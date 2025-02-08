import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';

const categories = [
  { id: 'work', name: 'Work', icon: 'work' },
  { id: 'personal', name: 'Personal', icon: 'person' },
  { id: 'shopping', name: 'Shopping', icon: 'shopping-cart' },
  { id: 'health', name: 'Health', icon: 'favorite' },
];

const priorities = [
  { id: 'low', name: 'Low', color: '#10b981' },
  { id: 'medium', name: 'Medium', color: '#f59e0b' },
  { id: 'high', name: 'High', color: '#ef4444' },
];

export default function AddReminderScreen() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [isLocationBased, setIsLocationBased] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setDate(selectedTime);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Reminder</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <MaterialIcons name="title" size={20} color="#6b7280" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Reminder Title"
            placeholderTextColor="rgba(0, 0, 0, 0.6)"
            value={title}
            onChangeText={setTitle}
          />
        </View>

        <TouchableOpacity 
          style={styles.dateTimeButton}
          onPress={() => setShowDatePicker(true)}
        >
          <View style={styles.dateTimeContent}>
            <MaterialIcons name="calendar-today" size={20} color="#6b7280" />
            <Text style={styles.dateTimeText}>
              {date.toLocaleDateString()}
            </Text>
          </View>
          <MaterialIcons name="arrow-drop-down" size={24} color="#6b7280" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.dateTimeButton}
          onPress={() => setShowTimePicker(true)}
        >
          <View style={styles.dateTimeContent}>
            <MaterialIcons name="access-time" size={20} color="#6b7280" />
            <Text style={styles.dateTimeText}>
              {date.toLocaleTimeString()}
            </Text>
          </View>
          <MaterialIcons name="arrow-drop-down" size={24} color="#6b7280" />
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Category</Text>
        <View style={styles.categoryContainer}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryButton,
                selectedCategory === category.id && styles.selectedCategory,
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <MaterialIcons 
                name ={category.icon} 
                size={20} 
                color={selectedCategory === category.id ? '#fff' : '#6b7280'} 
              />
              <Text 
                style={[
                  styles.categoryText,
                  selectedCategory === category.id && styles.selectedCategoryText,
                ]}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Priority</Text>
        <View style={styles.priorityContainer}>
          {priorities.map((priority) => (
            <TouchableOpacity
              key={priority.id}
              style={[
                styles.priorityButton,
                selectedPriority === priority.id && { backgroundColor: priority.color },
              ]}
              onPress={() => setSelectedPriority(priority.id)}
            >
              <Text 
                style={[
                  styles.priorityText,
                  selectedPriority === priority.id && styles.selectedPriorityText,
                ]}
              >
                {priority.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.switchContainer}>
          <View style={styles.switchRow}>
            <MaterialIcons name="location-on" size={20} color="#6b7280" />
            <Text style={styles.switchLabel}>Location-based Reminder</Text>
            <Switch
              value={isLocationBased}
              onValueChange={setIsLocationBased}
              trackColor={{ false: '#e5e7eb', true: '#818cf8' }}
              thumbColor={isLocationBased ? '#6366f1' : '#fff'}
            />
          </View>

          <View style={styles.switchRow}>
            <MaterialIcons name="repeat" size={20} color="#6b7280" />
            <Text style={styles.switchLabel}>Recurring Reminder</Text>
            <Switch
              value={isRecurring}
              onValueChange={setIsRecurring}
              trackColor={{ false: '#e5e7eb', true: '#818cf8' }}
              thumbColor={isRecurring ? '#6366f1' : '#fff'}
            />
          </View>
        </View>

        <TouchableOpacity 
          style={styles.saveButton}
          onPress={() => {
            // TODO: Save reminder
            router.back();
          }}
        >
          <Text style={styles.saveButtonText}>Save Reminder</Text>
        </TouchableOpacity>
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="spinner"
          onChange={handleDateChange}
        />
      )}

      {showTimePicker && (
        <DateTimePicker
          value={date}
          mode="time"
          display="spinner"
          onChange={handleTimeChange}
        />
      )}
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
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  form: {
    padding: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
  },
  dateTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    height: 56,
    backgroundColor: '#fff',
  },
  dateTimeContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateTimeText: {
    fontSize: 16,
    color: '#1f2937',
    marginLeft: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 20,
    marginBottom: 12,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
  },
  selectedCategory: {
    backgroundColor: '#6366f1',
  },
  categoryText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#6b7280',
  },
  selectedCategoryText: {
    color: '#fff',
  },
  priorityContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  priorityText: {
    fontSize: 14,
    color: '#6b7280',
  },
  selectedPriorityText: {
    color: '#fff',
  },
  switchContainer: {
    marginTop: 24,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  switchLabel: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1f2937',
  },
  saveButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 32,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
}); 