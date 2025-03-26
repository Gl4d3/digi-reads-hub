
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { subscribeToMailingList } from '@/services/bookServiceFixed';

interface MailingListSignupProps {
  className?: string;
}

const MailingListSignup: React.FC<MailingListSignupProps> = ({ className }) => {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Replace the handleSubmit function to use our fixed service
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    if (!email) {
      toast({
        title: "Error",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await subscribeToMailingList(email, firstName);
      
      toast({
        title: "Success!",
        description: "You have successfully subscribed to our mailing list",
      });
      
      // Reset form
      setEmail("");
      setFirstName("");
    } catch (error) {
      console.error("Error subscribing to mailing list:", error);
      toast({
        title: "Subscription failed",
        description: "There was an error subscribing to the mailing list. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={className}>
      <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            type="email"
            id="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isSubmitting}
          />
        </div>
        <div>
          <Label htmlFor="firstName">First Name (Optional)</Label>
          <Input
            type="text"
            id="firstName"
            placeholder="Enter your first name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            disabled={isSubmitting}
          />
        </div>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Subscribe"}
        </Button>
      </form>
    </div>
  );
};

export default MailingListSignup;
