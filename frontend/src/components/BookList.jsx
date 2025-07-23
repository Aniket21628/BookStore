import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import StarRating from './StarRating';

import {
  Typography,
  Select,
  MenuItem,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  Box,
  Grid,
  Paper,
  Alert
} from '@mui/material';

const BookList = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({ genre: '', author: '' });
  const [genres, setGenres] = useState([]);
  const [authors, setAuthors] = useState([]);

  useEffect(() => {
    fetchBooks();
    fetchGenres();
    fetchAuthors();
  }, [currentPage, filters]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        ...(filters.genre && { genre: filters.genre }),
        ...(filters.author && { author: filters.author }),
      };

      const response = await axios.get('http://localhost:5000/api/books', { params });
      setBooks(response.data.books);
      setPagination(response.data.pagination);
    } catch {
      setError('Failed to fetch books');
    } finally {
      setLoading(false);
    }
  };

  const fetchGenres = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/genres');
      setGenres(response.data);
    } catch {
      console.error('Failed to fetch genres');
    }
  };

  const fetchAuthors = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/authors');
      setAuthors(response.data);
    } catch {
      console.error('Failed to fetch authors');
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({ genre: '', author: '' });
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Box className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
  <Box>
    <Typography variant="h4" gutterBottom>📚 All Books</Typography>
    <Typography className="text-gray-600">Discover and review amazing books</Typography>
  </Box>
  <Button
    variant="contained"
    color="primary"
    component={Link}
    to="/add-book"
    className="self-start"
  >
    + Add Book
  </Button>
</Box>


      {/* Filters */}
      <Box className="flex flex-wrap gap-4 mb-6">
        <FormControl className="min-w-[180px]">
          <InputLabel>Genre</InputLabel>
          <Select
            name="genre"
            value={filters.genre}
            onChange={handleFilterChange}
            label="Genre"
          >
            <MenuItem value="">All Genres</MenuItem>
            {genres.map((g) => (
              <MenuItem key={g} value={g}>{g}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl className="min-w-[180px]">
          <InputLabel>Author</InputLabel>
          <Select
            name="author"
            value={filters.author}
            onChange={handleFilterChange}
            label="Author"
          >
            <MenuItem value="">All Authors</MenuItem>
            {authors.map((a) => (
              <MenuItem key={a} value={a}>{a}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {(filters.genre || filters.author) && (
          <Button onClick={clearFilters} variant="outlined" className="h-[56px]">
            Clear Filters
          </Button>
        )}
      </Box>

      {/* Error */}
      {error && (
        <Alert severity="error" className="mb-4">
          {error}
        </Alert>
      )}

      {/* Loading */}
      {loading && books.length === 0 ? (
        <div className="flex justify-center py-10">
          <CircularProgress />
        </div>
      ) : (
        <>
          {/* Book Cards */}
          <Grid container spacing={3}>
            {books.length === 0 ? (
              <Grid item xs={12}>
                <Paper className="p-4 text-center text-gray-500">
                  <Typography>No books found{(filters.genre || filters.author) ? ' with the selected filters' : ''}.</Typography>
                  <Button variant="outlined" component={Link} to="/add-book" className="mt-2">
                    Be the first to add a book!
                  </Button>
                </Paper>
              </Grid>
            ) : (
              books.map((book) => (
                <Grid item xs={12} sm={6} md={4} key={book.id}>
                  <Paper className="p-4 h-full flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
                    <Box>
                      <Typography variant="h6" component={Link} to={`/books/${book.id}`} className="hover:underline">
                        {book.title}
                      </Typography>
                      <Typography className="text-sm text-gray-600 mb-1">by {book.author}</Typography>
                      <Typography className="text-xs bg-gray-200 inline-block px-2 py-0.5 rounded mb-2">{book.genre}</Typography>

                      <Box className="flex items-center gap-2">
                        <StarRating rating={parseFloat(book.average_rating)} />
                        <Typography className="text-sm text-gray-600">
                          {parseFloat(book.average_rating).toFixed(1)} ({book.review_count} review{book.review_count !== 1 ? 's' : ''})
                        </Typography>
                      </Box>
                    </Box>

                    <Button
                      variant="outlined"
                      size="small"
                      component={Link}
                      to={`/books/${book.id}`}
                      className="mt-4 self-start"
                    >
                      View Details
                    </Button>
                  </Paper>
                </Grid>
              ))
            )}
          </Grid>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <Box className="mt-8 flex justify-center gap-2 flex-wrap">
              <Button
                variant="outlined"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </Button>

              {[...Array(pagination.totalPages)].map((_, i) => {
                const page = i + 1;
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? 'contained' : 'outlined'}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </Button>
                );
              })}

              <Button
                variant="outlined"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === pagination.totalPages}
              >
                Next
              </Button>
            </Box>
          )}

          {/* Results Summary */}
          {pagination.totalBooks > 0 && (
            <Typography className="text-center py-4 text-sm text-gray-500">
              Showing {books.length} of {pagination.totalBooks} books
              {(filters.genre || filters.author) && ' (filtered)'}
            </Typography>
          )}
        </>
      )}
    </div>
  );
};

export default BookList;
