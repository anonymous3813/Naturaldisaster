package com.selfemploye.naturaldisaster.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.selfemploye.naturaldisaster.models.UserLocation
import com.selfemploye.naturaldisaster.utils.getLastLocation
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class AppViewModel : ViewModel() {
    private val _isFirstResponder = MutableStateFlow(false)
    val isFirstResponder: StateFlow<Boolean> get() = _isFirstResponder.asStateFlow()

    private val _locationOn = MutableStateFlow(true)
    val locationOn: StateFlow<Boolean> get() = _locationOn.asStateFlow()

    private val _lastLocation = MutableStateFlow(UserLocation(0.0, 0.0))
    val lastLocation: StateFlow<UserLocation> get() = _lastLocation.asStateFlow()

    fun setIsFirstResponder(newValue: Boolean) {
        viewModelScope.launch(Dispatchers.IO) {
            _isFirstResponder.value = newValue
        }
    }

    fun setLocationOn(newValue: Boolean) {
        viewModelScope.launch(Dispatchers.IO){
            _locationOn.value = newValue
        }
    }

    fun setLastLocation(newValue: UserLocation) {
        viewModelScope.launch(Dispatchers.IO){
            _lastLocation.value = newValue
        }
    }
}