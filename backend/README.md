# Resolve It Backend API

A Node.js/Express.js API for automatically routing civic issue reports to the correct department based on issue type and location using rule-based mapping.

## Features

- **Automatic Report Routing**: Intelligent routing based on keywords and categories
- **Rule-Based Mapping**: Configurable rules for department assignment
- **RESTful API**: Clean, well-documented endpoints
- **Input Validation**: Comprehensive request validation using Joi
- **Rate Limiting**: Protection against abuse
- **CORS Support**: Cross-origin resource sharing enabled
- **Security**: Helmet.js for security headers
- **Logging**: Morgan for HTTP request logging

## API Endpoints

### Health Check
```
GET /api/health
```
Returns API status and version information.

### Departments
```
GET /api/departments
```
Returns list of all available departments.

### Submit Report
```
POST /api/reports
```
Submit a new civic issue report. The API will automatically route it to the appropriate department.

**Request Body:**
```json
{
  "title": "Large pothole on Main Street",
  "description": "There is a large pothole causing traffic issues...",
  "location": "123 Main Street, Downtown",
  "category": "road-maintenance",
  "priority": "high",
  "reporterName": "John Smith",
  "reporterEmail": "john.smith@email.com",
  "reporterPhone": "+1234567890",
  "latitude": 40.7128,
  "longitude": -74.0060,
  "images": ["https://example.com/image1.jpg"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Report submitted successfully",
  "data": {
    "reportId": "CR-2024-ABC123",
    "assignedDepartment": {
      "id": "road-maintenance",
      "name": "Road Maintenance Department",
      "email": "roads@city.gov",
      "phone": "(555) 345-6789"
    },
    "routingDetails": {
      "confidence": 0.9,
      "reason": "Matched keywords: pothole, road"
    },
    "status": "open",
    "submittedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Get Reports
```
GET /api/reports?department=sanitation&status=open&limit=10&offset=0
```
Retrieve reports with optional filtering.

### Get Specific Report
```
GET /api/reports/:id
```
Get details of a specific report.

### Update Report Status
```
PATCH /api/reports/:id/status
```
Update the status of a report.

**Request Body:**
```json
{
  "status": "in-progress"
}
```

### Reassign Report
```
PATCH /api/reports/:id/reassign
```
Reassign a report to a different department.

**Request Body:**
```json
{
  "departmentId": "sanitation"
}
```

## Department Categories

The API supports the following departments and their associated categories:

1. **Sanitation Department**
   - Garbage collection
   - Waste management
   - Recycling
   - Sanitation issues

2. **Public Works Department**
   - Street lights
   - Traffic signals
   - Public infrastructure
   - Electrical issues

3. **Road Maintenance Department**
   - Potholes
   - Sidewalks
   - Road repairs
   - Street maintenance

4. **Water Supply Department**
   - Water leaks
   - Water supply issues
   - Sewage problems
   - Drainage issues

5. **General Services Department**
   - Noise complaints
   - Vandalism
   - General issues
   - Other miscellaneous problems

## Routing Logic

The API uses a sophisticated rule-based routing system:

1. **Keyword Matching**: Analyzes title, description, and location for specific keywords
2. **Priority Assignment**: Assigns priority levels based on issue type
3. **Confidence Scoring**: Provides confidence levels for routing decisions
4. **Fallback Routing**: Uses category-based routing when keyword matching fails

### Example Routing Rules

```javascript
{
  keywords: ['water', 'leak', 'flood', 'sewage', 'drainage', 'pipe', 'hydrant'],
  department: 'water-supply',
  priority: 'high'
}
```

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Start the production server:
```bash
npm start
```

## Testing

Run the test suite to verify API functionality:

```bash
node test-api.js
```

This will test all endpoints with sample data and demonstrate the auto-routing functionality.

## Environment Variables

Create a `.env` file with the following variables:

```env
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

## Security Features

- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Input Validation**: Comprehensive validation using Joi
- **Security Headers**: Helmet.js for security headers
- **CORS**: Configurable cross-origin resource sharing
- **Error Handling**: Proper error responses without sensitive information

## Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "error": "Validation failed",
  "details": ["title is required"]
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details.
