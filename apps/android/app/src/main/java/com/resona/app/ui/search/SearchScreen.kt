package com.resona.app.ui.search

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.platform.LocalSoftwareKeyboardController
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.resona.app.data.AlbumSummary
import com.resona.app.data.ArtistSummary
import com.resona.app.data.GenreSummary
import com.resona.app.data.RecentsResponse
import com.resona.app.data.SearchResponse
import com.resona.app.data.SearchSuggestion
import com.resona.app.data.SearchSuggestResponse
import com.resona.app.data.TrackSummary
import com.resona.app.ui.AppViewModel
import com.resona.app.ui.common.CheckBadge
import com.resona.app.ui.common.EmptyPane
import com.resona.app.ui.common.ErrorPane
import com.resona.app.ui.common.FilterPill
import com.resona.app.ui.common.LoadState
import com.resona.app.ui.common.LoadingPane
import com.resona.app.ui.common.SectionHeader
import com.resona.app.ui.common.TrackListItem
import com.resona.app.ui.common.formatDuration
import com.resona.app.ui.common.formatPlayCount
import com.resona.app.ui.common.gradientFor
import com.resona.app.ui.common.plural
import com.resona.app.ui.common.rememberLoader
import com.resona.app.ui.friendlyMessage
import com.resona.app.ui.theme.GeneratedTokens as T
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.delay

private val filters = listOf(
    "all" to "All",
    "song" to "Songs",
    "album" to "Albums",
    "artist" to "Artists",
)

/**
 * Screens 3–5: idle (recents + genre grid), typing (live suggestions), and
 * typed results with filter chips. Suggestions are debounced 250 ms.
 */
@Composable
fun SearchScreen(
    vm: AppViewModel,
    onOpenTrack: (id: String, title: String) -> Unit,
    onOpenAlbum: (id: String, title: String) -> Unit,
    onOpenArtist: (id: String, name: String) -> Unit,
    onOpenGenre: (id: String, name: String) -> Unit,
) {
    var query by rememberSaveable { mutableStateOf("") }
    var submitted by rememberSaveable { mutableStateOf<String?>(null) }
    var filter by rememberSaveable { mutableStateOf("all") }
    val keyboard = LocalSoftwareKeyboardController.current

    val idle = rememberLoader("search-idle") {
        IdleData(recents = vm.recents(), genres = vm.genres())
    }

    var suggestions by remember { mutableStateOf<List<SearchSuggestion>>(emptyList()) }
    var suggesting by remember { mutableStateOf(false) }
    var suggestError by remember { mutableStateOf<String?>(null) }

    LaunchedEffect(query, submitted) {
        if (query.isBlank() || submitted != null) {
            suggestions = emptyList()
            suggestError = null
            suggesting = false
            return@LaunchedEffect
        }
        suggesting = true
        suggestError = null
        delay(250)
        try {
            suggestions = vm.suggest(query).suggestions
        } catch (err: CancellationException) {
            throw err
        } catch (err: Exception) {
            suggestions = emptyList()
            suggestError = friendlyMessage(err)
        } finally {
            suggesting = false
        }
    }

    fun submit(text: String) {
        val trimmed = text.trim()
        if (trimmed.isEmpty()) return
        query = trimmed
        submitted = trimmed
        keyboard?.hide()
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(T.bg)
            .padding(horizontal = T.ScreenXDp),
    ) {
        Text(
            "Search",
            style = MaterialTheme.typography.headlineLarge,
            color = T.text,
            modifier = Modifier.padding(top = T.SmDp, bottom = T.SmDp),
        )

        OutlinedTextField(
            value = query,
            onValueChange = {
                query = it
                submitted = null
            },
            singleLine = true,
            modifier = Modifier.fillMaxWidth(),
            placeholder = { Text("Songs, artists, albums", color = T.dim) },
            leadingIcon = {
                Icon(Icons.Filled.Search, contentDescription = null, tint = T.sub)
            },
            trailingIcon = {
                if (query.isNotEmpty()) {
                    IconButton(onClick = { query = ""; submitted = null }) {
                        Icon(Icons.Filled.Close, contentDescription = "Clear search", tint = T.sub)
                    }
                }
            },
            keyboardOptions = KeyboardOptions(imeAction = ImeAction.Search),
            keyboardActions = KeyboardActions(onSearch = { submit(query) }),
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = T.green,
                unfocusedBorderColor = T.line,
                focusedTextColor = T.text,
                unfocusedTextColor = T.text,
                cursorColor = T.green,
                focusedContainerColor = T.card2,
                unfocusedContainerColor = T.card2,
            ),
            shape = RoundedCornerShape(T.Field),
        )

        Spacer(Modifier.height(T.MdDp))

        when {
            submitted != null -> SearchResults(
                vm = vm,
                query = submitted!!,
                filter = filter,
                onFilterChange = { filter = it },
                onOpenTrack = onOpenTrack,
                onOpenAlbum = onOpenAlbum,
                onOpenArtist = onOpenArtist,
            )

            query.isNotBlank() -> SuggestionList(
                query = query,
                suggestions = suggestions,
                loading = suggesting,
                error = suggestError,
                onPick = { suggestion ->
                    val id = suggestion.id
                    when (suggestion.type) {
                        "query" -> submit(suggestion.text)
                        "song" -> if (id != null) onOpenTrack(id, suggestion.text)
                        "album" -> if (id != null) onOpenAlbum(id, suggestion.text)
                        "artist" -> if (id != null) onOpenArtist(id, suggestion.text)
                    }
                },
                onSubmit = { submit(query) },
            )

            else -> IdleSearch(
                idle = idle.state,
                onRetry = idle.reload,
                onOpenTrack = onOpenTrack,
                onOpenGenre = onOpenGenre,
            )
        }
    }
}

