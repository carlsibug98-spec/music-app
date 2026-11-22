#!/usr/bin/env python3
"""Music App Creation Blueprint - body PDF via ReportLab (Report brief, Template 07 body palette)."""
import os
import sys
import hashlib

sys.path.insert(0, "/home/z/my-project/skills/pdf/scripts")

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase.pdfmetrics import registerFontFamily
from reportlab.platypus import (
    Paragraph, Spacer, PageBreak, Table, TableStyle, Image, KeepTogether,
    CondPageBreak, HRFlowable, Frame, PageTemplate, SimpleDocTemplate)
from reportlab.platypus.tableofcontents import TableOfContents
from PIL import Image as PILImage

# ------------------------------------------------------------------ fonts
FONT_DIR = "/usr/share/fonts"
pdfmetrics.registerFont(TTFont("NotoSerifSC", f"{FONT_DIR}/truetype/noto-serif-sc/NotoSerifSC-Regular.ttf"))
pdfmetrics.registerFont(TTFont("NotoSerifSC-Bold", f"{FONT_DIR}/truetype/noto-serif-sc/NotoSerifSC-Bold.ttf"))
pdfmetrics.registerFont(TTFont("Noto Sans SC", f"{FONT_DIR}/truetype/chinese/NotoSansSC-Regular.ttf"))
pdfmetrics.registerFont(TTFont("Noto Sans SC Bold", f"{FONT_DIR}/truetype/chinese/NotoSansSC-Bold.ttf"))
pdfmetrics.registerFont(TTFont("FreeSerif", f"{FONT_DIR}/truetype/freefont/FreeSerif.ttf"))
pdfmetrics.registerFont(TTFont("FreeSerif-Bold", f"{FONT_DIR}/truetype/freefont/FreeSerifBold.ttf"))
pdfmetrics.registerFont(TTFont("FreeSerif-Italic", f"{FONT_DIR}/truetype/freefont/FreeSerifItalic.ttf"))
pdfmetrics.registerFont(TTFont("FreeSerif-BoldItalic", f"{FONT_DIR}/truetype/freefont/FreeSerifBoldItalic.ttf"))
pdfmetrics.registerFont(TTFont("DejaVuSans", f"{FONT_DIR}/truetype/dejavu/DejaVuSansMono.ttf"))
registerFontFamily("NotoSerifSC", normal="NotoSerifSC", bold="NotoSerifSC-Bold")
registerFontFamily("Noto Sans SC", normal="Noto Sans SC", bold="Noto Sans SC Bold")
registerFontFamily("FreeSerif", normal="FreeSerif", bold="FreeSerif-Bold",
                   italic="FreeSerif-Italic", boldItalic="FreeSerif-BoldItalic")
registerFontFamily("DejaVuSans", normal="DejaVuSans", bold="DejaVuSans")

from pdf import install_font_fallback  # noqa: E402
install_font_fallback()

# ---------------------------------------------------- Template 07 body palette
PAGE_BG = colors.HexColor("#f5f8fc")      # XL
SECTION_BG = colors.HexColor("#edf2f9")   # XL
CARD_BG = colors.HexColor("#e4ecf5")      # L
TABLE_STRIPE = colors.HexColor("#eef3fa") # L
HEADER_FILL = colors.HexColor("#1a4a7a")  # M
BORDER = colors.HexColor("#c0d0e2")       # S
ACCENT = colors.HexColor("#2d7ab3")       # XS
TEXT_PRIMARY = colors.HexColor("#142840")
TEXT_MUTED = colors.HexColor("#5a7a96")

# ------------------------------------------------------------------ geometry
PAGE_W, PAGE_H = A4
MARGIN = 1.0 * inch
AVAIL = PAGE_W - 2 * MARGIN
TOP_MARGIN = 1.08 * inch
BOTTOM_MARGIN = 0.95 * inch
AVAIL_H = PAGE_H - TOP_MARGIN - BOTTOM_MARGIN
H1_COND = AVAIL_H * 0.25

DOC_TITLE = "Music App Creation Blueprint"
DOC_FOOTER_LEFT = "carlsibug98-spec  ·  Tugtugin (working title)"

# ------------------------------------------------------------------ styles
S = {}
S["h1"] = ParagraphStyle("H1", fontName="FreeSerif-Bold", fontSize=22, leading=27,
                         textColor=TEXT_PRIMARY, spaceBefore=6, spaceAfter=4)
S["h2"] = ParagraphStyle("H2", fontName="FreeSerif-Bold", fontSize=15, leading=19,
                         textColor=HEADER_FILL, spaceBefore=14, spaceAfter=6)
S["h3"] = ParagraphStyle("H3", fontName="FreeSerif-Bold", fontSize=11.5, leading=15,
                         textColor=TEXT_PRIMARY, spaceBefore=10, spaceAfter=4)
S["body"] = ParagraphStyle("Body", fontName="FreeSerif", fontSize=10.5, leading=17,
                           textColor=TEXT_PRIMARY, alignment=TA_JUSTIFY, spaceAfter=8)
S["bullet"] = ParagraphStyle("Bullet", parent=S["body"], alignment=TA_LEFT,
                             leftIndent=14, bulletIndent=2, spaceAfter=4)
S["caption"] = ParagraphStyle("Caption", fontName="FreeSerif-Italic", fontSize=8.5, leading=11,
                              textColor=TEXT_MUTED, alignment=TA_CENTER, spaceBefore=0, spaceAfter=0)
S["code"] = ParagraphStyle("Code", fontName="DejaVuSans", fontSize=8, leading=11.5,
                           textColor=TEXT_PRIMARY, alignment=TA_LEFT)
S["th"] = ParagraphStyle("TH", fontName="FreeSerif-Bold", fontSize=9, leading=12,
                         textColor=colors.white, alignment=TA_LEFT)
S["td"] = ParagraphStyle("TD", fontName="FreeSerif", fontSize=9, leading=12,
                         textColor=TEXT_PRIMARY, alignment=TA_LEFT)
