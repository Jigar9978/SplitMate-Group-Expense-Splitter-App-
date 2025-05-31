import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';


const GroupDetailScreen = ({ route }: any) => {
  const { group } = route.params;
  const [currentGroup, setCurrentGroup] = useState(group);

  const [showModal, setShowModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState('');
  const [description, setDescription] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);

  const saveGroup = async (updatedGroup: any) => {
    try {
      const groupsJSON = await AsyncStorage.getItem('groups');
      let groups = groupsJSON ? JSON.parse(groupsJSON) : [];
      const updatedGroups = groups.map((g: any) =>
        g.id === updatedGroup.id ? updatedGroup : g
      );
      await AsyncStorage.setItem('groups', JSON.stringify(updatedGroups));
      setCurrentGroup(updatedGroup);
    } catch (error) {
      console.error('Failed to save expense:', error);
    }
  };

  const openAddModal = () => {
    setIsEditing(false);
    setPaidBy('');
    setAmount('');
    setDescription('');
    setShowModal(true);
  };

  const openEditModal = (expense: any) => {
    setIsEditing(true);
    setEditingExpenseId(expense.id);
    setPaidBy(expense.paidBy);
    setAmount(expense.amount.toString());
    setDescription(expense.description);
    setShowModal(true);
  };

  const handleSaveExpense = () => {
    if (!amount || !paidBy || !description) {
      Alert.alert('Please fill all fields');
      return;
    }

    if (!currentGroup.members.includes(paidBy)) {
      Alert.alert('Paid By should be one of the group members.');
      return;
    }

    let updatedExpenses;
    if (isEditing && editingExpenseId) {
      updatedExpenses = currentGroup.expenses.map((exp: any) =>
        exp.id === editingExpenseId
          ? { ...exp, amount: parseFloat(amount), paidBy, description }
          : exp
      );
    } else {
      const newExpense = {
        id: (currentGroup.expenses?.length + 1).toString(),
        paidBy,
        amount: parseFloat(amount),
        description,
      };
      updatedExpenses = [...(currentGroup.expenses || []), newExpense];
    }

    const updatedGroup = {
      ...currentGroup,
      expenses: updatedExpenses,
    };

    saveGroup(updatedGroup);
    setAmount('');
    setPaidBy('');
    setDescription('');
    setEditingExpenseId(null);
    setShowModal(false);
  };

  const deleteExpense = (id: string) => {
    Alert.alert('Delete Expense', 'Are you sure?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          const updatedExpenses = currentGroup.expenses.filter((exp: any) => exp.id !== id);
          const updatedGroup = {
            ...currentGroup,
            expenses: updatedExpenses,
          };
          saveGroup(updatedGroup); 
        },
      },
    ]);
  };

  const calculateSettlements = (members: string[], expenses: any[]) => {
    const paidMap: Record<string, number> = {};
    members.forEach((member) => {
      paidMap[member] = 0;
    });

    expenses.forEach((expense) => {
      if (paidMap.hasOwnProperty(expense.paidBy)) {
        paidMap[expense.paidBy] += parseFloat(expense.amount);
      }
    });

    const total = Object.values(paidMap).reduce((a, b) => a + b, 0);
    const share = members.length > 0 ? total / members.length : 0;

    const balances = members.map((member) => ({
      name: member,
      balance: paidMap[member] - share,
    }));

    const debtors = balances.filter((p) => p.balance < 0).map((p) => ({ ...p, balance: -p.balance }));
    const creditors = balances.filter((p) => p.balance > 0);

    const settlements: string[] = [];

    let i = 0, j = 0;
    while (i < debtors.length && j < creditors.length) {
      const debtor = debtors[i];
      const creditor = creditors[j];
      const minAmount = Math.min(debtor.balance, creditor.balance);

      settlements.push(`${debtor.name} will give ₹${minAmount.toFixed(2)} to ${creditor.name}`);
      debtor.balance -= minAmount;
      creditor.balance -= minAmount;

      if (debtor.balance === 0) i++;
      if (creditor.balance === 0) j++;
    }

    return settlements;
  };

  const settlements = useMemo(() => {
    return currentGroup ? calculateSettlements(currentGroup.members, currentGroup.expenses || []) : [];
  }, [currentGroup]);

  if (!currentGroup) {
    return (
      <View style={styles.centered}>
        <Text style={{ fontSize: 18, color: '#666' }}>No group data found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.groupName}>{currentGroup.name}</Text>

      <Text style={styles.sectionTitle}>Expenses</Text>
      {currentGroup.expenses?.length > 0 ? (
        <FlatList
          data={currentGroup.expenses}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.expenseItem}>
              <Text style={styles.expenseText}>
                {item.paidBy} paid ₹{item.amount} for {item.description}
              </Text>
              <View style={styles.actionRow}>
                <TouchableOpacity onPress={() => openEditModal(item)}>
                  <Text style={styles.editText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deleteExpense(item.id)}>
                  <Text style={styles.deleteText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      ) : (
        <Text style={{ fontSize: 16, color: '#888' }}>No expenses yet.</Text>
      )}

      <TouchableOpacity style={styles.addExpenseBtn} onPress={openAddModal}>
        <Text style={{ color: '#fff' }}>+ Add Expense</Text>
      </TouchableOpacity>

      <Modal visible={showModal} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>{isEditing ? 'Edit Expense' : 'Add Expense'}</Text>

          <Text style={{ fontSize: 16, marginBottom: 5 }}>Paid By</Text>
<View style={styles.pickerContainer}>
  <Picker
    selectedValue={paidBy}
    onValueChange={(itemValue) => setPaidBy(itemValue)}
  >
    <Picker.Item label="Select member" value="" />
    {currentGroup.members.map((member: string) => (
      <Picker.Item label={member} value={member} key={member} />
    ))}
  </Picker>
</View>

          <TextInput
            placeholder="Amount"
            style={styles.input}
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
          />
          <TextInput
            placeholder="Description"
            style={styles.input}
            value={description}
            onChangeText={setDescription}
          />

          <TouchableOpacity style={styles.addButton} onPress={handleSaveExpense}>
            <Text style={{ color: '#fff' }}>{isEditing ? 'Update' : 'Add'}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setShowModal(false)} style={{ marginTop: 10 }}>
            <Text style={{ color: 'red' }}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <Text style={styles.sectionTitle}>Summary</Text>
      <View style={styles.summaryBox}>
        {settlements.length === 0 ? (
          <Text>All settled up!</Text>
        ) : (
          settlements.map((line, index) => <Text key={index}>• {line}</Text>)
        )}
      </View>
    </View>
  );
};

export default GroupDetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  groupName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#444',
    marginTop: 25,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 4,
  },
  expenseItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  expenseText: {
    fontSize: 16,
    color: '#333',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  editText: {
    color: '#007bff',
    fontWeight: '600',
    marginRight: 15,
  },
  deleteText: {
    color: '#dc3545',
    fontWeight: '600',
  },
  addExpenseBtn: {
    backgroundColor: '#28a745',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  summaryBox: {
    backgroundColor: '#e0f7fa',
    padding: 15,
    borderRadius: 10,
    marginTop: 15,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
    backgroundColor: '#fefefe',
  },
  addButton: {
    backgroundColor: '#007bff',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    marginBottom: 12,
    backgroundColor: '#fefefe',
  },
});

