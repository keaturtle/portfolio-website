import { useRef, useState } from 'react';
import {
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, Stack } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Svg, { Circle, Path } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { EIGHTY_PRESET } from '@/data/presets';
import { repo } from '@/data/db';
import { usePalette, radius, Palette } from '@/theme/tokens';

const { width } = Dimensions.get('window');
const SERIF = 'Georgia';

const GROUPS: { title: string; key: string }[] = [
  { title: 'Morning', key: 'morning' },
  { title: 'Through the day', key: 'day' },
  { title: 'Evening', key: 'evening' },
];

function markComplete() {
  repo.setSetting('onboarding_completed', '1');
}

export default function Onboarding() {
  const p = usePalette();
  const insets = useSafeAreaInsets();
  const [page, setPage] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / width);
    if (i !== page) setPage(i);
  };
  const goTo = (i: number) => {
    Haptics.selectionAsync();
    scrollRef.current?.scrollTo({ x: i * width, animated: true });
  };

  const startMy80 = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    markComplete();
    router.replace({ pathname: '/preview', params: { presetJson: JSON.stringify(EIGHTY_PRESET) } });
  };
  const lookAround = () => {
    markComplete();
    router.replace('/');
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={{ flex: 1, backgroundColor: p.bg }}>
        <Pressable
          onPress={lookAround}
          style={[styles.skip, { top: insets.top + 8 }]}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Skip intro"
        >
          <Text style={{ fontSize: 13, color: p.sub, fontWeight: '600' }}>Skip</Text>
        </Pressable>

        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={onScroll}
          scrollEventThrottle={16}
        >
          <ScreenOne p={p} insets={insets} />
          <ScreenTwo p={p} insets={insets} />
          <ScreenThree p={p} insets={insets} />
          <ScreenFour p={p} insets={insets} onStart={startMy80} onLook={lookAround} />
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
          <View style={styles.dots}>
            {[0, 1, 2, 3].map((i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  i === page ? { backgroundColor: p.mint, width: 18 } : { backgroundColor: p.line },
                ]}
              />
            ))}
          </View>
          {page < 3 ? (
            <Pressable onPress={() => goTo(page + 1)} style={[styles.next, { backgroundColor: p.mint }]}>
              <Text style={{ color: p.onAccent, fontWeight: '800', fontSize: 14 }}>Next</Text>
              <Ionicons name="arrow-forward" size={15} color={p.onAccent} />
            </Pressable>
          ) : (
            <View style={{ width: 84 }} />
          )}
        </View>
      </View>
    </>
  );
}

type SP = { p: Palette; insets: { top: number; bottom: number } };

function Page({ children, insets }: { children: React.ReactNode; insets: SP['insets'] }) {
  return (
    <View style={{ width, paddingHorizontal: 30, paddingTop: insets.top + 64, paddingBottom: 120, flex: 1 }}>
      {children}
    </View>
  );
}

function ScreenOne({ p, insets }: SP) {
  return (
    <Page insets={insets}>
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <Svg width={46} height={46} viewBox="0 0 46 46" style={{ marginBottom: 30 }}>
          <Circle cx={23} cy={23} r={19} stroke={p.line} strokeWidth={4} fill="none" />
          <Path d="M23 4 a19 19 0 0 1 16.5 28.5" stroke={p.mint} strokeWidth={4} strokeLinecap="round" fill="none" />
        </Svg>
        <Text style={[styles.h1, { color: p.ink }]}>Progress isn't perfect.</Text>
        <Text style={[styles.body, { color: p.sub, marginTop: 20 }]}>
          Streak apps punish one bad day like it erases every good one. It doesn't. Real change is
          built on showing up <Text style={{ color: p.ink, fontStyle: 'italic' }}>most</Text> of the
          time — and having a system that expects you to be human.
        </Text>
      </View>
    </Page>
  );
}

function ScreenTwo({ p, insets }: SP) {
  const trip = [
    ['80%', 'of your list', 'hit 8 of 10 habits'],
    ['80%', 'of your days', 'succeed on any 64'],
    ['80', 'days long', 'the full challenge'],
  ];
  return (
    <Page insets={insets}>
      <Text style={[styles.eyebrow, { color: p.mint }]}>THE CHALLENGE</Text>
      <Text style={[styles.h2, { color: p.ink, marginTop: 8 }]}>The 80/80/80 Challenge</Text>
      <View style={{ marginTop: 22, gap: 14 }}>
        {trip.map(([num, bold, cap]) => (
          <View key={bold} style={{ flexDirection: 'row', alignItems: 'baseline', gap: 14 }}>
            <Text style={[styles.trip, { color: p.mint }]}>{num}</Text>
            <View>
              <Text style={{ fontSize: 14, fontWeight: '700', color: p.ink }}>{bold}</Text>
              <Text style={{ fontSize: 12.5, color: p.sub }}>{cap}</Text>
            </View>
          </View>
        ))}
      </View>
      <Text style={[styles.body, { color: p.sub, marginTop: 22 }]}>
        Drop two items every single day and miss sixteen days entirely — and still finish perfect.
        That's not a loophole. That's the design.
      </Text>
      <Text style={{ fontSize: 12, color: p.sub, opacity: 0.85, marginTop: 16, lineHeight: 18 }}>
        Research puts real habit formation at around 66 days. Eighty gives you 80 — long enough to
        actually get there.
      </Text>
    </Page>
  );
}

