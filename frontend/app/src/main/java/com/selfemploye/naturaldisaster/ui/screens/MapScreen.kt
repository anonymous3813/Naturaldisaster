package com.selfemploye.naturaldisaster.ui.screens

import android.util.Log
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import com.google.android.gms.maps.model.BitmapDescriptorFactory
import com.google.android.gms.maps.model.CameraPosition
import com.google.android.gms.maps.model.LatLng
import com.google.maps.android.compose.Circle
import com.google.maps.android.compose.GoogleMap
import com.google.maps.android.compose.Marker
import com.google.maps.android.compose.MarkerState
import com.google.maps.android.compose.Polygon
import com.google.maps.android.compose.rememberCameraPositionState
import com.selfemploye.naturaldisaster.models.UserLocation
import com.selfemploye.naturaldisaster.utils.storms
import com.selfemploye.naturaldisaster.viewmodel.AppViewModel

@Composable
fun MapScreen(
    appViewModel: AppViewModel
) {
    val lastLocation by appViewModel.lastLocation.collectAsState()
    val allLocations by appViewModel.allLocations.collectAsState()
    val allStorms = storms

    val startingLocation = LatLng(lastLocation.lat, lastLocation.lon)

    var selectedMarker by remember { mutableStateOf<UserLocation?>(null) }
    var showDialog by remember { mutableStateOf(false) }

    LaunchedEffect(allLocations) {
        Log.d("Map screen coordinates", allLocations.toString())
    }

    Column {
        Text("Locations: ${allLocations.size}") // Debug line

        GoogleMap(
            modifier = Modifier.fillMaxSize(),
            cameraPositionState = rememberCameraPositionState {
                position = CameraPosition.fromLatLngZoom(startingLocation, 12f)
            }
        ) {
            // === Rescue markers ===
            allLocations.forEach { loc ->
                Marker(
                    state = MarkerState(position = LatLng(loc.lat, loc.lon)), // fixed lat/lon
                    title = "Rescue here",
                    icon = BitmapDescriptorFactory.defaultMarker(loc.getMarkerColor()),
                    onClick = {
                        selectedMarker = loc
                        showDialog = true
                        true
                    }
                )
            }

            // === Storms overlay ===
            allStorms.take(5).forEach { storm ->
                // Draw storm radius as a circle
                val radiusMeters =
                    storm.impactZones.firstOrNull()?.radius?.times(1000.0) ?: 100_000.0
                Circle(
                    center = LatLng(storm.lat, storm.lon),
                    radius = radiusMeters,
                    strokeColor = Color.Red.copy(alpha = 0.5f),
                    fillColor = Color.Red.copy(alpha = 0.2f),
                    strokeWidth = 3f
                )

                // Draw impact zone polygons
                storm.impactZones.forEach { zone ->
                    zone.polygon?.coordinates?.get(0)?.let { coords ->
                        val points = coords.map { LatLng(it[1], it[0]) } // GeoJSON: [lon, lat]
                        Polygon(
                            points = points,
                            strokeColor = Color.Blue.copy(alpha = 0.6f),
                            fillColor = Color.Blue.copy(alpha = 0.2f),
                            strokeWidth = 2f
                        )
                    }
                }
            }
        }
    }

    // === Rescue dialog ===
    if (showDialog && selectedMarker != null) {
        val isFirstResponder by appViewModel.isFirstResponder.collectAsState()
        if (isFirstResponder) {
            AlertDialog(
                onDismissRequest = { showDialog = false },
                title = { Text("Rescue Confirmation") },
                text = {
                    Text("Mark this person at ${selectedMarker!!.lat}, ${selectedMarker!!.lon} as rescued?")
                },
                confirmButton = {
                    TextButton(onClick = {
                        selectedMarker?.let { markerToRemove ->
                            appViewModel.removeLocation(markerToRemove)
                        }
                        showDialog = false
                    }) {
                        Text("Yes")
                    }
                },
                dismissButton = {
                    TextButton(onClick = { showDialog = false }) {
                        Text("No")
                    }
                }
            )
        }
    }
}
