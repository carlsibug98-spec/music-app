package com.resona.app.ui

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.saveable.rememberSaveableStateHolder
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.unit.dp
import com.resona.app.data.CatalogCard
import com.resona.app.ui.album.AlbumScreen
import com.resona.app.ui.artist.ArtistScreen
import com.resona.app.ui.genre.GenreScreen
import com.resona.app.ui.home.HomeScreen
import com.resona.app.ui.onboarding.OnboardingScreen
import com.resona.app.ui.search.SearchScreen
import com.resona.app.ui.station.StationScreen
import com.resona.app.ui.theme.GeneratedTokens as T
import com.resona.app.ui.track.TrackScreen

@Composable
fun AppRoot(vm: AppViewModel) {
    when (val session = vm.session) {
        is SessionState.Ready -> MainShell(vm)
        SessionState.NeedsName, SessionState.Registering -> OnboardingScreen(
            session = session,
            error = vm.onboardingError,
            onRegister = vm::register,
            onDismissError = vm::dismissOnboardingError,
        )
    }
}

@Composable
private fun MainShell(vm: AppViewModel) {
    val dest = vm.currentDestination
    val showNav = dest == Dest.HomeTab || dest == Dest.SearchTab
    val holder = rememberSaveableStateHolder()

    BackHandler(enabled = vm.canGoBack) { vm.back() }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(T.bg),
    ) {
        Box(Modifier.weight(1f)) {
            holder.SaveableStateProvider(destKey(dest)) {
                Destination(vm, dest)
            }
        }
        if (showNav) {
            BottomNav(
                current = dest,
                onSelect = vm::selectTab,
            )
        }
    }
}

@Composable
private fun Destination(vm: AppViewModel, dest: Dest) {
    when (dest) {
        Dest.HomeTab -> HomeScreen(
            vm = vm,
            onOpenCard = { card -> openCard(vm, card) },
        )

        Dest.SearchTab -> SearchScreen(
            vm = vm,
            onOpenTrack = vm::openTrack,
            onOpenAlbum = vm::openAlbum,
            onOpenArtist = vm::openArtist,
            onOpenGenre = vm::openGenre,
        )

        is Dest.Artist -> ArtistScreen(
            vm = vm,
            artistId = dest.id,
            onBack = { vm.back() },
            onOpenTrack = vm::openTrack,
            onOpenAlbum = vm::openAlbum,
            onOpenStation = vm::openStation,
        )

        is Dest.Album -> AlbumScreen(
            vm = vm,
            albumId = dest.id,
            onBack = { vm.back() },
            onOpenTrack = vm::openTrack,
            onOpenArtist = vm::openArtist,
            onOpenAlbum = vm::openAlbum,
            onOpenStation = vm::openStation,
        )

        is Dest.Track -> TrackScreen(
            vm = vm,
            trackId = dest.id,
            onBack = { vm.back() },
            onOpenArtist = vm::openArtist,
            onOpenAlbum = vm::openAlbum,
            onOpenStation = vm::openStation,
        )

        is Dest.Genre -> GenreScreen(
            vm = vm,
            genreId = dest.id,
            onBack = { vm.back() },
            onOpenTrack = vm::openTrack,
            onOpenStation = vm::openStation,
        )

        is Dest.Station -> StationScreen(
            vm = vm,
            seed = dest.seed,
            title = dest.title,
            onBack = { vm.back() },
            onOpenTrack = vm::openTrack,
        )
    }
}

private fun openCard(vm: AppViewModel, card: CatalogCard) {
    when (card.kind) {
        "track" -> vm.openTrack(card.id, card.title)
        "album" -> vm.openAlbum(card.id, card.title)
        "artist" -> vm.openArtist(card.id, card.title)
        "genre" -> vm.openGenre(card.id, card.title)
    }
}

private fun destKey(dest: Dest): String = when (dest) {
    Dest.HomeTab -> "home"
    Dest.SearchTab -> "search"
    is Dest.Artist -> "artist:${dest.id}"
    is Dest.Album -> "album:${dest.id}"
    is Dest.Track -> "track:${dest.id}"
    is Dest.Genre -> "genre:${dest.id}"
    is Dest.Station -> "station:${dest.seed}"
}

@Composable
private fun BottomNav(current: Dest, onSelect: (Dest) -> Unit) {
    Column {
        Box(
            Modifier
                .fillMaxWidth()
                .height(1.dp)
                .background(T.line),
        )
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .height(T.NavBarDp)
                .background(T.bg),
            horizontalArrangement = Arrangement.SpaceEvenly,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            NavItem(
                label = "Home",
                icon = Icons.Filled.Home,
                selected = current == Dest.HomeTab,
                onClick = { onSelect(Dest.HomeTab) },
            )
            NavItem(
                label = "Search",
                icon = Icons.Filled.Search,
                selected = current == Dest.SearchTab,
                onClick = { onSelect(Dest.SearchTab) },
            )
        }
    }
}

@Composable
private fun NavItem(
    label: String,
    icon: ImageVector,
    selected: Boolean,
    onClick: () -> Unit,
) {
    Column(
        modifier = Modifier
            .clickable(onClick = onClick)
            .padding(horizontal = 28.dp, vertical = T.XsDp),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Icon(
            icon,
            contentDescription = label,
            tint = if (selected) T.text else T.dim,
            modifier = Modifier.size(22.dp),
        )
        Text(
            label,
            style = MaterialTheme.typography.labelSmall,
            color = if (selected) T.text else T.dim,
        )
    }
}
