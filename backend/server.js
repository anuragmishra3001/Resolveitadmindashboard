const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const Joi = require('joi');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// In-memory storage for reports (in production, use a database)
let reports = [];
let connectedClients = 0;

// In-memory storage for users (in production, use a database)
const users = [
  {
    id: '1',
    email: 'admin@resolveit.gov',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // admin123
    name: 'Admin User',
    role: 'admin',
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    email: 'superadmin@resolveit.gov',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // superadmin123
    name: 'Super Admin',
    role: 'super-admin',
    createdAt: new Date().toISOString()
  }
];

// JWT token blacklist (in production, use Redis or database)
const tokenBlacklist = new Set();

// Socket.IO connection handling
io.on('connection', (socket) => {
  connectedClients++;
  console.log(`📱 Client connected. Total clients: ${connectedClients}`);
  
  // Join admin room for dashboard updates
  socket.join('admin-dashboard');
  
  // Send current report count to new client
  socket.emit('reports:count', { total: reports.length });
  
  // Send recent reports to new client
  const recentReports = reports
    .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
    .slice(0, 10);
  socket.emit('reports:recent', recentReports);
  
  socket.on('disconnect', () => {
    connectedClients--;
    console.log(`📱 Client disconnected. Total clients: ${connectedClients}`);
  });
  
  // Handle admin dashboard events
  socket.on('admin:join', () => {
    socket.join('admin-dashboard');
    console.log('👨‍💼 Admin joined dashboard');
  });
});

// Helper function to emit real-time updates
function emitReportUpdate(event, data) {
  io.to('admin-dashboard').emit(event, data);
  console.log(`📡 Emitted ${event} to ${connectedClients} clients`);
}

// Authentication middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access token required' });
  }

  // Check if token is blacklisted
  if (tokenBlacklist.has(token)) {
    return res.status(401).json({ success: false, message: 'Token has been revoked' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

// Role-based authorization middleware
function requireRole(role) {
  return (req, res, next) => {
    if (req.user.role !== role && req.user.role !== 'super-admin') {
      return res.status(403).json({ success: false, message: 'Insufficient permissions' });
    }
    next();
  };
}

// Generate JWT tokens
function generateTokens(user) {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role
  };

  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  const refreshToken = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN });

  return { accessToken, refreshToken };
}

let departments = [
  {
    id: 'sanitation',
    name: 'Sanitation Department',
    email: 'sanitation@city.gov',
    phone: '(555) 123-4567',
    categories: ['garbage', 'waste', 'recycling', 'sanitation']
  },
  {
    id: 'public-works',
    name: 'Public Works Department',
    email: 'publicworks@city.gov',
    phone: '(555) 234-5678',
    categories: ['street-lights', 'traffic-signals', 'public-infrastructure']
  },
  {
    id: 'road-maintenance',
    name: 'Road Maintenance Department',
    email: 'roads@city.gov',
    phone: '(555) 345-6789',
    categories: ['potholes', 'sidewalks', 'road-repairs', 'street-maintenance']
  },
  {
    id: 'water-supply',
    name: 'Water Supply Department',
    email: 'water@city.gov',
    phone: '(555) 456-7890',
    categories: ['water-leaks', 'water-supply', 'sewage', 'drainage']
  },
  {
    id: 'general',
    name: 'General Services Department',
    email: 'general@city.gov',
    phone: '(555) 567-8901',
    categories: ['noise', 'vandalism', 'other', 'general']
  }
];

// Validation schema for new reports
const reportSchema = Joi.object({
  title: Joi.string().min(5).max(200).required(),
  description: Joi.string().min(10).max(1000).required(),
  location: Joi.string().min(5).max(200).required(),
  category: Joi.string().valid('sanitation', 'public-works', 'road-maintenance', 'water-supply', 'other').required(),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent').default('medium'),
  reporterName: Joi.string().min(2).max(100).required(),
  reporterEmail: Joi.string().email().required(),
  reporterPhone: Joi.string().pattern(/^[\+]?[1-9][\d]{0,15}$/).optional(),
  latitude: Joi.number().min(-90).max(90).optional(),
  longitude: Joi.number().min(-180).max(180).optional(),
  images: Joi.array().items(Joi.string().uri()).max(5).optional()
});

