# Natural Disaster Management System - API Documentation

## Overview
This is a comprehensive natural disaster management system that provides real-time tracking, alerting, and rescue coordination capabilities. The system integrates with external weather services (GDACS and Azure Maps) to monitor storms and natural disasters, tracks user locations, and manages priority-based rescue operations.

## Base URL
```
http://localhost:3000
```

## Authentication
Currently, the API does not implement authentication. All endpoints are publicly accessible.

## Data Models

### UserLocation
```json
{
  "id": "string (cuid)",
  "userId": "string (unique)",
  "lat": "number (float)",
  "lon": "number (float)", 
  "timestamp": "datetime"
}
```

### Alert
```json
{
  "id": "string (cuid)",
  "userId": "string",
  "message": "string",
  "read": "boolean (default: false)",
  "timestamp": "datetime"
}
```

### StormSnapshot
```json
{
  "id": "string (cuid)",
  "lat": "number (float)",
  "lon": "number (float)",
  "radius": "number (float)",
  "severity": "number (integer)",
  "timestamp": "datetime"
}
```

### PriorityQueue
```json
{
  "id": "string (cuid)",
  "userId": "string",
  "danger": "number (float)",
  "timestamp": "datetime"
}
```

---

## API Endpoints

### 1. Location Management

#### POST `/api/locations/post`
**Description**: Save or update a user's location coordinates.

**Request Body**:
```json
{
  "userId": "string (required)",
  "lat": "number (required)",
  "lon": "number (required)"
}
```

**Response**:
- **Success (200)**:
```json
{
  "message": "location updated"
}
```

- **Error (400)**:
```json
{
  "error": "Need all data to continue"
}
```

- **Error (500)**:
```json
{
  "error": "internal software error"
}
```

**Notes**: 
- Uses upsert operation (create if not exists, update if exists)
- Automatically adds user to priority queue
- Updates timestamp to current time

#### GET `/api/locations/get`
**Description**: Retrieve all user locations from the database.

**Response**:
- **Success (200)**:
```json
[
  {
    "id": "string",
    "userId": "string",
    "lat": "number",
    "lon": "number",
    "timestamp": "datetime"
  }
]
```

- **Error (500)**:
```json
{
  "error": "internal server error"
}
```

---

### 2. Storm Management

#### GET `/api/storms/update`
**Description**: Fetch latest storm data from GDACS and Azure Maps, process impact zones, and send alerts to affected users.

**Response**:
- **Success (200)**:
```json
{
  "success": true,
  "storms": [
    {
      "id": "string",
      "name": "string",
      "lat": "number",
      "lon": "number",
      "severity": "number",
      "zone": "geojson object",
      "impactZones": [
        {
          "polygon": "geojson geometry",
          "severity": "number"
        }
      ],
      "priorityQueue": [
        {
          "userId": "string",
          "lat": "number",
          "lon": "number",
          "distance": "number",
          "danger": "number"
        }
      ]
    }
  ]
}
```

- **Error (500)**:
```json
{
  "error": "Failed to update storms"
}
```

**Notes**:
- Fetches data from GDACS RSS feed
- Gets detailed polygon data for each storm
- Integrates with Azure Maps for impact zone analysis
- Automatically creates storm snapshots in database
- Identifies affected users using point-in-polygon algorithms
- Sends push notifications to users in danger zones
- Builds priority queue based on danger level and distance

---

### 3. Priority Management

#### POST `/api/priorities/`
**Description**: Calculate priority queue for users affected by a specific storm and send alerts.

**Request Body**:
```json
{
  "lat": "number",
  "lon": "number", 
  "radius": "number",
  "severity": "number"
}
```

**Response**:
- **Success (200)**:
```json
{
  "priorityQueue": [
    {
      "userId": "string",
      "lat": "number",
      "lon": "number",
      "distance": "number",
      "danger": "number"
    }
  ],
  "affectedCount": "number"
}
```

- **Error (500)**:
```json
{
  "error": "Failed to calculate priority"
}
```

**Notes**:
- Uses heap-based priority queue (max-heap by danger level)
- Calculates danger score based on distance and severity
- Considers Azure Maps impact zones for enhanced danger calculation
- Automatically sends alerts to all affected users
- Returns top 50 most at-risk users

---

### 4. Tracking & Rescue Operations

#### POST `/api/track/safe`
**Description**: Mark a user as safe when a responder is within the specified radius.

