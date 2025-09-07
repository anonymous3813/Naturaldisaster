package com.selfemploye.naturaldisaster.models

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.ui.graphics.vector.ImageVector

enum class Screens(val route: String, val title: String, val icon: ImageVector) {
    Map("map", "Map", Icons.Default.LocationOn),
    Tracking("tracking", "Tracking", Icons.Default.LocationOn),
    Settings("settings", "Settings", Icons.Default.Settings)
}