S["td_c"] = ParagraphStyle("TDC", parent=S["td"], alignment=TA_CENTER)
S["stat_num"] = ParagraphStyle("StatNum", fontName="FreeSerif-Bold", fontSize=17, leading=20,
                               textColor=ACCENT, alignment=TA_CENTER)
S["stat_lbl"] = ParagraphStyle("StatLbl", fontName="FreeSerif", fontSize=8, leading=10.5,
                               textColor=TEXT_MUTED, alignment=TA_CENTER)
S["toc0"] = ParagraphStyle("TOC0", fontName="FreeSerif", fontSize=11.5, leading=21,
                           textColor=TEXT_PRIMARY, leftIndent=2)
S["toc_title"] = ParagraphStyle("TOCTitle", fontName="FreeSerif-Bold", fontSize=22, leading=27,
                                textColor=TEXT_PRIMARY, spaceAfter=14)

# ------------------------------------------------------------------ doc template
class TocDocTemplate(SimpleDocTemplate):
    def handle_pageBegin(self):
        # keep the custom 'All' template on every page
        # (SimpleDocTemplate would otherwise switch to its auto 'Later' template)
        self._handle_pageBegin()

    def afterFlowable(self, flowable):
        if hasattr(flowable, "bookmark_name"):
            level = getattr(flowable, "bookmark_level", 0)
            text = getattr(flowable, "bookmark_text", "")
            key = getattr(flowable, "bookmark_key", "")
            # body-visible page number (TOC occupies exactly 1 page; verified post-build)
            self.notify("TOCEntry", (level, text, self.page - 1, key))
            try:
                self.canv.addOutlineEntry(text, key, level, 0)
            except Exception:
                pass


def paint_page(canvas, doc):
    canvas.saveState()
    # Layer 0: light-blue page background (Template 07 body)
    canvas.setFillColor(PAGE_BG)
    canvas.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    # Header: title left + accent rule
    canvas.setFont("FreeSerif", 7.5)
    canvas.setFillColor(TEXT_MUTED)
    canvas.drawString(MARGIN, PAGE_H - 0.58 * inch, DOC_TITLE.upper())
    canvas.setStrokeColor(ACCENT)
    canvas.setLineWidth(1.5)
    canvas.line(MARGIN, PAGE_H - 0.66 * inch, PAGE_W - MARGIN, PAGE_H - 0.66 * inch)
    # Footer: light rule + author left + page number right
    canvas.setStrokeColor(BORDER)
    canvas.setLineWidth(0.5)
    canvas.line(MARGIN, 0.62 * inch, PAGE_W - MARGIN, 0.62 * inch)
    canvas.setFont("FreeSerif", 7.5)
    canvas.setFillColor(TEXT_MUTED)
    canvas.drawString(MARGIN, 0.46 * inch, DOC_FOOTER_LEFT)
    page_label = "i" if doc.page == 1 else str(doc.page - 1)
    canvas.drawRightString(PAGE_W - MARGIN, 0.46 * inch, page_label)
    canvas.restoreState()


# ------------------------------------------------------------------ helpers
def heading(text, style_key, level=None):
    p = Paragraph(f"<b>{text}</b>", S[style_key])
    if level is not None:
        key = "h_" + hashlib.md5(text.encode()).hexdigest()[:8]
        p = Paragraph(f'<a name="{key}"/><b>{text}</b>', S[style_key])
        p.bookmark_name = key
        p.bookmark_level = level
        p.bookmark_text = text
        p.bookmark_key = key
    return p


def h1_block(text, first_flowables):
    """H1 with accent underline, orphan-protected, kept with first content."""
    rule = HRFlowable(width="100%", thickness=1.2, color=ACCENT,
                      spaceBefore=0, spaceAfter=10)
    group = [heading(text, "h1", level=0), rule] + first_flowables
    return [CondPageBreak(H1_COND), KeepTogether(group)]


def body(text):
    return [Paragraph(text, S["body"])]


def bullets(items):
    return [Paragraph(t, S["bullet"], bulletText="\u2022") for t in items]


def make_table(header, rows, ratios, caption=None, font=9, align_center_cols=(),
               repeat=True):
    th = ParagraphStyle("th_x", parent=S["th"], fontSize=font)
    td = ParagraphStyle("td_x", parent=S["td"], fontSize=font, leading=font + 3)
    td_c = ParagraphStyle("tdc_x", parent=td, alignment=TA_CENTER)
    data = [[Paragraph(f"<b>{c}</b>", th) for c in header]]
    for r in rows:
        row = []
        for i, c in enumerate(r):
            row.append(Paragraph(str(c), td_c if i in align_center_cols else td))
        data.append(row)
    widths = [ratio * AVAIL * 0.995 for ratio in ratios]
    assert sum(widths) <= AVAIL + 0.5, "table exceeds available width"
    t = Table(data, colWidths=widths, hAlign="CENTER",
              repeatRows=1 if repeat else 0)
    style = [
        ("BACKGROUND", (0, 0), (-1, 0), HEADER_FILL),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, TABLE_STRIPE]),
        ("GRID", (0, 0), (-1, -1), 0.5, BORDER),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]
    t.setStyle(TableStyle(style))
    out = [Spacer(1, 14), t]
    if caption:
        out += [Spacer(1, 6), Paragraph(caption, S["caption"])]
    out.append(Spacer(1, 14))
    return out


def code_block(text, caption=None):
    p = Paragraph(text.replace("\n", "<br/>").replace(" ", " "), S["code"])
    t = Table([[p]], colWidths=[AVAIL * 0.96])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), CARD_BG),
        ("LINEBEFORE", (0, 0), (0, -1), 2.2, ACCENT),
        ("LEFTPADDING", (0, 0), (-1, -1), 12),
        ("RIGHTPADDING", (0, 0), (-1, -1), 14),
        ("TOPPADDING", (0, 0), (-1, -1), 9),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 9),
    ]))
    t.hAlign = 'CENTER'
    out = [Spacer(1, 10), t]
    if caption:
        out += [Spacer(1, 6), Paragraph(caption, S["caption"])]
    out.append(Spacer(1, 12))
    return out


