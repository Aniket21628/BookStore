import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  TextField,
  Button,
  MenuItem,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  Box
} from '@mui/material';

const AddBook = () => {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    genre: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const genres = [
    'Fiction', 'Non-Fiction', 'Mystery', 'Romance', 'Science Fiction',
    'Fantasy', 'Horror', 'Biography', 'History', 'Self-Help',
    'Business', 'Technology', 'Health', 'Travel', 'Cooking',
    'Art', 'Philosophy', 'Religion', 'Politics', 'Poetry'
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const validateForm = () => {
    if (!formData.title.trim()) return setError('Book title is required'), false;
    if (!formData.author.trim()) return setError('Author name is required'), false;
    if (!formData.genre) return setError('Please select a genre'), false;
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('http://localhost:5000/api/books', {
        title: formData.title.trim(),
        author: formData.author.trim(),
        genre: formData.genre
      });
      navigate(`/books/${res.data.book.id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add book');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4 py-8">
      <Paper elevation={3} className="w-full max-w-xl p-8">
        <Typography variant="h5" gutterBottom>
          📚 Add a New Book
        </Typography>
        <Typography variant="body1" className="text-gray-600 mb-4">
          Share a great book with the community!
        </Typography>

        {error && (
          <Alert severity="error" className="mb-4">
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <TextField
            fullWidth
            label="Book Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter the book title"
            disabled={loading}
            required
          />

          <TextField
            fullWidth
            label="Author"
            name="author"
            value={formData.author}
            onChange={handleChange}
            placeholder="Enter the author's name"
            disabled={loading}
            required
          />

          <TextField
            select
            fullWidth
            label="Genre"
            name="genre"
            value={formData.genre}
            onChange={handleChange}
            disabled={loading}
            required
          >
            <MenuItem value="">Select a genre</MenuItem>
            {genres.map((genre) => (
              <MenuItem key={genre} value={genre}>
                {genre}
              </MenuItem>
            ))}
          </TextField>

          <Box className="flex justify-end gap-4">
            <Button
              variant="outlined"
              onClick={() => navigate('/books')}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              type="submit"
              disabled={loading}
              startIcon={loading && <CircularProgress size={20} />}
            >
              {loading ? 'Adding...' : 'Add Book'}
            </Button>
          </Box>
        </form>

        <div className="mt-6 text-sm text-gray-500">
          <p>* Required fields</p>
          <p>Once you add a book, you and others can write reviews for it!</p>
        </div>
      </Paper>
    </div>
  );
};

export default AddBook;
