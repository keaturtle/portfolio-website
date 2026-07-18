import WidgetKit
import SwiftUI

// Eighty home-screen widget — renders "today's ring" from a snapshot the app writes to
// the shared App Group. See eighty/src/data/widget.ts for the writer and WIDGET.md.

private let appGroup = "group.com.keatentuttle.eighty"

// MARK: - Shared snapshot (matches WidgetSnapshot in src/data/widget.ts)

struct EightySnapshot: Codable {
  let pct: Double
  let goalPct: Double
  let dayNumber: Int
  let totalDays: Int
  let successDays: Int
  let marginForError: Int
  let challengeName: String
  let updatedAt: String
}

private func readSnapshot() -> EightySnapshot? {
  guard let defaults = UserDefaults(suiteName: appGroup),
        let raw = defaults.string(forKey: "today"),
        let data = raw.data(using: .utf8) else { return nil }
  return try? JSONDecoder().decode(EightySnapshot.self, from: data)
}

// MARK: - Timeline

struct EightyEntry: TimelineEntry {
  let date: Date
  let snapshot: EightySnapshot?
}

struct Provider: TimelineProvider {
  func placeholder(in context: Context) -> EightyEntry {
    EightyEntry(
      date: Date(),
      snapshot: EightySnapshot(
        pct: 80, goalPct: 80, dayNumber: 12, totalDays: 80,
        successDays: 9, marginForError: 7, challengeName: "80/80/80", updatedAt: ""))
  }

  func getSnapshot(in context: Context, completion: @escaping (EightyEntry) -> Void) {
    completion(EightyEntry(date: Date(), snapshot: readSnapshot()))
  }

  func getTimeline(in context: Context, completion: @escaping (Timeline<EightyEntry>) -> Void) {
    let entry = EightyEntry(date: Date(), snapshot: readSnapshot())
    // The app calls reloadWidget() on every change; refresh at the next hour as a fallback.
    let next = Calendar.current.date(byAdding: .hour, value: 1, to: Date())
      ?? Date().addingTimeInterval(3600)
    completion(Timeline(entries: [entry], policy: .after(next)))
  }
}

// MARK: - Night Fir colors

private extension Color {
  init(hex: UInt32) {
    self.init(
      .sRGB,
      red: Double((hex >> 16) & 0xff) / 255,
      green: Double((hex >> 8) & 0xff) / 255,
      blue: Double(hex & 0xff) / 255,
      opacity: 1)
  }
  static let nfBg = Color(hex: 0x0d1411)
  static let nfCard2 = Color(hex: 0x1a2620)
  static let nfMint = Color(hex: 0x7fdcb2)
  static let nfSienna = Color(hex: 0xe0805a)
  static let nfInk = Color(hex: 0xedf3ee)
  static let nfSub = Color(hex: 0x8da399)
}

// MARK: - Ring

struct RingView: View {
  let pct: Double  // 0...100
  var lineWidth: CGFloat = 12

  var body: some View {
    let frac = min(max(pct / 100, 0), 1)
    ZStack {
      Circle().stroke(Color.nfCard2, lineWidth: lineWidth)
      Circle()
        .trim(from: 0, to: frac)
        .stroke(Color.nfMint, style: StrokeStyle(lineWidth: lineWidth, lineCap: .round))
        .rotationEffect(.degrees(-90))
      Text("\(Int(pct))%")
        .font(.system(size: 20, weight: .heavy, design: .rounded))
        .foregroundColor(.nfInk)
    }
  }
}

// MARK: - Entry view

struct EightyWidgetEntryView: View {
  @Environment(\.widgetFamily) var family
  var entry: Provider.Entry

  var body: some View {
    if let s = entry.snapshot {
      switch family {
      case .systemSmall:
        RingView(pct: s.pct, lineWidth: 11).padding(14)
      default:
        HStack(spacing: 16) {
          RingView(pct: s.pct).frame(width: 92, height: 92)
          VStack(alignment: .leading, spacing: 4) {
            Text(s.challengeName)
              .font(.system(size: 15, weight: .bold))
              .foregroundColor(.nfInk)
              .lineLimit(1)
            Text("Day \(s.dayNumber) of \(s.totalDays)")
              .font(.system(size: 12))
              .foregroundColor(.nfSub)
            Text("\(s.successDays) success days")
              .font(.system(size: 12))
              .foregroundColor(.nfSub)
            Text(
              s.marginForError > 0
                ? "Miss \(s.marginForError) more and you're still in"
                : "No margin left — every day counts"
            )
            .font(.system(size: 12, weight: .semibold))
            .foregroundColor(s.marginForError > 0 ? .nfMint : .nfSienna)
            .lineLimit(2)
          }
          Spacer(minLength: 0)
        }
        .padding(16)
      }
    } else {
      VStack(spacing: 6) {
        Text("EIGHTY")
          .font(.system(size: 11, weight: .bold))
          .foregroundColor(.nfMint)
        Text("Open the app to start")
          .font(.system(size: 12))
          .foregroundColor(.nfSub)
      }
      .padding()
    }
  }
}

// MARK: - Widget

@main
struct EightyWidget: Widget {
  let kind: String = "EightyWidget"

  var body: some WidgetConfiguration {
    StaticConfiguration(kind: kind, provider: Provider()) { entry in
      if #available(iOS 17.0, *) {
        EightyWidgetEntryView(entry: entry)
          .containerBackground(Color.nfBg, for: .widget)
      } else {
        EightyWidgetEntryView(entry: entry)
          .background(Color.nfBg)
      }
    }
    .configurationDisplayName("Today's Ring")
    .description("Your 80/80/80 progress at a glance.")
    .supportedFamilies([.systemSmall, .systemMedium])
  }
}