def figure(path, caption, max_h=330):
    pil = PILImage.open(path)
    ow, oh = pil.size
    ratio = min(AVAIL / ow, max_h / oh, 1.0)
    img = Image(path, width=ow * ratio, height=oh * ratio)
    img.hAlign = 'CENTER'
    cap = Paragraph(caption, S["caption"])
    return [Spacer(1, 16), KeepTogether([img, Spacer(1, 8), cap]), Spacer(1, 16)]


def stat_row(stats):
    row = []
    for num, lbl in stats:
        row.append([Paragraph(f"<b>{num}</b>", S["stat_num"]),
                    Spacer(1, 3),
                    Paragraph(lbl, S["stat_lbl"])])
    outer = Table([row], colWidths=[AVAIL / len(stats)] * len(stats),
                  hAlign="CENTER")
    outer.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), CARD_BG),
        ("BOX", (0, 0), (-1, -1), 0.8, ACCENT),
        ("LINEBEFORE", (1, 0), (-1, -1), 0.8, ACCENT),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 0), (-1, -1), 10),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
        ("LEFTPADDING", (0, 0), (-1, -1), 4),
        ("RIGHTPADDING", (0, 0), (-1, -1), 4),
    ]))
    return [Spacer(1, 12), outer, Spacer(1, 14)]


# ================================================================== story
story = []

# ---- TOC page (front matter, roman i) ----
story.append(Paragraph("<b>Table of Contents</b>", S["toc_title"]))
toc = TableOfContents()
toc.levelStyles = [S["toc0"]]
toc.dotsMinLevel = 0
story.append(toc)
story.append(PageBreak())

# =============================================================== Chapter 1
story += h1_block("1. Executive Summary", body(
    "This blueprint is the complete, build-ready plan for <b>Tugtugin</b> (working title), a free music "
    "app for iOS and Android. It converts an existing 25-screen interactive mockup - a Spotify-style "
    "layout covering Home, Search, Now Playing, synced lyrics, playlists, artist and album pages, "
    "Library, profile and settings - into a concrete engineering program: one solo builder, working "
    "evenings and weekends, shipping a working MVP in 28 weeks."))
story += body(
    "The product is defined by five non-negotiable principles, fixed before any code is written. "
    "First, <b>no login</b>: the app asks for a display name once and registers a device silently; "
    "there is no email, password, or account anywhere in the system. Second, <b>free downloads</b>: "
    "any track or playlist can be saved for offline playback at no cost. Third, <b>no ads</b>: zero "
    "ad SDKs, zero third-party trackers, no premium tier. Fourth, <b>lyrics lead by 0.5 seconds</b>: "
    "every synced lyric line highlights 500 ms before the vocal lands, so the listener is always "
    "slightly ahead of the song. Fifth, <b>music is sourced the way OpenSpot and Musify do it</b> - "
    "from YouTube / YouTube Music - but behind a server-side adapter with an own-catalog fallback, "
    "so the sourcing decision can never break the architecture.")
story += stat_row([
    ("25", "screens specced<br/>from the mockup"),
    ("28", "weeks, solo<br/>part-time plan"),
    ("24", "REST endpoints<br/>on the custom API"),
    ("11", "tables in the<br/>PostgreSQL schema"),
    ("-0.5 s", "default lyric<br/>lead offset"),
])
story += body(
    "The document is organized to be used, not just read. Chapter 2 defines what is being built and "
    "what is deliberately deferred. Chapters 3 and 4 specify the system: two native clients (Swift "
    "with SwiftUI, Kotlin with Jetpack Compose) over a custom Node.js API with PostgreSQL. Chapter 5 "
    "locks the design system - every color, size, radius and animation curve extracted from the "
    "mockup. Chapter 6 sequences the build into six demoable milestones. Chapter 7 is the honest "
    "analysis of how OpenSpot and Musify actually source music and what that means legally and for "
    "distribution. Chapter 8 scores the twelve risks that matter. The appendices carry the full "
    "screen inventory and research sources.")
story += body(
    "Everything in this blueprint also lives as living documents in the project repository, where "
    "progress is tracked milestone by milestone. The repository - not this PDF - is the source of "
    "truth once construction starts; the PDF is the v1.0 snapshot of the plan.")

# =============================================================== Chapter 2
story += h1_block("2. Product Definition", body(
    "Tugtugin targets one primary persona: the daily listener in the Philippines who commutes one to "
    "two hours a day on a mid-range Android phone, sometimes without signal, wants to hear a song "
    "within five seconds of opening the app, and uses lyrics to sing along to OPM tracks. The second "
    "persona is the builder - a solo developer with roughly eight to ten hours per week who needs "
    "small, demoable milestones and a plan that survives a skipped week. Every product decision in "
    "this chapter serves one of those two people."))

story.append(heading("2.1 Scope cut-line", "h2"))
story += body(
    "The mockup renders more than the MVP builds. Social features (friends, activity feed, "
    "messages), collaborative playlists, Blend and Jam, podcasts, audiobooks, pre-save campaigns and "
    "Canvas video loops all appear in the design language but are deferred to v2 - each is hidden "
    "behind a feature flag rather than redesigned away. The table below is the binding cut-line.")
story += make_table(
    ["Deferred feature", "Why deferred", "Mockup reference"],
    [
        ["Friends / activity / messages", "Requires real accounts - conflicts with the no-login principle", "Profile drawer, friends row"],
        ["Blend / Jam / collaborative playlists", "Multi-player coordination is a project of its own", "Create sheet options"],
        ["Podcasts and audiobooks", "Catalog focus is music; UI chips stay hidden until v2", "Home chips, Library tab"],
        ["Pre-save / release countdown", "Needs push infrastructure and label relationships", "Single page banner"],
        ["Canvas video loops", "High bandwidth, low MVP value", "Settings row"],
        ["Listening stats page", "v2 social tier", "Profile drawer"],
    ],
    [0.30, 0.44, 0.26],
    caption="Table 2-1. Features present in the mockup but explicitly out of MVP scope.")