private data class IdleData(
    val recents: RecentsResponse,
    val genres: com.resona.app.data.GenresResponse,
)

@Composable
private fun IdleSearch(
    idle: LoadState<IdleData>,
    onRetry: () -> Unit,
    onOpenTrack: (String, String) -> Unit,
    onOpenGenre: (String, String) -> Unit,
) {
    when (idle) {
        is LoadState.Loading -> LoadingPane("Finding your music")
        is LoadState.Failed -> ErrorPane(idle.message, onRetry)
        is LoadState.Ready -> {
            val recentTracks = idle.value.recents.groups
                .flatMap { it.items }
                .map { it.track }
                .distinctBy { it.id }
                .take(6)

            LazyColumn(
                modifier = Modifier.fillMaxSize(),
                contentPadding = PaddingValues(bottom = T.SectionDp),
                verticalArrangement = Arrangement.spacedBy(T.MdDp),
            ) {
                if (recentTracks.isNotEmpty()) {
                    item { SectionHeader("Recently played") }
                    items(recentTracks, key = { "recent:${it.id}" }) { track ->
                        TrackListItem(track, onClick = { onOpenTrack(track.id, track.title) })
                    }
                }

                item {
                    SectionHeader(
                        "Browse all",
                        modifier = Modifier.padding(top = if (recentTracks.isEmpty()) 0.dp else T.SmDp),
                    )
                }
                items(idle.value.genres.genres.chunked(2)) { pair ->
                    Row(horizontalArrangement = Arrangement.spacedBy(T.SmDp)) {
                        pair.forEach { genre ->
                            GenreTile(genre, Modifier.weight(1f)) {
                                onOpenGenre(genre.id, genre.name)
                            }
                        }
                        if (pair.size == 1) Spacer(Modifier.weight(1f))
                    }
                }
            }
        }
    }
}

@Composable
private fun GenreTile(
    genre: GenreSummary,
    modifier: Modifier = Modifier,
    onClick: () -> Unit,
) {
    Box(
        modifier = modifier
            .height(T.GenreTileDp)
            .clip(RoundedCornerShape(T.Card))
            .background(Brush.linearGradient(gradientFor(genre.id)))
            .clickable(onClick = onClick)
            .padding(T.MdDp),
    ) {
        Column(Modifier.align(Alignment.TopStart)) {
            Text(
                genre.name,
                style = MaterialTheme.typography.titleMedium,
                color = T.text,
                maxLines = 2,
                overflow = TextOverflow.Ellipsis,
            )
            Text(
                plural(genre.trackCount, "track"),
                style = MaterialTheme.typography.labelSmall,
                color = T.text.copy(alpha = 0.75f),
            )
        }
    }
}

