import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import Modal from 'react-native-modal';
import { Ionicons } from '@expo/vector-icons';

const ProjectModal = ({ visible, project, onSave, onDelete, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    start_date: '',
    end_date: '',
  });

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || '',
        description: project.description || '',
        start_date: project.start_date || '',
        end_date: project.end_date || '',
      });
    } else {
      setFormData({
        name: '',
        description: '',
        start_date: '',
        end_date: '',
      });
    }
  }, [project, visible]);

  const handleSave = () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter a project name');
      return;
    }

    onSave(formData);
  };

  const handleDelete = () => {
    if (!project) return;

    Alert.alert(
      'Delete Project',
      'Are you sure you want to delete this project? This will also delete all associated tasks.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => onDelete(project.id) },
      ]
    );
  };

  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  const getNextWeekDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date.toISOString().split('T')[0];
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
            {project ? 'Edit Project' : 'Create Project'}
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.field}>
            <Text style={styles.label}>Project Name *</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              placeholder="Enter project name"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              placeholder="Describe your project (this helps AI generate better tasks)"
              multiline
              numberOfLines={4}
            />
            <Text style={styles.hint}>
              💡 Tip: Mention the type of project (web app, mobile app, marketing campaign, etc.) 
              for better AI task suggestions
            </Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Start Date</Text>
            <TextInput
              style={styles.input}
              value={formData.start_date}
              onChangeText={(text) => setFormData({ ...formData, start_date: text })}
              placeholder="YYYY-MM-DD"
            />
            <TouchableOpacity
              style={styles.quickDateButton}
              onPress={() => setFormData({ ...formData, start_date: getTodayDate() })}
            >
              <Text style={styles.quickDateText}>Use Today</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>End Date</Text>
            <TextInput
              style={styles.input}
              value={formData.end_date}
              onChangeText={(text) => setFormData({ ...formData, end_date: text })}
              placeholder="YYYY-MM-DD"
            />
            <TouchableOpacity
              style={styles.quickDateButton}
              onPress={() => setFormData({ ...formData, end_date: getNextWeekDate() })}
            >
              <Text style={styles.quickDateText}>Next Week</Text>
            </TouchableOpacity>
          </View>

          {!project && (
            <View style={styles.aiInfo}>
              <Ionicons name="bulb-outline" size={20} color="#FF9800" />
              <Text style={styles.aiInfoText}>
                AI will automatically generate tasks and schedule them based on your project details
              </Text>
            </View>
          )}
        </ScrollView>

        <View style={styles.footer}>
          {project && (
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
                {project ? 'Update' : 'Create & Generate Tasks'}
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
  hint: {
    fontSize: 12,
    color: '#666',
    marginTop: 6,
    fontStyle: 'italic',
    lineHeight: 16,
  },
  quickDateButton: {
    alignSelf: 'flex-start',
    marginTop: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#E3F2FD',
    borderRadius: 16,
  },
  quickDateText: {
    fontSize: 12,
    color: '#1976D2',
    fontWeight: '500',
  },
  aiInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  aiInfoText: {
    fontSize: 14,
    color: '#F57C00',
    marginLeft: 8,
    flex: 1,
    lineHeight: 18,
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

export default ProjectModal; 