package com.selfemploye.naturaldisaster.ui.components

import android.util.Log
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.selfemploye.naturaldisaster.data.RetrofitInstance
import com.selfemploye.naturaldisaster.utils.saveCSVToDevice
import kotlinx.coroutines.launch

@Composable
fun ExportButton() {
    val scope = rememberCoroutineScope()

    Button(
        modifier = Modifier
            .fillMaxWidth()
            .padding(16.dp)
            .height(56.dp),
        shape = RoundedCornerShape(12.dp), // rounded corners
        elevation = ButtonDefaults.buttonElevation(
            defaultElevation = 6.dp,
            pressedElevation = 2.dp
        ),
        onClick = {
            scope.launch {
                try {
                    val response = RetrofitInstance.api.getExportedLocations()
                    if (response.isSuccessful) {
                        val csvText = response.body()?.string()
                        if (csvText != null) {
                            saveCSVToDevice(csvText)
                        }
                    } else {
                        Log.e("CSV Export", "Failed: ${response.code()}")
                    }
                } catch (e: Exception) {
                    Log.e("CSV Export", "Error: ${e.message}")
                }
            }
        }
    ) {
        Text("Export data")
    }
}
