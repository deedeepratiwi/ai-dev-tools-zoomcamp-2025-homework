# Realtime Code Studio - Backend

Flask-based REST API for managing leaderboards and code execution scores.

## Features

- **User Management**: Register users and track their execution history
- **Score Tracking**: Store code execution results with metrics (language, duration, success rate)
- **Leaderboard API**: Rank users by execution success and performance
- **Language Filtering**: Filter leaderboard by programming language
- **CORS Support**: Enable cross-origin requests from frontend
- **Database**: SQLAlchemy ORM with SQLite (or PostgreSQL for production)

## API Endpoints

### Health Check
```
GET /api/health
```
Returns: `{"status": "healthy", "timestamp": "2025-12-04T..."}`

### User Management
```
POST /api/users
Body: {"username": "john_doe", "email": "john@example.com"}
Response: {"id": 1, "username": "john_doe", "email": "john@example.com", "created_at": "..."}

GET /api/users/<int:user_id>
Response: {user_object}

GET /api/users/by-username/<username>
Response: {user_object}
```

### Score Management
```
POST /api/scores
Body: {
  "user_id": 1,
  "language": "javascript",
  "code_length": 152,
  "execution_time": 45.23,
  "successful": true
}
Response: {score_object}

GET /api/scores/<int:user_id>
Response: {"user": {user_object}, "scores": [...], "total_scores": 5}
```

### Leaderboard
```
GET /api/leaderboard
Query params: language (optional), limit (default: 10)

Response: {
  "leaderboard": [
    {
      "rank": 1,
      "user_id": 1,
      "username": "john_doe",
      "email": "john@example.com",
      "total_executions": 25,
      "successful_executions": 24,
      "success_rate": 96.0,
      "avg_execution_time": 42.5
    },
    ...
  ],
  "total_users": 15,
  "language_filter": null
}

GET /api/leaderboard?language=python
GET /api/leaderboard?language=javascript&limit=20
```

## Setup

### Prerequisites
- Python 3.11+
- pip

### Installation

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Initialize the database:
```bash
python app.py
```

This creates `leaderboard.db` in the `instance/` directory.

### Running Locally

Development mode with hot reload:
```bash
FLASK_ENV=development FLASK_DEBUG=True python app.py
```

Production mode with Gunicorn:
```bash
gunicorn --bind 0.0.0.0:5000 --workers 4 app:app
```

## Environment Variables

```bash
# Development
FLASK_ENV=development
FLASK_DEBUG=True

# Database
DATABASE_URL=sqlite:///leaderboard.db  # Default (local)
# Or PostgreSQL for production:
# DATABASE_URL=postgresql://user:password@postgres:5432/leaderboard
```

## Docker

### Build
```bash
docker build -t realtime-code-studio-backend:latest .
```

### Run
```bash
docker run -p 5000:5000 realtime-code-studio-backend:latest
```

### With Docker Compose (full stack)
```bash
docker-compose up -d
```

View logs:
```bash
docker-compose logs -f backend
```

## Database Schema

### Users Table
- `id` (Integer, Primary Key)
- `username` (String, Unique, Indexed)
- `email` (String, Unique)
- `created_at` (DateTime)

### Scores Table
- `id` (Integer, Primary Key)
- `user_id` (Integer, Foreign Key → Users)
- `language` (String: 'javascript', 'typescript', 'python')
- `code_length` (Integer)
- `execution_time` (Float, in milliseconds)
- `successful` (Boolean)
- `created_at` (DateTime, Indexed)

## Testing Endpoints

### Create User
```bash
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com"}'
```

### Submit Score
```bash
curl -X POST http://localhost:5000/api/scores \
  -H "Content-Type: application/json" \
  -d '{
    "user_id":1,
    "language":"javascript",
    "code_length":150,
    "execution_time":42.5,
    "successful":true
  }'
```

### Get Leaderboard
```bash
curl http://localhost:5000/api/leaderboard
curl http://localhost:5000/api/leaderboard?language=python
```

## Performance Considerations

- Indexed queries on `username`, `user_id`, and `created_at` for fast lookups
- Leaderboard aggregations use efficient GROUP BY queries
- CORS enabled for frontend cross-origin requests
- Health checks configured for container orchestration

## Production Deployment

For production, consider:
1. Use PostgreSQL instead of SQLite
2. Set `FLASK_ENV=production` and `FLASK_DEBUG=False`
3. Use environment variables for sensitive data
4. Add authentication (JWT, OAuth)
5. Implement rate limiting
6. Add request logging
7. Use managed database service (AWS RDS, Google Cloud SQL)

## License

MIT
