package com.selfemploye.naturaldisaster.data

import com.selfemploye.naturaldisaster.models.MarkSafeRequest
import com.selfemploye.naturaldisaster.models.PriorityResponse
import com.selfemploye.naturaldisaster.models.PriorityUser
import com.selfemploye.naturaldisaster.models.SafeCounterResponse
import com.selfemploye.naturaldisaster.models.UserLocation
import com.selfemploye.naturaldisaster.models.UserLocationRequest
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST

interface ApiService {

    @GET("api/tracking/counter")
    suspend fun getSafeCounter(): Response<SafeCounterResponse>

    @POST("api/tracking/safe")
    suspend fun markUserSafe(@Body request: MarkSafeRequest): Response<Unit>

    @POST("api/locations")
    suspend fun postLocation(@Body location: UserLocationRequest): Response<Unit>

    @GET("api/priorities")
    suspend fun getPriorities(): Response<List<PriorityUser>>
}
