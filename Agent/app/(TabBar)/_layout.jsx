import { Tabs } from "expo-router";
import TabBar from "../../components/trajet/TabBar";
export default function TabLayout() {
  return (
    <>
      <Tabs tabBar={(props) => 
        <TabBar {...props} />} screenOptions={{ headerShown: false, }}>
          <Tabs.Screen name="Home"options={{ title: "Accueil", }}/>
          <Tabs.Screen name="Trajet" options={{ title: "Trajet", }}/>
          <Tabs.Screen name="Settings" options={{ title: "Parametres", }}/>
        </Tabs>
    </>
  );
}
