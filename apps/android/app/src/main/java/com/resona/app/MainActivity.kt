package com.resona.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import com.resona.app.ui.home.HomeScreen
import com.resona.app.ui.theme.ResonaTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            ResonaTheme {
                HomeScreen()
            }
        }
    }
}
