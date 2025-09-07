package com.selfemploye.naturaldisaster.models

data class SafeCounterResponse(
    val total: Int,
    val saved: Int,
    val remaining: Int
)

data class MarkSafeRequest(
    val responderId: String,
    val userId: String,
    val responderLat: Double,
    val responderLon: Double
)

data class UserLocationRequest(
    val userId: String,
    val lat: Double,
    val lon: Double,
    val danger: Int? = null
)

data class PriorityUser(
    val userId: String,
    val lat: Double,
    val lon: Double,
    val danger: Int
)
