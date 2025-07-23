import React, { useState } from 'react';
import axios from 'axios';
import StarRating from './StarRating';
import {
  TextField,
  Button,
  Typography,
  CircularProgress,
  Box,
  Alert,
} from '@mui/material';

const ReviewForm = ({ bookId, onReviewAdded, onCancel }) => {
  const [formData, setFormData] = useState({
    review_text: '',
    rating: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTextChange = (e) => {
    setFormData({
      ...formData,
      review_text: e.target.value
    });
    setError('');
  };

  const handleRatingChange = (rating) => {
    setFormData({
      ...formData,
      rating
    });
    setError('');
  };

  const validateForm = () => {
    if (!formData.review_text.trim()) {
      setError('Please write a review');
      return false;
    }
    if (formData.rating === 0) {
      setError('Please select a rating');
      return false;
    }
    if (formData.review_text.trim().length < 10) {
      setError('Review must be at least 10 characters long');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/books/${bookId}/reviews`, {
        review_text: formData.review_text.trim(),
        rating: formData.rating
      });

      onReviewAdded();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="max-w-2xl mx-auto mt-8 p-6 bg-white shadow-lg rounded-xl">
      <Typography variant="h5" className="text-gray-800 mb-4">
        Write Your Review
      </Typography>

      {error && (
        <Alert severity="error" className="mb-4">
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Rating Section */}
        <div>
          <Typography variant="subtitle1" className="text-gray-700 mb-1">
            Your Rating *
          </Typography>
          <div className="flex items-center gap-3">
            <StarRating
              rating={formData.rating}
              onRatingChange={handleRatingChange}
              interactive={true}
            />
            <span className="text-sm text-gray-500">
              {formData.rating > 0 ? `${formData.rating}/5 stars` : 'Click to rate'}
            </span>
          </div>
        </div>

        {/* Review Text */}
        <div>
          <TextField
            label="Your Review *"
            name="review_text"
            value={formData.review_text}
            onChange={handleTextChange}
            multiline
            rows={6}
            fullWidth
            required
            disabled={loading}
            placeholder="Share your thoughts about this book..."
            variant="outlined"
            inputProps={{ minLength: 10 }}
          />
          <Typography variant="caption" className="text-gray-500 mt-1 block">
            {formData.review_text.length} characters
            {formData.review_text.length < 10 && ' (minimum 10 required)'}
          </Typography>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-4">
          <Button
            onClick={onCancel}
            variant="outlined"
            disabled={loading}
            color="secondary"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? <CircularProgress size={22} /> : 'Submit Review'}
          </Button>
        </div>
      </form>

      <Typography variant="body2" className="mt-6 text-sm text-gray-500">
        * Required fields. Please be respectful and constructive in your review.
      </Typography>
    </Box>
  );
};

export default ReviewForm;
