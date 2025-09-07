# DISASTER RESPONSE SYSTEM - CHEAT SHEET

## API ENDPOINTS

### STORM DATA
```
GET /api/storms/update
Returns: { success: true, storms: [StormObject] }

Storm Object:
{
  "id": "unknown",
  "name": "Orange alert for tropical cyclone TAPAH-25...",
  "lat": 20,
  "lon": 113.6,
  "severity": 1,
  "zone": null,
  "impactZones": [
    {
      "polygon": { "type": "Polygon", "coordinates": [[[113.2,21.25],[113.29,21.24],...]] },
      "severity": 5,
      "radius": 50,
      "windSpeed": 88.88,
      "type": "wind",
      "source": "azure_maps_real_wind_data",
      "stormId": "NP22",
      "stormName": "TAPAH",
      "zoneName": "Outer"
    }
  ]
}
```

### USER LOCATIONS
```
GET /api/locations/get
Returns: [UserLocationObject]

UserLocation:
{
  "id": "string",
  "userId": "user123",
  "lat": 47.6062,
  "lon": -122.3321,
  "safe": false,
  "timestamp": "2025-01-09T20:30:00.000Z"
}
```

### PRIORITY USERS
```
POST /api/priorities
Body: { "impactZones": [ImpactZoneObject] }
Returns: { "priorityQueue": [PriorityUserObject], "affectedCount": number }

PriorityUser:
{
  "userId": "user123",
  "lat": 47.6062,
  "lon": -122.3321,
  "danger": 500,
  "timestamp": "2025-01-09T20:30:00.000Z"
}
```

### RESCUE STATS
```
GET /api/track/counter
Returns: {
  "totalUsers": 150,
  "safeUsers": 45,
  "atRiskUsers": 105,
  "activeResponders": 0,
  "rescueAttempts": 0
}
```

## DISTANCE CALCULATION

```javascript
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = Math.sin(dLat/2)² + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon/2)²;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}
```

## IMPACT ZONE CALCULATION

### Wind Thresholds
```javascript
const windThresholds = [
  { speed: windSpeed * 0.8, radius: 50, name: 'Outer' },
  { speed: windSpeed * 0.9, radius: 30, name: 'Middle' },
  { speed: windSpeed, radius: 20, name: 'Inner' },
  { speed: maxWindGust, radius: 15, name: 'Core' }
];
```

### Polygon Generation
```javascript
function createWindRadiusPolygon(centerLat, centerLon, radiusKm, windSpeed) {
  const points = [];
  const numPoints = 32;
  
  for (let i = 0; i < numPoints; i++) {
    const angle = (i * 360) / numPoints;
    const radians = (angle * Math.PI) / 180;
    const latOffset = (radiusKm / 111) * Math.cos(radians);
    const lonOffset = (radiusKm / (111 * Math.cos(centerLat * Math.PI / 180))) * Math.sin(radians);
    points.push([centerLon + lonOffset, centerLat + latOffset]);
  }
  
  points.push(points[0]);
  return points;
}
```

### Severity Classification
```javascript
function getSeverityFromWindSpeed(windSpeed) {
  if (windSpeed >= 74) return 5;
  if (windSpeed >= 64) return 4;
  if (windSpeed >= 39) return 3;
  if (windSpeed >= 25) return 2;
  return 1;
}
```

## POINT-IN-POLYGON DETECTION

```javascript
function pointInPolygon(point, polygon) {
  let x = point[0], y = point[1];
  let inside = false;
  
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    let xi = polygon[i][0], yi = polygon[i][1];
    let xj = polygon[j][0], yj = polygon[j][1];
    
    let intersect = ((yi > y) !== (yj > y)) &&
                    (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}
```

## PRIORITY QUEUE SYSTEM

### Max-Heap
```javascript
import { Heap } from 'heap-js';

export const priorityQueue = new Heap((a, b) => b.danger - a.danger);

priorityQueue.push({ userId, lat, lon, danger });
const mostDangerous = priorityQueue.pop();
const topUsers = priorityQueue.toArray().slice(0, 50);
```

### Priority Calculation
```javascript
export async function flagUsersInStorm(impactZones) {
  const users = await prisma.userLocation.findMany();
  priorityQueue.clear();

  for (const user of users) {
    let danger = 0;
    let inHighImpactZone = false;

    for (const zone of impactZones) {
      if (pointInPolygon([user.lat, user.lon], zone.polygon.coordinates[0])) {
        if (zone.severity >= 3) {
          inHighImpactZone = true;
          danger = zone.severity * 100;
          break;
        }
      }
    }

    if (inHighImpactZone) {
      priorityQueue.push({ ...user, danger });
    }
  }

  return priorityQueue.toArray().slice(0, 50);
}
```