story.append(heading("2.2 Screen clusters and build priority", "h2"))
story += body(
    "The mockup's 25 states group into 20 screen clusters; each cluster ships in the milestone shown. "
    "The full state-by-state inventory is Appendix A. The one screen that does not exist in the "
    "mockup is Onboarding - a single name-entry field required by the no-login principle: type a "
    "name, tap go, device registers silently, Home appears with the quick grid filled.")
story += make_table(
    ["#", "Screen cluster", "Ships", "Key elements (from mockup)"],
    [
        ["1", "Onboarding - name entry", "M1", "Single field, no email or password, silent device registration"],
        ["2", "Home", "M2", "Chips, 8-tile quick grid, recent rotation, card carousels, Show all links"],
        ["3", "Search idle + browse", "M2", "Recents with remove, 5 feature categories, ~30 genre tiles"],
        ["4", "Search typing + results", "M2", "Live suggestions, type chips, artist header card, result rows"],
        ["5", "Now Playing", "M1", "Art, scrubber, shuffle/prev/play/next/sleep, lyrics preview card"],
        ["6", "Full-screen lyrics", "M4", "Active/past/future states, tap-to-seek, instrumental rows"],
        ["7", "Queue sheet", "M1/M4", "Now playing + next up, hold-to-reorder, swipe-to-remove"],
        ["8", "Track sheet + add-to-playlist", "M3", "Share, lyrics toggle, like, saved-in list, new playlist dialog"],
        ["9", "Playlist detail", "M3", "Gradient hero, action pills, tracks, recommended songs, refresh"],
        ["10", "Playlist edit + name & details", "M3", "Drag rows, cover with edit badge, private toggle, delete"],
        ["11", "Liked Songs + add", "M3", "Count, add-to-this-playlist row, most-played/songs tabs"],
        ["12", "Artist page", "M2", "Verified hero, monthly listeners, Follow, Popular with counts"],
        ["13", "Album / Single page", "M2", "Tracks, save/download/share, credits, more by artist"],
        ["14", "Radio / Browse genre", "M2", "Station hero + track list; genre page with card rows"],
        ["15", "Library", "M3", "Tabs, sub-chips, sort + grid, pinned Liked Songs, empty states"],
        ["16", "Recents grouped", "M3", "Today / Yesterday / date sections with activity subtitles"],
        ["17", "Profile drawer", "M3", "User card, recents, settings; social rows flagged off"],
        ["18", "Settings", "M4", "Data saver, playback, storage, about; sleep timer sheet"],
        ["19", "Share / create / toast", "M3", "System share targets, playlist name dialog, confirmations"],
        ["20", "Mini player", "M1", "Floating, per-track tint, progress hairline, tap to expand"],
    ],
    [0.05, 0.24, 0.09, 0.62],
    caption="Table 2-2. Screen clusters mapped to milestones (M1 through M4).",
    font=8, align_center_cols=(0, 2))

story.append(heading("2.3 Acceptance criteria for the big rocks", "h2"))
story += body(
    "Each milestone ends with a scripted demo that must pass verbatim. The five flows below are the "
    "contract between the plan and the build; their full acceptance criteria are in the repository's "
    "PRD (doc 01).")
story += bullets([
    "<b>F1 First launch:</b> name to music in under 30 seconds - type a name, tap go, land on Home with the quick grid filled, tap a tile, the mini player appears and the track plays.",
    "<b>F2 Sing along:</b> search a title, play the top result, open full-screen lyrics - each line highlights 0.5 s before it is sung; tapping a line seeks playback to it.",
    "<b>F3 Build a playlist:</b> create, name, add tracks from search, hold-drag to reorder, swipe to remove - order persists after restart and syncs to the server.",
    "<b>F4 Commute offline:</b> download a playlist on Wi-Fi, enable airplane mode, reopen the app straight into offline library - tracks and cached lyrics play.",
    "<b>F5 Sleep timer:</b> set 30 minutes (or end-of-track); at zero, playback fades out and pauses with confirmation.",
])
story += body(
    "Non-functional targets: cold start under 2.5 s on a mid-range Android, playback start under "
    "1.5 s on 4G and under 300 ms from cache, lyric sync within 150 ms after the lead, crash-free "
    "sessions at 99.5 percent or better, at most 5 percent battery per hour of screen-off playback, "
    "and full offline function for downloads, likes and playlists.")

# =============================================================== Chapter 3
story += h1_block("3. System Architecture", body(
    "Two native clients talk HTTPS to one custom backend. The backend owns the catalog through a "
    "swappable provider adapter, plus playlists, likes, recents and lyrics, and hands clients "
    "short-lived signed stream URLs. Clients are local-first: every user mutation writes to the "
    "on-device database first and syncs to the server, so the app keeps working offline and replays "
    "queued writes when connectivity returns."))
story.append(heading("3.1 Technology choices", "h2"))
story += make_table(
    ["Layer", "Choice", "Why (solo-friendly)"],
    [
        ["iOS", "Swift 5.9+, SwiftUI, AVFoundation", "Declarative UI maps 1:1 to the mockup's component model; AVQueuePlayer gives background audio and lock-screen controls with minimal code"],
        ["Android", "Kotlin 2.x, Jetpack Compose, Media3", "Compose mirrors SwiftUI structurally - one mental model across both apps; Media3 gives the queue, shuffle, reorder and notification controls for free"],
        ["Local DB", "SwiftData / Room", "Mirrored schema; one sync layer per platform"],
        ["Backend", "Node 20, Express, Prisma, PostgreSQL 16", "One language for API and scripts; Prisma migrations are solo-maintainable"],
        ["Storage", "S3-compatible object storage (R2)", "Own-catalog audio, art and LRC files; zero egress fees keep the app free to run"],
        ["Lyrics", "LRC format + LRCLIB lookup", "Trivial to parse on-device; community database is free"],
    ],
    [0.13, 0.29, 0.58],
    caption="Table 3-1. Stack decisions and their rationale. React Native, Flutter and Firebase were explicitly rejected.")

