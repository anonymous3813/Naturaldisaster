package com.selfemploye.naturaldisaster.models

// ======================
// Tracking API
// ======================

// Requests
data class SafeOrRespondRequest(
    val responderId: String,
    val userId: String,
    val responderLat: Double,
    val responderLon: Double
)

// Responses
data class SuccessResponse(
    val success: Boolean
)

data class RescueStatsResponse(
    val totalUsers: Int,
    val safeUsers: Int,
    val rescuedUsers: Int
)


// ======================
// Storms API
// ======================

// Responses
data class StormUpdateResponse(
    val success: Boolean,
    val storms: List<Storm>
)



// ======================
// Priorities API
// ======================

// Requests
data class PriorityRequest(
    val impactZones: List<ImpactZone>
)

// Responses
data class PriorityResponse(
    val priorityQueue: List<String>,
    val affectedCount: Int
)


// ======================
// Locations API
// ======================

// Requests
data class UserLocationRequest(
    val userId: String,
    val lat: Double,
    val lon: Double
)

// Responses
data class LocationUpdateResponse(
    val message: String
)

