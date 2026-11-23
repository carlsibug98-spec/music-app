package com.resona.app.ui.home

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
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.style.TextOverflow
import com.resona.app.data.CatalogCard
import com.resona.app.data.HomeResponse
import com.resona.app.ui.AppViewModel
import com.resona.app.ui.common.Artwork
import com.resona.app.ui.common.CatalogCardTile
import com.resona.app.ui.common.ErrorPane
import com.resona.app.ui.common.LoadState
import com.resona.app.ui.common.LoadingPane
import com.resona.app.ui.common.SectionHeader
import com.resona.app.ui.common.rememberLoader
import com.resona.app.ui.theme.GeneratedTokens as T

/**
 * M1 Home: greeting + search entry + 2-col quick grid + server rows.
 * All content comes from GET /v1/home; tapping a card deep-links into the
 * matching M1 destination.
 */
@Composable
fun HomeScreen(
    vm: AppViewModel,
    onOpenCard: (CatalogCard) -> Unit,
) {
    val loader = rememberLoader("home") { vm.home() }

    when (val state = loader.state) {
        is LoadState.Loading -> HomeFrame(greeting = "Loading your music…") {
            LoadingPane("Building your home")
        }

        is LoadState.Failed -> HomeFrame(
            greeting = "Home",
            onRefresh = loader.reload,
        ) {
            ErrorPane(state.message, loader.reload)
        }

        is LoadState.Ready -> HomeFrame(
            greeting = state.value.greeting,
            onRefresh = loader.reload,
        ) {
            HomeContent(state.value, onOpenCard)
        }
    }
}

@Composable
private fun HomeFrame(
    greeting: String,
    onRefresh: (() -> Unit)? = null,
    content: @Composable () -> Unit,
) {
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(T.bg),
        contentPadding = PaddingValues(
            start = T.ScreenXDp,
            end = T.ScreenXDp,
            top = T.SmDp,
            bottom = T.SectionDp,
        ),
        verticalArrangement = Arrangement.spacedBy(T.MdDp),
    ) {
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Column(Modifier.weight(1f)) {
                    Text(
                        "TUGTUGIN",
                        style = MaterialTheme.typography.labelSmall,
                        color = T.green,
                    )
                    Text(
                        greeting,
                        style = MaterialTheme.typography.headlineLarge,
                        color = T.text,
                        maxLines = 2,
                        overflow = TextOverflow.Ellipsis,
                    )
                }
                if (onRefresh != null) {
                    IconButton(onClick = onRefresh) {
                        Icon(
                            Icons.Filled.Refresh,
                            contentDescription = "Refresh home",
                            tint = T.sub,
                        )
                    }
                }
            }
        }
        item { content() }
    }
}

@Composable
private fun HomeContent(
    home: HomeResponse,
    onOpenCard: (CatalogCard) -> Unit,
) {
    Column(verticalArrangement = Arrangement.spacedBy(T.MdDp)) {
        if (home.quickGrid.isNotEmpty()) {
            Column(verticalArrangement = Arrangement.spacedBy(T.SmDp)) {
                home.quickGrid.chunked(2).forEach { pair ->
                    Row(horizontalArrangement = Arrangement.spacedBy(T.SmDp)) {
                        pair.forEach { card ->
                            QuickTile(card, onOpenCard, Modifier.weight(1f))
                        }
                        if (pair.size == 1) Spacer(Modifier.weight(1f))
                    }
                }
            }
        }

        home.rows.forEach { row ->
            Column(verticalArrangement = Arrangement.spacedBy(T.SmDp)) {
                SectionHeader(row.title)
                LazyRow(
                    horizontalArrangement = Arrangement.spacedBy(T.MdDp),
                    contentPadding = PaddingValues(end = T.MdDp),
                ) {
                    items(row.items, key = { "${row.key}:${it.kind}:${it.id}" }) { card ->
                        CatalogCardTile(card, onClick = { onOpenCard(card) })
                    }
                }
            }
        }
    }
}

@Composable
private fun QuickTile(
    card: CatalogCard,
    onOpenCard: (CatalogCard) -> Unit,
    modifier: Modifier = Modifier,
) {
    Row(
        modifier = modifier
            .height(T.QuickTileDp)
            .clip(RoundedCornerShape(T.Art))
            .background(T.card)
            .clickable { onOpenCard(card) },
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Artwork(
            seed = card.id,
            artUrl = card.artUrl,
            modifier = Modifier.size(T.QuickTileDp),
            corner = T.Art,
        )
        Text(
            card.title,
            style = MaterialTheme.typography.labelLarge,
            color = T.text,
            maxLines = 2,
            overflow = TextOverflow.Ellipsis,
            modifier = Modifier.padding(horizontal = T.SmDp),
        )
    }
}
