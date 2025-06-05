import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  Platform,
} from 'react-native';
import Modal from 'react-native-modal';
import { Ionicons } from '@expo/vector-icons';

const TaskModal = ({ visible, task, projectId, onSave, onDelete, onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    complexity_level: 1,
    start_date: '',
    deadline: '',
    estimated_hours: 1,
  });

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        complexity_level: task.complexity_level || 1,
        start_date: task.start_date || '',
        deadline: task.deadline || '',
        estimated_hours: task.estimated_hours || 1,
      });
    } else {
      setFormData({
        title: '',
        description: '',
        complexity_level: 1,
        start_date: '',
        deadline: '',
        estimated_hours: 1,
      });
    }
  }, [task, visible]);

  const handleSave = () => {
    if (!formData.title.trim()) {
      Alert.alert('Error', 'Please enter a task title');
      return;
    }

    onSave(formData);
  };

  const handleDelete = () => {
    if (!task) return;

    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => onDelete(task.id) },
      ]
    );
  };

  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  const getComplexityColor = (level) => {
    switch (level) {
      case 1: return '#4CAF50';
      case 2: return '#FF9800';
      case 3: return '#F44336';
      case 4: return '#9C27B0';
      default: return '#757575';
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

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onClose}
      onSwipeComplete={onClose}
      swipeDirection="down"
      style={styles.modal}
      propagateSwipe
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>
            {task ? 'Edit Task' : 'Create Task'}
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.field}>
            <Text style={styles.label}>Title *</Text>
            <TextInput
              style={styles.input}
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
              placeholder="Enter task title"
              multiline
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              placeholder="Enter task description"
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Complexity Level</Text>
            <View style={styles.complexityContainer}>
              {[1, 2, 3, 4].map((level) => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.complexityButton,
                    {
                      backgroundColor: formData.complexity_level === level
                        ? getComplexityColor(level)
                        : '#F5F5F5'
                    }
                  ]}
                  onPress={() => setFormData({ ...formData, complexity_level: level })}
                >
                  <Text style={[
                    styles.complexityButtonText,
                    {
                      color: formData.complexity_level === level ? '#FFFFFF' : '#666'
                    }
                  ]}>
                    {getComplexityText(level)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Estimated Hours</Text>
            <View style={styles.hoursContainer}>
              <TouchableOpacity
                style={styles.hoursButton}
                onPress={() => setFormData({
                  ...formData,
                  estimated_hours: Math.max(1, formData.estimated_hours - 1)
                })}
              >
                <Ionicons name="remove" size={20} color="#666" />
              </TouchableOpacity>
              <Text style={styles.hoursText}>{formData.estimated_hours}h</Text>
              <TouchableOpacity
                style={styles.hoursButton}
                onPress={() => setFormData({
                  ...formData,
                  estimated_hours: formData.estimated_hours + 1
                })}
              >
                <Ionicons name="add" size={20} color="#666" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Start Date</Text>
            <TextInput
              style={styles.input}
              value={formData.start_date}
              onChangeText={(text) => setFormData({ ...formData, start_date: text })}
              placeholder="YYYY-MM-DD"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Deadline</Text>
            <TextInput
              style={styles.input}
              value={formData.deadline}
              onChangeText={(text) => setFormData({ ...formData, deadline: text })}
              placeholder="YYYY-MM-DD"
            />
          </View>
        </ScrollView>

        <View style={styles.footer}>
          {task && (
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDelete}
            >
              <Ionicons name="trash-outline" size={20} color="#FFFFFF" />
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          )}
          
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSave}
            >
              <Text style={styles.saveButtonText}>
                {task ? 'Update' : 'Create'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#FAFAFA',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  complexityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  complexityButton: {
    flex: 1,
    paddingVertical: 12,
    marginHorizontal: 4,
    borderRadius: 8,
    alignItems: 'center',
  },
  complexityButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  hoursContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingVertical: 8,
  },
  hoursButton: {
    padding: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    marginHorizontal: 16,
  },
  hoursText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    minWidth: 40,
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F44336',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    marginRight: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    marginLeft: 8,
    borderRadius: 8,
    backgroundColor: '#2196F3',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default TaskModal; 