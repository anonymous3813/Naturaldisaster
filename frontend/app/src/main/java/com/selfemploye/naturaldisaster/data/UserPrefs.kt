package com.selfemploye.naturaldisaster.data

import android.content.Context
import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.doublePreferencesKey
import androidx.datastore.preferences.preferencesDataStore

val Context.dataStore by preferencesDataStore("user_prefs")

object UserPrefs {
    val LOCATION_ON = booleanPreferencesKey("location_on")
    val IS_FIRST_RESPONDER = booleanPreferencesKey("is_first_responder")
    val LAST_LAT = doublePreferencesKey("last_lat")
    val LAST_LON = doublePreferencesKey("last_lon")
}
