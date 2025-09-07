# Notification Service Setup

## Firebase Cloud Messaging (FCM) Configuration

### 1. Get FCM Server Key
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing project
3. Go to Project Settings > Cloud Messaging
4. Copy the "Server key" from the Cloud Messaging tab

### 2. Environment Variables
Add to your `.env` file:
```
FCM_SERVER_KEY=your_fcm_server_key_here
```

### 3. Database Migration
Run the following to update your database schema:
```bash
npx prisma db push
```

## API Endpoints

### Alert Creation
- `POST /api/notifications/alert` - Create general alert
- `POST /api/notifications/sos` - Create SOS alert
- `POST /api/notifications/storm` - Create storm alert
- `POST /api/notifications/rescue` - Create rescue alert
- `POST /api/notifications/safe` - Create safe alert
- `POST /api/notifications/evacuation` - Create evacuation alert
- `POST /api/notifications/all-clear` - Create all clear alert

### Bulk Operations
- `POST /api/notifications/bulk` - Send bulk notifications

### User Management
- `GET /api/notifications/user/:userId` - Get user alerts
- `PUT /api/notifications/read/:alertId` - Mark alert as read
- `POST /api/notifications/device/register` - Register device token

## Usage Examples

### Create Storm Alert
```bash
curl -X POST http://localhost:3000/api/notifications/storm \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "stormName": "Hurricane Maria",
    "severity": 5
  }'
```

### Register Device Token
```bash
curl -X POST http://localhost:3000/api/notifications/device/register \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "pushToken": "fcm_token_here",
    "deviceType": "android"
  }'
```

### Send Bulk Notifications
```bash
curl -X POST http://localhost:3000/api/notifications/bulk \
  -H "Content-Type: application/json" \
  -d '{
    "userIds": ["user1", "user2", "user3"],
    "message": "Emergency evacuation order for your area",
    "alertType": "evacuation"
  }'
```

## Alert Types
- `general` - General alerts
- `sos` - SOS emergency alerts
- `storm` - Storm-related alerts
- `rescue` - Rescue operation alerts
- `safe` - Safety confirmation alerts
- `evacuation` - Evacuation orders
- `all_clear` - All clear notifications
- `bulk` - Bulk notifications

## Frontend Integration

### Register Device Token (Android)
```kotlin
// Get FCM token
FirebaseMessaging.getInstance().token.addOnCompleteListener { task ->
    if (task.isSuccessful) {
        val token = task.result
        // Send token to backend
        apiService.registerDeviceToken(userId, token, "android")
    }
}
```

### Handle Notifications
```kotlin
// In your FirebaseMessagingService
override fun onMessageReceived(remoteMessage: RemoteMessage) {
    val title = remoteMessage.notification?.title ?: "Disaster Alert"
    val body = remoteMessage.notification?.body ?: ""
    
    // Show notification
    showNotification(title, body)
    
    // Mark as read in backend
    val alertId = remoteMessage.data["alertId"]
    if (alertId != null) {
        apiService.markAlertAsRead(alertId)
    }
}
```
