# Kanban Calendar MVP - AI-Powered Productivity App

A React Native + Node.js MVP for an AI-powered Kanban Calendar productivity app that combines task management with intelligent scheduling.

## 🚀 Features

### Frontend (React Native + Expo)
- **Kanban Board**: 6 columns (Backlog → Planned → Next Up → In Progress → Done → Archive)
- **Drag & Drop**: Move tasks between columns with smooth animations
- **Calendar View**: Time-blocking visualization with scheduled tasks
- **AI Chat Interface**: Basic UI shell for future AI interactions
- **Task Management**: Create, edit, and delete tasks with complexity levels
- **Project Management**: Create projects with AI-generated subtasks

### Backend (Node.js + Express)
- **RESTful API**: Complete CRUD operations for projects, tasks, and calendar blocks
- **SQLite Database**: Lightweight database with proper relationships
- **Mock AI Service**: Generates subtasks based on project descriptions
- **Auto-Scheduling**: Distributes tasks across available time slots
- **Calendar Integration**: Respects unavailable time blocks

### Key Features Implemented
✅ Create project → AI generates subtasks  
✅ Set start/end dates → automatically schedule tasks  
✅ Mark tasks complete → auto-move cards to next column  
✅ Respect calendar blocks marked as "unavailable"  
✅ Basic deadline adjustment when tasks are delayed  
✅ Drag-and-drop functionality between Kanban columns  
✅ Calendar integration showing scheduled tasks  
✅ Simple chat UI shell  

## 🛠 Tech Stack

**Frontend:**
- React Native + Expo
- React Navigation (Bottom Tabs)
- React Native Draggable FlatList
- React Native Calendars
- React Context for state management
- React Native Modal

**Backend:**
- Node.js + Express
- SQLite3 database
- CORS enabled
- UUID for unique IDs

## 📦 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)

### 1. Clone and Install Dependencies

```bash
# Install root dependencies
npm install

# Install all dependencies (frontend + backend)
npm run install-all
```

### 2. Start the Backend Server

```bash
# Start the Node.js API server
npm run start-backend
```

The backend will run on `http://localhost:3000`

### 3. Start the Frontend App

```bash
# Start the React Native app
npm run start-frontend
```

### 4. Run Both Simultaneously

```bash
# Run both backend and frontend concurrently
npm run dev
```

## 📱 Running the App

1. **Install Expo Go** on your mobile device
2. **Scan the QR code** displayed in the terminal
3. **Or run on simulator:**
   - iOS: `cd frontend && npm run ios`
   - Android: `cd frontend && npm run android`
   - Web: `cd frontend && npm run web`

## 🗄 Database Schema

The app uses SQLite with three main tables:

### Projects
- `id` (TEXT PRIMARY KEY)
- `name` (TEXT NOT NULL)
- `description` (TEXT)
- `start_date` (TEXT)
- `end_date` (TEXT)
- `created_at` (DATETIME)

### Tasks
- `id` (TEXT PRIMARY KEY)
- `project_id` (TEXT, Foreign Key)
- `title` (TEXT NOT NULL)
- `description` (TEXT)
- `status` (TEXT: backlog, planned, next_up, in_progress, done, archive)
- `complexity_level` (INTEGER: 1-4)
- `start_date` (TEXT)
- `deadline` (TEXT)
- `estimated_hours` (INTEGER)
- `position` (INTEGER)
- `created_at` (DATETIME)

### Calendar Blocks
- `id` (TEXT PRIMARY KEY)
- `task_id` (TEXT, Foreign Key)
- `start_time` (TEXT)
- `end_time` (TEXT)
- `date` (TEXT)
- `is_available` (BOOLEAN)
- `block_type` (TEXT: task, unavailable, free)
- `created_at` (DATETIME)

## 🤖 AI Features (Mock Implementation)

The app includes a mock AI service that:

1. **Generates Subtasks** based on project descriptions:
   - Web Development projects → Setup, Database, API, Frontend, etc.
   - Mobile App projects → React Native setup, Navigation, Screens, etc.
   - Marketing campaigns → Research, Strategy, Content, Launch, etc.

