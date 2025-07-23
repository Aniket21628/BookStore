import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Button, Typography, Box } from '@mui/material';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/books');
  };

  return (
    <AppBar position="static" className="bg-white shadow-md">
      <Toolbar className="flex justify-between items-center px-4 md:px-10">
        <Typography
          variant="h6"
          component={Link}
          to="/books"
          className="text-xl font-semibold text-white-600 no-underline hover:underline"
        >
          📚 BookReviews
        </Typography>

        <Box className="flex items-center space-x-4">
          <Button
            component={Link}
            to="/books"
            className="text-gray-700 hover:text-blue-600"
          >
            All Books
          </Button>

          {user ? (
            <>
              <Button
                component={Link}
                to="/add-book"
                className="text-gray-700 hover:text-blue-600"
              >
                Add Book
              </Button>

              <Typography
                variant="body2"
                className="text-sm text-white-600 hidden sm:block p-1"
              >
                Welcome, <span className="font-medium">{user.username}</span>
              </Typography>

              <Button
                onClick={handleLogout}
                variant="contained"
                color="error"
                className="ml-2"
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button
                component={Link}
                to="/login"
                className="text-gray-700 hover:text-blue-600"
              >
                Login
              </Button>
              {/* <Button
                component={Link}
                to="/signup"
                variant="contained"
                color="primary"
              >
                Sign Up
              </Button> */}
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
