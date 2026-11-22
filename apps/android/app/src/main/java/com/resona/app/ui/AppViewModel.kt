package com.resona.app.ui

import android.app.Application
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.resona.app.BuildConfig
import com.resona.app.data.AlbumDetail
import com.resona.app.data.ApiClient
import com.resona.app.data.ApiException
import com.resona.app.data.AppRepository
import com.resona.app.data.ArtistDetail
import com.resona.app.data.DeviceStore
import com.resona.app.data.GenreDetailResponse
import com.resona.app.data.GenresResponse
import com.resona.app.data.HomeResponse
import com.resona.app.data.ListenEventInput
import com.resona.app.data.ListenEventsResponse
import com.resona.app.data.RecentsResponse
import com.resona.app.data.SearchResponse
import com.resona.app.data.SearchSuggestResponse
import com.resona.app.data.StationResponse
import com.resona.app.data.TrackDetail
import kotlinx.coroutines.launch

sealed interface SessionState {
    data object NeedsName : SessionState
    data object Registering : SessionState
    data class Ready(val displayName: String) : SessionState
}

/** Navigation destinations for M1 (no nav library needed yet). */
sealed interface Dest {
    data object HomeTab : Dest
    data object SearchTab : Dest
    data class Artist(val id: String, val name: String) : Dest
    data class Album(val id: String, val title: String) : Dest
    data class Track(val id: String, val title: String) : Dest
    data class Genre(val id: String, val name: String) : Dest
    data class Station(val seed: String, val title: String) : Dest
}

class AppViewModel(application: Application) : AndroidViewModel(application) {

    private val repository = AppRepository(
        api = ApiClient(BuildConfig.API_BASE_URL),
        store = DeviceStore(application),
    )

    var session by mutableStateOf<SessionState>(
        if (repository.hasDevice) {
            SessionState.Ready(repository.displayName.orEmpty())
        } else {
            SessionState.NeedsName
        },
    )
        private set

    var onboardingError by mutableStateOf<String?>(null)
        private set

    var destinations by mutableStateOf<List<Dest>>(listOf(Dest.HomeTab))
        private set

    val currentDestination: Dest get() = destinations.last()

    val canGoBack: Boolean get() = destinations.size > 1

    fun register(rawName: String) {
        val name = rawName.trim()
        if (name.isEmpty()) {
            onboardingError = "Enter a name so the app can greet you."
            return
        }
        if (name.length > 32) {
            onboardingError = "Keep it to 32 characters or fewer."
            return
        }
        if (session is SessionState.Registering) return

        onboardingError = null
        session = SessionState.Registering
        viewModelScope.launch {
            try {
                val savedName = repository.register(name)
                destinations = listOf(Dest.HomeTab)
                session = SessionState.Ready(savedName)
            } catch (err: Exception) {
                session = SessionState.NeedsName
                onboardingError = friendlyMessage(err)
            }
        }
    }

    fun dismissOnboardingError() {
        onboardingError = null
    }

    fun selectTab(dest: Dest) {
        if (dest == Dest.HomeTab || dest == Dest.SearchTab) {
            destinations = listOf(dest)
        }
    }

    fun openArtist(id: String, name: String) {
        destinations = destinations + Dest.Artist(id, name)
    }

    fun openAlbum(id: String, title: String) {
        destinations = destinations + Dest.Album(id, title)
    }

    fun openTrack(id: String, title: String) {
        destinations = destinations + Dest.Track(id, title)
    }

    fun openGenre(id: String, name: String) {
        destinations = destinations + Dest.Genre(id, name)
    }

    fun openStation(seed: String, title: String) {
        destinations = destinations + Dest.Station(seed, title)
    }

    fun back(): Boolean {
        if (!canGoBack) return false
        destinations = destinations.dropLast(1)
        return true
    }

    fun mediaUrl(path: String?): String? = repository.mediaUrl(path)

    /* ---------- Data calls (screens own their loading/error state) ---------- */

    suspend fun home(): HomeResponse = guarded { repository.home() }

    suspend fun suggest(query: String): SearchSuggestResponse =
        guarded { repository.suggest(query) }

    suspend fun search(query: String, type: String? = null): SearchResponse =
        guarded { repository.search(query, type) }

    suspend fun genres(): GenresResponse = guarded { repository.genres() }

    suspend fun genre(id: String): GenreDetailResponse = guarded { repository.genre(id) }

    suspend fun artist(id: String): ArtistDetail = guarded { repository.artist(id) }

    suspend fun album(id: String): AlbumDetail = guarded { repository.album(id) }

    suspend fun track(id: String): TrackDetail = guarded { repository.track(id) }

    suspend fun station(seed: String): StationResponse = guarded { repository.station(seed) }

    suspend fun recents(): RecentsResponse = guarded { repository.recents() }

    suspend fun recordListen(
        trackId: String,
        msPlayed: Long,
        completed: Boolean,
    ): ListenEventsResponse =
        guarded {
            repository.recordListen(
                listOf(
                    ListenEventInput(
                        trackId = trackId,
                        msPlayed = msPlayed,
                        completed = completed,
                    ),
                ),
            )
        }

    private suspend fun <T> guarded(block: suspend () -> T): T =
        try {
            block()
        } catch (err: ApiException) {
            if (err.isUnauthorized) handleUnauthorized()
            throw err
        }

    private fun handleUnauthorized() {
        repository.signOut()
        destinations = listOf(Dest.HomeTab)
        session = SessionState.NeedsName
        onboardingError = "This device needs to be set up again."
    }
}

fun friendlyMessage(err: Throwable): String =
    when (err) {
        is ApiException -> err.problem?.detail
            ?: err.problem?.title
            ?: err.message
            ?: "Something went wrong."
        else -> err.message ?: "Could not reach Tugtugin. Check that the API is running."
    }
