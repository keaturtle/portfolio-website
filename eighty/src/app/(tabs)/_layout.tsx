import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { usePalette } from '@/theme/tokens';

type IconName = keyof typeof Ionicons.glyphMap;

function TabIcon({
  active,
  inactive,
  focused,
  color,
}: {
  active: IconName;
  inactive: IconName;
  focused: boolean;
  color: string;
}) {
  return <Ionicons name={focused ? active : inactive} size={22} color={color} />;
}

export default function TabsLayout() {
  const p = usePalette();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: p.mint,
        tabBarInactiveTintColor: p.sub,
        tabBarStyle: { backgroundColor: p.card, borderTopColor: p.line },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Today',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon active="checkmark-circle" inactive="checkmark-circle-outline" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon active="stats-chart" inactive="stats-chart-outline" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="trends"
        options={{
          title: 'Trends',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon active="trending-up" inactive="trending-up-outline" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="challenges"
        options={{
          title: 'Challenges',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon active="layers" inactive="layers-outline" focused={focused} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
