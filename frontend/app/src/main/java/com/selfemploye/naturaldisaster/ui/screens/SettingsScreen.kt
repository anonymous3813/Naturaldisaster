package com.selfemploye.naturaldisaster.ui.screens

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.navigation.NavController
import com.selfemploye.naturaldisaster.ui.components.ToggleCard
import com.selfemploye.naturaldisaster.viewmodel.AppViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SettingsScreen(
    appViewModel: AppViewModel,
    modifier: Modifier = Modifier
) {

    val locationOn by appViewModel.locationOn.collectAsStateWithLifecycle()
    val firstResponderMode by appViewModel.isFirstResponder.collectAsStateWithLifecycle()


    Column(
        modifier = modifier
            .fillMaxSize()
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Spacer(Modifier.height(16.dp))

        ToggleCard(
            title = "Background Tracking",
            isChecked = locationOn,
            onCheckedChange = { appViewModel.setLocationOn(it) }
        )

        Spacer(Modifier.height(16.dp))

        ToggleCard(
            title = "First Responder mode",
            isChecked = firstResponderMode,
            onCheckedChange = { appViewModel.setIsFirstResponder(it) }
        )

    }
}