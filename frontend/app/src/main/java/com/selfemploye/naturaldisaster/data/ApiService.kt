package com.selfemploye.naturaldisaster.data

import com.selfemploye.naturaldisaster.models.LocationUpdateResponse
import com.selfemploye.naturaldisaster.models.PriorityRequest
import com.selfemploye.naturaldisaster.models.PriorityResponse
import com.selfemploye.naturaldisaster.models.RescueStatsResponse
import com.selfemploye.naturaldisaster.models.SafeOrRespondRequest
import com.selfemploye.naturaldisaster.models.StormUpdateResponse
import com.selfemploye.naturaldisaster.models.SuccessResponse
import com.selfemploye.naturaldisaster.models.UserLocation
import com.selfemploye.naturaldisaster.models.UserLocationRequest
import okhttp3.ResponseBody
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST

interface ApiService {

    //Tracking
    @POST("api/track/safe")
    suspend fun markUserSafe(@Body request: SafeOrRespondRequest): Response<SuccessResponse>

    @POST("api/track/respond")
    suspend fun checkIfUserClose(@Body request: SafeOrRespondRequest): Response<SuccessResponse>

    @GET("api/track/counter")
    suspend fun getRescueStats(): Response<RescueStatsResponse>


    //Storms
    @GET("api/storms/update")
    suspend fun getStormUpdates(): Response<StormUpdateResponse>


    //Priorities
    @POST("api/priorities")
    suspend fun getPriorityUsers(@Body request: PriorityRequest): Response<PriorityResponse>


    //Locations
    @POST("api/locations/post")
    suspend fun postLocation(@Body request: UserLocationRequest): Response<LocationUpdateResponse>

    @GET("api/locations/get")
    suspend fun getAllLocations(): Response<List<UserLocation>>

    @GET("api/locations/export-csv")
    suspend fun getExportedLocations(): Response<ResponseBody>
}