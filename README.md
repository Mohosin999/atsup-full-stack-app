# CVCoach - AI-Powered Resume Analysis & Builder Platform (AI)

CVCoach is an AI-powered resume analysis and building platform that helps job seekers optimize their resumes for Applicant Tracking Systems (ATS) and job matching. Users can upload resumes to receive detailed ATS scores, missing keyword identification, and AI-generated improvement recommendations. The platform also features resume-to-job matching with skills gap analysis, a professional resume builder with AI-powered content generation, plus secure authentication, Stripe payment integration for premium features, and a centralized dashboard.

![Tech Stack](https://img.shields.io/badge/Stack-React%20%7C%20Node.js%20%7C%20MongoDB%20%7C%20Gemini%20AI-blue)

![Project Screenshot](./frontend//public/cvcoach.png)

## 📋 Table of Contents

- [Live Demo](#live-demo)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [API Endpoints](#api-endpoints)
- [Contributing](#contributing)

## Live Demo

[CVCoach App](https://cvcoach-client.vercel.app/) - Try the live application

## Features

### ATS Score Analysis

- **ATS Compatibility Scoring** - Evaluate how well your resume performs against Applicant Tracking Systems
- **Detailed Analysis Reports** - Get comprehensive breakdowns of your resume's strengths and weaknesses
- **Missing Keyword Identification** - Discover critical keywords that your resume lacks
- **ATS Score History** - Track your resume's ATS score improvements over time
- **AI-Powered Recommendations** - Receive intelligent suggestions to optimize your resume for ATS

### Job Match Analysis

- **Resume-to-Job Matching** - Compare your resume against specific job descriptions
- **Match Score Calculation** - Get a percentage score showing how well you fit the position
- **Skills Gap Analysis** - Identify missing skills and qualifications for the target job
- **Keyword Optimization** - Find relevant keywords to add for better job alignment
- **Job Match History** - Review all your previous job match analyses
- **Customizable Job Descriptions** - Paste any job description to get instant matching insights

### Resume Builder

- **Professional Resume Templates** - Choose from multiple ATS-friendly resume templates
- **AI-Powered Content Generation** - Generate professional summaries, work experience descriptions, and skills automatically
- **Real-Time Live Preview** - See your resume changes as you edit
- **Multiple Export Formats** - Download your resume as PDF, DOCX, or PNG
- **Resume Build History** - Access and manage all your previously created resumes

### Resume Parser & Analysis

- **File Upload Support** - Upload resumes in PDF, DOCX, or TXT formats
- **Automatic Content Extraction** - Parse and extract information from resume files
- **AI-Generated Feedback** - Get intelligent suggestions to improve resume content
- **Section-by-Section Analysis** - Detailed review of each resume section

### User Dashboard & Management

- **Secure Authentication** - Email/password login with Google OAuth support
- **Centralized Dashboard** - View all your resumes, analyses, and match scores in one place
- **Settings Management** - Customize your profile and application preferences
- **Activity History** - Track all your resume analyses, ATS scores, and job matches

### Payment & Credits System

- **Stripe Integration** - Secure and reliable payment processing
- **Credit-Based System** - Purchase credits to unlock premium features
- **Multiple Pricing Plans** - Choose from different subscription tiers
- **Payment Verification** - Real-time payment status tracking
- **Success & Cancel Pages** - Guided checkout experience

### Technical Features

- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile devices
- **Modern UI/UX** - Clean, intuitive interface with smooth animations
- **Real-Time Updates** - Instant feedback and live preview capabilities
- **Secure File Handling** - Safe upload and processing of resume documents
- **API Rate Limiting** - Protected against abuse and excessive requests
- **Comprehensive Error Handling** - Clear error messages and validation

## Tech Stack

### Frontend

- **React 18** with TypeScript
- **Vite** for build tooling
- **Redux Toolkit** for state management
- **TailwindCSS** for styling
- **React Router** for navigation
- **Framer Motion** for animations
- **React Quill** for rich text editing

### Backend

- **Express.js** with TypeScript
- **MongoDB** with Mongoose
- **Google Gemini AI** for AI-powered features
- **Stripe** for payment processing
- **Passport.js** for authentication
- **Multer** for file uploads

## Project Structure

```
app/
├── backend/                 # Express.js backend API
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── controllers/    # Request handlers
│   │   ├── middlewares/    # Express middlewares
│   │   ├── models/         # Mongoose models
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── db/             # Database connection
│   │   └── utils/          # Utility functions
│   └── package.json
│
└── frontend/               # React frontend application
    ├── src/
    │   ├── api/           # API client
    │   ├── components/    # React components
    │   ├── hooks/         # Custom hooks
    │   ├── pages/         # Page components
    │   ├── store/         # Redux store
    │   ├── types/         # TypeScript types
    │   └── utils/         # Utility functions
    └── package.json
```

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Google Cloud Platform account (for Gemini AI)
- Stripe account (for payments)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd app
   ```

2. **Install backend dependencies**

   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**

   ```bash
   cd frontend
   npm install
   ```

4. **Configure environment variables**

   Create `backend/.env`:

   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GEMINI_API_KEY=your_gemini_api_key
   STRIPE_SECRET_KEY=your_stripe_secret_key
   STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
   FRONTEND_URL=http://localhost:5173
   ```

   Create `frontend/.env`:

   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   ```

### Running the Application

1. **Start the backend**

   ```bash
   cd backend
   npm run dev
   ```

   Backend runs on http://localhost:5000

2. **Start the frontend**

   ```bash
   cd frontend
   npm run dev
   ```

   Frontend runs on http://localhost:5173

3. **Build for production**

   ```bash
   # Backend
   cd backend
   npm run build
   npm start

   # Frontend
   cd frontend
   npm run build
   npm run start
   ```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh-token` - Refresh access token
- `POST /api/auth/logout` - User logout

### Resumes

- `POST /api/resumes/upload` - Upload resume file
- `GET /api/resumes` - Get all user resumes
- `GET /api/resumes/:id` - Get single resume
- `PUT /api/resumes/:id` - Update resume
- `DELETE /api/resumes/:id` - Delete resume

### Analysis

- `POST /api/analysis/generate` - Generate AI analysis
- `GET /api/analysis` - Get all analyses
- `GET /api/analysis/:id` - Get single analysis
- `DELETE /api/analysis/:id` - Delete analysis

### ATS Score

- `POST /api/ats-score` - Calculate ATS score
- `GET /api/ats-score/history` - Get ATS score history
- `GET /api/ats-score/history/:id` - Get single ATS score history
- `DELETE /api/ats-score/history/:id` - Delete ATS score history

### Job Match

- `POST /api/job-match` - Match resume to job description
- `GET /api/job-match/history` - Get job match history
- `GET /api/job-match/history/:id` - Get single job match history
- `DELETE /api/job-match/history/:id` - Delete job match history

### Resume Builder

- `POST /api/resume-builder` - Create resume from content
- `GET /api/resume-builder/templates` - Get available templates
- `GET /api/resume-builder/history` - Get resume build history
- `GET /api/resume-builder/history/:id` - Get single build history
- `DELETE /api/resume-builder/history/:id` - Delete build history

### Payment

- `POST /api/payment/create-checkout-session` - Create Stripe checkout
- `POST /api/payment/webhook` - Stripe webhook handler
- `GET /api/payment/verify/:id` - Verify payment status

### Jobs

- `POST /api/jobs` - Create/save job
- `GET /api/jobs` - Get all jobs
- `GET /api/jobs/:id` - Get single job
- `PUT /api/jobs/:id` - Update job
- `DELETE /api/jobs/:id` - Delete job

### Users

- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/credits` - Get user credits balance

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/name`)
3. Commit changes (`git commit -m 'Add feature'`)
4. Push branch (`git push origin feature/name`)
5. Open Pull Request
