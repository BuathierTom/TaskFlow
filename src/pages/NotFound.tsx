
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Home, ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
    const location = useLocation();

    useEffect(() => {
        console.error(
            "404 Error: User attempted to access non-existent route:",
            location.pathname
        );
    }, [location.pathname]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-accent/10 p-4">
            <div className="text-center max-w-md mx-auto">
                {/* Animated 404 number */}
                <div className="relative mb-8">
                    <h1 className="text-[120px] sm:text-[150px] font-bold text-primary/20 select-none animate-pulse">
                        404
                    </h1>
                </div>

                {/* Error message */}
                <div className="space-y-4 mb-8">
                    <h2 className="text-2xl sm:text-3xl font-semibold text-foreground">
                        Page Not Found
                    </h2>
                    <p className="text-muted-foreground text-lg leading-relaxed">
                        The page you're looking for doesn't exist or has been moved.
                    </p>
                    {location.pathname !== "/" && (
                        <p className="text-sm text-muted-foreground/80 font-mono bg-muted/50 px-3 py-2 rounded-md border">
                            {location.pathname}
                        </p>
                    )}
                </div>

                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button
                        asChild
                        size="lg"
                        className="group"
                    >
                        <a href="/" className="flex items-center gap-2">
                            <Home className="h-4 w-4 group-hover:scale-110 transition-transform" />
                            Go Home
                        </a>
                    </Button>

                    <Button
                        variant="outline"
                        size="lg"
                        onClick={() => window.history.back()}
                        className="group"
                    >
                        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                        Go Back
                    </Button>
                </div>

                {/* Decorative elements */}
                <div className="mt-12 flex justify-center space-x-2">
                    <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
            </div>
        </div>
    );
};

export default NotFound;