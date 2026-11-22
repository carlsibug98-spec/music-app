#!/usr/bin/env node
/**
 * Token generator — reads tokens.json, writes:
 *   1. apps/android/.../ui/theme/GeneratedTokens.kt  (Compose constants)
 *   2. apps/ios/Resona/Theme/GeneratedTokens.swift   (SwiftUI constants)
 * Run from repo root: npm run tokens
 * GENERATED FILE — do not edit by hand; edit packages/design-tokens/tokens.json.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..', '..', '..');
const tokens = JSON.parse(readFileSync(join(here, '..', 'tokens.json'), 'utf8'));
const STAMP = new Date().toISOString().slice(0, 10);

const hex6 = (hex) => {
  const h = hex.replace('#', '').slice(0, 6);
  return `0xFF${h.toUpperCase()}`;
};
const swiftHex = (hex) => {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  return `Color(red: ${r.toFixed(3)}, green: ${g.toFixed(3)}, blue: ${b.toFixed(3)})`;
};
const pascal = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const beam = (pts) => pts.join('f, ') + 'f';

/* ---------------- Kotlin ---------------- */
const ktColors = Object.entries(tokens.color)
  .map(([k, v]) => `    val ${k}: Color = Color(${hex6(v)})`).join('\n');

const ktGradients = Object.entries(tokens.gradient)
  .map(([k, v]) => `    val ${pascal(k)}: List<Color> = listOf(${v.map(hex6).map((h) => `Color(${h})`).join(', ')})`)
  .join('\n');

const ktType = Object.entries(tokens.type.styles)
  .map(([k, v]) => {
    const size = v.sizeMin === v.sizeMax ? v.sizeMin : v.sizeMin; // use min as base; both recorded in comment
    return `    val ${pascal(k)}: ResonaTextStyle = ResonaTextStyle(\n        size = ${v.sizeMin}.sp,\n        sizeMax = ${v.sizeMax}.sp,\n        weight = FontWeight(${v.weight}),\n        trackingEm = ${v.trackingEm}f,\n    )`;
  }).join('\n\n');

const ktSpace = Object.entries(tokens.space)
  .map(([k, v]) => `    val ${pascal(k)}Dp: Dp = ${v}.dp`).join('\n');

const ktRadius = Object.entries(tokens.radius)
  .map(([k, v]) => `    val ${pascal(k)}: Dp = ${v}.dp`).join('\n');

const curve = (c) => `CubicBezier(${beam(c)})`;
const ktMotion = Object.entries(tokens.motion)
  .filter(([, v]) => typeof v === 'object')
  .map(([k, v]) => `    val ${pascal(k)}: MotionSpec = MotionSpec(\n        ms = ${v.ms},\n        curve = ${v.curve ? curve(v.curve) : 'CubicBezier(0f, 0f, 1f, 1f)'},\n    )`)
  .join('\n\n');

const kotlin = `package com.resona.app.ui.theme

// GENERATED from packages/design-tokens/tokens.json on ${STAMP} — do not edit by hand.
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

    // ---- Color (${tokens.version}) ----
${ktColors}

    // ---- Fallback art gradients (deterministic by track id hash) ----
${ktGradients}

    // ---- Typography (family: ${tokens.type.family}, fallback: ${tokens.type.fallback.android}) ----
${ktType}

    // ---- Spacing (base unit ${tokens.space.base}px) ----
${ktSpace}

    // ---- Radii ----
${ktRadius}

    // ---- Motion ----
${ktMotion}
}
`;

/* ---------------- Swift ---------------- */
const swiftColors = Object.entries(tokens.color)
  .map(([k, v]) => `    static let ${k} = ${swiftHex(v)}`).join('\n');

const swiftGradients = Object.entries(tokens.gradient)
  .map(([k, v]) => `    static let ${pascal(k)}: [Color] = [${v.map(swiftHex).join(', ')}]`).join('\n');

const swiftType = Object.entries(tokens.type.styles)
  .map(([k, v]) => {
    const namedWeight = { 400: 'regular', 500: 'medium', 600: 'semibold', 700: 'bold', 800: 'heavy', 900: 'black' }[v.weight] || 'regular';
    return `    static let ${pascal(k)} = ResonaFontStyle(size: ${v.sizeMin}, sizeMax: ${v.sizeMax}, weight: .${namedWeight}, trackingEm: ${v.trackingEm})`;
  }).join('\n');

const swiftSpace = Object.entries(tokens.space)
  .map(([k, v]) => `    static let ${pascal(k)}: CGFloat = ${v}`).join('\n');

const swiftRadius = Object.entries(tokens.radius)
  .map(([k, v]) => `    static let ${pascal(k)}: CGFloat = ${v}`).join('\n');

const swiftMotion = Object.entries(tokens.motion)
  .filter(([, v]) => typeof v === 'object' && v.curve)
  .map(([k, v]) => {
    const [x1, y1, x2, y2] = v.curve;
    return `    static let ${pascal(k)} = MotionSpec(ms: ${v.ms}, control1: CGPoint(x: ${x1}, y: ${y1}), control2: CGPoint(x: ${x2}, y: ${y2}))`;
  }).join('\n');

const swift = `import SwiftUI

// GENERATED from packages/design-tokens/tokens.json on ${STAMP} — do not edit by hand.

public struct ResonaFontStyle {
    let size: CGFloat
    let sizeMax: CGFloat
    let weight: Font.Weight
    let trackingEm: CGFloat

    /// Resolved font, scaled for Dynamic Type by SwiftUI.
    public var font: Font {
        .custom("Figtree-\(weightName)", size: size, relativeTo: textCategory)
    }

    private var weightName: String {
        switch weight {
        case .black: return "Black"
        case .heavy: return "ExtraBold"
        case .bold: return "Bold"
        case .semibold: return "SemiBold"
        case .medium: return "Medium"
        default: return "Regular"
        }
    }

    private var weightFileFallback: String {
        weightName
    }

    private var textCategory: Font.TextStyle {
        size >= 34 ? .largeTitle : size >= 22 ? .title2 : size >= 16 ? .body : .caption
    }
}

public struct MotionSpec {
    let ms: TimeInterval
    let control1: CGPoint
    let control2: CGPoint

    public var animation: Animation {
        .timingCurve(Double(control1.x), Double(control1.y), Double(control2.x), Double(control2.y), duration: ms / 1000)
    }
}

public enum ResonaTokens {

    // MARK: - Color
${swiftColors}

    // MARK: - Fallback art gradients (deterministic by track id hash)
${swiftGradients}

    // MARK: - Typography (family: ${tokens.type.family}, fallback: ${tokens.type.fallback.ios})
${swiftType}

    // MARK: - Spacing (base unit ${tokens.space.base}pt)
${swiftSpace}

    // MARK: - Radii
${swiftRadius}

    // MARK: - Motion
${swiftMotion}
}
`;

const ktPath = join(root, 'apps', 'android', 'app', 'src', 'main', 'java', 'com', 'resona', 'app', 'ui', 'theme', 'GeneratedTokens.kt');
const swiftPath = join(root, 'apps', 'ios', 'Resona', 'Theme', 'GeneratedTokens.swift');
mkdirSync(dirname(ktPath), { recursive: true });
mkdirSync(dirname(swiftPath), { recursive: true });
writeFileSync(ktPath, kotlin);
writeFileSync(swiftPath, swift);
console.log(`✓ GeneratedTokens.kt  -> ${ktPath.replace(root + '/', '')}`);
console.log(`✓ GeneratedTokens.swift -> ${swiftPath.replace(root + '/', '')}`);
