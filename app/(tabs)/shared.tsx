import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react';

const sharedGroups = [
  {
    id: 1,
    name: 'Family',
    members: [
      { id: 1, name: 'Alex', avatar: null },
      { id: 2, name: 'Sarah', avatar: null },
      { id: 3, name: 'Mom', avatar: null },
    ],
    reminders: [
      {
        id: 1,
        title: 'Family Dinner',
        time: 'Today, 7:00 PM',
        assignedTo: 'Alex',
        status: 'pending',
      },
      {
        id: 2,
        title: 'Grocery Shopping',
        time: 'Tomorrow, 10:00 AM',
        assignedTo: 'Sarah',
        status: 'accepted',
      },
    ],
  },
  {
    id: 2,
    name: 'Work Team',
    members: [
      { id: 1, name: 'Alex', avatar: null },
      { id: 4, name: 'John', avatar: null },
      { id: 5, name: 'Emma', avatar: null },
    ],
    reminders: [
      {
        id: 3,
        title: 'Team Meeting',
        time: 'Today, 2:00 PM',
        assignedTo: 'All',
        status: 'accepted',
      },
    ],
  },
];

export default function SharedScreen() {
  const [selectedGroup, setSelectedGroup] = useState(sharedGroups[0]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return '#10b981';
      case 'pending':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Shared Reminders</Text>
        <TouchableOpacity style={styles.addButton}>
          <MaterialIcons name="group-add" size={24} color="#1f2937" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.groupsContainer}
      >
        {sharedGroups.map((group) => (
          <TouchableOpacity
            key={group.id}
            style={[
              styles.groupCard,
              selectedGroup.id === group.id && styles.selectedGroupCard,
            ]}
            onPress={() => setSelectedGroup(group)}
          >
            <Text 
              style={[
                styles.groupName,
                selectedGroup.id === group.id && styles.selectedGroupName,
              ]}
            >
              {group.name}
            </Text>
            <View style={styles.avatarStack}>
              {group.members.slice(0, 3).map((member, index) => (
                <View
                  key={member.id}
                  style={[
                    styles.avatar,
                    { 
                      zIndex: 3 - index,
                      marginLeft: index > 0 ? -12 : 0,
                    },
                  ]}
                >
                  <Text style={styles.avatarText}>{getInitials(member.name)}</Text>
                </View>
              ))}
              {group.members.length > 3 && (
                <View style={[styles.avatar, { marginLeft: -12, zIndex: 0 }]}>
                  <Text style={styles.avatarText}>+{group.members.length - 3}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.content}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Members</Text>
          <TouchableOpacity style={styles.addMemberButton}>
            <MaterialIcons name="person-add" size={20} color="#6366f1" />
            <Text style={styles.addMemberText}>Add Member</Text>
          </TouchableOpacity>
        </View>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.membersContainer}
        >
          {selectedGroup.members.map((member) => (
            <View key={member.id} style={styles.memberCard}>
              <View style={styles.memberAvatar}>
                <Text style={styles.memberAvatarText}>{getInitials(member.name)}</Text>
              </View>
              <Text style={styles.memberName}>{member.name}</Text>
            </View>
          ))}
        </ScrollView>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Reminders</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        {selectedGroup.reminders.map((reminder) => (
          <TouchableOpacity key={reminder.id} style={styles.reminderCard}>
            <View style={styles.reminderLeft}>
              <View 
                style={[
                  styles.statusDot,
                  { backgroundColor: getStatusColor(reminder.status) },
                ]}
              />
              <View>
                <Text style={styles.reminderTitle}>{reminder.title}</Text>
                <Text style={styles.reminderTime}>{reminder.time}</Text>
              </View>
            </View>
            <View style={styles.reminderRight}>
              <Text style={styles.assignedTo}>
                {reminder.assignedTo}
              </Text>
              <MaterialIcons name="chevron-right" size={24} color="#6b7280" />
            </View>
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={styles.createButton}>
          <MaterialIcons name="add" size={24} color="#fff" />
          <Text style={styles.createButtonText}>Create Shared Reminder</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  groupsContainer: {
    paddingLeft: 20,
    marginBottom: 24,
  },
  groupCard: {
    padding: 16,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    marginRight: 12,
    width: 160,
  },
  selectedGroupCard: {
    backgroundColor: '#6366f1',
  },
  groupName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  selectedGroupName: {
    color: '#fff',
  },
  avatarStack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  avatarText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  addMemberButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addMemberText: {
    fontSize: 14,
    color: '#6366f1',
  },
  membersContainer: {
    marginBottom: 24,
  },
  memberCard: {
    alignItems: 'center',
    marginRight: 16,
  },
  memberAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  memberAvatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  memberName: {
    fontSize: 14,
    color: '#6b7280',
  },
  seeAll: {
    fontSize: 14,
    color: '#6366f1',
  },
  reminderCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    marginBottom: 12,
  },
  reminderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  reminderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  reminderTime: {
    fontSize: 14,
    color: '#6b7280',
  },
  reminderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  assignedTo: {
    fontSize: 14,
    color: '#6366f1',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366f1',
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
}); 