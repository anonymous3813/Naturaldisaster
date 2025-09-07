package com.selfemploye.naturaldisaster.ui.screens

import android.util.Log
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
import com.google.android.gms.maps.model.BitmapDescriptorFactory
import com.google.android.gms.maps.model.CameraPosition
import com.google.android.gms.maps.model.LatLng
import com.google.maps.android.compose.GoogleMap
import com.google.maps.android.compose.Marker
import com.google.maps.android.compose.MarkerState
import com.google.maps.android.compose.rememberCameraPositionState
import com.selfemploye.naturaldisaster.models.UserLocation
import com.selfemploye.naturaldisaster.viewmodel.AppViewModel

@Composable
fun MapScreen(
    appViewModel: AppViewModel
) {
    val lastLocation by appViewModel.lastLocation.collectAsState()
    val startingLocation = remember(lastLocation) {
        LatLng(lastLocation.lat, lastLocation.lng)
    }

    var markers by remember {
        mutableStateOf(
            appViewModel.allLocations.value
        )
    }


    var selectedMarker by remember { mutableStateOf<UserLocation?>(null) }
    var showDialog by remember { mutableStateOf(false) }

    GoogleMap(
        modifier = Modifier.fillMaxSize(),
        cameraPositionState = rememberCameraPositionState {
            position = CameraPosition.fromLatLngZoom(startingLocation, 12f)
        }
    ) {
        markers.forEach { loc ->
            Marker(
                state = MarkerState(position = LatLng(loc.lat, loc.lng)),
                title = "Rescue here",
                icon = BitmapDescriptorFactory.defaultMarker(loc.getMarkerColor()),
                onClick = {
                    selectedMarker = loc
                    showDialog = true
                    true
                }
            )
        }
    }

    // Dialog to mark rescue done
    if (showDialog && selectedMarker != null && appViewModel.isFirstResponder.collectAsState().value) {
        AlertDialog(
            onDismissRequest = { showDialog = false },
            title = { Text("Rescue Confirmation") },
            text = { Text("Mark this person at ${selectedMarker!!.lat}, ${selectedMarker!!.lng} as rescued?") },
            confirmButton = {
                TextButton(onClick = {
                    selectedMarker?.let { markerToRemove ->
                        markers =
                            markers.filter { it.lat != markerToRemove.lat || it.lng != markerToRemove.lng }

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
