# Exam Paper Repository

A web application for IIT ISM Dhanbad students to share and access past exam papers. The platform features a credit system, metadata extraction, and Google authentication.

## Features

- **User Authentication**: Secure login through Google OAuth (restricted to iitism.ac.in email domain)
- **Credit System**: Users earn credits by uploading papers and spend credits to download papers
- **Metadata Extraction**: Automatic extraction of subject, course, exam type, and year from uploaded PDFs
- **Search & Filter**: Find papers by subject, course, exam type, year, or full-text search
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Tech Stack

### Backend

- Node.js with Express
- MongoDB with Mongoose
- JWT for authentication
- Multer for file uploads
- PDF-Parse for metadata extraction

### Frontend

- React with Vite
- React Router for navigation
- Material UI for components
- Axios for API requests
- JWT Decode for token handling

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- Google OAuth credentials

### Installation

1. Clone the repository:

   ```
   git clone https://github.com/yourusername/exam-paper-repository.git
   cd exam-paper-repository
   ```

2. Install backend dependencies:

   ```
   cd backend
   npm install
   ```

3. Install frontend dependencies:

   ```
   cd ../frontend
   npm install
   ```

4. Configure environment variables:

   - Backend: Create `backend/config/.env` with:

     ```
     PORT=5000
     MONGO_URI=your_mongodb_connection_string
     JWT_SECRET=your_jwt_secret_key
     JWT_EXPIRE=30d
     GOOGLE_CLIENT_ID=your_google_client_id
     ALLOWED_EMAIL_DOMAIN=iitism.ac.in
     ```

   - Frontend: Create `frontend/.env` with:
     ```
     VITE_API_URL=http://localhost:5000
     VITE_GOOGLE_CLIENT_ID=your_google_client_id
     ```

5. Create MongoDB database (if using local MongoDB):

   ```
   mongod --dbpath=/path/to/data/directory
   ```

6. Start the development servers:

   Backend:

   ```
   cd backend
   npm run dev
   ```

   Frontend:

   ```
   cd frontend
   npm run dev
   ```

7. Access the application at http://localhost:5173

## Usage

1. **Login**: Sign in with your IIT ISM Dhanbad Google account
2. **Upload Papers**: Navigate to "Upload" and submit exam papers (PDF, JPEG, PNG, DOC, DOCX)
3. **Search Papers**: Use filters to find papers by subject, course, exam type, or year
4. **Download Papers**: Spend credits to download the papers you need
5. **Manage Profile**: View your credit balance, upload count, and download history

## Credit System

- New users receive 10 credits upon registration
- Uploading a paper: +5 credits
- Downloading a paper: -2 credits

## Project Structure

```
├── backend/
│   ├── config/             # Environment variables and configuration
│   ├── src/
│   │   ├── controllers/    # Request handlers
│   │   ├── middleware/     # Express middleware
│   │   ├── models/         # Mongoose models
│   │   ├── routes/         # API routes
│   │   └── utils/          # Utility functions
│   ├── uploads/            # Uploaded files storage
│   └── index.js            # Entry point
│
└── frontend/
    ├── public/             # Static files
    ├── src/
    │   ├── components/     # React components
    │   ├── context/        # React context providers
    │   ├── services/       # API services
    │   ├── App.jsx         # Main application component
    │   └── main.jsx        # Entry point
    └── index.html          # HTML template
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- IIT ISM Dhanbad for the inspiration
- All contributors who share exam papers on the platform