2. **Auto-Schedules Tasks** in calendar:
   - Respects working hours (9 AM - 5 PM)
   - Skips weekends
   - Avoids unavailable time blocks
   - Distributes tasks based on estimated hours

## 📋 API Endpoints

### Projects
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create project (with AI task generation)
- `GET /api/projects/:id` - Get single project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Tasks
- `GET /api/tasks` - Get all tasks (with filters)
- `POST /api/tasks` - Create task
- `GET /api/tasks/:id` - Get single task
- `PUT /api/tasks/:id` - Update task
- `PUT /api/tasks/:id/status` - Update task status (for Kanban)
- `DELETE /api/tasks/:id` - Delete task
- `GET /api/tasks/kanban/:project_id` - Get Kanban board data

### Calendar
- `GET /api/calendar` - Get calendar blocks (with date range)
- `POST /api/calendar` - Create calendar block
- `GET /api/calendar/date/:date` - Get blocks for specific date
- `PUT /api/calendar/:id` - Update calendar block
- `DELETE /api/calendar/:id` - Delete calendar block
- `POST /api/calendar/unavailable` - Mark time as unavailable
- `GET /api/calendar/available` - Get available time slots

## 🎯 Usage Guide

### 1. Create Your First Project
1. Go to **Projects** tab
2. Tap the **+** button
3. Enter project name and description
4. Set start/end dates
5. Tap **"Create & Generate Tasks"**
6. AI will generate relevant subtasks and schedule them

### 2. Manage Tasks with Kanban
1. Select a project from the Projects screen
2. Go to **Kanban** tab
3. Drag tasks between columns
4. Tap tasks to edit details
5. Use **+** button to add custom tasks

### 3. View Schedule in Calendar
1. Go to **Calendar** tab
2. Browse dates to see scheduled tasks
3. Tap dates with dots to see task details
4. View time blocks and availability

### 4. AI Chat (Basic UI)
1. Go to **AI Chat** tab
2. Basic chat interface for future AI features
3. Currently shows mock responses

## 🔧 Customization

### Adding New Task Templates
Edit `backend/aiService.js` to add new project types:

```javascript
const taskTemplates = {
  'your_project_type': [
    { title: 'Task 1', complexity: 2, hours: 3 },
    { title: 'Task 2', complexity: 1, hours: 2 },
    // ... more tasks
  ]
};
```

### Modifying Working Hours
Update the scheduling logic in `backend/aiService.js`:

```javascript
const workingHours = { start: 9, end: 17 }; // 9 AM to 5 PM
const workingDays = [1, 2, 3, 4, 5]; // Monday to Friday
```

## 🚧 Future Enhancements

- **Real AI Integration**: Connect to OpenAI or similar service
- **Advanced Scheduling**: Machine learning for optimal task scheduling
- **Team Collaboration**: Multi-user support and real-time sync
- **Analytics Dashboard**: Productivity insights and reporting
- **Mobile Notifications**: Task reminders and deadline alerts
- **File Attachments**: Add files and images to tasks
- **Time Tracking**: Built-in time tracking for tasks
- **Integration APIs**: Connect with Google Calendar, Slack, etc.

## 🐛 Troubleshooting

### Backend Issues
- Ensure Node.js is installed and updated
- Check if port 3000 is available
- Verify SQLite database permissions

### Frontend Issues
- Clear Expo cache: `expo start -c`
- Restart Metro bundler
- Check network connectivity for API calls

### Common Errors
- **"Network request failed"**: Ensure backend is running on localhost:3000
- **"Module not found"**: Run `npm install` in both frontend and backend directories
- **Drag & drop not working**: Ensure react-native-gesture-handler is properly installed

## 📄 License

MIT License - feel free to use this project as a starting point for your own productivity app!

## 🤝 Contributing

This is an MVP/demo project. Feel free to fork and extend with additional features!

---

**Built with ❤️ using React Native + Node.js** 