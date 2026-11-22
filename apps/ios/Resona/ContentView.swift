import SwiftUI

/**
 * M0 Home skeleton — layout contract from the mockup (doc 03):
 * greeting/title, 2-col quick grid, section header, track rows.
 * Content is static; /v1/home feeds it in M1+.
 */
struct ContentView: View {

    private struct QuickItem: Identifiable {
        let title: String
        let colors: [Color]
        var id: String { title }
    }

    private struct Track: Identifiable {
        let title: String
        let artist: String
        let colors: [Color]
        var id: String { title }
    }

    private let quickItems: [QuickItem] = [
        .init(title: "Liked songs", colors: ResonaTokens.Liked),
        .init(title: "Bakunawa Radio", colors: ResonaTokens.Teal),
        .init(title: "Chill mix", colors: ResonaTokens.Blue),
        .init(title: "Diwata Drive", colors: ResonaTokens.Violet),
    ]

    private let tracks: [Track] = [
        .init(title: "Panata", artist: "Bakunawa", colors: ResonaTokens.Warm),
        .init(title: "Susundan", artist: "Diwata Drive", colors: ResonaTokens.Blue),
        .init(title: "Gabing Nasa Bukid", artist: "Neon Kapre", colors: ResonaTokens.Green),
    ]

    private var columns: [GridItem] {
        [GridItem(.flexible(), spacing: ResonaTokens.Sm),
         GridItem(.flexible(), spacing: ResonaTokens.Sm)]
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: ResonaTokens.Sm) {
                Text("Home")
                    .font(ResonaTokens.H1.font)
                    .foregroundStyle(ResonaTokens.text)

                LazyVGrid(columns: columns, spacing: ResonaTokens.Sm) {
                    ForEach(quickItems) { item in
                        QuickCard(title: item.title, colors: item.colors)
                    }
                }

                Text("Made for you")
                    .font(ResonaTokens.H2.font)
                    .foregroundStyle(ResonaTokens.text)
                    .padding(.top, ResonaTokens.Lg)

                VStack(spacing: 0) {
                    ForEach(tracks) { track in
                        TrackRowView(track: track)
                    }
                }
            }
            .padding(.horizontal, ResonaTokens.ScreenX)
            .padding(.vertical, ResonaTokens.Section)
        }
        .background(ResonaTokens.bg)
        .preferredColorScheme(.dark)
    }
}

private struct QuickCard: View {
    let title: String
    let colors: [Color]

    var body: some View {
        ZStack(alignment: .leading) {
            RoundedRectangle(cornerRadius: ResonaTokens.Art, style: .continuous)
                .fill(
                    LinearGradient(
                        colors: colors,
                        startPoint: .top,
                        endPoint: .bottom
                    )
                )
            Text(title)
                .font(ResonaTokens.Chip.font)
                .foregroundStyle(ResonaTokens.text)
                .lineLimit(2)
                .padding(.horizontal, ResonaTokens.Md)
        }
        .frame(height: ResonaTokens.QuickTile)
    }
}

private struct TrackRowView: View {
    let track: ContentView.Track

    var body: some View {
        HStack(spacing: ResonaTokens.Md) {
            RoundedRectangle(cornerRadius: ResonaTokens.Art, style: .continuous)
                .fill(
                    LinearGradient(
                        colors: track.colors,
                        startPoint: .top,
                        endPoint: .bottom
                    )
                )
                .frame(width: ResonaTokens.ArtRow, height: ResonaTokens.ArtRow)

            VStack(alignment: .leading, spacing: 2) {
                Text(track.title)
                    .font(ResonaTokens.Body.font)
                    .foregroundStyle(ResonaTokens.text)
                    .lineLimit(1)
                Text(track.artist)
                    .font(ResonaTokens.Sub.font)
                    .foregroundStyle(ResonaTokens.sub)
                    .lineLimit(1)
            }
            Spacer(minLength: 0)
        }
        .frame(minHeight: ResonaTokens.RowMin)
    }
}

#Preview("Home") {
    ContentView()
}
