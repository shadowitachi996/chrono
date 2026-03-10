import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import * as SQLite from 'expo-sqlite';

const DB_NAME = 'goals.db';

interface GoalRecord {
  id: number;
  month: string;
  year: string;
  tenYear: string;
}

export default function Goals() {
  const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null);
  const [loading, setLoading] = useState(true);
  const [goals, setGoals] = useState<GoalRecord | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [tenYear, setTenYear] = useState('');

  useEffect(() => {
    const initDB = async () => {
      try {
        const database = await SQLite.openDatabaseAsync(DB_NAME);
        setDb(database);

        await database.execAsync(`
          CREATE TABLE IF NOT EXISTS goals (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            month TEXT,
            year TEXT,
            tenYear TEXT
          );
        `);

        const result = await database.getAllAsync<GoalRecord>(
          'SELECT * FROM goals ORDER BY id DESC LIMIT 1'
        );

        if (result.length > 0) {
          const data = result[0];
          setGoals(data);
          setMonth(data.month);
          setYear(data.year);
          setTenYear(data.tenYear);
        }
      } catch (error) {
        console.error('Error initializing database:', error);
      } finally {
        setLoading(false);
      }
    };

    initDB();

    return () => {
      // Cleanup handled by expo-sqlite lifecycle, but safe to close if needed
      // Note: In modern expo-sqlite, explicit close in cleanup is often unnecessary 
      // as the database instance is managed, but keeping it for safety if logic changes.
    };
  }, []);

  const handleSave = useCallback(async () => {
    if (!db) return;

    setIsSaving(true);
    try {
      if (goals) {
        // Update existing record
        await db.runAsync(
          `UPDATE goals SET month = ?, year = ?, tenYear = ? WHERE id = ?`,
          [month, year, tenYear, goals.id]
        );
      } else {
        // Insert new record
        await db.runAsync(
          `INSERT INTO goals (month, year, tenYear) VALUES (?, ?, ?)`,
          [month, year, tenYear]
        );
      }

      // Refresh state
      const result = await db.getAllAsync<GoalRecord>(
        'SELECT * FROM goals ORDER BY id DESC LIMIT 1'
      );
      if (result.length > 0) {
        setGoals(result[0]);
      }
    } catch (error) {
      console.error('Error saving goals:', error);
    } finally {
      setIsSaving(false);
    }
  }, [db, goals, month, year, tenYear]);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.header}>Set Your Goals</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Monthly Goal</Text>
          <TextInput
            style={styles.input}
            value={month}
            onChangeText={setMonth}
            placeholder="e.g. Save $500"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Yearly Goal</Text>
          <TextInput
            style={styles.input}
            value={year}
            onChangeText={setYear}
            placeholder="e.g. Save $6,000"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>10-Year Goal</Text>
          <TextInput
            style={styles.input}
            value={tenYear}
            onChangeText={setTenYear}
            placeholder="e.g. Buy a house"
            placeholderTextColor="#999"
            multiline
            numberOfLines={3}
          />
        </View>

        <TouchableOpacity
          style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Save Goals</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 30,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  saveButtonDisabled: {
    backgroundColor: '#888',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});