@Composable
private fun SuggestionList(
    query: String,
    suggestions: List<SearchSuggestion>,
    loading: Boolean,
    error: String?,
    onPick: (SearchSuggestion) -> Unit,
    onSubmit: () -> Unit,
) {
    if (error != null) {
        ErrorPane(error, onSubmit)
        return
    }

    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(bottom = T.SectionDp),
    ) {
        if (loading && suggestions.isEmpty()) {
            item { LoadingPane("Searching") }
        }

        items(suggestions, key = { "${it.type}:${it.id ?: it.text}" }) { suggestion ->
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable { onPick(suggestion) }
                    .padding(vertical = T.MdDp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                val isQuery = suggestion.type == "query"
                Box(
                    modifier = Modifier
                        .size(36.dp)
                        .clip(RoundedCornerShape(T.Art))
                        .background(if (isQuery) T.green else T.chip),
                    contentAlignment = Alignment.Center,
                ) {
                    if (isQuery) {
                        Icon(
                            Icons.Filled.Search,
                            contentDescription = null,
                            tint = T.black,
                            modifier = Modifier.size(20.dp),
                        )
                    } else {
                        Text(
                            suggestion.type.take(1).uppercase(),
                            style = MaterialTheme.typography.labelLarge,
                            color = T.green,
                        )
                    }
                }
                Spacer(Modifier.width(T.MdDp))
                Column(Modifier.weight(1f)) {
                    Text(
                        suggestion.text,
                        style = MaterialTheme.typography.bodyLarge,
                        color = T.text,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis,
                    )
                    suggestion.subtitle?.let {
                        Text(
                            it,
                            style = MaterialTheme.typography.bodyMedium,
                            color = T.sub,
                            maxLines = 1,
                        )
                    }
                }
                if (isQuery) {
                    Text(
                        "See all",
                        style = MaterialTheme.typography.labelLarge,
                        color = T.green,
                    )
                }
            }
        }

        if (!loading && suggestions.isEmpty()) {
            item {
                EmptyPane(
                    title = "No suggestions for \"$query\"",
                    detail = "Press search to try the full catalog.",
                )
            }
        }
    }
}

