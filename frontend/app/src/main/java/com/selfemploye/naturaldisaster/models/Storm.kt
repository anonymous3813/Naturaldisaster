package com.selfemploye.naturaldisaster.models

data class Storm(
    val name: String,
    val priorityQueue: List<String>,
    val zones: List<Zone>
)