package com.resona.app.ui.common

import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberUpdatedState
import androidx.compose.runtime.setValue
import com.resona.app.ui.friendlyMessage
import kotlinx.coroutines.CancellationException

sealed interface LoadState<out T> {
    data object Loading : LoadState<Nothing>
    data class Ready<T>(val value: T) : LoadState<T>
    data class Failed(val message: String) : LoadState<Nothing>
}

class Loader<T>(
    val state: LoadState<T>,
    val reload: () -> Unit,
)

/**
 * One loading pattern for every M1 screen: loading → ready/failed, with a
 * retry that restarts the effect. `key` identifies the resource (e.g. artist id).
 */
@Composable
fun <T> rememberLoader(key: Any?, load: suspend () -> T): Loader<T> {
    var attempt by remember(key) { mutableIntStateOf(0) }
    var state by remember(key) { mutableStateOf<LoadState<T>>(LoadState.Loading) }
    val currentLoad by rememberUpdatedState(load)

    LaunchedEffect(key, attempt) {
        state = LoadState.Loading
        state = try {
            LoadState.Ready(currentLoad())
        } catch (err: CancellationException) {
            throw err
        } catch (err: Exception) {
            LoadState.Failed(friendlyMessage(err))
        }
    }

    return Loader(state) { attempt += 1 }
}
