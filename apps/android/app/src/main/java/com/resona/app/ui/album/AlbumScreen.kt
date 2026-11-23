package com.resona.app.ui.album

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
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
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.resona.app.data.AlbumDetail
import com.resona.app.data.AlbumSummary
import com.resona.app.ui.AppViewModel
import com.resona.app.ui.common.Artwork
import com.resona.app.ui.common.BackHeader
import com.resona.app.ui.common.ErrorPane
import com.resona.app.ui.common.LoadState
import com.resona.app.ui.common.LoadingPane
import com.resona.app.ui.common.SectionHeader
import com.resona.app.ui.common.formatDuration
import com.resona.app.ui.common.gradientFor
import com.resona.app.ui.common.plural
import com.resona.app.ui.common.rememberLoader
import com.resona.app.ui.theme.GeneratedTokens as T

/** Album / single page: hero, track list with numbers, more by artist. */
@Composable
fun AlbumScreen(
    vm: AppViewModel,
    albumId: String,
    onBack: () -> Unit,
    onOpenTrack: (String, String) -> Unit,
    onOpenArtist: (String, String) -> Unit,
    onOpenAlbum: (String, String) -> Unit,
    onOpenStation: (String, String) -> Unit,
) {
    val loader = rememberLoader("album:$albumId") { vm.album(albumId) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(T.bg),
    ) {
        BackHeader(onBack = onBack)

        when (val state = loader.state) {
            is LoadState.Loading -> LoadingPane("Loading album")
            is LoadState.Failed -> ErrorPane(state.message, loader.reload)
            is LoadState.Ready -> AlbumContent(
                album = state.value,
                onOpenTrack = onOpenTrack,
                onOpenArtist = onOpenArtist,
                onOpenAlbum = onOpenAlbum,
                onOpenStation = onOpenStation,
            )
        }
    }
}

@Composable
private fun AlbumContent(
    album: AlbumDetail,
    onOpenTrack: (String, String) -> Unit,
    onOpenArtist: (String, String) -> Unit,
    onOpenAlbum: (String, String) -> Unit,
    onOpenStation: (String, String) -> Unit,
) {
    val totalMs = album.tracks.sumOf { it.durationMs }

    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(bottom = T.SectionDp),
        verticalArrangement = Arrangement.spacedBy(T.SmDp),
    ) {
        item {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(
                        Brush.verticalGradient(
                            listOf(
                                gradientFor(album.id).first().copy(alpha = 0.45f),
                                T.bg,
                            ),
                        ),
                    )
                    .padding(horizontal = T.ScreenXDp, vertical = T.MdDp),
            ) {
                Artwork(
                    seed = album.id,
                    artUrl = album.artUrl,
                    modifier = Modifier.size(128.dp),
                    corner = T.Card,
                )
                Spacer(Modifier.width(T.LgDp))
                Column(Modifier.weight(1f)) {
                    Text(
                        album.type.replaceFirstChar { it.uppercase() },
                        style = MaterialTheme.typography.labelSmall,
                        color = T.green,
                    )
                    Text(
                        album.title,
                        style = MaterialTheme.typography.headlineLarge,
                        color = T.text,
                        maxLines = 3,
                        overflow = TextOverflow.Ellipsis,
                    )
                    Spacer(Modifier.height(T.XsDp))
                    Text(
                        album.artistName,
                        style = MaterialTheme.typography.bodyLarge,
                        color = T.sub,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis,
                        modifier = Modifier.clickable {
                            onOpenArtist(album.artistId, album.artistName)
                        },
                    )
                    Text(
                        buildString {
                            album.releaseDate?.take(4)?.let { append("$it · ") }
                            append(plural(album.trackCount, "track"))
                            if (totalMs > 0) append(" · ${formatDuration(totalMs)}")
                        },
                        style = MaterialTheme.typography.labelSmall,
                        color = T.dim,
                    )
                }
            }
        }

        item {
            Row(
                modifier = Modifier.padding(horizontal = T.ScreenXDp),
                horizontalArrangement = Arrangement.spacedBy(T.SmDp),
            ) {
                Button(
                    onClick = { onOpenStation(album.id, "${album.title} Radio") },
                    shape = RoundedCornerShape(T.Cta),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = T.green,
                        contentColor = T.black,
                    ),
                ) {
                    Text("Start radio", style = MaterialTheme.typography.labelLarge)
                }
            }
        }

        itemsIndexed(album.tracks, key = { _, t -> "track:${t.id}" }) { index, track ->
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable { onOpenTrack(track.id, track.title) }
                    .padding(horizontal = T.ScreenXDp, vertical = T.XsDp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Text(
                    (index + 1).toString().padStart(2, '0'),
                    style = MaterialTheme.typography.labelLarge,
                    color = T.dim,
                    modifier = Modifier.width(28.dp),
                )
                Column(Modifier.weight(1f)) {
                    Text(
                        track.title,
                        style = MaterialTheme.typography.bodyLarge,
                        color = T.text,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis,
                    )
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(
                            track.artistName,
                            style = MaterialTheme.typography.bodyMedium,
                            color = T.sub,
                            maxLines = 1,
                        )
                        if (track.hasLyrics) {
                            Text(
                                "  ·  LRC",
                                style = MaterialTheme.typography.labelSmall,
                                color = T.green,
                            )
                        }
                    }
                }
                Text(
                    formatDuration(track.durationMs),
                    style = MaterialTheme.typography.labelSmall,
                    color = T.dim,
                )
            }
        }

        if (album.moreByArtist.isNotEmpty()) {
            item {
                SectionHeader(
                    "More by ${album.artistName}",
                    modifier = Modifier.padding(horizontal = T.ScreenXDp, vertical = T.SmDp),
                )
            }
            item {
                LazyRow(
                    horizontalArrangement = Arrangement.spacedBy(T.MdDp),
                    contentPadding = PaddingValues(horizontal = T.ScreenXDp),
                ) {
                    items(album.moreByArtist, key = { "more:${it.id}" }) { more ->
                        MoreAlbumTile(more) { onOpenAlbum(more.id, more.title) }
                    }
                }
            }
        }
    }
}

@Composable
private fun MoreAlbumTile(album: AlbumSummary, onClick: () -> Unit) {
    Column(
        modifier = Modifier
            .width(136.dp)
            .clip(RoundedCornerShape(T.Art))
            .clickable(onClick = onClick),
    ) {
        Artwork(album.id, album.artUrl, Modifier.size(136.dp))
        Spacer(Modifier.height(T.SmDp))
        Text(
            album.title,
            style = MaterialTheme.typography.bodyLarge,
            color = T.text,
            maxLines = 1,
            overflow = TextOverflow.Ellipsis,
        )
        Text(
            album.type.replaceFirstChar { it.uppercase() },
            style = MaterialTheme.typography.bodyMedium,
            color = T.sub,
            maxLines = 1,
        )
    }
}
