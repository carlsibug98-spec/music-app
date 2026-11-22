package com.resona.app.ui.artist

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
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.shape.CircleShape
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
import com.resona.app.data.AlbumSummary
import com.resona.app.data.ArtistDetail
import com.resona.app.data.TrackSummary
import com.resona.app.ui.AppViewModel
import com.resona.app.ui.common.Artwork
import com.resona.app.ui.common.BackHeader
import com.resona.app.ui.common.CheckBadge
import com.resona.app.ui.common.ErrorPane
import com.resona.app.ui.common.LoadState
import com.resona.app.ui.common.LoadingPane
import com.resona.app.ui.common.SectionHeader
import com.resona.app.ui.common.formatListeners
import com.resona.app.ui.common.formatPlayCount
import com.resona.app.ui.common.gradientFor
import com.resona.app.ui.common.plural
import com.resona.app.ui.common.rememberLoader
import com.resona.app.ui.theme.GeneratedTokens as T

/**
 * Screen 13 (PRD): artist hero, verified badge, monthly listeners, popular
 * top 5 with play counts, releases, and a radio entry point. Follow/credits/
 * explore are M3+ (no follow API yet).
 */
@Composable
fun ArtistScreen(
    vm: AppViewModel,
    artistId: String,
    onBack: () -> Unit,
    onOpenTrack: (String, String) -> Unit,
    onOpenAlbum: (String, String) -> Unit,
    onOpenStation: (String, String) -> Unit,
) {
    val loader = rememberLoader("artist:$artistId") { vm.artist(artistId) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(T.bg),
    ) {
        BackHeader(onBack = onBack)

        when (val state = loader.state) {
            is LoadState.Loading -> LoadingPane("Loading artist")
            is LoadState.Failed -> ErrorPane(state.message, loader.reload)
            is LoadState.Ready -> ArtistContent(
                artist = state.value,
                onOpenTrack = onOpenTrack,
                onOpenAlbum = onOpenAlbum,
                onOpenStation = onOpenStation,
            )
        }
    }
}

@Composable
private fun ArtistContent(
    artist: ArtistDetail,
    onOpenTrack: (String, String) -> Unit,
    onOpenAlbum: (String, String) -> Unit,
    onOpenStation: (String, String) -> Unit,
) {
    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(bottom = T.SectionDp),
        verticalArrangement = Arrangement.spacedBy(T.MdDp),
    ) {
        item {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(
                        Brush.verticalGradient(
                            listOf(
                                gradientFor(artist.id).first().copy(alpha = 0.5f),
                                T.bg,
                            ),
                        ),
                    )
                    .padding(horizontal = T.ScreenXDp, vertical = T.LgDp),
            ) {
                Column {
                    Artwork(
                        seed = artist.id,
                        artUrl = artist.artUrl,
                        modifier = Modifier.size(112.dp),
                        corner = 56.dp,
                    )
                    Spacer(Modifier.height(T.MdDp))
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(
                            artist.name,
                            style = MaterialTheme.typography.displayLarge,
                            color = T.text,
                            maxLines = 2,
                            overflow = TextOverflow.Ellipsis,
                            modifier = Modifier.weight(1f, fill = false),
                        )
                        if (artist.verified) {
                            Spacer(Modifier.width(T.XsDp))
                            CheckBadge()
                        }
                    }
                    Text(
                        formatListeners(artist.monthlyListeners),
                        style = MaterialTheme.typography.bodyMedium,
                        color = T.sub,
                    )
                    if (artist.genres.isNotEmpty()) {
                        Spacer(Modifier.height(T.XsDp))
                        Text(
                            artist.genres.joinToString(" · "),
                            style = MaterialTheme.typography.labelLarge,
                            color = T.sub,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis,
                        )
                    }
                    Spacer(Modifier.height(T.MdDp))
                    Row(horizontalArrangement = Arrangement.spacedBy(T.SmDp)) {
                        Button(
                            onClick = { onOpenStation(artist.id, "${artist.name} Radio") },
                            shape = RoundedCornerShape(T.Cta),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = T.green,
                                contentColor = T.black,
                            ),
                        ) {
                            Text("Start radio", style = MaterialTheme.typography.labelLarge)
                        }
                    }
                    artist.bio?.let { bio ->
                        Spacer(Modifier.height(T.MdDp))
                        Text(
                            bio,
                            style = MaterialTheme.typography.bodyMedium,
                            color = T.sub,
                            maxLines = 4,
                            overflow = TextOverflow.Ellipsis,
                        )
                    }
                }
            }
        }

        item {
            SectionHeader(
                "Popular",
                modifier = Modifier.padding(horizontal = T.ScreenXDp),
            )
        }
        itemsIndexed(artist.topTracks.take(5), key = { _, t -> "top:${t.id}" }) { index, track ->
            PopularTrackRow(
                index = index + 1,
                track = track,
                onClick = { onOpenTrack(track.id, track.title) },
                modifier = Modifier.padding(horizontal = T.ScreenXDp),
            )
        }

        if (artist.releases.isNotEmpty()) {
            item {
                SectionHeader(
                    "Releases",
                    modifier = Modifier.padding(horizontal = T.ScreenXDp),
                )
            }
            item {
                LazyRow(
                    horizontalArrangement = Arrangement.spacedBy(T.MdDp),
                    contentPadding = PaddingValues(horizontal = T.ScreenXDp),
                ) {
                    items(artist.releases, key = { "release:${it.id}" }) { album ->
                        ReleaseTile(album) { onOpenAlbum(album.id, album.title) }
                    }
                }
            }
        }

        if (artist.topTracks.isEmpty() && artist.releases.isEmpty()) {
            item {
                Text(
                    "No releases yet.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = T.sub,
                    modifier = Modifier.padding(horizontal = T.ScreenXDp),
                )
            }
        }
    }
}

@Composable
private fun PopularTrackRow(
    index: Int,
    track: TrackSummary,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Row(
        modifier = modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(T.Art))
            .clickable(onClick = onClick)
            .padding(vertical = T.XsDp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Text(
            index.toString(),
            style = MaterialTheme.typography.labelLarge,
            color = T.dim,
            modifier = Modifier.width(24.dp),
        )
        Artwork(track.id, track.artUrl, Modifier.size(T.ArtRowDp))
        Spacer(Modifier.width(T.MdDp))
        Column(Modifier.weight(1f)) {
            Text(
                track.title,
                style = MaterialTheme.typography.bodyLarge,
                color = T.text,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
            )
            Text(
                formatPlayCount(track.playCount) + " plays",
                style = MaterialTheme.typography.bodyMedium,
                color = T.sub,
                maxLines = 1,
            )
        }
        Text(
            com.resona.app.ui.common.formatDuration(track.durationMs),
            style = MaterialTheme.typography.labelSmall,
            color = T.dim,
        )
    }
}

@Composable
private fun ReleaseTile(album: AlbumSummary, onClick: () -> Unit) {
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
            album.type.replaceFirstChar { it.uppercase() } +
                " · " + plural(album.trackCount, "track"),
            style = MaterialTheme.typography.bodyMedium,
            color = T.sub,
            maxLines = 1,
        )
    }
}
