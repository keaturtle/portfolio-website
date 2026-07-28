import { Component, ReactNode } from 'react';
import { Appearance, Pressable, Text, View } from 'react-native';
import { palettes, radius } from '@/theme/tokens';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/** Root-level fallback so an unexpected throw (e.g. a SQLite failure) shows a
 * recoverable screen instead of a hard crash. */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  render() {
    if (!this.state.error) return this.props.children;
    const p = Appearance.getColorScheme() === 'light' ? palettes.light : palettes.dark;
    return (
      <View style={{ flex: 1, backgroundColor: p.bg, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <Text style={{ fontSize: 22, fontWeight: '800', color: p.ink, textAlign: 'center' }}>
          Something went wrong
        </Text>
        <Text style={{ fontSize: 13.5, color: p.sub, textAlign: 'center', marginTop: 10, lineHeight: 19 }}>
          {this.state.error.message || 'An unexpected error occurred.'}
        </Text>
        <Pressable
          onPress={() => this.setState({ error: null })}
          style={{ marginTop: 24, backgroundColor: p.mint, borderRadius: radius.pill, paddingHorizontal: 26, paddingVertical: 13 }}
        >
          <Text style={{ color: p.onAccent, fontWeight: '800', fontSize: 15 }}>Try again</Text>
        </Pressable>
      </View>
    );
  }
}
