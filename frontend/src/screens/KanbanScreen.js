import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import KanbanColumn from '../components/KanbanColumn';
import TaskModal from '../components/TaskModal';

const KANBAN_COLUMNS = [
  { key: 'backlog', title: 'Backlog' },
  { key: 'planned', title: 'Planned' },
  { key: 'next_up', title: 'Next Up' },
  { key: 'in_progress', title: 'In Progress' },
  { key: 'done', title: 'Done' },
  { key: 'archive', title: 'Archive' },
];

const KanbanScreen = ({ navigation }) => {
  const { state, actions } = useApp();
  const [selectedTask, setSelectedTask] = useState(null);
  const [isTaskModalVisible, setIsTaskModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const currentProject = state.currentProject;
  const kanbanData = currentProject ? state.tasks[currentProject.id] || {} : {};

  useEffect(() => {
    if (currentProject) {
      loadKanbanData();
    }
  }, [currentProject]);

  const loadKanbanData = async () => {
    if (!currentProject) return;
    
    try {
      await actions.loadKanbanBoard(currentProject.id);
    } catch (error) {
      Alert.alert('Error', 'Failed to load kanban board');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadKanbanData();
    setRefreshing(false);
  };

  const handleTaskPress = (task) => {
    setSelectedTask(task);
    setIsTaskModalVisible(true);
  };

  const handleTaskMove = async (tasks, newStatus, newPosition) => {
    const task = tasks[newPosition];
    if (!task) return;

    try {
      await actions.updateTaskStatus(task.id, newStatus, newPosition);
    } catch (error) {
      Alert.alert('Error', 'Failed to move task');
    }
  };

  const handleCreateTask = () => {
    if (!currentProject) {
      Alert.alert('No Project', 'Please select a project first');
      return;
    }
    setSelectedTask(null);
    setIsTaskModalVisible(true);
  };

  const handleTaskSave = async (taskData) => {
    try {
      if (selectedTask) {
        // Update existing task
        await actions.updateTask(selectedTask.id, taskData);
      } else {
        // Create new task
        await actions.createTask({
          ...taskData,
          project_id: currentProject.id,
        });
      }
      setIsTaskModalVisible(false);
      setSelectedTask(null);
    } catch (error) {
      Alert.alert('Error', 'Failed to save task');
    }
  };

  const handleTaskDelete = async (taskId) => {
    try {
      await actions.deleteTask(taskId, currentProject.id);
      setIsTaskModalVisible(false);
      setSelectedTask(null);
    } catch (error) {
      Alert.alert('Error', 'Failed to delete task');
    }
  };

  if (!currentProject) {
    return (
      <View style={styles.noProjectContainer}>
        <Ionicons name="folder-open-outline" size={64} color="#CCC" />
        <Text style={styles.noProjectText}>No project selected</Text>
        <Text style={styles.noProjectSubtext}>
          Please select a project to view the Kanban board
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
        <View style={styles.headerLeft}>
          <Text style={styles.projectTitle}>{currentProject.name}</Text>
          <Text style={styles.projectSubtitle}>Kanban Board</Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleCreateTask}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {KANBAN_COLUMNS.map((column) => (
          <KanbanColumn
            key={column.key}
            title={column.title}
            status={column.key}
            tasks={kanbanData[column.key] || []}
            onTaskPress={handleTaskPress}
            onTaskMove={handleTaskMove}
          />
        ))}
      </ScrollView>

      <TaskModal
        visible={isTaskModalVisible}
        task={selectedTask}
        projectId={currentProject.id}
        onSave={handleTaskSave}
        onDelete={handleTaskDelete}
        onClose={() => {
          setIsTaskModalVisible(false);
          setSelectedTask(null);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerLeft: {
    flex: 1,
  },
  projectTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  projectSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  addButton: {
    backgroundColor: '#2196F3',
    borderRadius: 24,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  scrollContent: {
    paddingVertical: 20,
    paddingHorizontal: 12,
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

export default KanbanScreen; 