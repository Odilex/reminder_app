import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react';

const { width } = Dimensions.get('window');

const timelineData = [
  {
    date: '2024-03-20',
    items: [
      {
        id: 1,
        title: 'Team Meeting',
        time: '10:00 AM',
        category: 'Work',
        status: 'completed',
      },
      {
        id: 2,
        title: 'Take Vitamins',
        time: '9:00 AM',
        category: 'Health',
        status: 'missed',
      },
    ],
  },
  {
    date: '2024-03-19',
    items: [
      {
        id: 3,
        title: 'Grocery Shopping',
        time: '4:00 PM',
        category: 'Shopping',
        status: 'completed',
      },
    ],
  },
];

const stats = [
  { title: 'Completed', value: 85, color: '#10b981' },
  { title: 'Missed', value: 15, color: '#ef4444' },
];

const categories = [
  { name: 'Work', count: 45, color: '#6366f1' },
  { name: 'Personal', count: 30, color: '#8b5cf6' },
  { name: 'Shopping', count: 15, color: '#ec4899' },
  { name: 'Health', count: 10, color: '#14b8a6' },
];

export default function MemoryLogScreen() {
  const [selectedFilter, setSelectedFilter] = useState('all');

  const filters = ['all', 'completed', 'missed'];

  const getStatusColor = (status: string) => {
    return status === 'completed' ? '#10b981' : '#ef4444';
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Memory Log</Text>
        <TouchableOpacity style={styles.filterButton}>
          <MaterialIcons name="filter-list" size={24} color="#1f2937" />
        </TouchableOpacity>
      </View>

      <View style={styles.filterContainer}>
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterChip,
              selectedFilter === filter && styles.selectedFilterChip,
            ]}
            onPress={() => setSelectedFilter(filter)}
          >
            <Text
              style={[
                styles.filterText,
                selectedFilter === filter && styles.selectedFilterText,
              ]}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.statsContainer}>
        <Text style={styles.sectionTitle}>Completion Rate</Text>
        <View style={styles.progressBar}>
          {stats.map((stat, index) => (
            <View
              key={index}
              style={[
                styles.progressSegment,
                {
                  backgroundColor: stat.color,
                  width: `${stat.value}%`,
                },
              ]}
            />
          ))}
        </View>
        <View style={styles.statsLegend}>
          {stats.map((stat, index) => (
            <View key={index} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: stat.color }]} />
              <Text style={styles.legendText}>{stat.title}</Text>
              <Text style={styles.legendValue}>{stat.value}%</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.categoriesContainer}>
        <Text style={styles.sectionTitle}>Categories</Text>
        <View style={styles.categoryGrid}>
          {categories.map((category, index) => (
            <View key={index} style={styles.categoryCard}>
              <View style={[styles.categoryIcon, { backgroundColor: category.color }]}>
                <Text style={styles.categoryValue}>{category.count}</Text>
              </View>
              <Text style={styles.categoryName}>{category.name}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.timelineContainer}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        {timelineData.map((day, dayIndex) => (
          <View key={day.date} style={styles.timelineDay}>
            <Text style={styles.timelineDate}>{day.date}</Text>
            {day.items.map((item, itemIndex) => (
              <View 
                key={item.id} 
                style={[
                  styles.timelineItem,
                  itemIndex === day.items.length - 1 && styles.lastTimelineItem,
                ]}
              >
                <View 
                  style={[
                    styles.timelineDot,
                    { backgroundColor: getStatusColor(item.status) },
                  ]} 
                />
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineTitle}>{item.title}</Text>
                  <View style={styles.timelineDetails}>
                    <Text style={styles.timelineTime}>{item.time}</Text>
                    <Text style={styles.timelineCategory}>{item.category}</Text>
                  </View>
                </View>
                <MaterialIcons 
                  name={item.status === 'completed' ? 'check-circle' : 'cancel'} 
                  size={24} 
                  color={getStatusColor(item.status)} 
                />
              </View>
            ))}
          </View>
        ))}
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
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 24,
  },
  filterChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
  },
  selectedFilterChip: {
    backgroundColor: '#6366f1',
  },
  filterText: {
    fontSize: 14,
    color: '#6b7280',
  },
  selectedFilterText: {
    color: '#fff',
  },
  statsContainer: {
    padding: 20,
    backgroundColor: '#f9fafb',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  progressSegment: {
    height: '100%',
  },
  statsLegend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
    color: '#6b7280',
    marginRight: 4,
  },
  legendValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  categoriesContainer: {
    padding: 20,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  categoryCard: {
    width: (width - 56) / 2,
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    alignItems: 'center',
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  categoryName: {
    fontSize: 14,
    color: '#6b7280',
  },
  timelineContainer: {
    padding: 20,
  },
  timelineDay: {
    marginBottom: 24,
  },
  timelineDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 12,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 24,
    position: 'relative',
    marginBottom: 16,
  },
  lastTimelineItem: {
    marginBottom: 0,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    position: 'absolute',
    left: 0,
  },
  timelineContent: {
    flex: 1,
    marginRight: 16,
  },
  timelineTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  timelineDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timelineTime: {
    fontSize: 14,
    color: '#6b7280',
    marginRight: 8,
  },
  timelineCategory: {
    fontSize: 14,
    color: '#6366f1',
  },
}); 