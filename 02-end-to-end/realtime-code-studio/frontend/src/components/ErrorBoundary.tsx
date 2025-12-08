import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error, errorInfo: null };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
        this.setState({ errorInfo });
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="h-screen w-full flex flex-col items-center justify-center bg-background p-4 text-foreground">
                    <div className="max-w-md w-full bg-card border border-destructive/50 rounded-lg p-6 shadow-xl">
                        <div className="flex items-center gap-3 text-destructive mb-4">
                            <AlertTriangle className="h-6 w-6" />
                            <h2 className="text-xl font-bold">Something went wrong</h2>
                        </div>

                        <p className="text-muted-foreground mb-4">
                            The application encountered an unexpected error.
                        </p>

                        {this.state.error && (
                            <div className="bg-muted p-3 rounded-md mb-4 overflow-auto max-h-48">
                                <code className="text-xs font-mono text-destructive">
                                    {this.state.error.toString()}
                                </code>
                            </div>
                        )}

                        <div className="flex gap-2">
                            <Button
                                onClick={() => window.location.reload()}
                                variant="default"
                            >
                                Reload Page
                            </Button>
                            <Button
                                onClick={() => window.location.href = '/'}
                                variant="outline"
                            >
                                Go Home
                            </Button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
