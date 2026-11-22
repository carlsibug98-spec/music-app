"""Print-size roadmap Gantt for the PDF blueprint (designed at final display size)."""
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

plt.rcParams.update({
    "font.sans-serif": ["DejaVu Sans"],
    "axes.unicode_minus": False,
    "figure.facecolor": "#FFFFFF",
    "axes.facecolor": "#FFFFFF",
    "axes.edgecolor": "#E5E7EB",
    "axes.linewidth": 0.8,
    "axes.spines.top": False,
    "axes.spines.right": False,
    "axes.grid": False,
    "xtick.major.size": 0,
    "ytick.major.size": 0,
    "xtick.labelsize": 8,
    "ytick.labelsize": 9,
    "legend.frameon": False,
    "figure.dpi": 200,
    "savefig.dpi": 200,
    "savefig.facecolor": "#FFFFFF",
})

G900, G500, G400, G300 = "#111827", "#6B7280", "#9CA3AF", "#D1D5DB"

MILESTONES = [
    ("M0  Foundations",             0,  4, "Nov 23-Dec 20",  "#C3D0DE"),
    ("M1  Catalog / Search",        4,  4, "Dec 21-Jan 17",  "#A8BCCE"),
    ("M2  Playback core",           8,  5, "Jan 18-Feb 21",  "#8DA6BD"),
    ("M3  Library / taste picker", 13,  4, "Feb 22-Mar 21",  "#7290AC"),
    ("M4  Lyrics / offline",       17,  4, "Mar 22-Apr 18",  "#577A9B"),
    ("M5  Personalization / charts", 21, 3, "Apr 19-May 9",  "#3A6489"),
    ("M6  Deploy / friend rollout", 24, 2, "May 10-May 23", "#2A4E75"),
]
MONTHS = [(1.14, "Dec"), (5.57, "Jan"), (10.0, "Feb"), (14.0, "Mar"),
          (18.43, "Apr"), (22.71, "May")]

fig, ax = plt.subplots(figsize=(6.3, 3.0), constrained_layout=True)

y_positions = list(range(len(MILESTONES)))[::-1]
for (name, start, dur, dates, color), y in zip(MILESTONES, y_positions):
    ax.barh(y, dur, left=start, height=0.62, color=color,
            edgecolor="white", linewidth=0.8, zorder=3)
    ax.text(start + dur + 0.4, y, dates, ha="left", va="center",
            fontsize=8, color=G500, zorder=4)

ax.set_yticks(y_positions)
ax.set_yticklabels([m[0] for m in MILESTONES], fontsize=9, color=G900)
for x, month in MONTHS:
    ax.axvline(x, color=G300, linewidth=0.7, alpha=0.45, zorder=1)
    ax.text(x + 0.15, len(MILESTONES) - 0.42, month, fontsize=8, color=G500, va="top", zorder=2)

ax.set_xlim(0, 30.2)
ax.set_ylim(-0.6, len(MILESTONES) - 0.35)
ax.set_xticks(range(0, 27, 4))
ax.set_xticklabels(["wk 1", "wk 5", "wk 9", "wk 13", "wk 17", "wk 21", "wk 25"][:len(range(0, 27, 4))])
ax.xaxis.grid(True, alpha=0.08, color=G300)
ax.set_axisbelow(True)
ax.set_title("26-Week Solo Roadmap (Nov 2026 - May 2027)",
             loc="left", fontsize=11, fontweight="bold", color=G900, pad=10)

out = "/home/z/my-project/scripts/bp11/print-gantt.png"
fig.savefig(out, dpi=200, facecolor="white")
plt.close(fig)
import os
print(f"OK {out} ({os.path.getsize(out)/1024:.0f} KB)")
