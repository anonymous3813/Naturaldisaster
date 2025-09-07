package com.selfemploye.naturaldisaster.viewmodel

import android.annotation.SuppressLint
import android.app.Application
import android.os.Looper
import android.util.Log
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.google.android.gms.location.LocationCallback
import com.google.android.gms.location.LocationRequest
import com.google.android.gms.location.LocationResult
import com.google.android.gms.location.LocationServices
import com.google.android.gms.location.Priority
import com.selfemploye.naturaldisaster.data.UserPrefs
import com.selfemploye.naturaldisaster.data.dataStore
import com.selfemploye.naturaldisaster.models.UserLocation
import com.selfemploye.naturaldisaster.utils.getLastLocation
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import java.util.UUID

class AppViewModel (
    application: Application
) : AndroidViewModel(application) {

    private val dataStore = application.dataStore

    //Read operations
    private val _userId = MutableStateFlow<String?>(null)
    val userId: StateFlow<String?> = _userId

    init {
        viewModelScope.launch {
            _userId.value = getOrCreateUserId()
        }
        startLocationUpdates()
    }

    @SuppressLint("MissingPermission")
    fun startLocationUpdates() {
        val fusedClient = LocationServices.getFusedLocationProviderClient(getApplication<Application>())

        val locationRequest = LocationRequest.Builder(Priority.PRIORITY_HIGH_ACCURACY, 5000L)
            .build()

        val locationCallback = object : LocationCallback() {
            override fun onLocationResult(result: LocationResult) {
                result.lastLocation?.let { location ->
                    val newLocation = UserLocation(location.latitude, location.longitude, 3)
                    setLastLocation(newLocation) // update DataStore and lastLocation StateFlow
                }
            }
        }

        fusedClient.requestLocationUpdates(
            locationRequest,
            locationCallback,
            Looper.getMainLooper()
        )
    }


    val isFirstResponder: StateFlow<Boolean> = dataStore.data
        .map { prefs -> prefs[UserPrefs.IS_FIRST_RESPONDER] ?: false }
        .stateIn(viewModelScope, SharingStarted.Eagerly, false)

    val locationOn: StateFlow<Boolean> = dataStore.data
        .map { prefs -> prefs[UserPrefs.LOCATION_ON] ?: true }
        .stateIn(viewModelScope, SharingStarted.Eagerly, true)

    val lastLocation: StateFlow<UserLocation> = dataStore.data
        .map { prefs ->
            val lat = prefs[UserPrefs.LAST_LAT] ?: 0.0
            val lon = prefs[UserPrefs.LAST_LON] ?: 0.0
            UserLocation(lat, lon, 3)
        }
        .stateIn(viewModelScope, SharingStarted.Eagerly, UserLocation(0.0, 0.0, 3))

    //Write operations
    private suspend fun getOrCreateUserId(): String {
        val prefs = dataStore.data.first() // suspend function
        val existingId = prefs[UserPrefs.USER_ID]
        return (if (existingId != null) {
            existingId
        } else {
            val newId = UUID.randomUUID().toString() // generate new ID
            dataStore.edit { it[UserPrefs.USER_ID] = newId }
            newId
        })
    }

    fun setIsFirstResponder(newValue: Boolean) {
        viewModelScope.launch(Dispatchers.IO) {
            dataStore.edit { prefs ->
                prefs[UserPrefs.IS_FIRST_RESPONDER] = newValue
            }
        }
    }

    fun setLocationOn(newValue: Boolean) {
        viewModelScope.launch(Dispatchers.IO) {
            dataStore.edit { prefs ->
                prefs[UserPrefs.LOCATION_ON] = newValue
            }
        }
    }

    fun setLastLocation(newValue: UserLocation) {
        viewModelScope.launch(Dispatchers.IO) {
            dataStore.edit { prefs ->
                prefs[UserPrefs.LAST_LAT] = newValue.lat
                prefs[UserPrefs.LAST_LON] = newValue.lng
            }
        }
    }
}