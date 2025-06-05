import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import ProjectModal from '../components/ProjectModal';

const ProjectsScreen = ({ navigation }) => {
  const { state, actions } = useApp();
  const [isProjectModalVisible, setIsProjectModalVisible] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      await actions.loadProjects();
    } catch (error) {
      Alert.alert('Error', 'Failed to load projects');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProjects();
    setRefreshing(false);
  };

  const handleCreateProject = () => {
    setSelectedProject(null);
    setIsProjectModalVisible(true);
  };

  const handleEditProject = (project) => {
    setSelectedProject(project);
    setIsProjectModalVisible(true);
  };

  const handleSelectProject = (project) => {
    actions.setCurrentProject(project);
    Alert.alert(
      'Project Selected',
      `${project.name} is now your active project`,
      [
        { text: 'View Kanban', onPress: () => navigation.navigate('Kanban') },
        { text: 'OK', style: 'cancel' },
      ]
    );
  };

  const handleProjectSave = async (projectData) => {
    try {
      if (selectedProject) {
        await actions.updateProject(selectedProject.id, projectData);
      } else {
        await actions.createProject(projectData);
      }
      setIsProjectModalVisible(false);
      setSelectedProject(null);
    } catch (error) {
      Alert.alert('Error', 'Failed to save project');
    }
  };

  const handleProjectDelete = async (projectId) => {
    try {
      await actions.deleteProject(projectId);
      setIsProjectModalVisible(false);
      setSelectedProject(null);
    } catch (error) {
      Alert.alert('Error', 'Failed to delete project');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };

  const renderProject = ({ item }) => {
    const isActive = state.currentProject?.id === item.id;
    const projectTasks = state.tasks[item.id] || {};
    const totalTasks = Object.values(projectTasks).flat().length;

    return (
      <TouchableOpacity
        style={[styles.projectCard, isActive && styles.activeProjectCard]}
        onPress={() => handleSelectProject(item)}
        onLongPress={() => handleEditProject(item)}
      >
        <View style={styles.projectHeader}>
          <View style={styles.projectInfo}>
            <Text style={[styles.projectName, isActive && styles.activeProjectName]}>
              {item.name}
            </Text>
            {isActive && (
              <View style={styles.activeBadge}>
                <Text style={styles.activeBadgeText}>ACTIVE</Text>
              </View>
            )}
          </View>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => handleEditProject(item)}
          >
            <Ionicons name="ellipsis-vertical" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {item.description && (
          <Text style={styles.projectDescription} numberOfLines={2}>
            {item.description}
          </Text>
        )}

        <View style={styles.projectMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="calendar-outline" size={16} color="#666" />
            <Text style={styles.metaText}>
              {formatDate(item.start_date)} - {formatDate(item.end_date)}
            </Text>
          </View>
          
          <View style={styles.metaItem}>
            <Ionicons name="list-outline" size={16} color="#666" />
            <Text style={styles.metaText}>
              {totalTasks} tasks
            </Text>
          </View>
        </View>

        <View style={styles.projectActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              actions.setCurrentProject(item);
              navigation.navigate('Kanban');
            }}
          >
            <Ionicons name="grid-outline" size={16} color="#2196F3" />
            <Text style={styles.actionButtonText}>Kanban</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              actions.setCurrentProject(item);
              navigation.navigate('Calendar');
            }}
          >
            <Ionicons name="calendar-outline" size={16} color="#2196F3" />
            <Text style={styles.actionButtonText}>Calendar</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Projects</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleCreateProject}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {state.projects.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="folder-open-outline" size={64} color="#CCC" />
          <Text style={styles.emptyTitle}>No projects yet</Text>
          <Text style={styles.emptySubtitle}>
            Create your first project to get started with AI-powered task management
          </Text>
          <TouchableOpacity
            style={styles.createFirstButton}
            onPress={handleCreateProject}
          >
            <Text style={styles.createFirstButtonText}>Create Project</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={state.projects}
          renderItem={renderProject}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.projectsList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      <ProjectModal
        visible={isProjectModalVisible}
        project={selectedProject}
        onSave={handleProjectSave}
        onDelete={handleProjectDelete}
        onClose={() => {
          setIsProjectModalVisible(false);
          setSelectedProject(null);
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
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
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
  projectsList: {
    padding: 20,
  },
  projectCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  activeProjectCard: {
    borderWidth: 2,
    borderColor: '#2196F3',
    backgroundColor: '#F3F9FF',
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  projectInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  projectName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
  },
  activeProjectName: {
    color: '#2196F3',
  },
  activeBadge: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  activeBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  editButton: {
    padding: 4,
  },
  projectDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  projectMeta: {
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 6,
  },
  projectActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  actionButtonText: {
    fontSize: 14,
    color: '#2196F3',
    marginLeft: 6,
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 22,
  },
  createFirstButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 24,
  },
  createFirstButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProjectsScreen; 