import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Paper
} from '@mui/material';
import { useAuth } from '../context/AuthContext';

const Signup = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signup, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/books');
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const validateForm = () => {
    const { username, email, password, confirmPassword } = formData;

    if (!username || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return false;
    }
    if (username.length < 3) {
      setError('Username must be at least 3 characters long');
      return false;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    const result = await signup(formData.username, formData.email, formData.password);

    if (result.success) {
      navigate('/books');
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    <Box className="flex justify-center items-center min-h-screen bg-gray-50 px-4">
      <Paper elevation={3} className="p-8 w-full max-w-md rounded-xl">
        <Typography variant="h5" className="text-center pb-6 text-black-700 font-semibold">
          Sign Up for BookReviews
        </Typography>

        {error && (
          <Alert severity="error" className="mb-4">
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <TextField
            fullWidth
            label="Username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            disabled={loading}
            required
            inputProps={{ minLength: 3 }}
          />
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            disabled={loading}
            required
          />
          <TextField
            fullWidth
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            disabled={loading}
            required
            inputProps={{ minLength: 6 }}
          />
          <TextField
            fullWidth
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            disabled={loading}
            required
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            disabled={loading}
            className="mt-2"
          >
            {loading ? <CircularProgress size={22} /> : 'Sign Up'}
          </Button>
        </form>

        <Typography className="text-center pt-6 text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:underline">
            Login here
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
};

export default Signup;
