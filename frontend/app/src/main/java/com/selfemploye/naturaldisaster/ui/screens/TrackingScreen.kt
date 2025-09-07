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
import androidx.compose.runtime.collectAsState

@Composable
fun TrackingScreen(appViewModel: AppViewModel) {
    val context = LocalContext.current

    Text(text = "Latitude: ${appViewModel.lastLocation.collectAsState().value.lat}, Longitude: ${appViewModel.lastLocation.collectAsState().value.lng}")
}
