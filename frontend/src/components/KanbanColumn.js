import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import DraggableFlatList from 'react-native-draggable-flatlist';
import TaskCard from './TaskCard';

const KanbanColumn = ({ 
  title, 
  tasks, 
  status, 
  onTaskPress, 
  onTaskMove, 
  backgroundColor = '#F5F5F5' 
}) => {
  const getColumnColor = (status) => {
    switch (status) {
      case 'backlog': return '#E3F2FD';
      case 'planned': return '#FFF3E0';
      case 'next_up': return '#F3E5F5';
      case 'in_progress': return '#E8F5E8';
      case 'done': return '#E0F2F1';
      case 'archive': return '#FAFAFA';
      default: return '#F5F5F5';
    }
  };

  const getColumnHeaderColor = (status) => {
    switch (status) {
      case 'backlog': return '#1976D2';
      case 'planned': return '#F57C00';
      case 'next_up': return '#7B1FA2';
      case 'in_progress': return '#388E3C';
      case 'done': return '#00796B';
      case 'archive': return '#616161';
      default: return '#757575';
    }
  };

  const renderTask = ({ item, drag, isActive }) => (
    <TaskCard
      task={item}
      onPress={() => onTaskPress(item)}
      onLongPress={drag}
      isDragging={isActive}
    />
  );

  const handleDragEnd = ({ data, from, to }) => {
    if (from !== to) {
      onTaskMove(data, status, to);
    }
  };

  return (
    <View style={[styles.column, { backgroundColor: getColumnColor(status) }]}>
      <View style={[styles.header, { backgroundColor: getColumnHeaderColor(status) }]}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{tasks.length}</Text>
        </View>
      </View>
      
      <View style={styles.content}>
        {tasks.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No tasks</Text>
          </View>
        ) : (
          <DraggableFlatList
            data={tasks}
            renderItem={renderTask}
            keyExtractor={(item) => item.id}
            onDragEnd={handleDragEnd}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  column: {
    width: 280,
    marginHorizontal: 8,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
  },
  badge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    minHeight: 400,
    maxHeight: 600,
  },
  listContent: {
    paddingVertical: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
});

export default KanbanColumn; 