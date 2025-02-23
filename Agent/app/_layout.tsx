import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      {/* Page principale */}
      <Stack.Screen name="index" options={{ headerShown: false }} />

      {/* Groupe des onglets */}
      <Stack.Screen name="(TabBar)" options={{ headerShown: false }} />
    </Stack>
  );
}
