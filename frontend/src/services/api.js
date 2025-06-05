// Use Railway API for both development and production
const API_BASE_URL = 'https://canvascortexapp-production.up.railway.app/api';

class ApiService {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Projects
  async getProjects() {
    return this.request('/projects');
  }

  async getProject(id) {
    return this.request(`/projects/${id}`);
  }

  async createProject(projectData) {
    return this.request('/projects', {
      method: 'POST',
      body: projectData,
    });
  }

  async updateProject(id, projectData) {
    return this.request(`/projects/${id}`, {
      method: 'PUT',
      body: projectData,
    });
  }

  async deleteProject(id) {
    return this.request(`/projects/${id}`, {
      method: 'DELETE',
    });
  }

  // Tasks
  async getTasks(projectId = null, status = null) {
    const params = new URLSearchParams();
    if (projectId) params.append('project_id', projectId);
    if (status) params.append('status', status);
    
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request(`/tasks${query}`);
  }

  async getTask(id) {
    return this.request(`/tasks/${id}`);
  }

  async createTask(taskData) {
    return this.request('/tasks', {
      method: 'POST',
      body: taskData,
    });
  }

  async updateTask(id, taskData) {
    return this.request(`/tasks/${id}`, {
      method: 'PUT',
      body: taskData,
    });
  }

  async updateTaskStatus(id, status, position = 0) {
    return this.request(`/tasks/${id}/status`, {
      method: 'PUT',
      body: { status, position },
    });
  }

  async deleteTask(id) {
    return this.request(`/tasks/${id}`, {
      method: 'DELETE',
    });
  }

  async getKanbanBoard(projectId) {
    return this.request(`/tasks/kanban/${projectId}`);
  }

  // Calendar
  async getCalendarBlocks(startDate, endDate, taskId = null) {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    if (taskId) params.append('task_id', taskId);
    
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request(`/calendar${query}`);
  }

  async getCalendarBlocksForDate(date) {
    return this.request(`/calendar/date/${date}`);
  }

  async createCalendarBlock(blockData) {
    return this.request('/calendar', {
      method: 'POST',
      body: blockData,
    });
  }

  async updateCalendarBlock(id, blockData) {
    return this.request(`/calendar/${id}`, {
      method: 'PUT',
      body: blockData,
    });
  }

  async deleteCalendarBlock(id) {
    return this.request(`/calendar/${id}`, {
      method: 'DELETE',
    });
  }

  async markTimeUnavailable(timeData) {
    return this.request('/calendar/unavailable', {
      method: 'POST',
      body: timeData,
    });
  }

  async getAvailableSlots(startDate, endDate, durationHours = 1) {
    const params = new URLSearchParams({
      start_date: startDate,
      end_date: endDate,
      duration_hours: durationHours.toString(),
    });
    
    return this.request(`/calendar/available?${params.toString()}`);
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }
}

export default new ApiService(); 