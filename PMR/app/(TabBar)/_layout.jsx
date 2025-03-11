import { Tabs } from "expo-router";
import TabBar from "../../components/TabBar";

export default function TabLayout() {
  return (
    <>
      <Tabs tabBar={(props) => 
        <TabBar {...props} />} screenOptions={{ headerShown: false, }}>
          <Tabs.Screen name="Home"options={{ title: "Accueil", }}/>
          <Tabs.Screen name="Maps" options={{ title: "Carte",}}/>
          <Tabs.Screen name="Trajets" options={{title: "Trajets",}}/>
          <Tabs.Screen name="Settings" options={{ title: "Paramètres", }}/>
        </Tabs>
    </>
  );
}
