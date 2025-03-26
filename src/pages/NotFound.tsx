
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
        <div className="space-y-4 max-w-md animate-fade-in">
          <h1 className="text-6xl font-bold text-primary">404</h1>
          <h2 className="text-2xl font-semibold mb-2">Page Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The page you're looking for doesn't exist or has been moved. 
            Perhaps you can find what you're looking for on our homepage.
          </p>
          <Button asChild size="lg">
            <a href="/">Return to Homepage</a>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
