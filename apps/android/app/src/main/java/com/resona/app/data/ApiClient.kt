package com.resona.app.data

import java.net.HttpURLConnection
import java.net.URL
import java.net.URLEncoder
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ensureActive
import kotlinx.coroutines.withContext
import kotlinx.serialization.decodeFromString
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import kotlin.coroutines.coroutineContext

class ApiException(
    val status: Int,
    val problem: Problem?,
    message: String,
) : Exception(message) {
    val isUnauthorized: Boolean get() = status == 401
}

/**
 * Tiny JSON-over-HTTP client. HttpURLConnection keeps the M1 dependency
 * surface small; M2 can swap in OkHttp/Retrofit behind this same class.
 */
class ApiClient(val baseUrl: String) {

    private val json = Json {
        ignoreUnknownKeys = true
        coerceInputValues = true
    }

    suspend fun register(displayName: String): DeviceRegistration =
        decode(
            request(
                method = "POST",
                path = "/v1/devices",
                body = json.encodeToString(RegisterDeviceRequest(displayName, "android")),
            ),
        )

    suspend fun home(deviceKey: String): HomeResponse =
        get("/v1/home", deviceKey)

    suspend fun suggest(deviceKey: String, query: String): SearchSuggestResponse =
        get(
            "/v1/search/suggest",
            deviceKey,
            mapOf("q" to query),
        )

    suspend fun search(
        deviceKey: String,
        query: String,
        type: String? = null,
        limit: Int = 20,
        offset: Int = 0,
    ): SearchResponse =
        get(
            "/v1/search",
            deviceKey,
            mapOf(
                "q" to query,
                "type" to type,
                "limit" to limit.toString(),
                "offset" to offset.toString(),
            ),
        )

    suspend fun genres(deviceKey: String): GenresResponse =
        get("/v1/browse/genres", deviceKey)

    suspend fun genre(deviceKey: String, id: String): GenreDetailResponse =
        get("/v1/browse/genres/${segment(id)}", deviceKey)

    suspend fun artist(deviceKey: String, id: String): ArtistDetail =
        get("/v1/artists/${segment(id)}", deviceKey)

    suspend fun album(deviceKey: String, id: String): AlbumDetail =
        get("/v1/albums/${segment(id)}", deviceKey)

    suspend fun track(deviceKey: String, id: String): TrackDetail =
        get("/v1/tracks/${segment(id)}", deviceKey)

    suspend fun station(deviceKey: String, seed: String): StationResponse =
        get("/v1/stations/${segment(seed)}", deviceKey)

    suspend fun recents(deviceKey: String): RecentsResponse =
        get("/v1/recents", deviceKey)

    suspend fun recordListen(
        deviceKey: String,
        events: List<ListenEventInput>,
    ): ListenEventsResponse =
        decode(
            request(
                method = "POST",
                path = "/v1/events/listen",
                body = json.encodeToString(ListenEventsRequest(events)),
                deviceKey = deviceKey,
            ),
        )

    /** Absolute URL for a relative catalog art path. */
    fun mediaUrl(path: String?): String? {
        if (path.isNullOrBlank()) return null
        if (path.startsWith("http://") || path.startsWith("https://")) return path
        return "${baseUrl.trimEnd('/')}/${path.trimStart('/')}"
    }

    private suspend inline fun <reified T> get(
        path: String,
        deviceKey: String?,
        params: Map<String, String?> = emptyMap(),
    ): T = decode(request("GET", path, params = params, deviceKey = deviceKey))

    private inline fun <reified T> decode(raw: String): T = json.decodeFromString(raw)

    private suspend fun request(
        method: String,
        path: String,
        body: String? = null,
        deviceKey: String? = null,
        params: Map<String, String?> = emptyMap(),
    ): String = withContext(Dispatchers.IO) {
        coroutineContext.ensureActive()

        val query = params.entries
            .filter { it.value != null }
            .joinToString("&") { "${encode(it.key)}=${encode(it.value!!)}" }
        val url = URL(
            baseUrl.trimEnd('/') +
                path +
                if (query.isNotEmpty()) "?$query" else "",
        )

        val connection = (url.openConnection() as HttpURLConnection).apply {
            requestMethod = method
            connectTimeout = 10_000
            readTimeout = 15_000
            setRequestProperty("Accept", "application/json")
            if (deviceKey != null) setRequestProperty("X-Device-Key", deviceKey)
            if (body != null) {
                doOutput = true
                setRequestProperty("Content-Type", "application/json; charset=utf-8")
            }
        }

        try {
            if (body != null) {
                connection.outputStream.use { it.write(body.toByteArray(Charsets.UTF_8)) }
            }
            val status = connection.responseCode
            val stream = if (status in 200..299) connection.inputStream else connection.errorStream
            val text = stream?.bufferedReader(Charsets.UTF_8)?.use { it.readText() }.orEmpty()

            coroutineContext.ensureActive()

            if (status !in 200..299) {
                val problem = runCatching {
                    json.decodeFromString(Problem.serializer(), text)
                }.getOrNull()
                throw ApiException(
                    status = status,
                    problem = problem,
                    message = problem?.detail
                        ?: problem?.title
                        ?: "Request failed (HTTP $status)",
                )
            }
            text
        } finally {
            connection.disconnect()
        }
    }

    private fun encode(value: String): String =
        URLEncoder.encode(value, "UTF-8").replace("+", "%20")

    private fun segment(value: String): String = encode(value)
}
