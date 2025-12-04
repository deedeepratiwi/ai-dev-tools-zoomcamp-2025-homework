import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '@/components/ui/button';
import { Code2, Users, Zap, Share2, Play, Globe } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  const createRoom = () => {
    const roomId = uuidv4();
    navigate(`/room/${roomId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/5" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent/20 rounded-full blur-3xl" />

        <div className="relative container mx-auto px-4 py-20 lg:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-secondary/50 border border-border rounded-full px-4 py-2 mb-8 animate-fade-in">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-sm text-muted-foreground">Real-time collaborative coding</span>
            </div>

            <h1 className="text-5xl lg:text-7xl font-bold mb-6 animate-slide-up">
              Code Together,
              <br />
              <span className="text-gradient-primary">Build Faster</span>
            </h1>

            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto animate-fade-in">
              A real-time collaborative code editor. Share a room, pick a language, 
              and run code instantly. No setup required.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in">
              <Button
                size="lg"
                onClick={createRoom}
                className="h-14 px-8 text-lg glow-primary glow-primary-hover"
              >
                <Code2 className="w-5 h-5 mr-2" />
                Create Room
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                className="h-14 px-8 text-lg"
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section id="features" className="py-20 bg-card/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl lg:text-4xl font-bold text-center mb-4">
            Everything You Need
          </h2>
          <p className="text-muted-foreground text-center mb-16 max-w-xl mx-auto">
            Built for developers who want to code together without the hassle
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <FeatureCard
              icon={<Users className="w-6 h-6" />}
              title="Real-time Sync"
              description="See changes instantly as your collaborators type. No refresh needed."
            />
            <FeatureCard
              icon={<Play className="w-6 h-6" />}
              title="Run Code Instantly"
              description="Execute JavaScript, TypeScript, or Python directly in your browser."
            />
            <FeatureCard
              icon={<Share2 className="w-6 h-6" />}
              title="One-Click Sharing"
              description="Share your room with a single link. No sign-up required."
            />
            <FeatureCard
              icon={<Code2 className="w-6 h-6" />}
              title="Monaco Editor"
              description="The same powerful editor that powers VS Code, with syntax highlighting."
            />
            <FeatureCard
              icon={<Zap className="w-6 h-6" />}
              title="Zero Setup"
              description="Start coding immediately. No installations or configurations."
            />
            <FeatureCard
              icon={<Globe className="w-6 h-6" />}
              title="Works Everywhere"
              description="Access from any device with a modern browser."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="glass-panel rounded-2xl p-12 text-center max-w-3xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Ready to Start?
            </h2>
            <p className="text-muted-foreground mb-8">
              Create a room and share the link with your team. It&apos;s that simple.
            </p>
            <Button
              size="lg"
              onClick={createRoom}
              className="h-14 px-8 text-lg glow-primary glow-primary-hover"
            >
              <Code2 className="w-5 h-5 mr-2" />
              Create Your Room
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Built with Monaco Editor, Firebase &amp; Pyodide</p>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
  <div className="glass-panel rounded-xl p-6 transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
      {icon}
    </div>
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    <p className="text-muted-foreground text-sm">{description}</p>
  </div>
);

export default Index;
