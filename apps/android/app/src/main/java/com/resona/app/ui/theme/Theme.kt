package com.resona.app.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Typography
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.unit.em

/**
 * Midnight Leaf theme (docs/03-DESIGN-SYSTEM.md).
 * Colors/spacing/type come from GeneratedTokens.kt (generated from
 * packages/design-tokens/tokens.json — edit there, run `npm run tokens`).
 *
 * Figtree TTFs are not bundled yet (M1); system sans stands in with the
 * same weights so the layout contract holds.
 */

private val ResonaDarkScheme = darkColorScheme(
    primary = GeneratedTokens.green,
    onPrimary = GeneratedTokens.black,
    background = GeneratedTokens.bg,
    onBackground = GeneratedTokens.text,
    surface = GeneratedTokens.card,
    onSurface = GeneratedTokens.text,
    surfaceVariant = GeneratedTokens.card2,
    onSurfaceVariant = GeneratedTokens.sub,
    error = GeneratedTokens.red,
    onError = GeneratedTokens.text,
    outline = GeneratedTokens.line,
)

private fun tok(t: ResonaTextStyle) = TextStyle(
    fontSize = t.size,
    fontWeight = t.weight,
    letterSpacing = t.trackingEm.em,
    fontFamily = FontFamily.SansSerif,
)

val AppTypography = Typography(
    displayLarge = tok(GeneratedTokens.Hero),
    headlineLarge = tok(GeneratedTokens.H1),
    headlineMedium = tok(GeneratedTokens.H2),
    headlineSmall = tok(GeneratedTokens.Big),
    titleLarge = tok(GeneratedTokens.Big),
    titleMedium = tok(GeneratedTokens.Body),
    bodyLarge = tok(GeneratedTokens.Body),
    bodyMedium = tok(GeneratedTokens.Sub),
    labelLarge = tok(GeneratedTokens.Chip),
    labelSmall = tok(GeneratedTokens.Label),
)

@Composable
fun ResonaTheme(content: @Composable () -> Unit) {
    // Dark-first by design (doc 03 §1); no light scheme in v1.
    MaterialTheme(
        colorScheme = ResonaDarkScheme,
        typography = AppTypography,
        content = content,
    )
}
