# 📚 Book Review Platform

A full-stack web application where users can discover books, write reviews, and rate their favorite reads. Built with React and Node.js as part of a 48-hour development challenge.

## ✨ Features

### 🔐 Authentication
- User registration and login with JWT
- Secure password hashing with bcrypt
- Protected routes for authenticated users only

### 📖 Book Management
- Add new books with title, author, and genre
- View paginated list of all books
- Filter books by genre and author
- Sort books based on Rating and Date Published.

### ⭐ Review System
- Write detailed reviews for any book
- Rate books from 1 to 5 stars
- View average ratings for each book
- Visual star rating display
- One review per user per book restriction

### 🎨 User Experience
- Responsive design that works on all devices
- Clean, intuitive interface
- Real-time feedback and validation
- Loading states and error handling
- Pagination for better performance

## 🛠 Tech Stack

### Backend
- **Node.js** with Express.js framework
- **SQLite** database for data persistence
- **JWT** for authentication
- **bcryptjs** for password hashing
- **CORS** for cross-origin requests

### Frontend
- **React** with Hooks (no class components)
- **React Router** for navigation
- **Axios** for API calls
- **Tailwind CSS & MUI** with custom styling
- **Responsive design** principles

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Aniket21628/BookStore.git
cd BookStore
```

2. **Set up the Backend**
```bash
cd backend 

# Install dependencies
npm install

# Start the server
node server.js
```

The backend server will start on `http://localhost:5000`

3. **Set up the Frontend**
```bash
# Open a new terminal and navigate to frontend directory
cd frontend  

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will start on `http://localhost:5173`

### Environment Variables

Create a `.env` file in the frontend root:
```env
VITE_API_URL = http://localhost:5000
```

## 📁 Project Structure

```
book-review-platform/
├── backend/
│   ├── server.js           # Main server file with all routes
│   ├── package.json        # Backend dependencies
│   └── bookreviews.db      # SQLite database (auto-generated)
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   ├── BookList.jsx
│   │   │   ├── BookDetail.jsx
│   │   │   ├── AddBook.jsx
│   │   │   ├── StarRating.jsx
│   │   │   └── ReviewForm.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   └── package.json        # Frontend dependencies
└── README.md
```

## 🏗 Architecture Decisions

### Database Design
- **SQLite** chosen for simplicity and ease of deployment
- Three main tables: `users`, `books`, and `reviews`
- Proper foreign key relationships established
- Constraints ensure data integrity (rating 1-5, unique user reviews per book)

### Authentication Strategy
- **JWT tokens** for stateless authentication
- Tokens stored in localStorage for persistence
- Automatic token inclusion in API requests via Axios interceptors
- Protected routes check authentication status

### Frontend Architecture
- **React Context** for global authentication state
- **Custom hooks** for reusable logic
- **Component composition** for maintainable code
- **Responsive CSS** using TailwindCSS

### API Design
- **RESTful endpoints** following standard conventions
- **Proper HTTP status codes** for different scenarios
- **Input validation** on both client and server
- **Error handling** with meaningful messages

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login

### Books
- `GET /api/books` - Get all books (with pagination and filters)
- `GET /api/books/:id` - Get specific book with reviews
- `POST /api/books` - Add new book (authenticated)
- `GET /api/genres` - Get all available genres
- `GET /api/authors` - Get all available authors

### Reviews
- `POST /api/books/:id/reviews` - Add review for a book (authenticated)

## 🎯 Key Features Implemented

### ✅ Required Features
- [x] User authentication (signup/login) with JWT
- [x] Add new books with title, author, genre
- [x] View paginated list of books
- [x] Filter books by genre and author
- [x] Sort books by Rating and Date Published
- [x] Write reviews with ratings (1-5 stars)
- [x] View all reviews for each book
- [x] Calculate and display average ratings
- [x] Proper model relationships (1 book → many reviews)

### ✅ Bonus Features
- [x] Visual star rating display
- [x] Form validations on both client and server
- [x] Responsive UI design
- [x] Loading states and error handling
- [x] One review per user per book restriction
- [x] Clean, professional styling
- [x] Pagination for better performance
- [x] Filter dropdowns with actual data

## 🧪 Testing the Application

### Manual Testing Checklist

1. **Authentication Flow**
   - Sign up with new user
   - Login with existing user
   - Access protected routes
   - Logout functionality

2. **Book Management**
   - Add new books
   - View book list with pagination
   - Filter by genre and author
   - View book details

3. **Review System**
   - Write reviews for books
   - Rate books with stars
   - View average ratings
   - Prevent duplicate reviews

4. **Responsive Design**
   - Test on mobile devices
   - Test on tablets
   - Test on desktop

## 🚧 Known Limitations

1. **File Upload**: No book cover image upload functionality
2. **Search**: Basic filtering only, no full-text search
3. **Email Verification**: No email confirmation for new users
4. **Password Reset**: No password recovery mechanism
5. **User Profiles**: No user profile pages or settings
6. **Book Editing**: Users cannot edit books after creation
7. **Review Editing**: Users cannot edit their reviews

## 🔮 Future Enhancements

1. **Advanced Search**: Full-text search across titles and authors
2. **Book Covers**: Image upload and display for book covers
3. **User Profiles**: Detailed user profiles with review history
4. **Social Features**: Follow users, like reviews
5. **Recommendations**: Suggest books based on ratings
6. **Categories**: More detailed genre categorization
7. **Export**: Export reading lists and reviews
8. **Mobile App**: React Native version
