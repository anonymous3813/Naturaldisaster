package com.selfemploye.naturaldisaster.viewmodel

import android.annotation.SuppressLint
import android.app.Application
import android.os.Looper
import android.util.Log
import androidx.datastore.preferences.core.edit
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.google.android.gms.location.LocationCallback
import com.google.android.gms.location.LocationRequest
import com.google.android.gms.location.LocationResult
import com.google.android.gms.location.LocationServices
import com.google.android.gms.location.Priority
import com.selfemploye.naturaldisaster.data.ApiService
import com.selfemploye.naturaldisaster.data.RetrofitInstance
import com.selfemploye.naturaldisaster.data.UserPrefs
import com.selfemploye.naturaldisaster.data.dataStore
import com.selfemploye.naturaldisaster.models.*
import com.selfemploye.naturaldisaster.models.UserLocation
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import java.util.UUID

class AppViewModel(
    application: Application
) : AndroidViewModel(application) {

    private val dataStore = application.dataStore

    //Read operations
    private val _userId = MutableStateFlow<String?>(null)
    val userId: StateFlow<String?> = _userId

    private val _safeCounter = MutableStateFlow<Int?>(null)
    val safeCounter: StateFlow<Int?> = _safeCounter

    private val _remainingCounter = MutableStateFlow<Int?>(null)
    val remainingCounter: StateFlow<Int?> = _remainingCounter

    private val _allLocations = MutableStateFlow<List<UserLocation>>(emptyList())
    val allLocations: StateFlow<List<UserLocation>> = _allLocations

    init {
        viewModelScope.launch {
            _userId.value = getOrCreateUserId()
        }
    }

    @SuppressLint("MissingPermission")
    fun startLocationUpdates() {

        if (!locationOn.value) return

        val fusedClient =
            LocationServices.getFusedLocationProviderClient(getApplication<Application>())

        val locationRequest =
            LocationRequest.Builder(Priority.PRIORITY_HIGH_ACCURACY, 10 * 60 * 1000L)
                .build()

        val locationCallback = object : LocationCallback() {
            override fun onLocationResult(result: LocationResult) {
                result.lastLocation?.let { location ->
                    val newLocation = UserLocation(location.latitude, location.longitude, 3)
                    setLastLocation(newLocation)
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

    //Set local data
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

    //Set cloud db data
    fun setLastLocation(newValue: UserLocation) {
        viewModelScope.launch(Dispatchers.IO) {
            dataStore.edit { prefs ->
                prefs[UserPrefs.LAST_LAT] = newValue.lat
                prefs[UserPrefs.LAST_LON] = newValue.lng
            }
            try {
                val response = RetrofitInstance.api.postLocation(
                    UserLocationRequest(
                        userId = userId.value ?: getOrCreateUserId(),
                        lat = lastLocation.value.lat,
                        lon = lastLocation.value.lng
                    )
                )
            } catch (e: Exception) {
                Log.e("API", "Failed to set last location ${e.message}")
            }
        }
    }

    //API methods

    fun fetchStats() {
        viewModelScope.launch(Dispatchers.IO) {
            try {
                val response = RetrofitInstance.api.getRescueStats()
                if (response.isSuccessful) {
                    _safeCounter.value = response.body()?.safeUsers
                    _remainingCounter.value = response.body()?.rescuedUsers
                }
            } catch (e: Exception) {
                Log.e("API", "Failed to fetch counter: ${e.message}")
            }
        }
    }

    fun fetchAllLocations() {
        viewModelScope.launch(Dispatchers.IO) {
            try {
                val response = RetrofitInstance.api.getAllLocations()
                if(response.isSuccessful) {
                    _allLocations.value = response.body()!!
                }
            } catch (e: Exception) {
                Log.e("API", "Exception fetching all locations: ${e.message}")
            }
        }
    }


}