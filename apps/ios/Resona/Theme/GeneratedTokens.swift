import SwiftUI

// GENERATED from packages/design-tokens/tokens.json on 2026-11-22 — do not edit by hand.

public struct ResonaFontStyle {
    let size: CGFloat
    let sizeMax: CGFloat
    let weight: Font.Weight
    let trackingEm: CGFloat

    /// Resolved font, scaled for Dynamic Type by SwiftUI.
    public var font: Font {
        .custom("Figtree-(weightName)", size: size, relativeTo: textCategory)
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
    static let bg = Color(red: 0.071, green: 0.071, blue: 0.071)
    static let black = Color(red: 0.000, green: 0.000, blue: 0.000)
    static let card = Color(red: 0.122, green: 0.122, blue: 0.122)
    static let card2 = Color(red: 0.157, green: 0.157, blue: 0.157)
    static let chip = Color(red: 0.165, green: 0.165, blue: 0.165)
    static let line = Color(red: 0.184, green: 0.184, blue: 0.184)
    static let text = Color(red: 1.000, green: 1.000, blue: 1.000)
    static let sub = Color(red: 0.702, green: 0.702, blue: 0.702)
    static let dim = Color(red: 0.561, green: 0.561, blue: 0.561)
    static let green = Color(red: 0.118, green: 0.843, blue: 0.376)
    static let red = Color(red: 0.945, green: 0.369, blue: 0.424)
    static let mini = Color(red: 0.290, green: 0.122, blue: 0.086)
    static let blue = Color(red: 0.231, green: 0.553, blue: 1.000)

    // MARK: - Fallback art gradients (deterministic by track id hash)
    static let Warm: [Color] = [Color(red: 0.780, green: 0.455, blue: 0.247), Color(red: 0.290, green: 0.137, blue: 0.071)]
    static let Warm2: [Color] = [Color(red: 0.541, green: 0.290, blue: 0.165), Color(red: 0.165, green: 0.078, blue: 0.043)]
    static let Warm3: [Color] = [Color(red: 0.710, green: 0.416, blue: 0.235), Color(red: 0.231, green: 0.114, blue: 0.055)]
    static let Dark: [Color] = [Color(red: 0.302, green: 0.353, blue: 0.400), Color(red: 0.090, green: 0.106, blue: 0.125)]
    static let Blue: [Color] = [Color(red: 0.227, green: 0.655, blue: 1.000), Color(red: 0.075, green: 0.165, blue: 0.361)]
    static let Gold: [Color] = [Color(red: 0.961, green: 0.788, blue: 0.420), Color(red: 0.478, green: 0.294, blue: 0.071)]
    static let Green: [Color] = [Color(red: 0.184, green: 0.749, blue: 0.561), Color(red: 0.047, green: 0.302, blue: 0.227)]
    static let Teal: [Color] = [Color(red: 0.133, green: 0.757, blue: 0.812), Color(red: 0.043, green: 0.310, blue: 0.341)]
    static let Violet: [Color] = [Color(red: 0.608, green: 0.447, blue: 1.000), Color(red: 0.169, green: 0.086, blue: 0.341)]
    static let Sunset: [Color] = [Color(red: 1.000, green: 0.541, blue: 0.298), Color(red: 0.478, green: 0.122, blue: 0.239)]
    static let Grey: [Color] = [Color(red: 0.639, green: 0.663, blue: 0.714), Color(red: 0.227, green: 0.243, blue: 0.286)]
    static let Liked: [Color] = [Color(red: 0.435, green: 0.361, blue: 1.000), Color(red: 0.776, green: 0.722, blue: 1.000)]
    static let Spades: [Color] = [Color(red: 0.690, green: 0.416, blue: 0.173), Color(red: 0.227, green: 0.114, blue: 0.047), Color(red: 0.071, green: 0.071, blue: 0.071)]

    // MARK: - Typography (family: Figtree, fallback: SF Pro)
    static let Hero = ResonaFontStyle(size: 34, sizeMax: 40, weight: .black, trackingEm: -0.02)
    static let H1 = ResonaFontStyle(size: 26, sizeMax: 26, weight: .heavy, trackingEm: -0.02)
    static let H2 = ResonaFontStyle(size: 20, sizeMax: 22, weight: .bold, trackingEm: -0.01)
    static let Big = ResonaFontStyle(size: 22, sizeMax: 22, weight: .bold, trackingEm: 0)
    static let Lyric = ResonaFontStyle(size: 24, sizeMax: 24, weight: .heavy, trackingEm: -0.01)
    static let Body = ResonaFontStyle(size: 16, sizeMax: 16, weight: .medium, trackingEm: 0)
    static let Sub = ResonaFontStyle(size: 14, sizeMax: 14, weight: .regular, trackingEm: 0)
    static let Chip = ResonaFontStyle(size: 13, sizeMax: 14, weight: .semibold, trackingEm: 0)
    static let Label = ResonaFontStyle(size: 12, sizeMax: 12, weight: .regular, trackingEm: 0)
    static let Nav = ResonaFontStyle(size: 11, sizeMax: 11, weight: .semibold, trackingEm: 0)

    // MARK: - Spacing (base unit 4pt)
    static let Base: CGFloat = 4
    static let ScreenX: CGFloat = 14
    static let Xs: CGFloat = 6
    static let Sm: CGFloat = 8
    static let Md: CGFloat = 12
    static let Lg: CGFloat = 14
    static let Xl: CGFloat = 18
    static let Section: CGFloat = 24
    static let RowMin: CGFloat = 64
    static let RowCompact: CGFloat = 56
    static let SheetRow: CGFloat = 50
    static let SettingsRow: CGFloat = 48
    static let QuickTile: CGFloat = 56
    static let GenreTile: CGFloat = 78
    static let CardSize: CGFloat = 150
    static let ArtRow: CGFloat = 48
    static let NavBar: CGFloat = 64
    static let MiniPlayer: CGFloat = 56
    static let MiniFloat: CGFloat = 8

    // MARK: - Radii
    static let Art: CGFloat = 6
    static let Card: CGFloat = 10
    static let SheetTop: CGFloat = 12
    static let Pill: CGFloat = 16
    static let Cta: CGFloat = 22
    static let Field: CGFloat = 6

    // MARK: - Motion
    static let EnterMotion = MotionSpec(ms: 240, control1: CGPoint(x: 0.23, y: 1), control2: CGPoint(x: 0.32, y: 1))
    static let SheetMotion = MotionSpec(ms: 320, control1: CGPoint(x: 0.32, y: 0.72), control2: CGPoint(x: 0, y: 1))
    static let NowPlayingMotion = MotionSpec(ms: 380, control1: CGPoint(x: 0.32, y: 0.72), control2: CGPoint(x: 0, y: 1))
    static let DrawerMotion = MotionSpec(ms: 320, control1: CGPoint(x: 0.2, y: 0.8), control2: CGPoint(x: 0.2, y: 1))
}