@Composable
private fun SearchResults(
    vm: AppViewModel,
    query: String,
    filter: String,
    onFilterChange: (String) -> Unit,
    onOpenTrack: (String, String) -> Unit,
    onOpenAlbum: (String, String) -> Unit,
    onOpenArtist: (String, String) -> Unit,
) {
    val loader = rememberLoader("search:$query:$filter") {
        vm.search(query, filter.takeIf { it != "all" })
    }

    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(bottom = T.SectionDp),
        verticalArrangement = Arrangement.spacedBy(T.SmDp),
    ) {
        item {
            Row(
                horizontalArrangement = Arrangement.spacedBy(T.SmDp),
                modifier = Modifier.padding(bottom = T.SmDp),
            ) {
                filters.forEach { (key, label) ->
                    FilterPill(label, selected = filter == key) { onFilterChange(key) }
                }
            }
        }

        when (val state = loader.state) {
            is LoadState.Loading -> item { LoadingPane("Searching for \"$query\"") }
            is LoadState.Failed -> item { ErrorPane(state.message, loader.reload) }
            is LoadState.Ready -> {
                val results = state.value

                if (results.degraded) {
                    item {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(T.Art))
                                .background(T.mini)
                                .padding(T.MdDp),
                        ) {
                            Text(
                                "The online catalog is unavailable — showing Tugtugin's own catalog.",
                                style = MaterialTheme.typography.bodyMedium,
                                color = T.text,
                            )
                        }
                    }
                }

                val showArtistHeader =
                    results.artistHeader != null && (filter == "all" || filter == "artist")
                if (showArtistHeader) {
                    item {
                        val artist = results.artistHeader!!
                        ArtistHeaderCard(artist) {
                            onOpenArtist(artist.id, artist.name)
                        }
                    }
                }

                if (results.songs.isNotEmpty()) {
                    item { SectionHeader("Songs") }
                    items(results.songs, key = { "song:${it.id}" }) { track ->
                        TrackListItem(track, onClick = { onOpenTrack(track.id, track.title) })
                    }
                }

                if (results.albums.isNotEmpty()) {
                    item { SectionHeader("Albums") }
                    items(results.albums, key = { "album:${it.id}" }) { album ->
                        AlbumResultRow(album) { onOpenAlbum(album.id, album.title) }
                    }
                }

                if (results.artists.isNotEmpty()) {
                    item { SectionHeader("Artists") }
                    items(results.artists, key = { "artist:${it.id}" }) { artist ->
                        ArtistResultRow(artist) { onOpenArtist(artist.id, artist.name) }
                    }
                }

                if (results.total == 0) {
                    item {
                        EmptyPane(
                            title = "No results for \"$query\"",
                            detail = "Try a different spelling or browse a genre.",
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun ArtistHeaderCard(artist: ArtistSummary, onClick: () -> Unit) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(T.Card))
            .background(T.card)
            .clickable(onClick = onClick)
            .padding(T.MdDp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        com.resona.app.ui.common.Artwork(
            seed = artist.id,
            artUrl = artist.artUrl,
            modifier = Modifier.size(72.dp),
            corner = 100.dp,
        )
        Spacer(Modifier.width(T.MdDp))
        Column(Modifier.weight(1f)) {
            Text(
                "Artist",
                style = MaterialTheme.typography.labelSmall,
                color = T.sub,
            )
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(
                    artist.name,
                    style = MaterialTheme.typography.headlineMedium,
                    color = T.text,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                )
                if (artist.verified) {
                    Spacer(Modifier.width(T.XsDp))
                    CheckBadge()
                }
            }
            Text(
                artist.genres.take(3).joinToString(" · "),
                style = MaterialTheme.typography.bodyMedium,
                color = T.sub,
                maxLines = 1,
            )
        }
        Text("Open", style = MaterialTheme.typography.labelLarge, color = T.green)
    }
}

@Composable
private fun AlbumResultRow(album: AlbumSummary, onClick: () -> Unit) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(T.Art))
            .clickable(onClick = onClick)
            .padding(vertical = T.XsDp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        com.resona.app.ui.common.Artwork(
            seed = album.id,
            artUrl = album.artUrl,
            modifier = Modifier.size(T.ArtRowDp),
        )
        Spacer(Modifier.width(T.MdDp))
        Column(Modifier.weight(1f)) {
            Text(
                album.title,
                style = MaterialTheme.typography.bodyLarge,
                color = T.text,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
            )
            Text(
                "${album.type.replaceFirstChar { it.uppercase() }} · ${album.artistName}",
                style = MaterialTheme.typography.bodyMedium,
                color = T.sub,
                maxLines = 1,
            )
        }
        Text(
            plural(album.trackCount, "track"),
            style = MaterialTheme.typography.labelSmall,
            color = T.dim,
        )
    }
}

@Composable
private fun ArtistResultRow(artist: ArtistSummary, onClick: () -> Unit) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(T.Art))
            .clickable(onClick = onClick)
            .padding(vertical = T.XsDp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        com.resona.app.ui.common.Artwork(
            seed = artist.id,
            artUrl = artist.artUrl,
            modifier = Modifier.size(T.ArtRowDp),
            corner = 100.dp,
        )
        Spacer(Modifier.width(T.MdDp))
        Column(Modifier.weight(1f)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(
                    artist.name,
                    style = MaterialTheme.typography.bodyLarge,
                    color = T.text,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                )
                if (artist.verified) {
                    Spacer(Modifier.width(T.XsDp))
                    CheckBadge()
                }
            }
            Text(
                artist.genres.take(3).joinToString(" · "),
                style = MaterialTheme.typography.bodyMedium,
                color = T.sub,
                maxLines = 1,
            )
        }
    }
}
