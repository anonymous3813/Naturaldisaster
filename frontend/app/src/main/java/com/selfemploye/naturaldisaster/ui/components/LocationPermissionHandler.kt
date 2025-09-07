package com.selfemploye.naturaldisaster.ui.components

import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import com.google.accompanist.permissions.ExperimentalPermissionsApi
import com.google.accompanist.permissions.isGranted
import com.google.accompanist.permissions.rememberPermissionState

@OptIn(ExperimentalPermissionsApi::class)
@Composable
fun LocationPermissionHandler(onPermissionGranted: () -> Unit) {
    val permissionState = rememberPermissionState(
        android.Manifest.permission.ACCESS_FINE_LOCATION
    )

    LaunchedEffect(Unit) {
        if (permissionState.status.isGranted) {
            onPermissionGranted()
        } else {
            permissionState.launchPermissionRequest()
        }
    }

    if (!permissionState.status.isGranted) {
        Text("Location permission is required to track your position")
    }
}
