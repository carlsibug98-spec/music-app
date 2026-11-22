package com.resona.app.ui.theme

// GENERATED from packages/design-tokens/tokens.json on 2026-11-22 — do not edit by hand.
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.animation.core.CubicBezier

data class ResonaTextStyle(
    val size: androidx.compose.ui.unit.TextUnit,
    val sizeMax: androidx.compose.ui.unit.TextUnit,
    val weight: FontWeight,
    val trackingEm: Float,
)

data class MotionSpec(
    val ms: Int,
    val curve: CubicBezier,
)

object GeneratedTokens {

    // ---- Color (1.0.0) ----
    val bg: Color = Color(0xFF121212)
    val black: Color = Color(0xFF000000)
    val card: Color = Color(0xFF1F1F1F)
    val card2: Color = Color(0xFF282828)
    val chip: Color = Color(0xFF2A2A2A)
    val line: Color = Color(0xFF2F2F2F)
    val text: Color = Color(0xFFFFFFFF)
    val sub: Color = Color(0xFFB3B3B3)
    val dim: Color = Color(0xFF8F8F8F)
    val green: Color = Color(0xFF1ED760)
    val red: Color = Color(0xFFF15E6C)
    val mini: Color = Color(0xFF4A1F16)
    val blue: Color = Color(0xFF3B8DFF)

    // ---- Fallback art gradients (deterministic by track id hash) ----
    val Warm: List<Color> = listOf(Color(0xFFC7743F), Color(0xFF4A2312))
    val Warm2: List<Color> = listOf(Color(0xFF8A4A2A), Color(0xFF2A140B))
    val Warm3: List<Color> = listOf(Color(0xFFB56A3C), Color(0xFF3B1D0E))
    val Dark: List<Color> = listOf(Color(0xFF4D5A66), Color(0xFF171B20))
    val Blue: List<Color> = listOf(Color(0xFF3AA7FF), Color(0xFF132A5C))
    val Gold: List<Color> = listOf(Color(0xFFF5C96B), Color(0xFF7A4B12))
    val Green: List<Color> = listOf(Color(0xFF2FBF8F), Color(0xFF0C4D3A))
    val Teal: List<Color> = listOf(Color(0xFF22C1CF), Color(0xFF0B4F57))
    val Violet: List<Color> = listOf(Color(0xFF9B72FF), Color(0xFF2B1657))
    val Sunset: List<Color> = listOf(Color(0xFFFF8A4C), Color(0xFF7A1F3D))
    val Grey: List<Color> = listOf(Color(0xFFA3A9B6), Color(0xFF3A3E49))
    val Liked: List<Color> = listOf(Color(0xFF6F5CFF), Color(0xFFC6B8FF))
    val Spades: List<Color> = listOf(Color(0xFFB06A2C), Color(0xFF3A1D0C), Color(0xFF121212))

    // ---- Typography (family: Figtree, fallback: Roboto) ----
    val Hero: ResonaTextStyle = ResonaTextStyle(
        size = 34.sp,
        sizeMax = 40.sp,
        weight = FontWeight(900),
        trackingEm = -0.02f,
    )

    val H1: ResonaTextStyle = ResonaTextStyle(
        size = 26.sp,
        sizeMax = 26.sp,
        weight = FontWeight(800),
        trackingEm = -0.02f,
    )

    val H2: ResonaTextStyle = ResonaTextStyle(
        size = 20.sp,
        sizeMax = 22.sp,
        weight = FontWeight(700),
        trackingEm = -0.01f,
    )

    val Big: ResonaTextStyle = ResonaTextStyle(
        size = 22.sp,
        sizeMax = 22.sp,
        weight = FontWeight(700),
        trackingEm = 0f,
    )

    val Lyric: ResonaTextStyle = ResonaTextStyle(
        size = 24.sp,
        sizeMax = 24.sp,
        weight = FontWeight(800),
        trackingEm = -0.01f,
    )

    val Body: ResonaTextStyle = ResonaTextStyle(
        size = 16.sp,
        sizeMax = 16.sp,
        weight = FontWeight(500),
        trackingEm = 0f,
    )

    val Sub: ResonaTextStyle = ResonaTextStyle(
        size = 14.sp,
        sizeMax = 14.sp,
        weight = FontWeight(400),
        trackingEm = 0f,
    )

    val Chip: ResonaTextStyle = ResonaTextStyle(
        size = 13.sp,
        sizeMax = 14.sp,
        weight = FontWeight(600),
        trackingEm = 0f,
    )

    val Label: ResonaTextStyle = ResonaTextStyle(
        size = 12.sp,
        sizeMax = 12.sp,
        weight = FontWeight(400),
        trackingEm = 0f,
    )

    val Nav: ResonaTextStyle = ResonaTextStyle(
        size = 11.sp,
        sizeMax = 11.sp,
        weight = FontWeight(600),
        trackingEm = 0f,
    )

    // ---- Spacing (base unit 4px) ----
    val BaseDp: Dp = 4.dp
    val ScreenXDp: Dp = 14.dp
    val XsDp: Dp = 6.dp
    val SmDp: Dp = 8.dp
    val MdDp: Dp = 12.dp
    val LgDp: Dp = 14.dp
    val XlDp: Dp = 18.dp
    val SectionDp: Dp = 24.dp
    val RowMinDp: Dp = 64.dp
    val RowCompactDp: Dp = 56.dp
    val SheetRowDp: Dp = 50.dp
    val SettingsRowDp: Dp = 48.dp
    val QuickTileDp: Dp = 56.dp
    val GenreTileDp: Dp = 78.dp
    val CardSizeDp: Dp = 150.dp
    val ArtRowDp: Dp = 48.dp
    val NavBarDp: Dp = 64.dp
    val MiniPlayerDp: Dp = 56.dp
    val MiniFloatDp: Dp = 8.dp

    // ---- Radii ----
    val Art: Dp = 6.dp
    val Card: Dp = 10.dp
    val SheetTop: Dp = 12.dp
    val Pill: Dp = 16.dp
    val Cta: Dp = 22.dp
    val Field: Dp = 6.dp

    // ---- Motion ----
    val Enter: MotionSpec = MotionSpec(
        ms = 240,
        curve = CubicBezier(0.23f, 1f, 0.32f, 1f),
    )

    val Press: MotionSpec = MotionSpec(
        ms = 160,
        curve = CubicBezier(0f, 0f, 1f, 1f),
    )

    val Sheet: MotionSpec = MotionSpec(
        ms = 320,
        curve = CubicBezier(0.32f, 0.72f, 0f, 1f),
    )

    val NowPlaying: MotionSpec = MotionSpec(
        ms = 380,
        curve = CubicBezier(0.32f, 0.72f, 0f, 1f),
    )

    val Drawer: MotionSpec = MotionSpec(
        ms = 320,
        curve = CubicBezier(0.2f, 0.8f, 0.2f, 1f),
    )

    val Dialog: MotionSpec = MotionSpec(
        ms = 250,
        curve = CubicBezier(0f, 0f, 1f, 1f),
    )

    val Toast: MotionSpec = MotionSpec(
        ms = 300,
        curve = CubicBezier(0f, 0f, 1f, 1f),
    )

    val Toggle: MotionSpec = MotionSpec(
        ms = 200,
        curve = CubicBezier(0f, 0f, 1f, 1f),
    )

    val Lyric: MotionSpec = MotionSpec(
        ms = 200,
        curve = CubicBezier(0f, 0f, 1f, 1f),
    )
}