story += figure("/home/z/my-project/scripts/print-architecture.png",
                "Figure 3-1. Four-layer system architecture. Dashed cards are external providers behind the adapter interface.",
                max_h=505)
story.append(heading("3.2 The catalog adapter - the most important interface in the system", "h2"))
story += body(
    "The server never hard-codes where music comes from. Everything sits behind one interface with "
    "two implementations, built in this order: OwnCatalogProvider (admin-uploaded audio, LRC and "
    "artwork in object storage) ships first so the playback milestone is built against a guaranteed "
    "source; YtmProvider (YouTube / YouTube Music, the OpenSpot-Musify pattern) ships second behind "
    "a build flag. Because the server does the resolution, clients stay clean of extractor code, "
    "there is exactly one place to patch when upstream changes, and resolved metadata is persisted "
    "so playlists survive source churn. A future licensed provider can plug in without touching the "
    "apps.")
story += code_block(
    "interface CatalogProvider {\n"
    "  search(q, type, page): Promise<SearchPage>\n"
    "  getTrack(id): Promise<TrackMeta>          // title, artist, duration, art\n"
    "  getStreamUrl(id): Promise<string>         // short-lived playable URL\n"
    "  getAlbum(id): Promise<AlbumMeta>\n"
    "  getArtist(id): Promise<ArtistMeta>        // + top tracks, releases\n"
    "  getStation(seed): Promise<TrackMeta[]>    // radio / autoplay\n"
    "}\n"
    "implementations: OwnCatalogProvider  ->  YtmProvider  ->  (future) LicensedProvider",
    caption="Code 3-1. The CatalogProvider interface. Implementations are server-side only.")
story += body(
    "Stream delivery: the stream endpoint returns a 302 redirect to a signed, roughly four-hour-TTL "
    "upstream URL, which keeps bandwidth cost at zero and prevents the API from becoming an open "
    "proxy. A proxy-cache mode through the server exists for own-catalog files and for caching "
    "popular community streams. Playback engines: on iOS, AVAudioSession in playback mode with "
    "periodic time observers driving the lyrics clock; on Android, a foreground MediaSessionService "
    "with ExoPlayer, whose native playlist API maps one-to-one onto the queue sheet's move and "
    "remove gestures. Shuffle is a stored Fisher-Yates permutation so un-shuffling restores the "
    "original order and reorder gestures stay coherent.")

# =============================================================== Chapter 4
story += h1_block("4. Data Model and API", body(
    "Eleven tables cover the entire product. The Device table is the user: a UUID, a display name, "
    "a platform, and a hashed API key. There is no email, no password, and no profile table - the "
    "no-login principle is structural, not cosmetic. Catalog rows (Artist, Album, Track, Lyrics) "
    "carry a source and external ID so the same table serves both providers. Client databases "
    "mirror their slice of this schema."))
story += make_table(
    ["Endpoint", "Purpose"],
    [
        ["POST /v1/devices", "Register: display name + platform -> device_id and device key"],
        ["GET /v1/home", "Personalized sections: quick grid, card rows"],
        ["GET /v1/search/suggest?q=", "Prefix suggestions, under 300 ms, cached"],
        ["GET /v1/search?q=&type=", "Typed results (song/album/artist/playlist)"],
        ["GET /v1/browse/genres", "Genre and category tiles"],
        ["GET /v1/stations/:seed", "Radio track list for autoplay"],
        ["GET /v1/tracks/:id", "Track metadata"],
        ["GET /v1/tracks/:id/stream", "302 to signed 4 h stream URL"],
        ["GET /v1/tracks/:id/lyrics", "LRC text + offset"],
        ["GET /v1/artists/:id  ·  /v1/albums/:id", "Artist (top tracks, releases) and album detail"],
        ["GET/POST /v1/playlists  ·  PATCH/DELETE /:id", "Playlist CRUD (name, description, cover, privacy, sort)"],
        ["POST /v1/playlists/:id/tracks  ·  DELETE /:trackId", "Add and remove tracks"],
        ["PATCH /v1/playlists/:id/order", "Persist drag-reorder"],
        ["PUT/DELETE /v1/likes/:trackId", "Like and unlike"],
        ["GET /v1/library?include=", "Playlists, followed artists, saved albums"],
        ["PUT/DELETE /v1/library/:type/:id", "Follow / save and their inverses"],
        ["POST /v1/events/listen", "Batched listen events, replayed after offline"],
        ["GET /v1/recents", "Recents feed grouped by day"],
    ],
    [0.42, 0.58],
    caption="Table 4-1. The v1 API surface (24 endpoints; grouped rows combine method pairs).", font=8.5)
story.append(heading("4.1 Lyrics synchronization - the -500 ms rule", "h2"))
story += body(
    "Lyrics use standard LRC (timestamped lines, multiple stamps per line allowed). Resolution "
    "order when a track plays: the track's own LRC, then a community lookup on LRCLIB matched by "
    "artist, title and duration, then plain text, then none. The sync engine runs on the client, "
    "identically on both platforms, and applies the product's signature offset:")
story += code_block(
    "LEAD_MS = -500                        // highlight 0.5 s before the vocal\n"
    "onPositionUpdate(pos):\n"
    "    t = pos + LEAD_MS                 // effective lyric clock\n"
    "    active = last line where line.time <= t\n"
    "    if active != prevActive:\n"
    "        render(active)                // white, 24 pt, weight 800\n"
    "        past lines -> white, future lines -> 50% opacity\n"
    "        scroll active line to vertical center (200 ms)\n"
    "onLineTapped(i):\n"
    "    seek(line[i].time - LEAD_MS + 100 ms)",
    caption="Code 4-1. Client-side lyric sync with the 0.5 s lead and tap-to-seek.")
story += body(
    "The offset is user-adjustable from -2 s to +2 s in Settings, defaulting to -500 ms. The "
    "perceived-sync acceptance gate is 150 ms on five reference tracks. Unsynced lyrics render as "
    "plain text without the highlight; instrumental rows render as spaced note glyphs at reduced "
    "opacity, exactly as the mockup shows.")

