from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import os

app = Flask(__name__)

# Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///leaderboard.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JSON_SORT_KEYS'] = False

# Initialize extensions
db = SQLAlchemy(app)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Models
class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False, index=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    scores = db.relationship('Score', backref='user', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'created_at': self.created_at.isoformat(),
        }

class Score(db.Model):
    __tablename__ = 'scores'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    language = db.Column(db.String(20), nullable=False)  # 'javascript', 'typescript', 'python'
    code_length = db.Column(db.Integer, default=0)
    execution_time = db.Column(db.Float, default=0)  # in milliseconds
    successful = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'username': self.user.username,
            'language': self.language,
            'code_length': self.code_length,
            'execution_time': self.execution_time,
            'successful': self.successful,
            'created_at': self.created_at.isoformat(),
        }

# Routes

@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'timestamp': datetime.utcnow().isoformat()}), 200

@app.route('/api/users', methods=['POST'])
def create_user():
    """Create a new user"""
    data = request.get_json()
    
    if not data or not data.get('username') or not data.get('email'):
        return jsonify({'error': 'Missing username or email'}), 400
    
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'Username already exists'}), 409
    
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already exists'}), 409
    
    user = User(username=data['username'], email=data['email'])
    db.session.add(user)
    db.session.commit()
    
    return jsonify(user.to_dict()), 201

@app.route('/api/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    """Get user details"""
    user = User.query.get_or_404(user_id)
    return jsonify(user.to_dict()), 200

@app.route('/api/users/by-username/<username>', methods=['GET'])
def get_user_by_username(username):
    """Get user by username"""
    user = User.query.filter_by(username=username).first_or_404()
    return jsonify(user.to_dict()), 200

@app.route('/api/scores', methods=['POST'])
def submit_score():
    """Submit a score for a user"""
    data = request.get_json()
    
    if not data or not data.get('user_id') or not data.get('language'):
        return jsonify({'error': 'Missing user_id or language'}), 400
    
    user = User.query.get_or_404(data['user_id'])
    
    score = Score(
        user_id=data['user_id'],
        language=data['language'],
        code_length=data.get('code_length', 0),
        execution_time=data.get('execution_time', 0),
        successful=data.get('successful', True),
    )
    
    db.session.add(score)
    db.session.commit()
    
    return jsonify(score.to_dict()), 201

@app.route('/api/scores/<int:user_id>', methods=['GET'])
def get_user_scores(user_id):
    """Get all scores for a user"""
    user = User.query.get_or_404(user_id)
    scores = Score.query.filter_by(user_id=user_id).order_by(Score.created_at.desc()).all()
    
    return jsonify({
        'user': user.to_dict(),
        'scores': [score.to_dict() for score in scores],
        'total_scores': len(scores),
    }), 200

@app.route('/api/leaderboard', methods=['GET'])
def get_leaderboard():
    """Get leaderboard - top users by execution success and speed"""
    # Get query parameters for filtering
    language = request.args.get('language', None)
    limit = int(request.args.get('limit', 10))
    
    query = db.session.query(
        User.id,
        User.username,
        User.email,
        db.func.count(Score.id).label('total_executions'),
        db.func.sum(db.case((Score.successful == True, 1), else_=0)).label('successful_executions'),
        db.func.avg(Score.execution_time).label('avg_execution_time'),
    ).outerjoin(Score).group_by(User.id, User.username, User.email)
    
    if language:
        query = query.filter(Score.language == language)
    
    # Order by successful executions desc, then by avg execution time asc
    results = query.order_by(
        db.func.sum(db.case((Score.successful == True, 1), else_=0)).desc(),
        db.func.avg(Score.execution_time).asc()
    ).limit(limit).all()
    
    leaderboard = []
    for idx, (user_id, username, email, total, successful, avg_time) in enumerate(results, 1):
        leaderboard.append({
            'rank': idx,
            'user_id': user_id,
            'username': username,
            'email': email,
            'total_executions': total or 0,
            'successful_executions': successful or 0,
            'success_rate': round((successful or 0) / (total or 1) * 100, 2),
            'avg_execution_time': round(avg_time or 0, 2),
        })
    
    return jsonify({
        'leaderboard': leaderboard,
        'total_users': len(leaderboard),
        'language_filter': language,
    }), 200

@app.route('/api/leaderboard/<language>', methods=['GET'])
def get_leaderboard_by_language(language):
    """Get leaderboard filtered by language"""
    return get_leaderboard()

@app.errorhandler(404)
def not_found(e):
    return jsonify({'error': 'Resource not found'}), 404

@app.errorhandler(500)
def internal_error(e):
    db.session.rollback()
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=os.environ.get('FLASK_DEBUG', False), host='0.0.0.0', port=5000)
