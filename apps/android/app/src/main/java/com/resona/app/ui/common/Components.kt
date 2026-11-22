package com.resona.app.ui.common

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import coil.compose.AsyncImage
import com.resona.app.data.CatalogCard
import com.resona.app.data.TrackSummary
import com.resona.app.ui.theme.GeneratedTokens as T

/** Resolves a relative /media path against the configured API host. */
val LocalMediaUrl = staticCompositionLocalOf<(String?) -> String?> { { null } }

private val gradients = listOf(
    T.Warm, T.Blue, T.Green, T.Violet, T.Teal, T.Gold, T.Sunset, T.Warm2, T.Warm3, T.Dark, T.Grey,
)

fun gradientFor(seed: String): List<Color> {
    val index = (seed.hashCode() and Int.MAX_VALUE) % gradients.size
    return gradients[index]
}

@Composable
fun Artwork(
    seed: String,
    artUrl: String?,
    modifier: Modifier = Modifier,
    corner: Dp = T.Art,
) {
    val resolved = LocalMediaUrl.current(artUrl)
    Box(
        modifier = modifier
            .clip(RoundedCornerShape(corner))
            .background(Brush.verticalGradient(gradientFor(seed))),
    ) {
        if (resolved != null) {
            AsyncImage(
                model = resolved,
                contentDescription = null,
                contentScale = ContentScale.Crop,
                modifier = Modifier.fillMaxSize(),
            )
        }
    }
}

@Composable
fun BackHeader(title: String? = null, onBack: () -> Unit) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = T.XsDp, vertical = T.XsDp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        IconButton(onClick = onBack) {
            Icon(Icons.Filled.ArrowBack, contentDescription = "Back", tint = T.text)
        }
        if (title != null) {
            Text(
                title,
                style = MaterialTheme.typography.titleMedium,
                color = T.text,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
            )
        }
    }
}

@Composable
fun SectionHeader(
    title: String,
    modifier: Modifier = Modifier,
    trailing: String? = null,
    onTrailingClick: (() -> Unit)? = null,
) {
    Row(
        modifier = modifier.fillMaxWidth(),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween,
    ) {
        Text(
            title,
            style = MaterialTheme.typography.headlineMedium,
            color = T.text,
            maxLines = 1,
            overflow = TextOverflow.Ellipsis,
            modifier = Modifier.weight(1f, fill = false),
        )
        if (trailing != null) {
            Text(
                trailing,
                style = MaterialTheme.typography.labelLarge,
                color = if (onTrailingClick != null) T.green else T.sub,
                modifier = if (onTrailingClick != null) {
                    Modifier
                        .clip(CircleShape)
                        .clickable(onClick = onTrailingClick)
                        .padding(horizontal = T.SmDp, vertical = T.XsDp)
                } else {
                    Modifier.padding(horizontal = T.SmDp)
                },
            )
        }
    }
}

@Composable
fun TrackListItem(
    track: TrackSummary,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    index: Int? = null,
    showArtwork: Boolean = true,
) {
    Row(
        modifier = modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(T.Art))
            .clickable(onClick = onClick)
            .padding(vertical = T.XsDp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        if (index != null) {
            Text(
                index.toString().padStart(2, '0'),
                style = MaterialTheme.typography.labelLarge,
                color = T.dim,
                modifier = Modifier.width(28.dp),
            )
        }
        if (showArtwork) {
            Artwork(track.id, track.artUrl, Modifier.size(T.ArtRowDp))
            Spacer(Modifier.width(T.MdDp))
        }
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
                    overflow = TextOverflow.Ellipsis,
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
            modifier = Modifier.padding(start = T.SmDp),
        )
    }
}

@Composable
fun CatalogCardTile(
    card: CatalogCard,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Column(
        modifier = modifier
            .width(136.dp)
            .clip(RoundedCornerShape(T.Art))
            .clickable(onClick = onClick),
    ) {
        Artwork(card.id, card.artUrl, Modifier.size(136.dp))
        Spacer(Modifier.height(T.SmDp))
        Text(
            card.title,
            style = MaterialTheme.typography.bodyLarge,
            color = T.text,
            maxLines = 1,
            overflow = TextOverflow.Ellipsis,
        )
        if (!card.subtitle.isNullOrBlank()) {
            Text(
                card.subtitle,
                style = MaterialTheme.typography.bodyMedium,
                color = T.sub,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
            )
        }
    }
}

@Composable
fun CheckBadge(modifier: Modifier = Modifier) {
    Icon(
        Icons.Filled.CheckCircle,
        contentDescription = "Verified",
        tint = T.green,
        modifier = modifier.size(18.dp),
    )
}

@Composable
fun FilterPill(
    label: String,
    selected: Boolean,
    onClick: () -> Unit,
) {
    Box(
        modifier = Modifier
            .clip(CircleShape)
            .background(if (selected) T.green else T.chip)
            .clickable(onClick = onClick)
            .padding(horizontal = 14.dp, vertical = 7.dp),
        contentAlignment = Alignment.Center,
    ) {
        Text(
            label,
            style = MaterialTheme.typography.labelLarge,
            color = if (selected) T.black else T.text,
        )
    }
}

@Composable
fun LoadingPane(label: String = "Loading") {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 48.dp),
        contentAlignment = Alignment.Center,
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            CircularProgressIndicator(color = T.green)
            Spacer(Modifier.height(T.MdDp))
            Text(label, style = MaterialTheme.typography.bodyMedium, color = T.sub)
        }
    }
}

@Composable
fun ErrorPane(message: String, onRetry: () -> Unit) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = T.LgDp, vertical = 40.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Text(
            "Something got in the way",
            style = MaterialTheme.typography.headlineSmall,
            color = T.text,
        )
        Spacer(Modifier.height(T.SmDp))
        Text(
            message,
            style = MaterialTheme.typography.bodyMedium,
            color = T.sub,
        )
        Spacer(Modifier.height(T.LgDp))
        Button(onClick = onRetry) { Text("Try again") }
    }
}

@Composable
fun EmptyPane(title: String, detail: String? = null) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = T.LgDp, vertical = 40.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Text(title, style = MaterialTheme.typography.headlineSmall, color = T.text)
        if (detail != null) {
            Spacer(Modifier.height(T.SmDp))
            Text(detail, style = MaterialTheme.typography.bodyMedium, color = T.sub)
        }
    }
}

fun formatDuration(ms: Long): String {
    if (ms <= 0) return "0:00"
    val totalSeconds = ms / 1000
    val minutes = totalSeconds / 60
    val seconds = totalSeconds % 60
    return "$minutes:${seconds.toString().padStart(2, '0')}"
}

fun formatPlayCount(count: Int): String = when {
    count >= 1_000_000 -> "${(count / 100_000) / 10.0}M"
    count >= 1_000 -> "${(count / 100) / 10.0}K"
    else -> count.toString()
}

fun formatListeners(count: Int): String =
    if (count == 0) "Be the first listener this month"
    else "${formatPlayCount(count)} monthly ${if (count == 1) "listener" else "listeners"}"

fun plural(count: Int, singular: String, plural: String = "${singular}s"): String =
    "$count ${if (count == 1) singular else plural}"
