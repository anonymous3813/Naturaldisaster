package com.selfemploye.naturaldisaster.ui.screens

import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Button
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.navigation.NavController
import androidx.compose.material3.Text
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import com.google.android.gms.maps.model.CameraPosition
import com.selfemploye.naturaldisaster.viewmodel.AppViewModel
import com.google.android.gms.maps.model.LatLng
import com.google.maps.android.compose.*

@Composable
fun MapScreen(appViewModel: AppViewModel, navController: NavController) {
    val sanFrancisco = LatLng(37.7749, -122.4194) // Example coordinates

    val markers = listOf(
        LatLng(37.7749, -122.4194), // San Francisco
        LatLng(37.8044, -122.2711)  // Oakland
    )

    var selectedMarker by remember { mutableStateOf<LatLng?>(null) }


    GoogleMap(
        modifier = Modifier.fillMaxSize(),
        cameraPositionState = rememberCameraPositionState {
            position = CameraPosition.fromLatLngZoom(sanFrancisco, 12f)
        }
    ) {
        markers.forEach { position ->
            Marker(
                state = MarkerState(position = position),
                title = "Marker at ${position.latitude}, ${position.longitude}",
                snippet = if (selectedMarker == position) "Selected!" else "",
                onClick = {
                    selectedMarker = position
                    true // returning true consumes the click
                }
            )
        }
    }
}