**Request Body**:
```json
{
  "responderId": "string (required)",
  "userId": "string (required)",
  "responderLat": "number (required)",
  "responderLon": "number (required)"
}
```

**Response**:
- **Success (200)**:
```json
{
  "success": true,
  "user": {
    "id": "string",
    "userId": "string",
    "lat": "number",
    "lon": "number",
    "safe": true,
    "timestamp": "datetime"
  }
}
```

- **Error (400)**:
```json
{
  "success": false,
  "error": "User is outside the allowed radius"
}
```

- **Error (500)**:
```json
{
  "error": "User not found"
}
```

**Notes**:
- Default radius is 50 feet (15.24 meters)
- Uses Haversine formula for distance calculation
- Updates user's safe status in database

#### POST `/api/track/respond`
**Description**: Register a responder's attempt to reach a user and check if they're within range.

**Request Body**:
```json
{
  "responderId": "string (required)",
  "userId": "string (required)",
  "responderLat": "number (required)",
  "responderLon": "number (required)"
}
```

**Response**:
- **Success (200)**:
```json
{
  "success": true,
  "userId": "string",
  "distanceKm": "number"
}
```

- **Error (400)**:
```json
{
  "success": false,
  "error": "User is outside the allowed radius"
}
```

- **Error (500)**:
```json
{
  "error": "User not found"
}
```

**Notes**:
- Default radius is 50 feet (15.24 meters)
- Returns distance in kilometers
- Does not update user status (use `/safe` endpoint for that)

#### GET `/api/track/counter`
**Description**: Get rescue operation statistics and counters.

**Response**:
- **Success (200)**:
```json
{
  "totalUsers": "number",
  "safeUsers": "number",
  "atRiskUsers": "number",
  "activeResponders": "number",
  "rescueAttempts": "number"
}
```

- **Error (500)**:
```json
{
  "error": "Failed to get rescue stats"
}
```

---

## External Service Integrations

### GDACS (Global Disaster Alert and Coordination System)
- **Endpoint**: `https://www.gdacs.org/xml/rss.xml`
- **Purpose**: Fetches real-time disaster information
- **Data Format**: RSS XML
- **Usage**: Storm detection and basic information

### Azure Maps Weather API
- **Endpoint**: `https://atlas.microsoft.com/weather/tropical/storms/locations/json`
- **Purpose**: Detailed storm impact zones and wind radius data
- **Authentication**: Requires `AZURE_MAPS_KEY` environment variable
- **Usage**: Enhanced danger zone calculation

### Push Notification Service
- **Endpoint**: `https://push-api.example.com/send`
- **Purpose**: Send emergency alerts to mobile devices
- **Usage**: Real-time user notifications

---

## Error Handling

### Common HTTP Status Codes
- **200**: Success
- **400**: Bad Request (missing required fields)
- **500**: Internal Server Error

### Error Response Format
```json
{
  "error": "Error message description"
}
```

---

## Environment Variables

Required environment variables:
```bash
PORT=3000
DATABASE_URL="your_sqlserver_connection_string"
AZURE_MAPS_KEY="your_azure_maps_api_key"
```

---

## Database Schema

The system uses SQL Server with Prisma ORM. Key tables:

1. **UserLocation**: Stores user coordinates and timestamps
2. **Alert**: Manages emergency notifications
3. **StormSnapshot**: Historical storm data
4. **PriorityQueue**: Rescue priority management

---

## Algorithm Details

### Priority Calculation
```javascript
danger = (1 - distance / radius) * severity * 100
```

### Distance Calculation
Uses Haversine formula for accurate geographic distance:
```javascript
distance = 2 * R * atan2(sqrt(a), sqrt(1-a))
```

### Point-in-Polygon
Ray casting algorithm for determining if users are within storm impact zones.

---

## Rate Limiting & Performance

- No rate limiting currently implemented
- Priority queue limited to top 50 users for performance
- Database queries optimized with Prisma ORM
- External API calls cached where possible

---

## Security Considerations

- No authentication/authorization implemented
- All endpoints are publicly accessible
- Input validation on required fields only
- SQL injection protection via Prisma ORM

---

## Future Enhancements

1. Implement JWT-based authentication
2. Add rate limiting middleware
3. Implement WebSocket for real-time updates
4. Add comprehensive input validation
5. Implement API versioning
6. Add request/response logging
7. Implement health check endpoints
