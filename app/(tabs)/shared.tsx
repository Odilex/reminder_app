import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Modal, Image } from 'react-native';
import { Stack } from 'expo-router';
import { useState } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';

type Member = {
  id: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  avatar?: string;
};

type SharedReminder = {
  id: string;
  title: string;
  date: string;
  time: string;
  members: Member[];
  isCompleted: boolean;
};

const mockReminders: SharedReminder[] = [
  {
    id: '1',
    title: 'Team Meeting',
    date: '2024-03-20',
    time: '10:00 AM',
    members: [
      { id: '1', email: 'dan@example.com', role: 'admin' },
      { id: '2', email: 'sarah@example.com', role: 'editor' },
    ],
    isCompleted: false,
  },
  {
    id: '2',
    title: 'Project Review',
    date: '2024-03-21',
    time: '2:00 PM',
    members: [
      { id: '1', email: 'dan@example.com', role: 'admin' },
      { id: '3', email: 'mike@example.com', role: 'viewer' },
    ],
    isCompleted: false,
  },
];

export default function SharedReminders() {
  const [members, setMembers] = useState<Member[]>([]);
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<Member['role']>('editor');
  const [reminders, setReminders] = useState<SharedReminder[]>(mockReminders);
  const [selectedReminder, setSelectedReminder] = useState<SharedReminder | null>(null);

  const handleAddMember = () => {
    if (newMemberEmail) {
      const newMember = {
        id: Date.now().toString(),
        email: newMemberEmail,
        role: newMemberRole,
      };
      
      if (selectedReminder) {
        const updatedReminders = reminders.map(reminder => 
          reminder.id === selectedReminder.id
            ? { ...reminder, members: [...reminder.members, newMember] }
            : reminder
        );
        setReminders(updatedReminders);
      } else {
        setMembers([...members, newMember]);
      }
      
      setNewMemberEmail('');
      setShowAddMember(false);
    }
  };

  const handleRemoveMember = (reminderId: string, memberId: string) => {
    const updatedReminders = reminders.map(reminder =>
      reminder.id === reminderId
        ? {
            ...reminder,
            members: reminder.members.filter(member => member.id !== memberId),
          }
        : reminder
    );
    setReminders(updatedReminders);
  };

  const toggleReminderComplete = (id: string) => {
    setReminders(reminders.map(reminder =>
      reminder.id === id
        ? { ...reminder, isCompleted: !reminder.isCompleted }
        : reminder
    ));
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Shared Reminders' }} />

      <ScrollView style={styles.reminderList}>
        {reminders.map((reminder) => (
          <View key={reminder.id} style={styles.reminderCard}>
          <TouchableOpacity
              style={styles.reminderHeader}
              onPress={() => toggleReminderComplete(reminder.id)}
            >
              <MaterialIcons
                name={reminder.isCompleted ? 'check-circle' : 'radio-button-unchecked'}
                size={24}
                color={reminder.isCompleted ? Colors.success : Colors.gray}
              />
              <View style={styles.reminderInfo}>
                <Text style={[
                  styles.reminderTitle,
                  reminder.isCompleted && styles.completedText
                ]}>
                  {reminder.title}
                </Text>
                <Text style={styles.reminderDateTime}>
                  {reminder.date} at {reminder.time}
                </Text>
              </View>
            </TouchableOpacity>

            <View style={styles.membersContainer}>
              <Text style={styles.membersTitle}>Members:</Text>
              {reminder.members.map((member) => (
                <View key={member.id} style={styles.memberItem}>
                  <View style={styles.memberInfo}>
                    <View style={styles.memberAvatar}>
                      <Text style={styles.memberInitial}>
                        {member.email[0].toUpperCase()}
            </Text>
                    </View>
                    <View style={styles.memberDetails}>
                      <Text style={styles.memberEmail}>{member.email}</Text>
                      <Text style={styles.memberRole}>{member.role}</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleRemoveMember(reminder.id, member.id)}
                    style={styles.removeButton}
                  >
                    <MaterialIcons name="close" size={20} color={Colors.error} />
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity
                style={styles.addMemberButton}
                onPress={() => {
                  setSelectedReminder(reminder);
                  setShowAddMember(true);
                }}
              >
                <MaterialIcons name="person-add" size={20} color={Colors.primary} />
                <Text style={styles.addMemberText}>Add Member</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      <Modal
        visible={showAddMember}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddMember(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Member</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowAddMember(false);
                  setSelectedReminder(null);
                }}
              >
                <MaterialIcons name="close" size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>
            
            <TextInput
              style={styles.input}
              placeholder="Enter email address"
              value={newMemberEmail}
              onChangeText={setNewMemberEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <View style={styles.roleContainer}>
              {(['admin', 'editor', 'viewer'] as const).map((role) => (
                <TouchableOpacity
                  key={role}
                  style={[
                    styles.roleButton,
                    newMemberRole === role && styles.roleButtonActive,
                  ]}
                  onPress={() => setNewMemberRole(role)}
                >
                  <Text
                    style={[
                      styles.roleText,
                      newMemberRole === role && styles.roleTextActive,
                    ]}
                  >
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowAddMember(false);
                  setSelectedReminder(null);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.addMemberButton]}
                onPress={handleAddMember}
              >
                <Text style={styles.addMemberButtonText}>Add</Text>
          </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  reminderList: {
    flex: 1,
    padding: 16,
  },
  reminderCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reminderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  reminderInfo: {
    marginLeft: 12,
    flex: 1,
  },
  reminderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: Colors.gray,
  },
  reminderDateTime: {
    fontSize: 14,
    color: Colors.gray,
  },
  membersContainer: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 12,
  },
  membersTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  memberAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberInitial: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  memberDetails: {
    marginLeft: 12,
  },
  memberEmail: {
    fontSize: 14,
    color: Colors.text,
  },
  memberRole: {
    fontSize: 12,
    color: Colors.gray,
    textTransform: 'capitalize',
  },
  removeButton: {
    padding: 4,
  },
  addMemberButton: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  addMemberText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 20,
    backgroundColor: Colors.white,
    color: Colors.text,
  },
  roleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  roleButton: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  roleButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  roleText: {
    color: Colors.text,
  },
  roleTextActive: {
    color: Colors.white,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  cancelButton: {
    backgroundColor: Colors.gray,
  },
  cancelButtonText: {
    color: Colors.white,
    fontSize: 16,
  },
  addMemberButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  modalButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
}); 