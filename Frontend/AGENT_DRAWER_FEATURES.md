# Agent Drawer Features

## Overview
The agent drawer (sidebar) has been enhanced with interactive switches that can actually start and stop backend agent processes. The UI is now fully integrated with the agent system in the parent directory.

## Features

### 1. Expandable Sidebar
- **Hover to Expand**: The sidebar automatically expands when you hover over it
- **Collapsed State**: Shows only agent icons when collapsed
- **Expanded State**: Shows agent names and switches when expanded

### 2. Real Agent Control Switches
- **Switch Location**: Switches appear on the right side of each agent when the sidebar is expanded
- **Real Backend Integration**: Switches actually start/stop Python agent processes
- **Visual Feedback**: 
  - Red color when agent is active (running)
  - Gray color when agent is inactive (stopped)
  - Yellow pulsing animation during startup process

### 3. Confirmation Dialog
- **Start Confirmation**: When turning on an agent, a confirmation dialog appears
- **Dialog Content**: Shows agent name and confirmation message
- **Actions**: 
  - "Start" button to launch the agent process
  - "Cancel" button to abort

### 4. Real-time Status Monitoring
- **Backend Status Check**: Fetches real agent status from running processes
- **Automatic Refresh**: Updates status every 30 seconds
- **Loading States**: Shows when status is being refreshed
- **Fallback Mode**: Uses static data if backend is unavailable

### 5. API Integration
- **Status Endpoint**: `/api/agents/status` - Gets real agent status
- **Control Endpoint**: `/api/agents/control` - Starts/stops agents
- **Process Detection**: Checks for Python and Ollama processes
- **State Files**: Reads agent state from backend JSON files

## Technical Implementation

### Backend Integration
- **Process Detection**: Uses `tasklist` to find running Python processes
- **Agent Startup**: Executes `python start_agent.py` in agent directories
- **Directory Mapping**: Maps agent IDs to their folder names
- **Error Handling**: Graceful fallback when backend is unavailable

### API Endpoints

#### GET `/api/agents/status`
Returns the current status of all agents:
```json
{
  "success": true,
  "runningAgents": ["GHOST_AGENT", "CEO_AGENT"],
  "agentStates": {...},
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

#### POST `/api/agents/control`
Starts or stops an agent:
```json
{
  "agentId": "GHOST_AGENT",
  "action": "start" // or "stop"
}
```

### State Management
- **Real-time Updates**: Fetches status from backend API
- **Optimistic Updates**: Updates UI immediately, reverts on error
- **Periodic Refresh**: Automatically refreshes every 30 seconds
- **Loading States**: Shows when operations are in progress

### Error Handling
- **Network Errors**: Falls back to static data
- **Process Errors**: Shows error messages in console
- **Timeout Handling**: Graceful degradation when agents don't respond
- **Retry Logic**: Automatic retry for failed operations

## Usage

1. **Hover over the sidebar** to expand it
2. **Click the switch** next to any agent to toggle its state
3. **Confirm startup** in the dialog that appears
4. **Watch the visual feedback** as the agent starts up
5. **Check the system monitor** to see updated agent counts
6. **Monitor the console** for startup messages and errors

## Visual States

- 🔴 **Active**: Agent is running (red color)
- ⚫ **Inactive**: Agent is stopped (gray color)
- 🟡 **Starting**: Agent is in startup process (yellow with animation)
- 🔵 **Refreshing**: Status is being updated (blue indicator)

## Backend Requirements

### Agent Directory Structure
```
VHQ_LAG/
├── 00_CEO_LAG/
│   ├── start_agent.py
│   └── ...
├── 15_GHOST_LAG/
│   ├── start_agent.py
│   └── ...
└── frontend/
    └── ...
```

### Required Files
- `start_agent.py` in each agent directory
- Python executable in PATH
- Proper permissions to execute Python scripts

### Process Detection
- Checks for `python.exe` processes
- Checks for `ollama.exe` processes
- Reads agent state files from `Agents_Logs/shared_resources/state/agents/`

## Integration

The agent drawer integrates with:
- **Backend Agent Processes**: Real Python agent processes
- **System Monitor**: Shows real-time agent counts
- **Agent Detail Pages**: Individual agent workspaces
- **Dashboard**: Main application dashboard
- **Chat System**: Agent communication interface

## Troubleshooting

### Common Issues
1. **Agents won't start**: Check Python installation and permissions
2. **Status not updating**: Check network connectivity and API endpoints
3. **Process detection fails**: Verify agent startup scripts exist
4. **Permission errors**: Ensure proper file system permissions

### Debug Mode
- Check browser console for API errors
- Monitor network tab for failed requests
- Check backend logs in agent directories
- Use the test script: `node test-api.js`

## Future Enhancements

- **Process Management**: Better process tracking and cleanup
- **Health Checks**: Agent health monitoring and auto-restart
- **Resource Monitoring**: CPU/memory usage per agent
- **Log Integration**: Real-time log viewing in UI
- **Configuration UI**: Agent settings management

## Design Improvements

### Icon Sizing
- Icons are constrained to 20x20px (w-5 h-5) to prevent overflow
- Proper spacing and alignment maintained
- No scrollbar triggered in the sidebar

### Switch Visibility
- Switches have higher z-index (z-10) to ensure visibility
- Always visible when sidebar is expanded, regardless of agent status
- Clear visual distinction between on/off states

### Color Scheme
- **Red accent** for active agents (matches brand colors)
- **Gray** for inactive agents
- **Yellow** for transitional states
- Consistent with overall application theme 