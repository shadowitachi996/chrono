import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
} from 'react-native';

// --- Configuration & Constants ---

const WEEKS_IN_YEAR = 52;
const DAYS_IN_WEEK = 7;
const CELL_SIZE = 16;
const CELL_GAP = 4;

// Color Palette
const COLORS = {
  background: '#0d1117', // GitHub Dark Dimmed
  gridBackground: '#161b22',
  text: '#8b949e',
  textActive: '#c9d1d9',
  // Streak Colors
  level0: '#161b22', // Empty
  level1: '#0e4429', // 3:00 AM (Bright Green - Darker for contrast)
  level2: '#006d32', // 3:00 AM (Bright Green - Standard)
  level3: '#d29922', // 5:00 AM (Orange)
  level4: '#d73a49', // 6:00 AM (Red)
};

// --- Types ---

type StreakLevel = 0 | 1 | 2 | 3 | 4;

interface StreakData {
  date: string; // ISO Date string YYYY-MM-DD
  level: StreakLevel;
}

// --- Helper Functions ---

/**
 * Generates a mock dataset for the last 52 weeks.
 * In a real app, this would come from an API or local storage.
 */
const generateMockData = (): StreakData[] => {
  const data: StreakData[] = [];
  const today = new Date();
  
  // Go back 52 weeks
  for (let i = 0; i < WEEKS_IN_YEAR * DAYS_IN_WEEK; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    
    // Randomize levels for demo purposes
    // 0 = Empty, 1-2 = Green (3am), 3 = Orange (5am), 4 = Red (6am)
    const rand = Math.random();
    let level: StreakLevel = 0;
    
    if (rand > 0.7) level = 4; // 30% Red
    else if (rand > 0.5) level = 3; // 20% Orange
    else if (rand > 0.2) level = Math.random() > 0.5 ? 2 : 1; // 30% Green
    
    data.push({
      date: d.toISOString().split('T')[0],
      level,
    });
  }
  return data;
};

// --- Components ---

const StreakMap = () => {
  const data = useMemo(() => generateMockData(), []);

  // Calculate grid dimensions
  const rowHeight = CELL_SIZE + CELL_GAP;
  const colWidth = CELL_SIZE + CELL_GAP;
  const totalWidth = colWidth * DAYS_IN_WEEK;
  const totalHeight = rowHeight * WEEKS_IN_YEAR;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Wake Up Streaks</Text>
        <Text style={styles.subtitle}>
          Green: 3:00 AM • Orange: 5:00 AM • Red: 6:00 AM
        </Text>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={[styles.grid, { width: totalWidth, height: totalHeight }]}>
          {data.map((item, index) => {
            const row = Math.floor(index / DAYS_IN_WEEK);
            const col = index % DAYS_IN_WEEK;
            
            // Determine color based on level
            let backgroundColor = COLORS.level0;
            if (item.level === 1 || item.level === 2) backgroundColor = COLORS.level2;
            if (item.level === 3) backgroundColor = COLORS.level3;
            if (item.level === 4) backgroundColor = COLORS.level4;

            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.cell,
                  {
                    backgroundColor,
                    top: row * rowHeight,
                    left: col * colWidth,
                  },
                ]}
                activeOpacity={0.7}
              >
                {/* Tooltip could go here on press */}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: COLORS.level2 }]} />
          <Text style={styles.legendText}>3:00 AM</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: COLORS.level3 }]} />
          <Text style={styles.legendText}>5:00 AM</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: COLORS.level4 }]} />
          <Text style={styles.legendText}>6:00 AM</Text>
        </View>
      </View>
    </View>
  );
};

// --- Styles ---

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textActive,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.text,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  grid: {
    position: 'relative',
    backgroundColor: COLORS.gridBackground,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#30363d',
  },
  cell: {
    position: 'absolute',
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: 2,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 2,
  },
  legendText: {
    fontSize: 10,
    color: COLORS.text,
  },
});

export default StreakMap;