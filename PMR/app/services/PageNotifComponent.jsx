import { View } from 'react-native';
import React, { useLayoutEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import PageNotif from '../../components/Notification/PageNotif';

export default function PageNotifComponent() {
  const navigation = useNavigation(); 

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  return (
    <View style={{ flex: 1 }}>
      <PageNotif />
    </View>
  );
}