// Rule-based routing logic
function determineDepartment(report) {
  const { category, location, title, description } = report;
  
  // Convert to lowercase for case-insensitive matching
  const searchText = `${title} ${description} ${location}`.toLowerCase();
  
  // Priority-based routing rules
  const routingRules = [
    // Water-related issues
    {
      keywords: ['water', 'leak', 'flood', 'sewage', 'drainage', 'pipe', 'hydrant'],
      department: 'water-supply',
      priority: 'high'
    },
    // Road and infrastructure issues
    {
      keywords: ['pothole', 'sidewalk', 'road', 'street', 'asphalt', 'concrete', 'crack'],
      department: 'road-maintenance',
      priority: 'medium'
    },
    // Sanitation issues
    {
      keywords: ['garbage', 'trash', 'waste', 'recycling', 'dumpster', 'litter', 'sanitation'],
      department: 'sanitation',
      priority: 'medium'
    },
    // Public works issues
    {
      keywords: ['street light', 'traffic light', 'signal', 'lamp', 'electrical', 'power'],
      department: 'public-works',
      priority: 'high'
    },
    // Noise and general issues
    {
      keywords: ['noise', 'construction', 'vandalism', 'graffiti', 'disturbance'],
      department: 'general',
      priority: 'low'
    }
  ];
  
  // Check each rule
  for (const rule of routingRules) {
    if (rule.keywords.some(keyword => searchText.includes(keyword))) {
      return {
        departmentId: rule.department,
        department: departments.find(d => d.id === rule.department),
        confidence: 0.9,
        reason: `Matched keywords: ${rule.keywords.filter(k => searchText.includes(k)).join(', ')}`
      };
    }
  }
  
  // Fallback to category-based routing
  const categoryMapping = {
    'sanitation': 'sanitation',
    'public-works': 'public-works',
    'road-maintenance': 'road-maintenance',
    'water-supply': 'water-supply',
    'other': 'general'
  };
  
  const departmentId = categoryMapping[category] || 'general';
  return {
    departmentId,
    department: departments.find(d => d.id === departmentId),
    confidence: 0.7,
    reason: `Category-based routing: ${category}`
  };
}

// Generate report ID
function generateReportId() {
  const year = new Date().getFullYear();
  const random = Math.random().toString(36).substr(2, 6).toUpperCase();
  return `CR-${year}-${random}`;
}

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Authentication routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user);

    // Return user data (without password)
    const userData = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    };

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: userData,
        token: accessToken,
        refreshToken: refreshToken
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Token verification endpoint
app.post('/api/auth/verify', authenticateToken, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Token is valid',
    data: {
      user: {
        id: req.user.id,
        email: req.user.email,
        role: req.user.role
      }
    }
  });
});

// Token refresh endpoint
app.post('/api/auth/refresh', authenticateToken, (req, res) => {
  try {
    const user = users.find(u => u.id === req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const { accessToken } = generateTokens(user);

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        token: accessToken
      }
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Logout endpoint
app.post('/api/auth/logout', authenticateToken, (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (token) {
    tokenBlacklist.add(token);
  }

  res.status(200).json({
    success: true,
    message: 'Logout successful'
  });
});

// Get all departments (protected)
app.get('/api/departments', authenticateToken, (req, res) => {
  res.json({
    success: true,
    data: departments
  });
});

// Submit new report (protected)
app.post('/api/reports', authenticateToken, async (req, res) => {
  try {
    // Validate request body
    const { error, value } = reportSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.details.map(d => d.message)
      });
    }

    // Determine department using rule-based routing
    const routingResult = determineDepartment(value);
    
    // Create report object
    const report = {
      id: generateReportId(),
      ...value,
      status: 'open',
      assignedDepartment: routingResult.departmentId,
      assignedDepartmentName: routingResult.department.name,
      routingConfidence: routingResult.confidence,
      routingReason: routingResult.reason,
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Store report
    reports.push(report);

    // Emit real-time updates
    emitReportUpdate('report:new', {
      report,
      department: routingResult.department,
      routingDetails: {
        confidence: routingResult.confidence,
        reason: routingResult.reason
      }
    });

    // Emit updated statistics
    const stats = {
      total: reports.length,
      byStatus: {
        open: reports.filter(r => r.status === 'open').length,
        'in-progress': reports.filter(r => r.status === 'in-progress').length,
        'under-review': reports.filter(r => r.status === 'under-review').length,
        resolved: reports.filter(r => r.status === 'resolved').length
      },
      byDepartment: departments.reduce((acc, dept) => {
        acc[dept.id] = reports.filter(r => r.assignedDepartment === dept.id).length;
        return acc;
      }, {})
    };
    emitReportUpdate('reports:stats', stats);

    // Prepare response
    const response = {
      success: true,
      message: 'Report submitted successfully',
      data: {
        reportId: report.id,
        assignedDepartment: {
          id: routingResult.department.id,
          name: routingResult.department.name,
          email: routingResult.department.email,
          phone: routingResult.department.phone
        },
        routingDetails: {
          confidence: routingResult.confidence,
          reason: routingResult.reason
        },
        status: report.status,
        submittedAt: report.submittedAt
      }
    };

    res.status(201).json(response);

  } catch (error) {
    console.error('Error processing report:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to process report submission'
    });
  }
});