## FRONTEND USAGE

### API Service
```kotlin
interface ApiService {
    @GET("storms/update")
    suspend fun getStorms(): Response<StormResponse>
    
    @GET("locations/get")
    suspend fun getAllLocations(): Response<List<UserLocation>>
    
    @POST("priorities")
    suspend fun getPriorityUsers(@Body request: PriorityRequest): Response<PriorityResponse>
    
    @GET("track/counter")
    suspend fun getRescueStats(): Response<RescueStats>
    
    @GET("locations/export-csv")
    suspend fun exportLocationsCSV(): Response<ResponseBody>
}
```

### Data Models
```kotlin
data class Storm(
    val id: String,
    val name: String,
    val lat: Double,
    val lon: Double,
    val severity: Int,
    val impactZones: List<ImpactZone>
)

data class ImpactZone(
    val polygon: Polygon,
    val severity: Int,
    val radius: Double,
    val windSpeed: Double,
    val type: String,
    val source: String,
    val stormId: String,
    val stormName: String,
    val zoneName: String
)

data class UserLocation(
    val id: String,
    val userId: String,
    val lat: Double,
    val lon: Double,
    val safe: Boolean,
    val timestamp: String
)
```

### ViewModel
```kotlin
class AppViewModel : ViewModel() {
    private val _storms = MutableStateFlow<List<Storm>>(emptyList())
    val storms: StateFlow<List<Storm>> = _storms.asStateFlow()
    
    fun fetchStorms() {
        viewModelScope.launch {
            try {
                val response = apiService.getStorms()
                if (response.isSuccessful) {
                    _storms.value = response.body()?.storms ?: emptyList()
                }
            } catch (e: Exception) {
                // Handle error
            }
        }
    }
}
```

## MAP VISUALIZATION

### Storm Markers
```kotlin
@Composable
fun StormMarkers(storms: List<Storm>) {
    storms.forEach { storm ->
        Marker(
            state = MarkerState(position = LatLng(storm.lat, storm.lon)),
            title = storm.name,
            snippet = "Severity: ${storm.severity}"
        )
    }
}
```

### Impact Zone Polygons
```kotlin
@Composable
fun ImpactZonePolygons(impactZones: List<ImpactZone>) {
    impactZones.forEach { zone ->
        val coordinates = zone.polygon.coordinates[0].map { coord ->
            LatLng(coord[1], coord[0])
        }
        
        Polygon(
            points = coordinates,
            fillColor = getSeverityColor(zone.severity),
            strokeColor = Color.Red,
            strokeWidth = 2f
        )
    }
}
```

### User Location Markers
```kotlin
@Composable
fun UserLocationMarkers(users: List<UserLocation>) {
    users.forEach { user ->
        Marker(
            state = MarkerState(position = LatLng(user.lat, user.lon)),
            title = user.userId,
            snippet = if (user.safe) "Safe" else "At Risk",
            icon = if (user.safe) BitmapDescriptorFactory.defaultMarker(BitmapDescriptorFactory.HUE_GREEN)
                   else BitmapDescriptorFactory.defaultMarker(BitmapDescriptorFactory.HUE_RED)
        )
    }
}
```

## RESCUE OPERATIONS

### Mark User Safe
```kotlin
fun markUserSafe(responderId: String, userId: String, responderLat: Double, responderLon: Double) {
    viewModelScope.launch {
        try {
            val request = MarkSafeRequest(responderId, userId, responderLat, responderLon)
            val response = apiService.markUserSafe(request)
            if (response.isSuccessful) {
                fetchUserLocations()
                fetchRescueStats()
            }
        } catch (e: Exception) {
            // Handle error
        }
    }
}
```

### Distance Validation
```kotlin
fun validateRescueDistance(userLat: Double, userLon: Double, responderLat: Double, responderLon: Double): Boolean {
    val distance = calculateHaversineDistance(userLat, userLon, responderLat, responderLon)
    val maxDistance = 0.01524 // 50 feet in kilometers
    return distance <= maxDistance
}

fun calculateHaversineDistance(lat1: Double, lon1: Double, lat2: Double, lon2: Double): Double {
    val R = 6371.0
    val dLat = Math.toRadians(lat2 - lat1)
    val dLon = Math.toRadians(lon2 - lon1)
    val a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2)
    val c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
}
```

## CSV EXPORT

### Backend
```
GET /api/locations/export-csv
Returns: CSV file download
Headers: Content-Type: text/csv, Content-Disposition: attachment; filename="user_locations.csv"
```

