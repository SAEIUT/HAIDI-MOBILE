import { Stack } from "expo-router";
import React from 'react';
import { PhotoProvider } from '../components/Photos/PhotoContext2'; // Importez le fournisseur de contexte

export default function RootLayout() {
  return (
    <PhotoProvider>
      <Stack>
        {/* Page principale */}
        <Stack.Screen name="index" options={{ headerShown: false }} />

        {/* Groupe des onglets */}
        <Stack.Screen name="(TabBar)" options={{ headerShown: false }} />

        <Stack.Screen name="cgu" options={{ headerShown: false }}
      />
      </Stack>
    </PhotoProvider>
  );
}