// Get all reports (protected)
app.get('/api/reports', authenticateToken, (req, res) => {
  const { department, status, limit = 50, offset = 0 } = req.query;
  
  let filteredReports = [...reports];
  
  if (department) {
    filteredReports = filteredReports.filter(r => r.assignedDepartment === department);
  }
  
  if (status) {
    filteredReports = filteredReports.filter(r => r.status === status);
  }
  
  const paginatedReports = filteredReports
    .slice(parseInt(offset), parseInt(offset) + parseInt(limit))
    .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
  
  res.json({
    success: true,
    data: {
      reports: paginatedReports,
      total: filteredReports.length,
      limit: parseInt(limit),
      offset: parseInt(offset)
    }
  });
});

// Get specific report
app.get('/api/reports/:id', authenticateToken, (req, res) => {
  const report = reports.find(r => r.id === req.params.id);
  
  if (!report) {
    return res.status(404).json({
      success: false,
      error: 'Report not found'
    });
  }
  
  res.json({
    success: true,
    data: report
  });
});

// Update report status (protected)
app.patch('/api/reports/:id/status', authenticateToken, (req, res) => {
  const { status } = req.body;
  const validStatuses = ['open', 'in-progress', 'under-review', 'resolved', 'closed'];
  
  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid status',
      validStatuses
    });
  }
  
  const reportIndex = reports.findIndex(r => r.id === req.params.id);
  
  if (reportIndex === -1) {
    return res.status(404).json({
      success: false,
      error: 'Report not found'
    });
  }
  
  reports[reportIndex].status = status;
  reports[reportIndex].updatedAt = new Date().toISOString();
  
  // Emit real-time update
  emitReportUpdate('report:status-updated', {
    reportId: req.params.id,
    status,
    updatedAt: reports[reportIndex].updatedAt
  });

  // Emit updated statistics
  const stats = {
    total: reports.length,
    byStatus: {
      open: reports.filter(r => r.status === 'open').length,
      'in-progress': reports.filter(r => r.status === 'in-progress').length,
      'under-review': reports.filter(r => r.status === 'under-review').length,
      resolved: reports.filter(r => r.status === 'resolved').length
    },
    byDepartment: departments.reduce((acc, dept) => {
      acc[dept.id] = reports.filter(r => r.assignedDepartment === dept.id).length;
      return acc;
    }, {})
  };
  emitReportUpdate('reports:stats', stats);
  
  res.json({
    success: true,
    message: 'Report status updated successfully',
    data: reports[reportIndex]
  });
});

// Reassign report to different department (protected)
app.patch('/api/reports/:id/reassign', authenticateToken, (req, res) => {
  const { departmentId } = req.body;
  
  const department = departments.find(d => d.id === departmentId);
  if (!department) {
    return res.status(400).json({
      success: false,
      error: 'Invalid department ID',
      validDepartments: departments.map(d => ({ id: d.id, name: d.name }))
    });
  }
  
  const reportIndex = reports.findIndex(r => r.id === req.params.id);
  
  if (reportIndex === -1) {
    return res.status(404).json({
      success: false,
      error: 'Report not found'
    });
  }
  
  reports[reportIndex].assignedDepartment = departmentId;
  reports[reportIndex].assignedDepartmentName = department.name;
  reports[reportIndex].updatedAt = new Date().toISOString();
  
  // Emit real-time update
  emitReportUpdate('report:reassigned', {
    reportId: req.params.id,
    newDepartment: {
      id: departmentId,
      name: department.name
    },
    updatedAt: reports[reportIndex].updatedAt
  });

  // Emit updated statistics
  const stats = {
    total: reports.length,
    byStatus: {
      open: reports.filter(r => r.status === 'open').length,
      'in-progress': reports.filter(r => r.status === 'in-progress').length,
      'under-review': reports.filter(r => r.status === 'under-review').length,
      resolved: reports.filter(r => r.status === 'resolved').length
    },
    byDepartment: departments.reduce((acc, dept) => {
      acc[dept.id] = reports.filter(r => r.assignedDepartment === dept.id).length;
      return acc;
    }, {})
  };
  emitReportUpdate('reports:stats', stats);
  
  res.json({
    success: true,
    message: 'Report reassigned successfully',
    data: reports[reportIndex]
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Resolve It Backend API running on port ${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📊 Reports endpoint: http://localhost:${PORT}/api/reports`);
  console.log(`🏢 Departments endpoint: http://localhost:${PORT}/api/departments`);
  console.log(`🔌 WebSocket server: ws://localhost:${PORT}`);
});

module.exports = app;
