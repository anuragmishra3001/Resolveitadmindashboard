# Resolve It Admin Dashboard

A modern React-based admin dashboard built with TypeScript, TailwindCSS, and Vite.

## Features

- 🚀 **Fast Development** - Built with Vite for lightning-fast development
- 🎨 **Modern UI** - Beautiful interface with TailwindCSS
- 📱 **Responsive Design** - Works perfectly on all devices
- 🔧 **TypeScript** - Full type safety and better developer experience
- 🧭 **React Router** - Client-side routing for seamless navigation
- 📊 **Dashboard Components** - Pre-built components for analytics, users, and settings

## Tech Stack

- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **TailwindCSS** - Utility-first CSS framework
- **React Router** - Declarative routing
- **Lucide React** - Beautiful icons

## Getting Started

### Prerequisites

- Node.js 16+ 
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd resolve-it-admin
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Header.tsx      # Top navigation header
│   └── Sidebar.tsx     # Side navigation
├── layouts/            # Layout components
│   └── DashboardLayout.tsx
├── pages/              # Page components
│   ├── Dashboard.tsx   # Main dashboard
│   ├── Users.tsx       # User management
│   ├── Analytics.tsx   # Analytics and charts
│   └── Settings.tsx    # Application settings
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
├── types/              # TypeScript type definitions
├── App.tsx             # Main app component
├── main.tsx            # App entry point
└── index.css           # Global styles
```

## Features Overview

### Dashboard
- Overview statistics and metrics
- Recent activity feed
- Quick action buttons
- Responsive grid layout

### Users Management
- User listing with search and filters
- Role-based access control
- User status management
- Bulk actions

### Analytics
- Performance metrics
- User growth charts
- Page view statistics
- Top pages ranking

### Settings
- General application settings
- Notification preferences
- Security configurations
- Theme customization

## Customization

### Colors
The color scheme can be customized in `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        // Your primary color palette
      }
    }
  }
}
```

### Components
All components are built with TailwindCSS utility classes and can be easily customized by modifying the class names.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
