// screens/HomeScreen.tsx
import React, { useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Text, TextInput, Button, Card } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useStore } from '../store/store';

export default function HomeScreen() {
  const navigation = useNavigation();
  const groups = useStore((state) => state.groups);
  const addGroup = useStore((state) => state.addGroup);
  const [groupName, setGroupName] = useState('');

  const handleAddGroup = () => {
    if (!groupName.trim()) return;
    addGroup(groupName.trim());
    setGroupName('');
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.header}>
        💸 Expense Splitter
      </Text>

      <TextInput
        label="Enter Group Name"
        value={groupName}
        onChangeText={setGroupName}
        mode="outlined"
        style={styles.input}
      />
      <Button mode="contained" onPress={handleAddGroup} style={styles.button}>
        ➕ Add Group
      </Button>

      <FlatList
        data={groups}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card
            style={styles.card}
            onPress={() => navigation.navigate('GroupDetails', { groupId: item.id })}
          >
            <Card.Title title={item.name} titleStyle={styles.cardTitle} />
          </Card>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No groups yet. Add one!</Text>}
        contentContainerStyle={groups.length === 0 && styles.emptyContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F9FAFB',
  },
  header: {
    marginBottom: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  input: {
    marginBottom: 10,
  },
  button: {
    marginBottom: 20,
    backgroundColor: '#4F46E5',
  },
  card: {
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
    elevation: 3,
    borderRadius: 12,
  },
  cardTitle: {
    color: '#1E40AF',
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    color: '#6B7280',
    marginTop: 20,
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
});
