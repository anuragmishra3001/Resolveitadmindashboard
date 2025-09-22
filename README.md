# Resolve It - Civic Issue Management System

A comprehensive civic issue management system with an admin dashboard and backend API.

## Project Structure

```
├── resolve-it-admin/     # React frontend admin dashboard
├── backend/             # Node.js/Express backend API
└── src/                 # Shared components and utilities
```

## Features

### Admin Dashboard (`resolve-it-admin`)
- Modern React dashboard with TypeScript
- Real-time notifications with Socket.IO
- User management and authentication
- Issue tracking and reporting
- Analytics and performance monitoring
- Responsive design with Tailwind CSS

### Backend API (`backend`)
- Express.js REST API
- JWT authentication
- Socket.IO for real-time communication
- Rate limiting and security middleware
- Input validation with Joi

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Frontend Setup
```bash
cd resolve-it-admin
npm install
npm run dev
```

### Backend Setup
```bash
cd backend
npm install
npm run dev
```

## Deployment

### Frontend (Vercel)
The frontend is configured for deployment on Vercel with automatic builds from the main branch.

### Backend
The backend can be deployed on platforms like Railway, Render, or Heroku.

## Environment Variables

### Frontend
Create a `.env` file in `resolve-it-admin/`:
```
VITE_API_URL=your_backend_url
VITE_SOCKET_URL=your_socket_url
```

### Backend
Create a `.env` file in `backend/`:
```
PORT=3000
JWT_SECRET=your_jwt_secret
NODE_ENV=production
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License