# =============================================================== Chapter 5
story += figure("/home/z/my-project/scripts/print-data-model.png",
                "Figure 4-1. Entity-relationship overview. Remaining relations are foreign keys listed inside each card.",
                max_h=505)
story += h1_block("5. Design System", body(
    "The mockup's CSS is the design source of truth; every value below is extracted from it, so the "
    "built apps match it pixel for pixel. Tokens live in the repository as JSON and generate both "
    "SwiftUI and Compose constants, keeping the two platforms visually identical as the design "
    "evolves. The system is dark-first, typography-led, with one green accent."))
story += make_table(
    ["Token", "Value", "Usage"],
    [
        ["bg", "#121212", "App background"],
        ["card / card2", "#1F1F1F / #282828", "Cards, settings tiles; sheets and dialogs"],
        ["chip / line", "#2A2A2A / #2F2F2F", "Chips and quick-grid tiles; hairline dividers"],
        ["text / sub / dim", "#FFFFFF / #B3B3B3 / #7F7F7F", "Primary, secondary, tertiary text"],
        ["green (accent)", "#1ED760", "Play buttons, active chips, progress, now-playing"],
        ["red", "#F15E6C", "Destructive actions, swipe-to-remove"],
        ["mini / blue", "#4A1F16 / #3B8DFF", "Per-track mini-player scrim; notification dot"],
    ],
    [0.20, 0.30, 0.50],
    caption="Table 5-1. Core color tokens from the mockup. Thirteen named art gradients backfill missing artwork.")
story += body(
    "Type is a single family, Figtree, in weights 400 through 900, with tracking that tightens as "
    "size grows: hero 34-40/900, h1 26/800, h2 20-22/700, Now-Playing title 22/700, lyric lines "
    "24/800, track titles 16/500, metadata 14, chips 13-14/600, tab labels 11/600. The spacing grid "
    "is a 4 px base with 14 px screen padding; track rows are 64 px minimum with 48 px artwork "
    "(round for artists); radii run 4-6 for art, 8-10 for cards, 12 for sheets, 16 for chips and "
    "pills, 22 for the CTA. The bottom chrome is a 64 px navigation bar with a 56 px floating mini "
    "player 8 px above it.")
story += make_table(
    ["Interaction", "Motion spec (from mockup CSS)"],
    [
        ["Screen enter", "Children rise 8 px + fade, 240 ms, cubic-bezier(.23,1,.32,1)"],
        ["Button press", "Scale 0.97, 160 ms"],
        ["Bottom sheet / Now Playing", "Slide-up 320 / 380 ms, cubic-bezier(.32,.72,0,1), scrim fade"],
        ["Profile drawer", "Slide-in 320 ms, cubic-bezier(.2,.8,.2,1)"],
        ["Toast / toggle / lyric highlight", "Fade 300 ms auto-dismiss 1.8 s / thumb 200 ms / recolor + center-scroll 200 ms"],
        ["Queue drag", "Lift with shadow, 15 ms haptic on grab"],
    ],
    [0.30, 0.70],
    caption="Table 5-2. Motion specs. All motion respects the platform reduce-motion setting.")
story += body(
    "Component inventory: 24 named components cover the app - TrackRow, Chip, QuickCard, JCard, "
    "MiniPlayer, NavBar, NowPlayingControls, ProgressBar, LyricsCard, LyricsView, Sheet, Drawer, "
    "Dialog, Toast, Toggle, SearchBar, HeroHeader, SettingsTile, QueueRow, Avatar, EqBars, "
    "PillButton, PlayButton and the gradient art system - plus a 44-icon, 24 px, 2 px-stroke icon "
    "set whose names come straight from the mockup. Two accessibility fixes are mandated at build "
    "time: the dim token rises from #7F7F7F to #8F8F8F to clear 4.5:1 contrast on the background, "
    "and every 36 px icon button gets an invisible 4 px hit-area inset, as the mockup already "
    "models. Before any public build, the de-branding checklist applies: rename the app, replace "
    "the wordmark, rename the 'By Spotify' filter chip to 'Curated', and remove the premium upsell "
    "row - the trade dress must differ even where the layout language pays homage.")

# =============================================================== Chapter 6
story += h1_block("6. Roadmap and Milestones", body(
    "The plan assumes one builder, eight to ten hours per week, and a rule of the road: if a week "
    "is lost, the buffer absorbs it and scope moves out of the milestone - quality gates never "
    "move. Every milestone ends with something demoable, not merely written. Week 1 begins Monday, "
    "November 23, 2026; the program ends in early June 2027 with two weeks of buffer."))
story += figure("/home/z/my-project/scripts/print-gantt.png",
                "Figure 6-1. The 28-week solo roadmap. The hatched tail is deliberate slack.", max_h=250)
story += make_table(
    ["ID", "Weeks", "Dates", "Demo at the gate"],
    [
        ["M0", "1-2", "Nov 23-Dec 6", "Fresh clone builds both apps; they hit the health endpoint; tokens render; CI green"],
        ["M1", "3-8", "Dec 7-Jan 17", "Play a song (own catalog), background audio, lock-screen controls, mini player, queue remove"],
        ["M2", "9-13", "Jan 18-Feb 21", "Search a title, results by type chip, play from the YT Music adapter; Home feed, artist and album pages"],
        ["M3", "14-18", "Feb 22-Mar 28", "Full playlist CRUD with drag reorder persisting, likes, Library tabs, recents, profile drawer"],
        ["M4", "19-23", "Mar 29-May 2", "Synced lyrics with the 0.5 s lead and tap-to-seek; airplane-mode playback; sleep timer; settings"],
        ["M5", "24-26", "May 3-May 23", "Two-week beta with five testers, crash-free 99.5%, store listing, first public APK"],
    ],
    [0.07, 0.09, 0.16, 0.68],
    caption="Table 6-1. Milestones with their gate demos. Full acceptance criteria live in the repository roadmap.",
    font=8.5, align_center_cols=(0, 1))
