package com.resona.app.ui.home

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import com.resona.app.ui.theme.GeneratedTokens as T
import com.resona.app.ui.theme.ResonaTheme

/**
 * M0 Home skeleton — layout contract from the mockup (doc 03):
 * greeting, 2-col quick grid, section header, track rows.
 * Content is static; /v1/home feeds it in M1+.
 */

private data class QuickItem(val title: String, val gradient: List<Color>)
private data class TrackRow(val title: String, val artist: String, val gradient: List<Color>)

private val quickItems = listOf(
    QuickItem("Liked songs", T.Liked),
    QuickItem("Bakunawa Radio", T.Teal),
    QuickItem("Chill mix", T.Blue),
    QuickItem("Diwata Drive", T.Violet),
)

private val tracks = listOf(
    TrackRow("Panata", "Bakunawa", T.Warm),
    TrackRow("Susundan", "Diwata Drive", T.Blue),
    TrackRow("Gabing Nasa Bukid", "Neon Kapre", T.Green),
)

@Composable
fun HomeScreen() {
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(T.bg),
        contentPadding = PaddingValues(
            horizontal = T.ScreenXDp,
            vertical = T.SectionDp,
        ),
        verticalArrangement = Arrangement.spacedBy(T.SmDp),
    ) {
        item {
            Text(
                "Home",
                style = MaterialTheme.typography.headlineLarge,
                color = T.text,
            )
        }

        // Quick grid — 2 cols, 56dp tiles (doc 03 §3)
        item {
            Column(verticalArrangement = Arrangement.spacedBy(T.SmDp)) {
                quickItems.chunked(2).forEach { row ->
                    Row(horizontalArrangement = Arrangement.spacedBy(T.SmDp)) {
                        row.forEach { item ->
                            QuickCard(item.title, item.gradient, Modifier.weight(1f))
                        }
                    }
                }
            }
        }

        item {
            SectionHeader("Made for you")
        }

        items(tracks.size) { i ->
            TrackRow(tracks[i])
        }
    }
}

@Composable
private fun SectionHeader(title: String) {
    Text(
        title,
        style = MaterialTheme.typography.headlineMedium,
        color = T.text,
        modifier = Modifier.padding(top = T.LgDp),
    )
}

@Composable
private fun QuickCard(title: String, gradient: List<Color>, modifier: Modifier = Modifier) {
    Box(
        modifier = modifier
            .height(T.QuickTileDp)
            .clip(RoundedCornerShape(T.ArtDp))
            .background(Brush.verticalGradient(gradient)),
        contentAlignment = Alignment.CenterStart,
    ) {
        Text(
            title,
            style = MaterialTheme.typography.labelLarge,
            color = T.text,
            maxLines = 2,
            overflow = TextOverflow.Ellipsis,
            modifier = Modifier.padding(horizontal = T.MdDp),
        )
    }
}

@Composable
private fun TrackRow(track: TrackRow) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .height(T.RowMinDp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Box(
            modifier = Modifier
                .size(T.ArtRowDp)
                .clip(RoundedCornerShape(T.ArtDp))
                .background(Brush.verticalGradient(track.gradient)),
        )
        Spacer(Modifier.width(T.MdDp))
        Column {
            Text(
                track.title,
                style = MaterialTheme.typography.bodyLarge,
                color = T.text,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
            )
            Text(
                track.artist,
                style = MaterialTheme.typography.bodyMedium,
                color = T.sub,
                maxLines = 1,
            )
        }
    }
}

@Preview(showBackground = true, backgroundColor = 0xFF121212)
@Composable
private fun HomeScreenPreview() {
    ResonaTheme {
        HomeScreen()
    }
}
