// frontend/src/components/ErrorBoundary.jsx
import React from 'react';
import { AlertCircle } from 'lucide-react';

class ErrorBoundary extends React.Component {
    state = { hasError: false, error: null };

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="p-4 bg-red-900/50 border border-red-500 rounded-lg">
                    <div className="flex items-center gap-2 text-red-200">
                        <AlertCircle className="h-5 w-5" />
                        <h2>Something went wrong</h2>
                    </div>
                    <p className="mt-2 text-red-200">
                        {this.state.error?.message || 'An error occurred'}
                    </p>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;