function ScreenThree({ p, insets }: SP) {
  const regular = EIGHTY_PRESET.items.filter((it) => !it.isBonus);
  return (
    <Page insets={insets}>
      <Text style={[styles.eyebrow, { color: p.mint }]}>THE LIST</Text>
      <Text style={[styles.h2, { color: p.ink, marginTop: 8, fontSize: 24 }]}>
        This is the starting list — not your list.
      </Text>
      <View style={{ marginTop: 16 }}>
        {GROUPS.map((g) => (
          <View key={g.key} style={{ marginTop: 10 }}>
            <Text style={{ fontSize: 10, fontWeight: '800', letterSpacing: 1, color: p.sub, marginBottom: 4 }}>
              {g.title.toUpperCase()}
            </Text>
            {regular
              .filter((it) => it.timeOfDay === g.key)
              .map((it) => {
                const short = it.label.split('—')[0]?.trim() ?? it.label;
                return (
                  <View key={it.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 9, paddingVertical: 3.5 }}>
                    <View
                      style={[
                        styles.mark,
                        it.isAvoidance
                          ? { borderColor: p.mint, borderStyle: 'dashed', backgroundColor: 'transparent' }
                          : { backgroundColor: p.mint, borderColor: p.mint },
                      ]}
                    >
                      {!it.isAvoidance && <Ionicons name="checkmark" size={11} color={p.onAccent} />}
                    </View>
                    <Text style={{ fontSize: 13, color: it.isAvoidance ? p.sub : p.ink, flex: 1 }}>{short}</Text>
                    {it.isAvoidance && (
                      <Text style={{ fontSize: 8.5, fontWeight: '800', color: p.mint, letterSpacing: 0.5 }}>AUTO</Text>
                    )}
                  </View>
                );
              })}
          </View>
        ))}
      </View>
      <Text style={{ fontSize: 12.5, color: p.sub, marginTop: 14, lineHeight: 18 }}>
        Every habit is editable — your items, your duration, your thresholds. The 80% engine holds
        you to it.
      </Text>
    </Page>
  );
}

function ScreenFour({
  p,
  insets,
  onStart,
  onLook,
}: SP & { onStart: () => void; onLook: () => void }) {
  return (
    <Page insets={insets}>
      <Text style={[styles.eyebrow, { color: p.mint }]}>BETA</Text>
      <Text style={[styles.h1, { color: p.ink, fontSize: 34, marginTop: 8 }]}>You're in early.</Text>
      <Text style={[styles.body, { color: p.sub, marginTop: 16 }]}>
        Eighty is in beta — new, improving fast, and shaped by the people using it. Everything you
        log stays on your phone: no account, no cloud, no tracking.
      </Text>
      <Text style={[styles.body, { color: p.sub, marginTop: 12 }]}>
        If something feels off, confusing, or missing, say so. Send feedback lives in Settings, one
        tap away — every message gets read.
      </Text>

      <View style={{ flex: 1 }} />
      <Pressable
        onPress={onStart}
        style={({ pressed }) => [styles.cta, { backgroundColor: p.mint, opacity: pressed ? 0.85 : 1 }]}
      >
        <Text style={{ color: p.onAccent, fontWeight: '800', fontSize: 16 }}>Start my 80</Text>
      </Pressable>
      <Pressable onPress={onLook} style={styles.ghost}>
        <Text style={{ color: p.sub, fontWeight: '600', fontSize: 13.5 }}>Just look around first</Text>
      </Pressable>
    </Page>
  );
}

const styles = StyleSheet.create({
  skip: { position: 'absolute', right: 20, zIndex: 10, padding: 6 },
  h1: { fontFamily: SERIF, fontSize: 38, fontWeight: '600', letterSpacing: -0.5, lineHeight: 44 },
  h2: { fontFamily: SERIF, fontSize: 27, fontWeight: '600', letterSpacing: -0.4, lineHeight: 32 },
  eyebrow: { fontSize: 11, fontWeight: '800', letterSpacing: 2 },
  trip: { fontFamily: SERIF, fontSize: 44, fontWeight: '700', letterSpacing: -2, minWidth: 84 },
  body: { fontSize: 15, lineHeight: 23 },
  mark: { width: 18, height: 18, borderRadius: 9, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dots: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  dot: { width: 6, height: 6, borderRadius: 3 },
  next: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: radius.pill,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  cta: { borderRadius: radius.pill, paddingVertical: 15, alignItems: 'center' },
  ghost: { paddingVertical: 12, alignItems: 'center' },
});
