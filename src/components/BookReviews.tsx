
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Star,
  StarHalf,
  MessageSquare,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { BookReview } from '@/types/supabase';

interface ReviewWithUser extends BookReview {
  user_name?: string;
}

interface BookReviewsProps {
  bookId: string;
}

const BookReviews: React.FC<BookReviewsProps> = ({ bookId }) => {
  const [reviews, setReviews] = useState<ReviewWithUser[]>([]);
  const [newReview, setNewReview] = useState('');
  const [rating, setRating] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const fetchReviews = async () => {
    try {
      // Since the book_reviews table doesn't exist yet, we're using mock data
      // This will prevent the type errors from the Supabase query
      
      // Mock data for reviews
      const mockReviews: ReviewWithUser[] = [
        {
          id: '1',
          user_id: 'user1',
          book_id: bookId,
          rating: 5,
          comment: 'This book was amazing! The storytelling was captivating from start to finish.',
          created_at: '2023-04-01T12:00:00Z',
          user_name: 'John Doe'
        },
        {
          id: '2',
          user_id: 'user2',
          book_id: bookId,
          rating: 4,
          comment: 'Great read, but I felt the ending was a bit rushed.',
          created_at: '2023-03-28T14:30:00Z',
          user_name: 'Alice Smith'
        }
      ];
      
      setReviews(mockReviews);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // We'll use our mock data function
    fetchReviews();
  }, [bookId]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast({
        title: 'Login Required',
        description: 'Please login to leave a review',
        variant: 'destructive',
      });
      return;
    }
    
    if (!rating) {
      toast({
        title: 'Rating Required',
        description: 'Please select a rating for your review',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Mock implementation
      const newReviewObj: ReviewWithUser = {
        id: `temp-${Date.now()}`,
        user_id: user?.id || 'unknown',
        book_id: bookId,
        rating,
        comment: newReview.trim(),
        created_at: new Date().toISOString(),
        user_name: 'You'
      };
      
      setReviews([newReviewObj, ...reviews]);
      setNewReview('');
      setRating(0);
      
      toast({
        title: 'Review Submitted',
        description: 'Your review has been submitted successfully',
      });
    } catch (error) {
      console.error('Error submitting review:', error);
      toast({
        title: 'Submission Failed',
        description: 'Failed to submit your review. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<StarHalf key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />);
      } else {
        stars.push(<Star key={i} className="w-4 h-4 text-muted-foreground" />);
      }
    }
    
    return stars;
  };

  return (
    <div className="mt-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold flex items-center">
          <MessageSquare className="mr-2 h-6 w-6" />
          Reviews & Ratings
        </h2>
        <div className="text-sm text-muted-foreground">
          {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
        </div>
      </div>

      {isAuthenticated && (
        <div className="mb-8 bg-card border rounded-lg p-4">
          <form onSubmit={handleSubmitReview}>
            <h3 className="text-base font-medium mb-2">Write a Review</h3>
            <div className="mb-3">
              <div className="text-sm mb-1">Your Rating</div>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="focus:outline-none"
                  >
                    <Star 
                      className={`w-6 h-6 ${
                        star <= rating 
                          ? "fill-yellow-400 text-yellow-400" 
                          : "text-muted-foreground"
                      }`} 
                    />
                  </button>
                ))}
              </div>
            </div>
            <Textarea
              placeholder="Share your thoughts about this book..."
              className="min-h-[100px]"
              value={newReview}
              onChange={(e) => setNewReview(e.target.value)}
            />
            <Button 
              type="submit" 
              className="mt-3"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </Button>
          </form>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="bg-card border rounded-lg p-4 animate-pulse">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 rounded-full bg-muted mr-3"></div>
                <div>
                  <div className="h-4 bg-muted w-32 mb-1"></div>
                  <div className="h-3 bg-muted w-24"></div>
                </div>
              </div>
              <div className="h-3 bg-muted w-full mb-2"></div>
              <div className="h-3 bg-muted w-4/5 mb-2"></div>
              <div className="h-3 bg-muted w-3/5"></div>
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-10 border border-dashed rounded-lg">
          <MessageSquare className="mx-auto h-10 w-10 text-muted-foreground/60" />
          <p className="mt-4 text-lg font-medium">No Reviews Yet</p>
          <p className="mt-2 text-muted-foreground">
            Be the first to share your thoughts on this book.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => {
            const timeAgo = formatDistanceToNow(new Date(review.created_at), { addSuffix: true });
            const initials = (review.user_name || 'A').substring(0, 1).toUpperCase();
            
            return (
              <div key={review.id} className="bg-card border rounded-lg p-4">
                <div className="flex items-start">
                  <Avatar className="h-10 w-10 mr-4">
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <h4 className="font-medium">{review.user_name}</h4>
                      <span className="text-xs text-muted-foreground">{timeAgo}</span>
                    </div>
                    <div className="flex my-1.5">
                      {renderStars(review.rating)}
                    </div>
                    <p className="text-sm mt-2">{review.comment}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BookReviews;
