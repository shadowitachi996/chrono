import React from 'react';
import { View, Text, StyleSheet, Dimensions, Platform } from 'react-native';

const { width } = Dimensions.get('window');

const Philosophy: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.contentWrapper}>
        <Text style={styles.label}>THE MOTIVATION</Text>
        <Text style={styles.headline}>
          REASON TO WAKE UP
        </Text>
        <Text style={styles.headline}>
          AND WORK
        </Text>
        <View style={styles.divider} />
        <Text style={styles.subtext}>
          Purpose is not found. It is forged in the daily grind.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  contentWrapper: {
    alignItems: 'center',
    maxWidth: width * 0.85,
  },
  label: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: '#FF3B30',
    fontSize: 14,
    letterSpacing: 2,
    marginBottom: 24,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  headline: {
    fontFamily: Platform.OS === 'ios' ? 'HelveticaNeue-Bold' : 'sans-serif',
    color: '#FFFFFF',
    fontSize: 48,
    lineHeight: 52,
    fontWeight: '900',
    letterSpacing: -1.5,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  divider: {
    height: 4,
    width: 60,
    backgroundColor: '#FFFFFF',
    marginVertical: 32,
  },
  subtext: {
    fontFamily: Platform.OS === 'ios' ? 'HelveticaNeue' : 'sans-serif',
    color: '#8E8E93',
    fontSize: 18,
    lineHeight: 28,
    textAlign: 'center',
    fontWeight: '400',
  },
});

export default Philosophy;