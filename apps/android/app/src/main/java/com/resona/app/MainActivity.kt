package com.resona.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.runtime.CompositionLocalProvider
import androidx.lifecycle.viewmodel.compose.viewModel
import com.resona.app.ui.AppRoot
import com.resona.app.ui.AppViewModel
import com.resona.app.ui.common.LocalMediaUrl
import com.resona.app.ui.theme.ResonaTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            ResonaTheme {
                val vm: AppViewModel = viewModel()
                CompositionLocalProvider(LocalMediaUrl provides vm::mediaUrl) {
                    AppRoot(vm)
                }
            }
        }
    }
}
