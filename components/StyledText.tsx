import { Text, StyleSheet } from 'react-native';

export function MonoText(props: Text['props']) {
  return <Text {...props} style={StyleSheet.flatten([props.style, { fontFamily: 'SpaceMono' }])} />;
}
