package com.selfemploye.naturaldisaster.utils

import android.annotation.SuppressLint
import android.content.Context
import android.os.Environment
import android.os.Looper
import android.util.Log
import com.google.android.gms.location.FusedLocationProviderClient
import com.google.android.gms.location.LocationCallback
import com.google.android.gms.location.LocationRequest
import com.google.android.gms.location.LocationResult
import com.google.android.gms.location.LocationServices
import com.google.android.gms.location.Priority
import com.selfemploye.naturaldisaster.models.ImpactZone
import com.selfemploye.naturaldisaster.models.PolygonData
import com.selfemploye.naturaldisaster.models.Storm
import java.io.File
import java.io.IOException

@SuppressLint("MissingPermission")
fun getLastLocation(context: Context, callback: (Double?, Double?) -> Unit) {
    val fusedLocationClient: FusedLocationProviderClient =
        LocationServices.getFusedLocationProviderClient(context)

    val locationRequest = LocationRequest.Builder(Priority.PRIORITY_HIGH_ACCURACY, 1000L)
        .setMaxUpdates(1)
        .build()

    val locationCallback = object : LocationCallback() {
        override fun onLocationResult(result: LocationResult) {
            val location = result.lastLocation
            if (location != null) {
                callback(location.latitude, location.longitude)
            } else {
                callback(null, null)
            }
            fusedLocationClient.removeLocationUpdates(this)
        }
    }

    fusedLocationClient.requestLocationUpdates(
        locationRequest,
        locationCallback,
        Looper.getMainLooper()
    )
}

fun saveCSVToDevice(csvData: String) {
    try {
        // Get Downloads directory
        val downloadsDir =
            Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS)

        // Create unique filename with timestamp
        val timestamp = System.currentTimeMillis()
        val fileName = "userlocations$timestamp.csv"
        val file = File(downloadsDir, fileName)

        file.writeText(csvData)

        Log.d("CSV Export", "File saved successfully: ${file.absolutePath}")

    } catch (e: SecurityException) {
        Log.e("CSV Export", "Permission denied: ${e.message}")
    } catch (e: IOException) {
        Log.e("CSV Export", "File write error: ${e.message}")
    } catch (e: Exception) {
        Log.e("CSV Export", "Unexpected error: ${e.message}")
        // Handle other errors
    }
}


val storms: List<Storm> = listOf(
    Storm(
        id = "unknown",
        name = "Orange alert for tropical cyclone TAPAH-25. Population affected by Category 1 (120 km/h) wind speeds or higher is 2.83 million.",
        lat = 20.0,
        lon = 113.6,
        severity = 1,
        zone = null,
        impactZones = listOf(
            ImpactZone(
                polygon = PolygonData(
                    type = "Polygon",
                    coordinates = listOf(
                        listOf(
                            listOf(113.2, 21.25045045045045),
                            listOf(113.29400525215512, 21.241795171352805),
                            listOf(113.6, 21.25),
                            listOf(113.8, 21.1),
                            listOf(113.9, 20.8),
                            listOf(113.2, 21.25045045045045) // close polygon
                        )
                    )
                ),
                severity = 5,
                radius = 50,
                windSpeed = 88.88,
                type = "wind",
                source = "azure_maps_real_wind_data",
                stormId = "NP22",
                stormName = "TAPAH",
                zoneName = "Outer"
            ),
            ImpactZone(
                polygon = PolygonData(
                    type = "Polygon",
                    coordinates = listOf(
                        listOf(
                            listOf(113.4, 21.0),
                            listOf(113.55, 21.05),
                            listOf(113.7, 20.95),
                            listOf(113.6, 20.8),
                            listOf(113.4, 21.0) // close polygon
                        )
                    )
                ),
                severity = 4,
                radius = 30,
                windSpeed = 100.0,
                type = "wind",
                source = "azure_maps_real_wind_data",
                stormId = "NP22",
                stormName = "TAPAH",
                zoneName = "Middle"
            ),
            ImpactZone(
                polygon = PolygonData(
                    type = "Polygon",
                    coordinates = listOf(
                        listOf(
                            listOf(113.55, 20.9),
                            listOf(113.65, 20.9),
                            listOf(113.65, 20.8),
                            listOf(113.55, 20.8),
                            listOf(113.55, 20.9) // close polygon
                        )
                    )
                ),
                severity = 3,
                radius = 15,
                windSpeed = 120.0,
                type = "wind",
                source = "azure_maps_real_wind_data",
                stormId = "NP22",
                stormName = "TAPAH",
                zoneName = "Inner"
            ),
            ImpactZone(
                polygon = PolygonData(
                    type = "Polygon",
                    coordinates = listOf(
                        listOf(
                            listOf(113.58, 20.85),
                            listOf(113.62, 20.85),
                            listOf(113.62, 20.81),
                            listOf(113.58, 20.81),
                            listOf(113.58, 20.85) // close polygon
                        )
                    )
                ),
                severity = 2,
                radius = 5,
                windSpeed = 140.0,
                type = "wind",
                source = "azure_maps_real_wind_data",
                stormId = "NP22",
                stormName = "TAPAH",
                zoneName = "Core"
            )
        )
    )
)


