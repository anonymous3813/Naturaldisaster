package com.selfemploye.naturaldisaster.models

data class Storm(
    val id: String,
    val name: String,
    val lat: Double,
    val lon: Double,
    val severity: Int,
    val zone: String?,
    val impactZones: List<ImpactZone>
)