import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import StarRating from './StarRating';
import ReviewForm from './ReviewForm';

import {
  Typography,
  Button,
  CircularProgress,
  Alert,
  Divider,
  Paper,
  Box
} from '@mui/material';

const BookDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => {
    fetchBook();
  }, [id]);

  const fetchBook = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/books/${id}`);
      setBook(response.data);
    } catch {
      setError('Failed to fetch book details');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewAdded = () => {
    setShowReviewForm(false);
    fetchBook();
  };

  const canWriteReview = () => {
    if (!user || !book) return false;
    return !book.reviews.some((r) => r.user_id === user.id);
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto mt-10">
        <Alert severity="error" className="mb-4">
          {error}
        </Alert>
        <Button variant="outlined" component={Link} to="/books">
          ← Back to Books
        </Button>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="max-w-2xl mx-auto mt-10">
        <Alert severity="warning" className="mb-4">
          Book not found
        </Alert>
        <Button variant="outlined" component={Link} to="/books">
          ← Back to Books
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-10 px-4">
      <Button variant="text" component={Link} to="/books" className="mb-4">
        ← Back to Books
      </Button>

      <Paper elevation={3} className="p-6 space-y-4">
        <Typography variant="h4" component="h1">
          {book.title}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          by {book.author}
        </Typography>
        <Box className="flex flex-wrap gap-4 text-sm text-gray-600 mt-2">
          <span className="px-2 py-1 bg-gray-200 rounded">{book.genre}</span>
          <span>Added on {formatDate(book.created_at)}</span>
        </Box>

        <Divider className="my-4" />

        <Box className="flex items-center space-x-4">
          <StarRating rating={parseFloat(book.average_rating)} size="large" />
          <Box>
            <Typography variant="h6">
              {parseFloat(book.average_rating).toFixed(1)}/5
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {book.review_count} review{book.review_count !== 1 ? 's' : ''}
            </Typography>
          </Box>
        </Box>
      </Paper>

      <div className="mt-10 space-y-6">
        <Box className="flex justify-between items-center">
          <Typography variant="h5">Reviews</Typography>

          {user && canWriteReview() && (
            <Button
              variant="contained"
              onClick={() => setShowReviewForm(!showReviewForm)}
            >
              {showReviewForm ? 'Cancel' : 'Write a Review'}
            </Button>
          )}

          {user && !canWriteReview() && (
            <Typography className="text-sm text-gray-500">
              You've already reviewed this book
            </Typography>
          )}

          {!user && (
            <Button variant="outlined" component={Link} to="/login">
              Login to write a review
            </Button>
          )}
        </Box>

        {showReviewForm && (
          <Paper elevation={1} className="p-4">
            <ReviewForm
              bookId={book.id}
              onReviewAdded={handleReviewAdded}
              onCancel={() => setShowReviewForm(false)}
            />
          </Paper>
        )}

        <div className="space-y-4">
          {book.reviews.length === 0 ? (
            <Paper elevation={1} className="p-4 text-gray-600">
              No reviews yet. Be the first to review this book!
            </Paper>
          ) : (
            book.reviews.map((review) => (
              <Paper key={review.id} elevation={2} className="p-4">
                <Box className="flex justify-between items-center mb-2">
                  <Box>
                    <Typography className="font-semibold">
                      {review.reviewer}
                    </Typography>
                    <Typography className="text-sm text-gray-500">
                      {formatDate(review.created_at)}
                    </Typography>
                  </Box>
                  <StarRating rating={review.rating} />
                </Box>
                <Typography>{review.review_text}</Typography>
              </Paper>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default BookDetail;
