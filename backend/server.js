const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

const db = new sqlite3.Database('bookreviews.db');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    genre TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    user_id INTEGER,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    review_text TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    book_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    reviewer TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (book_id) REFERENCES books (id),
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);
});

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

app.post('/api/auth/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    db.run(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ error: 'Username or email already exists' });
          }
          return res.status(500).json({ error: 'Database error' });
        }

        const token = jwt.sign(
          { id: this.lastID, username, email },
          JWT_SECRET,
          { expiresIn: '24h' }
        );

        res.status(201).json({
          message: 'User created successfully',
          token,
          user: { id: this.lastID, username, email }
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    db.get(
      'SELECT * FROM users WHERE email = ?',
      [email],
      async (err, user) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }

        if (!user) {
          return res.status(400).json({ error: 'Invalid credentials' });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
          return res.status(400).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
          { id: user.id, username: user.username, email: user.email },
          JWT_SECRET,
          { expiresIn: '24h' }
        );

        res.json({
          message: 'Login successful',
          token,
          user: { id: user.id, username: user.username, email: user.email }
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/books', (req, res) => {
  const {
    page = 1,
    limit = 10,
    genre,
    author,
    sortBy = 'date',  
    order = 'desc'     
  } = req.query;

  const offset = (page - 1) * limit;
  const sortColumn = sortBy === 'rating' ? 'average_rating' : 'b.created_at';
  const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC'; 

  let query = `
    SELECT b.*, 
           COALESCE(AVG(r.rating), 0) as average_rating,
           COUNT(r.id) as review_count
    FROM books b
    LEFT JOIN reviews r ON b.id = r.book_id
  `;

  let params = [];
  let conditions = [];

  if (genre) {
    conditions.push('b.genre LIKE ?');
    params.push(`%${genre}%`);
  }

  if (author) {
    conditions.push('b.author LIKE ?');
    params.push(`%${author}%`);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  query += `
    GROUP BY b.id
    ORDER BY ${sortColumn} ${sortOrder}
    LIMIT ? OFFSET ?
  `;

  params.push(parseInt(limit), parseInt(offset));

  db.all(query, params, (err, books) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    let countQuery = 'SELECT COUNT(*) as total FROM books';
    let countParams = [];

    if (genre || author) {
      let countConditions = [];

      if (genre) {
        countConditions.push('genre LIKE ?');
        countParams.push(`%${genre}%`);
      }

      if (author) {
        countConditions.push('author LIKE ?');
        countParams.push(`%${author}%`);
      }

      countQuery += ' WHERE ' + countConditions.join(' AND ');
    }

    db.get(countQuery, countParams, (err, countResult) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      res.json({
        books: books.map(book => ({
          ...book,
          average_rating: parseFloat(book.average_rating).toFixed(1)
        })),
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(countResult.total / limit),
          totalBooks: countResult.total,
          limit: parseInt(limit)
        }
      });
    });
  });
});

app.get('/api/books/:id', (req, res) => {
  const bookId = req.params.id;

  db.get(
    `SELECT b.*, 
            COALESCE(AVG(r.rating), 0) as average_rating,
            COUNT(r.id) as review_count
     FROM books b
     LEFT JOIN reviews r ON b.id = r.book_id
     WHERE b.id = ?
     GROUP BY b.id`,
    [bookId],
    (err, book) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (!book) {
        return res.status(404).json({ error: 'Book not found' });
      }

      db.all(
        'SELECT * FROM reviews WHERE book_id = ? ORDER BY created_at DESC',
        [bookId],
        (err, reviews) => {
          if (err) {
            return res.status(500).json({ error: 'Database error' });
          }

          res.json({
            ...book,
            average_rating: parseFloat(book.average_rating).toFixed(1),
            reviews
          });
        }
      );
    }
  );
});

app.post('/api/books', authenticateToken, (req, res) => {
  const { title, author, genre } = req.body;
  const userId = req.user.id;

  if (!title || !author || !genre) {
    return res.status(400).json({ error: 'Title, author, and genre are required' });
  }

  db.run(
    'INSERT INTO books (title, author, genre, user_id) VALUES (?, ?, ?, ?)',
    [title, author, genre, userId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      res.status(201).json({
        message: 'Book added successfully',
        book: {
          id: this.lastID,
          title,
          author,
          genre,
          user_id: userId
        }
      });
    }
  );
});

app.post('/api/books/:id/reviews', authenticateToken, (req, res) => {
  const bookId = req.params.id;
  const { review_text, rating } = req.body;
  const userId = req.user.id;
  const reviewer = req.user.username;

  if (!review_text || !rating) {
    return res.status(400).json({ error: 'Review text and rating are required' });
  }

  if (rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating must be between 1 and 5' });
  }

  db.get('SELECT id FROM books WHERE id = ?', [bookId], (err, book) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    db.get(
      'SELECT id FROM reviews WHERE book_id = ? AND user_id = ?',
      [bookId, userId],
      (err, existingReview) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }

        if (existingReview) {
          return res.status(400).json({ error: 'You have already reviewed this book' });
        }

        db.run(
          'INSERT INTO reviews (review_text, rating, book_id, user_id, reviewer) VALUES (?, ?, ?, ?, ?)',
          [review_text, parseInt(rating), bookId, userId, reviewer],
          function(err) {
            if (err) {
              return res.status(500).json({ error: 'Database error' });
            }

            res.status(201).json({
              message: 'Review added successfully',
              review: {
                id: this.lastID,
                review_text,
                rating: parseInt(rating),
                book_id: bookId,
                user_id: userId,
                reviewer
              }
            });
          }
        );
      }
    );
  });
});

app.get('/api/genres', (req, res) => {
  db.all(
    'SELECT DISTINCT genre FROM books ORDER BY genre',
    [],
    (err, genres) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(genres.map(g => g.genre));
    }
  );
});

app.get('/api/authors', (req, res) => {
  db.all(
    'SELECT DISTINCT author FROM books ORDER BY author',
    [],
    (err, authors) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(authors.map(a => a.author));
    }
  );
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;