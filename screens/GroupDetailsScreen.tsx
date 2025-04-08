import React, { useState, useEffect, useRef } from 'react';
import { ScrollView, View, StyleSheet, Image, Animated, Easing } from 'react-native';
import { Text, TextInput, Button, Card, Divider } from 'react-native-paper';
import { useRoute } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import { useStore } from '../store/store';

// Import your logo
import Logo from '../assets/expensely-logo.png';

export default function GroupDetailsScreen() {
  const route = useRoute();
  const { groupId } = route.params as { groupId: string };
  const group = useStore((state) => state.groups.find((g) => g.id === groupId));

  const addExpense = useStore((state) => state.addExpense);
  const addMember = useStore((state) => state.addMember);

  const [expenseTitle, setExpenseTitle] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [memberName, setMemberName] = useState('');
  const [paidByMemberId, setPaidByMemberId] = useState('');

  // Animated value
  const logoScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(logoScale, {
      toValue: 1,
      useNativeDriver: true,
      friction: 3,
      tension: 40,
    }).start();
  }, []);

  if (!group) {
    return (
      <View style={styles.centered}>
        <Text>Group not found.</Text>
      </View>
    );
  }

  const handleAddExpense = () => {
    if (!expenseTitle.trim() || !expenseAmount.trim() || !paidByMemberId) return;

    const amount = parseFloat(expenseAmount);
    if (isNaN(amount) || amount <= 0) return;

    console.log('Adding expense with details:', { expenseTitle, amount, paidByMemberId });
    addExpense(groupId, expenseTitle.trim(), amount, paidByMemberId);
    setExpenseTitle('');
    setExpenseAmount('');
    setPaidByMemberId('');
  };

  const handleAddMember = () => {
    if (!memberName.trim()) return;
    addMember(groupId, memberName.trim());
    setMemberName('');
  };

  const totalExpenses = group.expenses?.reduce((sum, expense) => sum + (expense.amount || 0), 0) || 0;

  const balances: Record<string, number> = {};
  const members = group.members || [];
  const numMembers = members.length || 1;

  members.forEach((member) => {
    balances[member.id] = 0;
  });

  group.expenses?.forEach((expense) => {
    const amount = expense.amount || 0;
    const share = amount / numMembers;
    members.forEach((member) => {
      if (member.id === expense.paidBy) {
        balances[member.id] += amount - share;
      } else {
        balances[member.id] -= share;
      }
    });
  });

  const balanceMessages: string[] = [];
  const creditors = Object.entries(balances).filter(([_, balance]) => balance > 0);
  const debtors = Object.entries(balances).filter(([_, balance]) => balance < 0);

  let creditorIndex = 0;
  let debtorIndex = 0;

  while (creditorIndex < creditors.length && debtorIndex < debtors.length) {
    const [creditorId, creditorBalance] = creditors[creditorIndex];
    const [debtorId, debtorBalance] = debtors[debtorIndex];

    const settledAmount = Math.min(creditorBalance, -debtorBalance);

    const creditorName = members.find((m) => m.id === creditorId)?.name || 'Unknown';
    const debtorName = members.find((m) => m.id === debtorId)?.name || 'Unknown';

    balanceMessages.push(`${debtorName} owes ${creditorName} ₹${settledAmount.toFixed(2)}`);

    balances[creditorId] -= settledAmount;
    balances[debtorId] += settledAmount;

    if (balances[creditorId] === 0) creditorIndex++;
    if (balances[debtorId] === 0) debtorIndex++;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Animated.Image
        source={Logo}
        style={[
          styles.logo,
          {
            transform: [{ scale: logoScale }],
          },
        ]}
        resizeMode="contain"
      />

      <Text variant="headlineMedium" style={styles.title}>{group.name}</Text>
      <Text>Total Expenses: ₹{totalExpenses.toFixed(2)}</Text>

      <Card style={styles.card}>
        <Card.Title title="Add Member" />
        <Card.Content>
          <TextInput
            label="Member Name"
            value={memberName}
            onChangeText={setMemberName}
            style={styles.input}
          />
          <Button mode="contained" onPress={handleAddMember} style={styles.button}>
            Add Member
          </Button>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Title title="Add Expense" />
        <Card.Content>
          <TextInput
            label="Expense Title"
            value={expenseTitle}
            onChangeText={setExpenseTitle}
            style={styles.input}
          />
          <TextInput
            label="Amount"
            value={expenseAmount}
            onChangeText={setExpenseAmount}
            keyboardType="numeric"
            style={styles.input}
          />
          <Picker
            selectedValue={paidByMemberId}
            onValueChange={(itemValue) => setPaidByMemberId(itemValue)}
            style={styles.input}
          >
            <Picker.Item label="Select Payer" value="" />
            {members.map((member) => (
              <Picker.Item key={member.id} label={member.name} value={member.id} />
            ))}
          </Picker>
          <Button mode="contained" onPress={handleAddExpense} style={styles.button}>
            Add Expense
          </Button>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Title title="Expenses" />
        <Card.Content>
          {group.expenses?.map((expense, index) => (
            <View key={index} style={styles.expenseItem}>
              <Text>{expense.title}: ₹{expense.amount.toFixed(2)} (Paid by {members.find(m => m.id === expense.paidBy)?.name || 'Unknown'})</Text>
              <Divider style={styles.divider} />
            </View>
          ))}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Title title="Balances" />
        <Card.Content>
          {balanceMessages.length === 0 ? (
            <Text>All settled up! 🎉</Text>
          ) : (
            balanceMessages.map((msg, index) => (
              <Text key={index}>{msg}</Text>
            ))
          )}
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  logo: {
    width: 100,
    height: 100,
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    textAlign: 'center',
    marginBottom: 16,
  },
  card: {
    marginBottom: 16,
  },
  input: {
    marginBottom: 8,
  },
  button: {
    marginTop: 8,
  },
  expenseItem: {
    marginBottom: 8,
  },
  divider: {
    marginVertical: 4,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
