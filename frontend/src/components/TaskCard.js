import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const TaskCard = ({ task, onPress, onLongPress, isDragging = false }) => {
  const getComplexityColor = (level) => {
    switch (level) {
      case 1: return '#4CAF50'; // Easy - Green
      case 2: return '#FF9800'; // Medium - Orange
      case 3: return '#F44336'; // Hard - Red
      case 4: return '#9C27B0'; // Very Hard - Purple
      default: return '#757575'; // Unknown - Gray
    }
  };

  const getComplexityText = (level) => {
    switch (level) {
      case 1: return 'Easy';
      case 2: return 'Medium';
      case 3: return 'Hard';
      case 4: return 'Very Hard';
      default: return 'Unknown';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const isOverdue = (deadline) => {
    if (!deadline) return false;
    return new Date(deadline) < new Date();
  };

  return (
    <TouchableOpacity
      style={[
        styles.card,
        isDragging && styles.dragging,
        isOverdue(task.deadline) && styles.overdue
      ]}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={2}>
          {task.title}
        </Text>
        <View style={[
          styles.complexityBadge,
          { backgroundColor: getComplexityColor(task.complexity_level) }
        ]}>
          <Text style={styles.complexityText}>
            {getComplexityText(task.complexity_level)}
          </Text>
        </View>
      </View>

      {task.description && (
        <Text style={styles.description} numberOfLines={3}>
          {task.description}
        </Text>
      )}

      <View style={styles.footer}>
        <View style={styles.dateContainer}>
          {task.start_date && (
            <View style={styles.dateItem}>
              <Ionicons name="play-circle-outline" size={14} color="#666" />
              <Text style={styles.dateText}>
                {formatDate(task.start_date)}
              </Text>
            </View>
          )}
          
          {task.deadline && (
            <View style={styles.dateItem}>
              <Ionicons 
                name="flag-outline" 
                size={14} 
                color={isOverdue(task.deadline) ? '#F44336' : '#666'} 
              />
              <Text style={[
                styles.dateText,
                isOverdue(task.deadline) && styles.overdueText
              ]}>
                {formatDate(task.deadline)}
              </Text>
            </View>
          )}
        </View>

        {task.estimated_hours && (
          <View style={styles.hoursContainer}>
            <Ionicons name="time-outline" size={14} color="#666" />
            <Text style={styles.hoursText}>
              {task.estimated_hours}h
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginVertical: 4,
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#E0E0E0',
  },
  dragging: {
    opacity: 0.8,
    transform: [{ scale: 1.05 }],
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  overdue: {
    borderLeftColor: '#F44336',
    backgroundColor: '#FFEBEE',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  complexityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
    minWidth: 50,
    alignItems: 'center',
  },
  complexityText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateContainer: {
    flex: 1,
  },
  dateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  dateText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  overdueText: {
    color: '#F44336',
    fontWeight: '500',
  },
  hoursContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  hoursText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 2,
    fontWeight: '500',
  },
});

export default TaskCard; 