### Frontend
```kotlin
fun exportLocationsCSV() {
    viewModelScope.launch {
        try {
            val response = apiService.exportLocationsCSV()
            if (response.isSuccessful) {
                val csvData = response.body()?.string()
                csvData?.let { data ->
                    saveCSVToDevice(data)
                }
            }
        } catch (e: Exception) {
            // Handle error
        }
    }
}

private fun saveCSVToDevice(csvData: String) {
    try {
        val downloadsDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS)
        val fileName = "user_locations_${System.currentTimeMillis()}.csv"
        val file = File(downloadsDir, fileName)
        file.writeText(csvData)
        Log.d("CSV Export", "File saved: ${file.absolutePath}")
    } catch (e: Exception) {
        Log.e("CSV Export", "Error: ${e.message}")
    }
}
```

## NOTIFICATION SYSTEM

### Alert Creation
```javascript
export async function createAlert(userId, message) {
  await prisma.alert.create({
    data: { userId, message, timestamp: new Date(), read: false }
  });
  
  await sendPushNotification(userId, message);
}
```

### Frontend Notification
```kotlin
fun showDangerAlert(userId: String, dangerLevel: Int) {
    val message = when {
        dangerLevel >= 500 -> "🚨 EXTREME DANGER! Evacuate immediately!"
        dangerLevel >= 300 -> "⚠️ HIGH DANGER! Seek shelter now!"
        dangerLevel >= 100 -> "⚠️ MODERATE DANGER! Stay alert!"
        else -> "ℹ️ Low risk area"
    }
    
    showNotification("Disaster Alert", message)
}
```

## KEY ALGORITHMS

### Distance Calculation
- Algorithm: Haversine formula
- Purpose: Calculate great-circle distance between two points
- Complexity: O(1)
- Usage: Storm proximity, rescue validation

### Point-in-Polygon
- Algorithm: Ray casting
- Purpose: Determine if user is inside impact zone
- Complexity: O(n) where n = polygon vertices
- Usage: Danger assessment

### Priority Queue
- Algorithm: Max-heap
- Purpose: Sort users by danger level
- Complexity: O(log n) for insert/extract
- Usage: Rescue prioritization

### Impact Zone Generation
- Algorithm: Circular polygon with 32 points
- Purpose: Create storm impact boundaries
- Complexity: O(1) for each zone
- Usage: Visual representation, danger assessment

## EMERGENCY RESPONSE FLOW

1. Storm Detection → GDACS API → Parse XML → Extract storm data
2. Impact Zone Creation → Azure Maps → Wind data → Generate polygons
3. User Location Update → GPS → Database → Priority queue
4. Danger Assessment → Point-in-polygon → Severity calculation
5. Priority Calculation → Heap sort → Top 50 most dangerous
6. Alert Generation → Notifications → Push alerts
7. Rescue Operations → Distance validation → Mark safe
8. Statistics Update → Real-time metrics → Dashboard

## FRONTEND SCREENS

### Map Screen
- Storm markers (red)
- Impact zone polygons (colored by severity)
- User location markers (green=safe, red=at risk)
- Priority user markers (yellow=high danger)

### Tracking Screen
- Active storms list
- Priority users list
- Rescue statistics
- Danger alerts

### Settings Screen
- CSV export button
- Notification preferences
- Location update frequency

## TROUBLESHOOTING

### Common Issues
1. Lat/Lon Swapped: Check coordinate order in database
2. Empty Impact Zones: Verify Azure Maps API key
3. Distance Calculation Wrong: Ensure Haversine formula is correct
4. Point-in-Polygon Fails: Check polygon coordinate format
5. Priority Queue Empty: Verify severity thresholds

### Debug Commands
```bash
curl -X GET http://localhost:3000/api/storms/update
curl -X GET http://localhost:3000/api/locations/get
curl -X POST http://localhost:3000/api/priorities -H "Content-Type: application/json" -d '{"impactZones":[]}'
curl -X GET http://localhost:3000/api/locations/export-csv
```

## QUICK REFERENCE

### API Endpoints
- GET /api/storms/update - Get storm data
- GET /api/locations/get - Get user locations
- POST /api/locations/post - Update user location
- POST /api/priorities - Calculate priorities
- GET /api/track/counter - Get rescue stats
- POST /api/track/safe - Mark user safe
- GET /api/locations/export-csv - Export CSV

### Key Constants
- Earth radius: 6371 km
- Max rescue distance: 50 feet (0.01524 km)
- Max storm search radius: 1000 km
- Priority queue size: 50 users
- Impact zone points: 32 (smooth circle)

### Severity Levels
- 1: Light winds (< 25 km/h)
- 2: Category 2 (25-39 km/h)
- 3: Category 3 (39-64 km/h)
- 4: Category 4 (64-74 km/h)
- 5: Category 5 (≥ 74 km/h)
