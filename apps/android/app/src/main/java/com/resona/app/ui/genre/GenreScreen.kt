package com.resona.app.ui.genre

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
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.resona.app.data.GenreDetailResponse
import com.resona.app.ui.AppViewModel
import com.resona.app.ui.common.BackHeader
import com.resona.app.ui.common.ErrorPane
import com.resona.app.ui.common.LoadState
import com.resona.app.ui.common.LoadingPane
import com.resona.app.ui.common.formatDuration
import com.resona.app.ui.common.gradientFor
import com.resona.app.ui.common.plural
import com.resona.app.ui.common.rememberLoader
import com.resona.app.ui.theme.GeneratedTokens as T

/** Browse genre page: gradient header, radio entry, full track list. */
@Composable
fun GenreScreen(
    vm: AppViewModel,
    genreId: String,
    onBack: () -> Unit,
    onOpenTrack: (String, String) -> Unit,
    onOpenStation: (String, String) -> Unit,
) {
    val loader = rememberLoader("genre:$genreId") { vm.genre(genreId) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(T.bg),
    ) {
        BackHeader(onBack = onBack)

        when (val state = loader.state) {
            is LoadState.Loading -> LoadingPane("Loading genre")
            is LoadState.Failed -> ErrorPane(state.message, loader.reload)
            is LoadState.Ready -> GenreContent(
                data = state.value,
                onOpenTrack = onOpenTrack,
                onOpenStation = onOpenStation,
            )
        }
    }
}

@Composable
private fun GenreContent(
    data: GenreDetailResponse,
    onOpenTrack: (String, String) -> Unit,
    onOpenStation: (String, String) -> Unit,
) {
    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(bottom = T.SectionDp),
        verticalArrangement = Arrangement.spacedBy(T.SmDp),
    ) {
        item {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Brush.linearGradient(gradientFor(data.genre.id)))
                    .padding(horizontal = T.ScreenXDp, vertical = T.SectionDp),
            ) {
                Column {
                    Text(
                        "Genre",
                        style = MaterialTheme.typography.labelSmall,
                        color = T.text.copy(alpha = 0.8f),
                    )
                    Text(
                        data.genre.name,
                        style = MaterialTheme.typography.displayLarge,
                        color = T.text,
                    )
                    Text(
                        plural(data.genre.trackCount, "track"),
                        style = MaterialTheme.typography.bodyMedium,
                        color = T.text.copy(alpha = 0.8f),
                    )
                    Spacer(Modifier.padding(top = T.SmDp))
                    Button(
                        onClick = { onOpenStation(data.genre.id, "${data.genre.name} Radio") },
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
        }

        itemsIndexed(data.tracks, key = { _, t -> "genre-track:${t.id}" }) { index, track ->
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable { onOpenTrack(track.id, track.title) }
                    .padding(horizontal = T.ScreenXDp, vertical = T.XsDp),
                verticalAlignment = androidx.compose.ui.Alignment.CenterVertically,
            ) {
                Text(
                    (index + 1).toString().padStart(2, '0'),
                    style = MaterialTheme.typography.labelLarge,
                    color = T.dim,
                    modifier = Modifier.padding(end = T.MdDp),
                )
                com.resona.app.ui.common.Artwork(
                    track.id,
                    track.artUrl,
                    Modifier.size(48.dp),
                )
                Column(
                    Modifier
                        .weight(1f)
                        .padding(horizontal = T.MdDp),
                ) {
                    Text(
                        track.title,
                        style = MaterialTheme.typography.bodyLarge,
                        color = T.text,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis,
                    )
                    Text(
                        track.artistName,
                        style = MaterialTheme.typography.bodyMedium,
                        color = T.sub,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis,
                    )
                }
                Text(
                    formatDuration(track.durationMs),
                    style = MaterialTheme.typography.labelSmall,
                    color = T.dim,
                )
            }
        }

        if (data.tracks.isEmpty()) {
            item {
                Text(
                    "No tracks in this genre yet.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = T.sub,
                    modifier = Modifier.padding(horizontal = T.ScreenXDp),
                )
            }
        }
    }
}
