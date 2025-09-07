package com.selfemploye.naturaldisaster.models

import com.google.android.gms.maps.model.BitmapDescriptorFactory

data class UserLocation(
    val id: String,
    val lat: Double,
    val lon: Double,
    val urgency: Int
) {
    fun getMarkerColor(): Float {
        return when (urgency) {
            1 -> BitmapDescriptorFactory.HUE_GREEN
            2 -> BitmapDescriptorFactory.HUE_YELLOW
            3 -> BitmapDescriptorFactory.HUE_ORANGE
            4 -> BitmapDescriptorFactory.HUE_ROSE
            5 -> BitmapDescriptorFactory.HUE_RED
            else -> BitmapDescriptorFactory.HUE_BLUE
        }
    }

}