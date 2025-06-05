import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

const CalendarScreen = ({ navigation }) => {
  const { state, actions } = useApp();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [calendarBlocks, setCalendarBlocks] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const currentProject = state.currentProject;

  useEffect(() => {
    loadCalendarData();
  }, [selectedDate, currentProject]);

  const loadCalendarData = async () => {
    if (!currentProject) return;

    try {
      const startDate = new Date(selectedDate);
      startDate.setDate(startDate.getDate() - 7); // Load week before
      const endDate = new Date(selectedDate);
      endDate.setDate(endDate.getDate() + 7); // Load week after

      await actions.loadCalendarBlocks(
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      );

      // Filter blocks for selected date
      const blocksForDate = state.calendarBlocks.filter(
        block => block.date === selectedDate
      );
      setCalendarBlocks(blocksForDate);
    } catch (error) {
      console.error('Failed to load calendar data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCalendarData();
    setRefreshing(false);
  };

  const getMarkedDates = () => {
    const marked = {};
    
    // Mark today
    const today = new Date().toISOString().split('T')[0];
    marked[today] = {
      selected: selectedDate === today,
      marked: true,
      dotColor: '#2196F3',
      selectedColor: '#2196F3',
    };

    // Mark dates with tasks
    state.calendarBlocks.forEach(block => {
      if (block.task_id) {
        marked[block.date] = {
          ...marked[block.date],
          marked: true,
          dotColor: '#4CAF50',
          selected: selectedDate === block.date,
          selectedColor: selectedDate === block.date ? '#2196F3' : undefined,
        };
      }
    });

    // Mark selected date
    if (!marked[selectedDate]) {
      marked[selectedDate] = {
        selected: true,
        selectedColor: '#2196F3',
      };
    } else {
      marked[selectedDate].selected = true;
      marked[selectedDate].selectedColor = '#2196F3';
    }

    return marked;
  };

  const renderTimeBlock = (block, index) => {
    const isTask = block.task_id && block.task_title;
    const isUnavailable = !block.is_available;

    return (
      <View
        key={index}
        style={[
          styles.timeBlock,
          isTask && styles.taskBlock,
          isUnavailable && styles.unavailableBlock,
        ]}
      >
        <View style={styles.timeBlockHeader}>
          <Text style={styles.timeText}>
            {block.start_time} - {block.end_time}
          </Text>
          {isTask && (
            <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
          )}
        </View>
        
        {isTask ? (
          <Text style={styles.taskTitle} numberOfLines={2}>
            {block.task_title}
          </Text>
        ) : isUnavailable ? (
          <Text style={styles.unavailableText}>Unavailable</Text>
        ) : (
          <Text style={styles.freeText}>Free time</Text>
        )}
      </View>
    );
  };

  const generateTimeSlots = () => {
    const slots = [];
    const workingHours = { start: 9, end: 17 };

    for (let hour = workingHours.start; hour < workingHours.end; hour++) {
      const timeSlot = `${hour.toString().padStart(2, '0')}:00`;
      const endTimeSlot = `${(hour + 1).toString().padStart(2, '0')}:00`;
      
      // Check if there's a block for this time slot
      const existingBlock = calendarBlocks.find(
        block => block.start_time === timeSlot
      );

      if (existingBlock) {
        slots.push(existingBlock);
      } else {
        // Create a free time slot
        slots.push({
          start_time: timeSlot,
          end_time: endTimeSlot,
          is_available: true,
          block_type: 'free',
        });
      }
    }

    return slots;
  };

  const handleMarkUnavailable = async (startTime, endTime) => {
    try {
      await actions.createCalendarBlock({
        start_time: startTime,
        end_time: endTime,
        date: selectedDate,
        is_available: false,
        block_type: 'unavailable',
      });
      await loadCalendarData();
    } catch (error) {
      Alert.alert('Error', 'Failed to mark time as unavailable');
    }
  };

  if (!currentProject) {
    return (
      <View style={styles.noProjectContainer}>
        <Ionicons name="calendar-outline" size={64} color="#CCC" />
        <Text style={styles.noProjectText}>No project selected</Text>
        <Text style={styles.noProjectSubtext}>
          Please select a project to view the calendar
        </Text>
        <TouchableOpacity
          style={styles.selectProjectButton}
          onPress={() => navigation.navigate('Projects')}
        >
          <Text style={styles.selectProjectButtonText}>Select Project</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Calendar</Text>
        <Text style={styles.headerSubtitle}>{currentProject.name}</Text>
      </View>

      <Calendar
        current={selectedDate}
        onDayPress={(day) => setSelectedDate(day.dateString)}
        markedDates={getMarkedDates()}
        theme={{
          backgroundColor: '#ffffff',
          calendarBackground: '#ffffff',
          textSectionTitleColor: '#b6c1cd',
          selectedDayBackgroundColor: '#2196F3',
          selectedDayTextColor: '#ffffff',
          todayTextColor: '#2196F3',
          dayTextColor: '#2d4150',
          textDisabledColor: '#d9e1e8',
          dotColor: '#00adf5',
          selectedDotColor: '#ffffff',
          arrowColor: '#2196F3',
          disabledArrowColor: '#d9e1e8',
          monthTextColor: '#2d4150',
          indicatorColor: '#2196F3',
          textDayFontWeight: '300',
          textMonthFontWeight: 'bold',
          textDayHeaderFontWeight: '300',
          textDayFontSize: 16,
          textMonthFontSize: 16,
          textDayHeaderFontSize: 13,
        }}
      />

      <View style={styles.dayHeader}>
        <Text style={styles.dayTitle}>
          {new Date(selectedDate).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </Text>
      </View>

      <ScrollView
        style={styles.timeSlots}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {generateTimeSlots().map((slot, index) => renderTimeBlock(slot, index))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  dayHeader: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  dayTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
  },
  timeSlots: {
    flex: 1,
    paddingHorizontal: 20,
  },
  timeBlock: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginVertical: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  taskBlock: {
    borderLeftColor: '#4CAF50',
    backgroundColor: '#F1F8E9',
  },
  unavailableBlock: {
    borderLeftColor: '#F44336',
    backgroundColor: '#FFEBEE',
  },
  timeBlockHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  unavailableText: {
    fontSize: 14,
    color: '#F44336',
    fontStyle: 'italic',
  },
  freeText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
  noProjectContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 40,
  },
  noProjectText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    textAlign: 'center',
  },
  noProjectSubtext: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 22,
  },
  selectProjectButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 24,
  },
  selectProjectButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CalendarScreen; 