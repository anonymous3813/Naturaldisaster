package com.selfemploye.naturaldisaster.models


data class ImpactZone(
    val polygon: PolygonData?,
    val severity: Int,
    val radius: Int,
    val windSpeed: Double?,
    val type: String?,
    val source: String?,
    val stormId: String?,
    val stormName: String?,
    val zoneName: String?
)


data class PolygonData(
    val type: String,
    val coordinates: List<List<List<Double>>>
)