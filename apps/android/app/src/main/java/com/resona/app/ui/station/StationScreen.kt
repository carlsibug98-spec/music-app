package com.resona.app.ui.station

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.text.style.TextOverflow
import com.resona.app.data.StationResponse
import com.resona.app.ui.AppViewModel
import com.resona.app.ui.common.BackHeader
import com.resona.app.ui.common.ErrorPane
import com.resona.app.ui.common.LoadState
import com.resona.app.ui.common.LoadingPane
import com.resona.app.ui.common.TrackListItem
import com.resona.app.ui.common.gradientFor
import com.resona.app.ui.common.plural
import com.resona.app.ui.common.rememberLoader
import com.resona.app.ui.theme.GeneratedTokens as T

/** Radio station page (artist, album, track, or genre seed). */
@Composable
fun StationScreen(
    vm: AppViewModel,
    seed: String,
    title: String,
    onBack: () -> Unit,
    onOpenTrack: (String, String) -> Unit,
) {
    val loader = rememberLoader("station:$seed") { vm.station(seed) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(T.bg),
    ) {
        BackHeader(title = title, onBack = onBack)

        when (val state = loader.state) {
            is LoadState.Loading -> LoadingPane("Tuning the station")
            is LoadState.Failed -> ErrorPane(state.message, loader.reload)
            is LoadState.Ready -> StationContent(state.value, onOpenTrack)
        }
    }
}

@Composable
private fun StationContent(
    station: StationResponse,
    onOpenTrack: (String, String) -> Unit,
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
                    .padding(horizontal = T.ScreenXDp)
                    .background(
                        Brush.linearGradient(gradientFor(station.seed)),
                        RoundedCornerShape(T.Card),
                    )
                    .padding(T.XlDp),
            ) {
                Column {
                    Text(
                        "RADIO",
                        style = MaterialTheme.typography.labelSmall,
                        color = T.text.copy(alpha = 0.8f),
                    )
                    Text(
                        station.title,
                        style = MaterialTheme.typography.displayLarge,
                        color = T.text,
                        maxLines = 2,
                        overflow = TextOverflow.Ellipsis,
                    )
                    Spacer(Modifier.height(T.XsDp))
                    Text(
                        station.description,
                        style = MaterialTheme.typography.bodyMedium,
                        color = T.text.copy(alpha = 0.85f),
                        maxLines = 3,
                        overflow = TextOverflow.Ellipsis,
                    )
                    Spacer(Modifier.height(T.MdDp))
                    Text(
                        plural(station.tracks.size, "track") + " · endless mix lands in M2",
                        style = MaterialTheme.typography.labelSmall,
                        color = T.text.copy(alpha = 0.7f),
                    )
                }
            }
        }

        item {
            Text(
                "Up next",
                style = MaterialTheme.typography.headlineMedium,
                color = T.text,
                modifier = Modifier.padding(horizontal = T.ScreenXDp, vertical = T.SmDp),
            )
        }

        items(station.tracks, key = { "station:${it.id}" }) { track ->
            TrackListItem(
                track = track,
                onClick = { onOpenTrack(track.id, track.title) },
                modifier = Modifier.padding(horizontal = T.ScreenXDp),
            )
        }

        if (station.tracks.isEmpty()) {
            item {
                Text(
                    "This station has no tracks yet.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = T.sub,
                    modifier = Modifier.padding(horizontal = T.ScreenXDp),
                )
            }
        }
    }
}
