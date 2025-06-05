const { v4: uuidv4 } = require('uuid');

// Mock AI service for generating subtasks
const taskTemplates = {
  'web development': [
    { title: 'Setup project structure', complexity: 2, hours: 2 },
    { title: 'Design database schema', complexity: 3, hours: 3 },
    { title: 'Create API endpoints', complexity: 4, hours: 6 },
    { title: 'Build frontend components', complexity: 4, hours: 8 },
    { title: 'Implement authentication', complexity: 3, hours: 4 },
    { title: 'Testing and debugging', complexity: 2, hours: 4 },
    { title: 'Deploy to production', complexity: 2, hours: 2 }
  ],
  'mobile app': [
    { title: 'Setup React Native project', complexity: 2, hours: 2 },
    { title: 'Design app navigation', complexity: 3, hours: 3 },
    { title: 'Create core screens', complexity: 4, hours: 8 },
    { title: 'Implement state management', complexity: 3, hours: 4 },
    { title: 'Add API integration', complexity: 3, hours: 4 },
    { title: 'Test on devices', complexity: 2, hours: 3 },
    { title: 'Prepare for app store', complexity: 2, hours: 2 }
  ],
  'marketing campaign': [
    { title: 'Market research', complexity: 2, hours: 4 },
    { title: 'Define target audience', complexity: 2, hours: 2 },
    { title: 'Create content strategy', complexity: 3, hours: 4 },
    { title: 'Design marketing materials', complexity: 3, hours: 6 },
    { title: 'Launch campaign', complexity: 2, hours: 2 },
    { title: 'Monitor and optimize', complexity: 2, hours: 3 },
    { title: 'Analyze results', complexity: 2, hours: 2 }
  ],
  'default': [
    { title: 'Research and planning', complexity: 2, hours: 3 },
    { title: 'Initial setup', complexity: 2, hours: 2 },
    { title: 'Core implementation', complexity: 4, hours: 6 },
    { title: 'Testing and refinement', complexity: 3, hours: 4 },
    { title: 'Final review', complexity: 2, hours: 2 }
  ]
};

const generateSubtasks = (projectName, projectDescription) => {
  const description = (projectDescription || projectName || '').toLowerCase();
  
  let template = taskTemplates.default;
  
  // Simple keyword matching to select appropriate template
  if (description.includes('web') || description.includes('website') || description.includes('api')) {
    template = taskTemplates['web development'];
  } else if (description.includes('mobile') || description.includes('app') || description.includes('react native')) {
    template = taskTemplates['mobile app'];
  } else if (description.includes('marketing') || description.includes('campaign') || description.includes('promotion')) {
    template = taskTemplates['marketing campaign'];
  }
  
  // Generate tasks with unique IDs and some variation
  return template.map((task, index) => ({
    id: uuidv4(),
    title: task.title,
    description: `Auto-generated subtask for: ${projectName}`,
    complexity_level: task.complexity,
    estimated_hours: task.hours,
    status: 'backlog',
    position: index
  }));
};

const scheduleTasksInCalendar = (tasks, startDate, endDate, unavailableBlocks = []) => {
  const scheduledBlocks = [];
  const workingHours = { start: 9, end: 17 }; // 9 AM to 5 PM
  const workingDays = [1, 2, 3, 4, 5]; // Monday to Friday
  
  let currentDate = new Date(startDate);
  const finalDate = new Date(endDate);
  let currentHour = workingHours.start;
  
  for (const task of tasks) {
    let hoursRemaining = task.estimated_hours;
    
    while (hoursRemaining > 0 && currentDate <= finalDate) {
      // Skip weekends
      if (!workingDays.includes(currentDate.getDay())) {
        currentDate.setDate(currentDate.getDate() + 1);
        currentHour = workingHours.start;
        continue;
      }
      
      // Check if current time slot is available
      const dateStr = currentDate.toISOString().split('T')[0];
      const timeSlot = `${currentHour.toString().padStart(2, '0')}:00`;
      
      const isUnavailable = unavailableBlocks.some(block => 
        block.date === dateStr && 
        block.start_time <= timeSlot && 
        block.end_time > timeSlot
      );
      
      if (!isUnavailable) {
        const blockDuration = Math.min(hoursRemaining, 1); // 1-hour blocks
        const endHour = currentHour + blockDuration;
        
        scheduledBlocks.push({
          id: uuidv4(),
          task_id: task.id,
          date: dateStr,
          start_time: `${currentHour.toString().padStart(2, '0')}:00`,
          end_time: `${endHour.toString().padStart(2, '0')}:00`,
          is_available: true,
          block_type: 'task'
        });
        
        hoursRemaining -= blockDuration;
      }
      
      currentHour++;
      
      // Move to next day if we've reached end of working hours
      if (currentHour >= workingHours.end) {
        currentDate.setDate(currentDate.getDate() + 1);
        currentHour = workingHours.start;
      }
    }
  }
  
  return scheduledBlocks;
};

module.exports = {
  generateSubtasks,
  scheduleTasksInCalendar
}; 