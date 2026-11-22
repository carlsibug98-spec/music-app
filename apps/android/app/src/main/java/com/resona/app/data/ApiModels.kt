package com.resona.app.data

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Kotlin mirror of packages/api-types (M1 surface). Field names stay in
 * snake_case on the wire; property names are idiomatic Kotlin.
 */

@Serializable
data class Problem(
    val type: String,
    val title: String,
    val status: Int,
    val detail: String? = null,
    val errors: List<ProblemField>? = null,
    @SerialName("trace_id") val traceId: String? = null,
)

@Serializable
data class ProblemField(val path: String, val message: String)

@Serializable
data class RegisterDeviceRequest(
    @SerialName("display_name") val displayName: String,
    val platform: String,
)

@Serializable
data class DeviceRegistration(
    @SerialName("device_id") val deviceId: String,
    @SerialName("device_key") val deviceKey: String,
    @SerialName("display_name") val displayName: String,
    val platform: String,
    @SerialName("created_at") val createdAt: String,
)

@Serializable
data class TrackSummary(
    val id: String,
    val title: String,
    @SerialName("artist_id") val artistId: String,
    @SerialName("artist_name") val artistName: String,
    @SerialName("album_id") val albumId: String? = null,
    @SerialName("album_title") val albumTitle: String? = null,
    @SerialName("duration_ms") val durationMs: Long,
    @SerialName("has_lyrics") val hasLyrics: Boolean = false,
    val explicit: Boolean = false,
    @SerialName("art_url") val artUrl: String? = null,
    @SerialName("play_count") val playCount: Int = 0,
    val genres: List<String> = emptyList(),
)

@Serializable
data class AlbumSummary(
    val id: String,
    val title: String,
    @SerialName("artist_id") val artistId: String,
    @SerialName("artist_name") val artistName: String,
    val type: String,
    @SerialName("release_date") val releaseDate: String? = null,
    @SerialName("art_url") val artUrl: String? = null,
    @SerialName("track_count") val trackCount: Int = 0,
)

@Serializable
data class ArtistSummary(
    val id: String,
    val name: String,
    @SerialName("art_url") val artUrl: String? = null,
    @SerialName("is_verified") val verified: Boolean = false,
    val genres: List<String> = emptyList(),
)

@Serializable
data class ArtistDetail(
    val id: String,
    val name: String,
    @SerialName("art_url") val artUrl: String? = null,
    @SerialName("is_verified") val verified: Boolean = false,
    val genres: List<String> = emptyList(),
    val bio: String? = null,
    @SerialName("monthly_listeners") val monthlyListeners: Int = 0,
    @SerialName("top_tracks") val topTracks: List<TrackSummary> = emptyList(),
    val releases: List<AlbumSummary> = emptyList(),
)

@Serializable
data class AlbumDetail(
    val id: String,
    val title: String,
    @SerialName("artist_id") val artistId: String,
    @SerialName("artist_name") val artistName: String,
    val type: String,
    @SerialName("release_date") val releaseDate: String? = null,
    @SerialName("art_url") val artUrl: String? = null,
    @SerialName("track_count") val trackCount: Int = 0,
    val tracks: List<TrackSummary> = emptyList(),
    @SerialName("more_by_artist") val moreByArtist: List<AlbumSummary> = emptyList(),
)

@Serializable
data class TrackDetail(
    val id: String,
    val title: String,
    @SerialName("artist_id") val artistId: String,
    @SerialName("artist_name") val artistName: String,
    @SerialName("album_id") val albumId: String? = null,
    @SerialName("album_title") val albumTitle: String? = null,
    @SerialName("duration_ms") val durationMs: Long,
    @SerialName("has_lyrics") val hasLyrics: Boolean = false,
    val explicit: Boolean = false,
    @SerialName("art_url") val artUrl: String? = null,
    @SerialName("play_count") val playCount: Int = 0,
    val genres: List<String> = emptyList(),
    @SerialName("lyrics_available") val lyricsAvailable: Boolean = false,
)

@Serializable
data class SearchSuggestion(
    val type: String,
    val text: String,
    val subtitle: String? = null,
    val id: String? = null,
)

@Serializable
data class SearchSuggestResponse(
    val query: String,
    val suggestions: List<SearchSuggestion> = emptyList(),
)

@Serializable
data class PlaylistSummary(
    val id: String,
    val name: String,
    val owner: String,
    @SerialName("track_count") val trackCount: Int,
    @SerialName("art_url") val artUrl: String? = null,
)

@Serializable
data class SearchResponse(
    val query: String,
    val type: String,
    val limit: Int,
    val offset: Int,
    val total: Int,
    val degraded: Boolean = false,
    @SerialName("artist_header") val artistHeader: ArtistSummary? = null,
    val songs: List<TrackSummary> = emptyList(),
    val albums: List<AlbumSummary> = emptyList(),
    val artists: List<ArtistSummary> = emptyList(),
    val playlists: List<PlaylistSummary> = emptyList(),
)

@Serializable
data class CatalogCard(
    val kind: String,
    val id: String,
    val title: String,
    val subtitle: String? = null,
    @SerialName("art_url") val artUrl: String? = null,
)

@Serializable
data class HomeRow(
    val key: String,
    val title: String,
    val items: List<CatalogCard> = emptyList(),
)

@Serializable
data class HomeResponse(
    val greeting: String,
    @SerialName("quick_grid") val quickGrid: List<CatalogCard> = emptyList(),
    val rows: List<HomeRow> = emptyList(),
)

@Serializable
data class GenreSummary(
    val id: String,
    val name: String,
    val featured: Boolean = false,
    @SerialName("track_count") val trackCount: Int = 0,
    @SerialName("art_url") val artUrl: String? = null,
)

@Serializable
data class GenresResponse(val genres: List<GenreSummary> = emptyList())

@Serializable
data class GenreDetailResponse(
    val genre: GenreSummary,
    val tracks: List<TrackSummary> = emptyList(),
)

@Serializable
data class StationResponse(
    val seed: String,
    val title: String,
    val description: String,
    val tracks: List<TrackSummary> = emptyList(),
)

@Serializable
data class ListenEventInput(
    @SerialName("track_id") val trackId: String,
    @SerialName("played_at") val playedAt: String? = null,
    @SerialName("ms_played") val msPlayed: Long,
    val completed: Boolean,
)

@Serializable
data class ListenEventsRequest(val events: List<ListenEventInput>)

@Serializable
data class ListenEventsResponse(val accepted: Int)

@Serializable
data class RecentItem(
    val track: TrackSummary,
    @SerialName("played_at") val playedAt: String,
    @SerialName("ms_played") val msPlayed: Long,
    val completed: Boolean,
)

@Serializable
data class RecentGroup(
    val day: String,
    val items: List<RecentItem> = emptyList(),
)

@Serializable
data class RecentsResponse(val groups: List<RecentGroup> = emptyList())