story += body(
    "Two structural decisions protect the schedule. First, a risk checkpoint at the end of week 10: "
    "if the adapter proves unreliable - more than ten percent stream-resolution failures across a "
    "test corpus - M2 pivots to own-catalog browsing and the adapter moves to the buffer, rather "
    "than letting a broken upstream stall the whole plan. Second, an honest fallback if M1 runs "
    "more than two weeks late: lead with Android only through M4 and port to iOS in one focused "
    "six-week block, since every API, design and algorithm artifact transfers - only the UI and "
    "player glue is rewritten. The weekly rhythm is two weeknight sessions of ninety minutes on "
    "the smallest current task, one weekend block of four to five hours on the week's main "
    "feature, a thirty-second demo video to keep morale measurable, and fifteen minutes on Sunday "
    "updating the progress board and choosing the next three tasks.")

# =============================================================== Chapter 7
story += h1_block("7. Music Sourcing and Legal Analysis", body(
    "The requirement is specific: songs come from wherever OpenSpot and Musify get them. Research "
    "for this blueprint verified what that actually is. Both are open-source music players whose "
    "catalog and audio come from YouTube and YouTube Music - neither hosts nor licenses any music. "
    "OpenSpot (BlackHatDevX) imports playlists from public Spotify URLs, pulls trending charts "
    "from Spotify across 75+ countries, and streams via what its README calls 'YouTube API - more "
    "reliable streaming'. Musify (gokadzev) streams YouTube Music with offline listening, lyrics "
    "and custom playlists, distributed through F-Droid. The wider ecosystem - ViMusic, RiMusic "
    "with roughly 1.3 million downloads, SimpMusic, Spotube - works the same way: metadata from "
    "YouTube Music, audio resolved at play time from YouTube's player endpoints, nothing stored "
    "by the app authors."))
story += body(
    "That is exactly the mechanism the YtmProvider adapter implements - with one architectural "
    "difference that matters: resolution happens on our server, not inside the clients, so there "
    "is a single place to patch, cache and monitor when upstream changes. And upstream does "
    "change: community reporting on these apps is consistent that 'performance is inconsistent' "
    "whenever YouTube's internal endpoints shift, which is why adapter breakage is risk R-01 in "
    "the register and why the own-catalog provider ships first.")
story.append(heading("7.1 The honest risk picture", "h2"))
story += bullets([
    "<b>Upstream breakage (near-certain, operational).</b> Unofficial endpoints are unversioned. Mitigation: server-side adapter isolation, persisted metadata, failure monitoring, and the own-catalog floor that always works.",
    "<b>YouTube Terms of Service (certain as a matter of the text).</b> The ToS restricts access to content outside official clients. Mitigation: no redistribution of audio - streams are played and time-limited-cached, never permanently stored server-side; the adapter is one swappable module.",
    "<b>Store distribution (variable).</b> The Play Store has accepted some apps in this category and removed others; Apple review is stricter. Mitigation: a dual-flavor strategy - a store-safe 'Catalog' flavor (own catalog plus official-API metadata) submitted to Play and TestFlight, and the full 'Community' flavor distributed as a signed APK from GitHub Releases, exactly how this ecosystem distributes.",
    "<b>Repository takedowns (possible).</b> Rights holders can DMCA the host. Mitigation: no media ever committed (enforced by CI), adapter code isolated, and a written takedown-response process in the progress board.",
    "<b>Jurisdiction (note).</b> Philippine law (RA 8293) is broadly similar to other Berne jurisdictions; the project stays personal and non-commercial. If it ever turns commercial, get actual counsel first.",
])
story.append(heading("7.2 Lyrics sourcing", "h2"))
story += body(
    "Own-catalog tracks ship with their own LRC files - full control, perfect sync. For community "
    "tracks, LRCLIB provides a free, community-driven synced-lyrics database with an open API, "
    "matched by artist, title and duration; it is the standard source for open-source players and "
    "the honest fit for a free app. Commercial services like Musixmatch require B2B licensing and "
    "are out of scope. The -0.5 s lead is applied client-side regardless of source.")

# =============================================================== Chapter 8
story += h1_block("8. Risk Register", body(
    "Twelve risks are scored likelihood times impact on a 1-to-5 scale. A score of 12 or more "
    "requires an active mitigation in the current milestone; 16 or more requires a plan-B decision "
    "at the next gate. Three risks actually kill solo projects - upstream breakage, schedule slip "
    "and scope creep - and those three are re-scored at every gate before any new work is "
    "scheduled."))
story += make_table(
    ["ID", "Risk", "L", "I", "Score", "Mitigation and trigger"],
    [
        ["R-01", "YouTube stream resolution breaks upstream", "4", "4", "16", "Server-side adapter + cached rows + monitoring. Trigger: >10% failures in a week - freeze features, patch; own catalog keeps the app alive"],
        ["R-02", "Store rejects the Community flavor", "4", "2", "8", "Dual-flavor distribution; Community APK ships from GitHub Releases regardless"],
        ["R-03", "Solo schedule slip or burnout", "3", "4", "12", "8-10 h/week cap, buffer weeks, demo-video ritual. Trigger: M1 >2 weeks late - switch to Android-first"],
        ["R-04", "Two-platform scope creep", "4", "3", "12", "MVP cut-line frozen in the PRD; new ideas go to the v2 backlog, never the current milestone"],
        ["R-05", "Data loss with no login (device lost)", "3", "3", "9", "Device key in Keychain/Keystore; server holds playlists and likes; v1.1 pairing code promoted on first report"],
        ["R-06", "DMCA notice to the repository", "2", "4", "8", "No media in repo (CI guard); isolated adapter; written response process"],
        ["R-07", "Lyrics unavailable or unsynced", "3", "2", "6", "Own LRC first, LRCLIB fallback, graceful plain-text mode"],
        ["R-08", "Background-audio platform quirks", "3", "3", "9", "M1 gates include screen-off, Doze and call-interruption tests on real devices"],
        ["R-09", "Hosting cost creep", "2", "2", "4", "302-redirect streaming keeps egress at zero; cost alarm at $20/month"],
        ["R-10", "API abuse via the stream endpoint", "2", "3", "6", "Device-key auth, rate limits, signed short-TTL URLs"],
        ["R-11", "Low-end Android performance", "3", "3", "9", "NFRs tested on a budget device from M1; defer art animations if cold start exceeds 2.5 s"],
        ["R-12", "Dependency or font license drift", "1", "2", "2", "Figtree is OFL; npm audit and license checks in CI"],
    ],
    [0.07, 0.25, 0.04, 0.04, 0.07, 0.53],
    caption="Table 8-1. Scored risk register. L = likelihood, I = impact (1-5).",
    font=8, align_center_cols=(0, 2, 3, 4))

