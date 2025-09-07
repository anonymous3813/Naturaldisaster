package com.selfemploye.naturaldisaster.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import com.selfemploye.naturaldisaster.viewmodel.AppViewModel
import androidx.compose.runtime.collectAsState
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

@Composable
fun TrackingScreen(viewModel: AppViewModel) {
    val safeCounter by viewModel.safeCounter.collectAsState()
    val remainingCounter by viewModel.remainingCounter.collectAsState()

    LaunchedEffect(Unit) {
        viewModel.fetchStats()
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        // Card for the "People safe" counter.
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(bottom = 16.dp),
            // Uses M3 CardDefaults to define elevation.
            elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
        ) {
            Column(
                modifier = Modifier.padding(16.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(
                    text = "People safe:",
                    // Uses M3 typography styles.
                    style = MaterialTheme.typography.titleLarge
                )
                Text(
                    text = "${safeCounter ?: 0}",
                    style = MaterialTheme.typography.displayMedium,
                    // Uses M3 color scheme.
                    color = MaterialTheme.colorScheme.primary
                )
            }
        }

        // Card for the "People remaining" counter.
        Card(
            modifier = Modifier.fillMaxWidth(),
            elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
        ) {
            Column(
                modifier = Modifier.padding(16.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(
                    text = "People remaining:",
                    style = MaterialTheme.typography.titleLarge
                )
                Text(
                    text = "${remainingCounter ?: 0}",
                    style = MaterialTheme.typography.displayMedium,
                    color = MaterialTheme.colorScheme.secondary
                )
            }
        }
    }
}