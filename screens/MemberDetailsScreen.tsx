import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useStore } from '../store/store';

const MemberDetailsScreen = () => {
  const route = useRoute();
  const { groupId, memberId } = route.params as { groupId: string; memberId: string };
  const groups = useStore((state) => state.groups);

  const group = groups.find((g) => g.id === groupId);
  const member = group?.members.find((m) => m.id === memberId);

  if (!member) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Member not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{member.name}</Text>
      <Text style={styles.detail}>Expenses: ₹{member.expenses}</Text>
      {/* Add more details here if you have */}
    </View>
  );
};

export default MemberDetailsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  detail: {
    fontSize: 18,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 18,
    color: 'red',
  },
});
