package com.selfemploye.naturaldisaster.ui.screens

import android.health.connect.datatypes.ExerciseRoute
import androidx.compose.foundation.layout.*
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import com.google.accompanist.permissions.ExperimentalPermissionsApi
import com.google.accompanist.permissions.rememberPermissionState
import com.google.android.gms.location.FusedLocationProviderClient
import com.selfemploye.naturaldisaster.utils.getLastLocation
import com.selfemploye.naturaldisaster.viewmodel.AppViewModel

@OptIn(ExperimentalPermissionsApi::class)
@Composable
fun TrackingScreen(appViewModel: AppViewModel, navController: NavController, modifier: Modifier = Modifier) {

    val context = LocalContext.current
    var locationText by remember { mutableStateOf("Getting location...") }

    val permissionState = rememberPermissionState(android.Manifest.permission.ACCESS_FINE_LOCATION)

    LaunchedEffect(Unit) {
        if (permissionState.status.equals(true)) {
            getLastLocation(context) { lat, lng ->
                locationText = if (lat != 0.0 && lng != 0.0) {
                    "Location received: Lat $lat, Lng $lng"
                } else {
                    "Failed to get location"
                }
            }
        } else {
            permissionState.launchPermissionRequest()
        }
    }



    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        Text(locationText)
        Text("Last recorded location: 1.3521, 103.8198")
        Text("Updates will continue in background...")
    }
}