# =============================================================== Appendix A
story += h1_block("Appendix A. Screen Inventory", body(
    "Every state rendered by the reference mockup, mapped to its screen cluster (Chapter 2) and "
    "the milestone that ships it. Clusters 1 and 20 include states added for the product rather "
    "than the mockup."))
story += make_table(
    ["Mockup state", "Cluster", "Ships"],
    [
        ["Home - chips + quick grid + sections", "2 Home", "M2"],
        ["Home - Following chip feed", "2 Home (v2 content)", "v2"],
        ["Home - Podcasts/Audiobooks feeds", "2 Home (v2 content)", "v2"],
        ["Search - idle with recents", "3 Search idle", "M2"],
        ["Search - browse grid (genres)", "3 Search idle", "M2"],
        ["Search - typing suggestions", "4 Search typing", "M2"],
        ["Search - results with type chips + artist card", "4 Search results", "M2"],
        ["Now Playing (compact + expanded)", "5 Now Playing", "M1"],
        ["Full-screen lyrics with tap-to-seek", "6 Lyrics", "M4"],
        ["Queue sheet (reorder + swipe remove)", "7 Queue", "M1/M4"],
        ["Track action sheet", "8 Track sheet", "M3"],
        ["Add-to-playlist sheet + find field", "8 Track sheet", "M3"],
        ["Playlist detail + recommended", "9 Playlist", "M3"],
        ["Edit playlist (drag rows)", "10 Edit", "M3"],
        ["Name & details (cover, private, delete)", "10 Edit", "M3"],
        ["Add songs (search + toggle)", "9/11 Add flows", "M3"],
        ["Liked Songs page", "11 Liked", "M3"],
        ["Artist page (verified, popular, releases)", "12 Artist", "M2"],
        ["Album page", "13 Album", "M2"],
        ["Single page + pre-save banner", "13 Album (banner v2)", "M2"],
        ["Radio station page", "14 Radio/Browse", "M2"],
        ["Browse genre page", "14 Radio/Browse", "M2"],
        ["Library tabs + sub-chips + sort/grid", "15 Library", "M3"],
        ["Library search + empty states", "15 Library", "M3"],
        ["Recents grouped by day", "16 Recents", "M3"],
        ["Profile drawer (+ friends, messages - v2)", "17 Profile", "M3"],
        ["Settings (+ private session, data saver)", "18 Settings", "M4"],
        ["Sleep timer sheet", "18 Settings", "M4"],
        ["Share sheet (8 targets)", "19 Share", "M3"],
        ["Create sheet + playlist-name dialog + toasts", "19 Create/toast", "M3"],
        ["Mini player (persistent)", "20 Mini player", "M1"],
        ["Onboarding - name entry (new screen)", "1 Onboarding", "M1"],
    ],
    [0.52, 0.33, 0.15],
    caption="Table A-1. Full state inventory (32 states including v2-flagged content and the new onboarding).",
    font=8, align_center_cols=(2,))

# =============================================================== Appendix B
story += h1_block("Appendix B. Research Sources", body(
    "Sourcing claims in Chapter 7 were verified against the following public sources during "
    "planning (November 2026)."))
story += bullets([
    "OpenSpot repository and project site - github.com/BlackHatDevX/openspot-music-app and blackhatdevx.github.io/openspot-music-app (Spotify playlist import, trending in 75+ countries, YouTube API streaming).",
    "OpenSpot 2.0 announcement thread - r/reactnative, November 2026 ('completely open-source and ad-free - focused on performance').",
    "Musify project site - gokadzev.github.io/Musify (open-source Android player, YouTube Music source, offline, lyrics, F-Droid builds).",
    "Curated ecosystem list - github.com/chayotic/Open-Source-Music-Streaming-Apps (topics: yt-dlp, yt-music, foss).",
    "ViMusic recommendation thread - Privacy Guides discussion forum, 2024 ('FOSS, ad-free, pulls songs from YouTube Music, no login').",
    "SimpMusic two-week trial coverage, November 2026 ('performance is inconsistent' - the upstream-instability evidence).",
    "RiMusic listing coverage - F-Droid catalog, approximately 1.3 million downloads.",
])
story += body(
    "Internal references: the repository's docs 01-06 (PRD, architecture, design system, roadmap, "
    "research, risk register), the progress board, and the reference mockup at "
    "design/reference-mockup.html.")

# ================================================================== build
OUT = "/home/z/my-project/scripts/blueprint-body.pdf"
doc = TocDocTemplate(
    OUT, pagesize=A4,
    leftMargin=MARGIN, rightMargin=MARGIN,
    topMargin=TOP_MARGIN, bottomMargin=BOTTOM_MARGIN,
    title=DOC_TITLE, author="Z.ai", creator="Z.ai",
    subject="Creation blueprint for a free, no-login, ad-free native music app")
frame = Frame(MARGIN, BOTTOM_MARGIN, AVAIL, AVAIL_H, id="normal")
doc.addPageTemplates([PageTemplate(id="All", frames=[frame], onPage=paint_page)])
doc.multiBuild(story)
print("built", OUT)

from pypdf import PdfReader  # noqa: E402
r = PdfReader(OUT)
print("pages:", len(r.pages))
p2_text = r.pages[1].extract_text() or ""
print("page-2 starts body:", "Executive Summary" in p2_text)
