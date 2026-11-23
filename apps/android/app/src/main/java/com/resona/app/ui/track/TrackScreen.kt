package com.resona.app.ui.track

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.resona.app.BuildConfig
import com.resona.app.data.TrackDetail
import com.resona.app.ui.AppViewModel
import com.resona.app.ui.common.Artwork
import com.resona.app.ui.common.BackHeader
import com.resona.app.ui.common.ErrorPane
import com.resona.app.ui.common.LoadState
import com.resona.app.ui.common.LoadingPane
import com.resona.app.ui.common.formatDuration
import com.resona.app.ui.common.formatPlayCount
import com.resona.app.ui.common.gradientFor
import com.resona.app.ui.common.rememberLoader
import com.resona.app.ui.friendlyMessage
import com.resona.app.ui.theme.GeneratedTokens as T
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.launch

/**
 * Single page. Playback is M2, so the primary action is a radio; the debug
 * block below it exercises POST /v1/events/listen end-to-end on device.
 */
@Composable
fun TrackScreen(
    vm: AppViewModel,
    trackId: String,
    onBack: () -> Unit,
    onOpenArtist: (String, String) -> Unit,
    onOpenAlbum: (String, String) -> Unit,
    onOpenStation: (String, String) -> Unit,
) {
    val loader = rememberLoader("track:$trackId") { vm.track(trackId) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(T.bg),
    ) {
        BackHeader(onBack = onBack)

        when (val state = loader.state) {
            is LoadState.Loading -> LoadingPane("Loading track")
            is LoadState.Failed -> ErrorPane(state.message, loader.reload)
            is LoadState.Ready -> TrackContent(
                vm = vm,
                track = state.value,
                onOpenArtist = onOpenArtist,
                onOpenAlbum = onOpenAlbum,
                onOpenStation = onOpenStation,
            )
        }
    }
}

@Composable
private fun TrackContent(
    vm: AppViewModel,
    track: TrackDetail,
    onOpenArtist: (String, String) -> Unit,
    onOpenAlbum: (String, String) -> Unit,
    onOpenStation: (String, String) -> Unit,
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .background(
                Brush.verticalGradient(
                    listOf(
                        gradientFor(track.id).first().copy(alpha = 0.45f),
                        T.bg,
                    ),
                ),
            )
            .padding(horizontal = T.ScreenXDp)
            .padding(bottom = T.SectionDp),
        horizontalAlignment = androidx.compose.ui.Alignment.CenterHorizontally,
    ) {
        Spacer(Modifier.height(T.MdDp))
        Artwork(
            seed = track.id,
            artUrl = track.artUrl,
            modifier = Modifier.size(180.dp),
            corner = T.Card,
        )
        Spacer(Modifier.height(T.XlDp))
        Text(
            track.title,
            style = MaterialTheme.typography.displayLarge,
            color = T.text,
            maxLines = 3,
            overflow = TextOverflow.Ellipsis,
        )
        Spacer(Modifier.height(T.XsDp))
        Text(
            track.artistName,
            style = MaterialTheme.typography.bodyLarge,
            color = T.green,
            maxLines = 1,
            modifier = Modifier.clickable {
                onOpenArtist(track.artistId, track.artistName)
            },
        )
        if (track.albumId != null && track.albumTitle != null) {
            Text(
                track.albumTitle,
                style = MaterialTheme.typography.bodyMedium,
                color = T.sub,
                maxLines = 1,
                modifier = Modifier.clickable {
                    onOpenAlbum(track.albumId, track.albumTitle)
                },
            )
        }
        Spacer(Modifier.height(T.SmDp))
        Text(
            buildString {
                append(formatDuration(track.durationMs))
                append(" · ")
                append(formatPlayCount(track.playCount))
                append(" plays")
                if (track.hasLyrics) append(" · Lyrics ready")
            },
            style = MaterialTheme.typography.labelSmall,
            color = T.dim,
        )

        if (track.genres.isNotEmpty()) {
            Spacer(Modifier.height(T.SmDp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.Center,
            ) {
                Text(
                    track.genres.joinToString(" · "),
                    style = MaterialTheme.typography.labelLarge,
                    color = T.sub,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                )
            }
        }

        Spacer(Modifier.height(T.SectionDp))
        Row(horizontalArrangement = Arrangement.spacedBy(T.SmDp)) {
            Button(
                onClick = { onOpenStation(track.id, "${track.title} Radio") },
                shape = RoundedCornerShape(T.Cta),
                colors = ButtonDefaults.buttonColors(
                    containerColor = T.green,
                    contentColor = T.black,
                ),
            ) {
                Text("Start radio", style = MaterialTheme.typography.labelLarge)
            }
            OutlinedButton(
                onClick = { onOpenArtist(track.artistId, track.artistName) },
                shape = RoundedCornerShape(T.Cta),
            ) {
                Text("Artist", style = MaterialTheme.typography.labelLarge)
            }
        }

        Spacer(Modifier.height(T.SmDp))
        Text(
            "Playback arrives in M2. The catalog, radio, and recents are live now.",
            style = MaterialTheme.typography.labelSmall,
            color = T.dim,
            modifier = Modifier.padding(top = T.SmDp),
        )

        if (BuildConfig.DEBUG) {
            DebugListenCard(vm = vm, trackId = track.id)
        }
    }
}

@Composable
private fun DebugListenCard(vm: AppViewModel, trackId: String) {
    val scope = rememberCoroutineScope()
    var status by rememberSaveable { mutableStateOf<String?>(null) }
    var busy by rememberSaveable { mutableStateOf(false) }

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(top = T.SectionDp)
            .background(T.card, RoundedCornerShape(T.Card))
            .padding(T.MdDp),
    ) {
        Text(
            "Debug · listen capture",
            style = MaterialTheme.typography.labelLarge,
            color = T.green,
        )
        Text(
            "Sends a ListenEvent so Search → Recently played has data before M2 playback exists.",
            style = MaterialTheme.typography.labelSmall,
            color = T.sub,
        )
        Spacer(Modifier.height(T.XsDp))
        TextButton(
            onClick = {
                if (busy) return@TextButton
                busy = true
                status = null
                scope.launch {
                    try {
                        val res = vm.recordListen(trackId, 30_000, false)
                        status = "Accepted ${res.accepted} event"
                    } catch (err: CancellationException) {
                        throw err
                    } catch (err: Exception) {
                        status = friendlyMessage(err)
                    } finally {
                        busy = false
                    }
                }
            },
            enabled = !busy,
        ) {
            Text(if (busy) "Sending…" else "Log a 30 s listen")
        }
        status?.let {
            Text(
                it,
                style = MaterialTheme.typography.labelSmall,
                color = T.sub,
            )
        }
    }
}
