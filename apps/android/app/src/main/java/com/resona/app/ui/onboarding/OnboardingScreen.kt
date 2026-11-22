package com.resona.app.ui.onboarding

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.resona.app.BuildConfig
import com.resona.app.ui.SessionState
import com.resona.app.ui.theme.GeneratedTokens as T

/**
 * Screen 1 (PRD): name-only onboarding. No email, password, or phone; the
 * device registers silently and the key is stored locally.
 */
@Composable
fun OnboardingScreen(
    session: SessionState,
    error: String?,
    onRegister: (String) -> Unit,
    onDismissError: () -> Unit,
) {
    val registering = session is SessionState.Registering
    var name by remember { mutableStateOf("") }
    val canSubmit = name.trim().isNotEmpty() && !registering

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(
                Brush.verticalGradient(
                    listOf(T.bg, T.bg, T.mini.copy(alpha = 0.55f)),
                ),
            )
            .padding(horizontal = T.SectionDp, vertical = T.SectionDp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,
    ) {
        Box(
            modifier = Modifier
                .size(72.dp)
                .clip(CircleShape)
                .background(T.green),
            contentAlignment = Alignment.Center,
        ) {
            Text(
                "♪",
                style = MaterialTheme.typography.displayLarge,
                color = T.black,
            )
        }

        Spacer(Modifier.height(T.LgDp))
        Text(
            "Tugtugin",
            style = MaterialTheme.typography.displayLarge,
            color = T.text,
        )
        Text(
            "Music, made for the Philippines.",
            style = MaterialTheme.typography.bodyLarge,
            color = T.sub,
            textAlign = TextAlign.Center,
        )

        Spacer(Modifier.height(T.SectionDp))

        Column(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(T.Card))
                .background(T.card)
                .padding(T.XlDp),
        ) {
            Text(
                "What should we call you?",
                style = MaterialTheme.typography.headlineMedium,
                color = T.text,
            )
            Spacer(Modifier.height(T.XsDp))
            Text(
                "Just a name. No account, no password.",
                style = MaterialTheme.typography.bodyMedium,
                color = T.sub,
            )
            Spacer(Modifier.height(T.LgDp))

            OutlinedTextField(
                value = name,
                onValueChange = {
                    if (it.length <= 32) {
                        name = it
                        if (error != null) onDismissError()
                    }
                },
                enabled = !registering,
                singleLine = true,
                modifier = Modifier.fillMaxWidth(),
                placeholder = { Text("Your name", color = T.dim) },
                supportingText = {
                    Text(
                        "${name.length}/32",
                        color = T.dim,
                        style = MaterialTheme.typography.labelSmall,
                    )
                },
                keyboardOptions = KeyboardOptions(imeAction = ImeAction.Done),
                keyboardActions = KeyboardActions(
                    onDone = { if (canSubmit) onRegister(name) },
                ),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = T.green,
                    unfocusedBorderColor = T.line,
                    focusedTextColor = T.text,
                    unfocusedTextColor = T.text,
                    cursorColor = T.green,
                ),
            )

            if (error != null) {
                Spacer(Modifier.height(T.SmDp))
                Text(
                    error,
                    style = MaterialTheme.typography.bodyMedium,
                    color = T.red,
                )
            }

            Spacer(Modifier.height(T.LgDp))
            Button(
                onClick = { onRegister(name) },
                enabled = canSubmit,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(48.dp),
                shape = RoundedCornerShape(T.Cta),
                colors = ButtonDefaults.buttonColors(
                    containerColor = T.green,
                    contentColor = T.black,
                    disabledContainerColor = T.chip,
                    disabledContentColor = T.dim,
                ),
            ) {
                if (registering) {
                    CircularProgressIndicator(
                        color = T.black,
                        strokeWidth = 2.dp,
                        modifier = Modifier.size(20.dp),
                    )
                } else {
                    Text("Start listening", style = MaterialTheme.typography.labelLarge)
                }
            }
        }

        Spacer(Modifier.height(T.SectionDp))
        Text(
            "OPM-first · Free · No login",
            style = MaterialTheme.typography.labelSmall,
            color = T.dim,
        )
        if (BuildConfig.DEBUG) {
            Spacer(Modifier.height(T.XsDp))
            Text(
                BuildConfig.API_BASE_URL,
                style = MaterialTheme.typography.labelSmall,
                color = T.dim.copy(alpha = 0.7f),
            )
        }
    }
}
