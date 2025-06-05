import React, { createContext, useContext, useReducer, useEffect } from 'react';
import ApiService from '../services/api';

const AppContext = createContext();

const initialState = {
  projects: [],
  currentProject: null,
  tasks: {},
  calendarBlocks: [],
  loading: false,
  error: null,
};

const appReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    
    case 'SET_PROJECTS':
      return { ...state, projects: action.payload };
    
    case 'SET_CURRENT_PROJECT':
      return { ...state, currentProject: action.payload };
    
    case 'ADD_PROJECT':
      return { 
        ...state, 
        projects: [action.payload.project, ...state.projects],
        tasks: {
          ...state.tasks,
          [action.payload.project.id]: action.payload.tasks || []
        }
      };
    
    case 'UPDATE_PROJECT':
      return {
        ...state,
        projects: state.projects.map(p => 
          p.id === action.payload.id ? action.payload : p
        ),
        currentProject: state.currentProject?.id === action.payload.id 
          ? action.payload 
          : state.currentProject
      };
    
    case 'DELETE_PROJECT':
      const { [action.payload]: deletedTasks, ...remainingTasks } = state.tasks;
      return {
        ...state,
        projects: state.projects.filter(p => p.id !== action.payload),
        tasks: remainingTasks,
        currentProject: state.currentProject?.id === action.payload 
          ? null 
          : state.currentProject
      };
    
    case 'SET_TASKS':
      return {
        ...state,
        tasks: {
          ...state.tasks,
          [action.payload.projectId]: action.payload.tasks
        }
      };
    
    case 'SET_KANBAN_BOARD':
      return {
        ...state,
        tasks: {
          ...state.tasks,
          [action.payload.projectId]: action.payload.kanbanBoard
        }
      };
    
    case 'ADD_TASK':
      const projectTasks = state.tasks[action.payload.project_id] || [];
      return {
        ...state,
        tasks: {
          ...state.tasks,
          [action.payload.project_id]: [...projectTasks, action.payload]
        }
      };
    
    case 'UPDATE_TASK':
      const updatedTask = action.payload;
      const currentTasks = state.tasks[updatedTask.project_id] || [];
      return {
        ...state,
        tasks: {
          ...state.tasks,
          [updatedTask.project_id]: currentTasks.map(task =>
            task.id === updatedTask.id ? updatedTask : task
          )
        }
      };
    
    case 'DELETE_TASK':
      const { taskId, projectId } = action.payload;
      const tasksAfterDelete = state.tasks[projectId] || [];
      return {
        ...state,
        tasks: {
          ...state.tasks,
          [projectId]: tasksAfterDelete.filter(task => task.id !== taskId)
        }
      };
    
    case 'SET_CALENDAR_BLOCKS':
      return { ...state, calendarBlocks: action.payload };
    
    case 'ADD_CALENDAR_BLOCK':
      return { 
        ...state, 
        calendarBlocks: [...state.calendarBlocks, action.payload] 
      };
    
    case 'UPDATE_CALENDAR_BLOCK':
      return {
        ...state,
        calendarBlocks: state.calendarBlocks.map(block =>
          block.id === action.payload.id ? action.payload : block
        )
      };
    
    case 'DELETE_CALENDAR_BLOCK':
      return {
        ...state,
        calendarBlocks: state.calendarBlocks.filter(block => 
          block.id !== action.payload
        )
      };
    
    default:
      return state;
  }
};

export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Actions
  const actions = {
    setLoading: (loading) => dispatch({ type: 'SET_LOADING', payload: loading }),
    setError: (error) => dispatch({ type: 'SET_ERROR', payload: error }),

    // Projects
    loadProjects: async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        const projects = await ApiService.getProjects();
        dispatch({ type: 'SET_PROJECTS', payload: projects });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error.message });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    },

    createProject: async (projectData) => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        const result = await ApiService.createProject(projectData);
        dispatch({ type: 'ADD_PROJECT', payload: result });
        return result;
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error.message });
        throw error;
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    },

    updateProject: async (id, projectData) => {
      try {
        await ApiService.updateProject(id, projectData);
        dispatch({ type: 'UPDATE_PROJECT', payload: { id, ...projectData } });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error.message });
        throw error;
      }
    },

    deleteProject: async (id) => {
      try {
        await ApiService.deleteProject(id);
        dispatch({ type: 'DELETE_PROJECT', payload: id });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error.message });
        throw error;
      }
    },

    setCurrentProject: (project) => {
      dispatch({ type: 'SET_CURRENT_PROJECT', payload: project });
    },

    // Tasks
    loadKanbanBoard: async (projectId) => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        const kanbanBoard = await ApiService.getKanbanBoard(projectId);
        dispatch({ 
          type: 'SET_KANBAN_BOARD', 
          payload: { projectId, kanbanBoard } 
        });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error.message });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    },

    createTask: async (taskData) => {
      try {
        const task = await ApiService.createTask(taskData);
        dispatch({ type: 'ADD_TASK', payload: task });
        return task;
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error.message });
        throw error;
      }
    },

    updateTask: async (id, taskData) => {
      try {
        const task = await ApiService.updateTask(id, taskData);
        dispatch({ type: 'UPDATE_TASK', payload: task });
        return task;
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error.message });
        throw error;
      }
    },

    updateTaskStatus: async (id, status, position = 0) => {
      try {
        const task = await ApiService.updateTaskStatus(id, status, position);
        dispatch({ type: 'UPDATE_TASK', payload: task });
        return task;
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error.message });
        throw error;
      }
    },

    deleteTask: async (taskId, projectId) => {
      try {
        await ApiService.deleteTask(taskId);
        dispatch({ type: 'DELETE_TASK', payload: { taskId, projectId } });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error.message });
        throw error;
      }
    },

    // Calendar
    loadCalendarBlocks: async (startDate, endDate) => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        const blocks = await ApiService.getCalendarBlocks(startDate, endDate);
        dispatch({ type: 'SET_CALENDAR_BLOCKS', payload: blocks });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error.message });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    },

    createCalendarBlock: async (blockData) => {
      try {
        const block = await ApiService.createCalendarBlock(blockData);
        dispatch({ type: 'ADD_CALENDAR_BLOCK', payload: block });
        return block;
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error.message });
        throw error;
      }
    },

    clearError: () => dispatch({ type: 'SET_ERROR', payload: null }),
  };

  return (
    <AppContext.Provider value={{ state, actions }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}; 