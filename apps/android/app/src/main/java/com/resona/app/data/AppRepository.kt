package com.resona.app.data

/**
 * The app's single data entry point. Screens never touch the raw client or
 * prefs; this class owns "register once, then send X-Device-Key".
 */
class AppRepository(
    private val api: ApiClient,
    private val store: DeviceStore,
) {
    val displayName: String? get() = store.displayName
    val hasDevice: Boolean get() = store.hasDevice

    suspend fun register(name: String): String {
        val registration = api.register(name.trim())
        store.save(registration)
        return registration.displayName
    }

    fun signOut() = store.clear()

    fun mediaUrl(path: String?): String? = api.mediaUrl(path)

    suspend fun home(): HomeResponse = authorized { api.home(it) }

    suspend fun suggest(query: String): SearchSuggestResponse =
        authorized { api.suggest(it, query) }

    suspend fun search(query: String, type: String? = null): SearchResponse =
        authorized { api.search(it, query, type = type) }

    suspend fun genres(): GenresResponse = authorized { api.genres(it) }

    suspend fun genre(id: String): GenreDetailResponse =
        authorized { api.genre(it, id) }

    suspend fun artist(id: String): ArtistDetail = authorized { api.artist(it, id) }

    suspend fun album(id: String): AlbumDetail = authorized { api.album(it, id) }

    suspend fun track(id: String): TrackDetail = authorized { api.track(it, id) }

    suspend fun station(seed: String): StationResponse =
        authorized { api.station(it, seed) }

    suspend fun recents(): RecentsResponse = authorized { api.recents(it) }

    suspend fun recordListen(events: List<ListenEventInput>): ListenEventsResponse =
        authorized { api.recordListen(it, events) }

    private inline fun <T> authorized(block: (String) -> T): T {
        val key = store.deviceKey
            ?: throw ApiException(
                status = 401,
                problem = null,
                message = "This device is not registered.",
            )
        return block(key)
    }
}
