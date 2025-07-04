# 👻 GHOST_LAG - Complete Implementation Guide

> **Status:** 🟡 PARTIALLY IMPLEMENTED  
> **Version:** 1.0.0  
> **Last Updated:** January 2025  
> **Priority:** HIGH

## 📋 Overview

This guide provides a comprehensive roadmap for completing the GHOST_LAG agent implementation. The Ghost Agent is designed to be an AI-powered writing assistant that manages long-form content creation including books, scripts, blog posts, and eBooks.

## 🎯 Current Implementation Status

### ✅ **Completed Components**

#### Frontend (Web Interface)
- **File Management System**: Full CRUD operations for files/folders
- **Project Structure Scanning**: Automatic project discovery and organization
- **Manifest System**: UUID-based file tracking with `.ghost_manifest.json`
- **BookWorkspace UI**: Complete editing interface with outline view
- **Drag & Drop**: Reordering of outline items
- **File Operations**: Create, rename, delete files and folders
- **Reveal in Explorer**: Cross-platform file system integration
- **Template System**: Basic content templates for chapters
- **Import/Export**: File and folder import functionality

#### Backend (API Layer)
- **Project Structure API**: `/api/projects/structure` - Project scanning
- **File Operations APIs**: 
  - `/api/workspace/addItem` - Create files/folders
  - `/api/workspace/renameItem` - Rename items
  - `/api/workspace/updateItemContent` - Save file content
  - `/api/workspace/revealInExplorer` - System integration
- **Manifest Management**: Automatic UUID tracking and persistence

#### File System Integration
- **Cross-Platform Support**: Windows, macOS, Linux file operations
- **Project Workspace**: `GHOST_Proyectos/` directory structure
- **File Persistence**: Real file system operations with manifest tracking

### 🟡 **Partially Implemented**

#### Python Agent Core (`ghost_agent.py`)
- **Basic Structure**: Agent class with initialization
- **Configuration System**: JSON-based configuration
- **Logging Framework**: Structured logging to `Agents_Logs/`
- **Writing Engine**: Skeleton implementation with OpenAI integration
- **Project Manager**: Basic project creation logic

#### Frontend AI Features
- **UI Placeholders**: AI dropdown menu with placeholder options
- **Template Selection**: Basic template application system

### ❌ **Missing/Incomplete Components**

#### Critical Missing Features
1. **AI Content Generation**: No actual AI writing implementation
2. **Content Persistence**: Save functionality incomplete
3. **Inter-Agent Communication**: No integration with PSICO_LAG/SEO_LAG
4. **Context Panel**: Empty right sidebar
5. **Advanced Templates**: No custom template management
6. **Project Linking**: Incomplete cross-project references
7. **Drag & Drop Persistence**: Changes not saved to backend

## 🚀 Implementation Roadmap

### Phase 1: Core AI Integration (Week 1-2)
**Priority: CRITICAL**

#### 1.1 Complete Content Persistence
```typescript
// Missing API endpoint
POST /api/workspace/updateItemContent
{
  "projectRootPath": "GHOST_Proyectos/libros/MyBook",
  "itemId": "uuid-here",
  "content": "Updated file content..."
}
```

#### 1.2 AI Content Generation API
```typescript
// New API endpoint needed
POST /api/ai/generate-content
{
  "prompt": "Write about...",
  "contentType": "chapter|blog|script",
  "length": 1000,
  "style": "professional|casual|academic"
}
```

#### 1.3 Python Agent AI Integration
- Connect `WritingEngine` to OpenAI/Ollama
- Implement content generation methods
- Add style guide integration from `GHOST_Reglas.md`

### Phase 2: Advanced Features (Week 3-4)
**Priority: HIGH**

#### 2.1 Context Panel Population
- Project metadata display
- Related files/chapters
- AI suggestions and insights
- Writing statistics and progress

#### 2.2 Template Management System
```typescript
// New API endpoints
GET /api/templates
POST /api/templates
PUT /api/templates/:id
DELETE /api/templates/:id
```

#### 2.3 Inter-Agent Communication
- Integration with PSICO_LAG for emotional analysis
- SEO_LAG integration for optimization
- CEO_LAG reporting and coordination

### Phase 3: Polish & Optimization (Week 5-6)
**Priority: MEDIUM**

#### 3.1 Advanced UI Features
- Real-time collaboration
- Version history
- Advanced search and filtering
- Export to multiple formats

#### 3.2 Performance Optimization
- Lazy loading for large projects
- Caching strategies
- Background processing

## 🛠 Technical Implementation Details

### 1. Content Persistence Implementation

#### Backend API Route
```typescript
// frontend/src/app/api/workspace/updateItemContent/route.ts
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
    try {
        const { projectRootPath, itemId, content } = await req.json();
        
        // Get manifest and resolve file path
        const manifest = getProjectManifest(projectFullPath);
        const filePath = path.join(projectFullPath, manifest[itemId]);
        
        // Save content to file
        await fs.promises.writeFile(filePath, content, 'utf-8');
        
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
```

#### Frontend Integration
```typescript
// Already implemented in BookWorkspace.tsx
const handleSave = async () => {
    const response = await fetch('/api/workspace/updateItemContent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            projectRootPath: project.path,
            itemId: activeItemId,
            content: content,
        }),
    });
    // Handle response...
};
```

### 2. AI Content Generation

#### Python Agent Integration
```python
# 15_GHOST_LAG/ghost_agent.py - Enhanced WritingEngine
class WritingEngine:
    async def generate_content(self, prompt: str, content_type: str, length: int) -> Dict:
        """Generate AI content using OpenAI/Ollama"""
        
        # Load style guide
        style_rules = self._load_style_guide()
        
        # Construct enhanced prompt
        enhanced_prompt = self._build_prompt(prompt, content_type, style_rules)
        
        # Generate content
        if self.config.get("use_openai", True):
            content = await self._generate_openai_content(enhanced_prompt, length)
        else:
            content = await self._generate_ollama_content(enhanced_prompt, length)
        
        # Post-process and analyze
        return await self._post_process_content(content, content_type)
```

#### API Endpoint
```typescript
// frontend/src/app/api/ai/generate-content/route.ts
export async function POST(req: NextRequest) {
    try {
        const { prompt, contentType, length, style } = await req.json();
        
        // Call Python agent
        const pythonResponse = await fetch('http://localhost:8000/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt, contentType, length, style })
        });
        
        const result = await pythonResponse.json();
        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
```

### 3. Context Panel Implementation

```typescript
// frontend/src/components/ghost/ContextPanel.tsx
export const ContextPanel = ({ project, activeItem }: ContextPanelProps) => {
    return (
        <div className="w-1/4 border-l border-gray-800 bg-gray-900/50">
            <div className="p-4 space-y-4">
                {/* Project Info */}
                <ProjectInfoWidget project={project} />
                
                {/* File Statistics */}
                <FileStatsWidget item={activeItem} />
                
                {/* AI Suggestions */}
                <AISuggestionsWidget content={activeItem?.content} />
                
                {/* Related Files */}
                <RelatedFilesWidget project={project} activeItem={activeItem} />
                
                {/* Writing Progress */}
                <ProgressWidget project={project} />
            </div>
        </div>
    );
};
```

## 📊 Agent Data Configuration

### Update Agent Status
```typescript
// frontend/src/lib/agents-data.tsx
{
    id: "GHOST_AGENT",
    name: "Ghost",
    role: "Content Writer", // Updated role
    status: "OPERATIONAL", // Change from INACTIVE
    performance: 96,
    tasksCompleted: 130,
    currentTasks: 3,
    description: "AI-powered writing assistant for long-form content creation.",
    icon: <Ghost />,
    priority: 1,
    capabilities: [
        "content_generation", 
        "project_management", 
        "ai_writing", 
        "template_management",
        "cross_platform_integration"
    ],
    uptime: "24h 0m",
    metrics: {
        words_written: 50000,
        projects_active: 5,
        ai_accuracy: 0.94,
        last_generation: "2 minutes ago"
    }
}
```

## 🔗 Inter-Agent Integration

### PSICO_LAG Integration
```python
# Emotional analysis integration
async def analyze_emotional_impact(content: str) -> Dict:
    """Send content to PSICO_LAG for emotional analysis"""
    response = await self.session.post(
        "http://localhost:8003/analyze-emotion",
        json={"content": content, "type": "writing"}
    )
    return await response.json()
```

### SEO_LAG Integration
```python
# SEO optimization integration
async def optimize_for_seo(content: str, target_keywords: List[str]) -> Dict:
    """Send content to SEO_LAG for optimization"""
    response = await self.session.post(
        "http://localhost:8001/optimize-content",
        json={"content": content, "keywords": target_keywords}
    )
    return await response.json()
```

## 📁 File Structure Updates

### Required New Files
```
15_GHOST_LAG/
├── ai_service.py              # NEW: AI content generation service
├── inter_agent_comm.py        # NEW: Communication with other agents
├── template_manager.py        # NEW: Template management system
└── content_analyzer.py        # NEW: Content analysis and metrics

frontend/src/app/api/
├── ai/
│   ├── generate-content/      # NEW: AI generation endpoint
│   ├── analyze-content/       # NEW: Content analysis
│   └── suggest-improvements/  # NEW: AI suggestions
├── templates/                 # NEW: Template management APIs
└── projects/
    └── link/                  # NEW: Project linking functionality

frontend/src/components/ghost/
├── ContextPanel.tsx           # NEW: Right sidebar context
├── TemplateManager.tsx        # NEW: Template management UI
├── AIAssistant.tsx           # NEW: AI interaction component
└── widgets/                   # NEW: Context panel widgets
    ├── ProjectInfoWidget.tsx
    ├── FileStatsWidget.tsx
    ├── AISuggestionsWidget.tsx
    └── ProgressWidget.tsx
```

## 🧪 Testing Strategy

### Unit Tests
```bash
# Python agent tests
cd 15_GHOST_LAG
python -m pytest tests/

# Frontend component tests
cd frontend
npm run test
```

### Integration Tests
```bash
# Test AI generation pipeline
python test_ai_pipeline.py

# Test file operations
npm run test:integration
```

### Manual Testing Checklist
- [ ] Create new book project
- [ ] Add chapters and files
- [ ] Generate AI content
- [ ] Save and persist content
- [ ] Test cross-platform file operations
- [ ] Verify manifest consistency
- [ ] Test template application
- [ ] Validate inter-agent communication

## 🚨 Critical Issues to Address

### 1. Content Persistence Bug
**Issue**: `handleSave` in BookWorkspace doesn't actually save to filesystem
**Fix**: Implement `/api/workspace/updateItemContent` endpoint

### 2. AI Integration Missing
**Issue**: No actual AI content generation
**Fix**: Complete Python agent AI service integration

### 3. Agent Status Inconsistency
**Issue**: Ghost Agent shows as "INACTIVE" but has working UI
**Fix**: Update agent status and implement health checks

### 4. Template Management
**Issue**: Templates are hardcoded in component
**Fix**: Implement database/file-based template system

## 📈 Success Metrics

### Technical KPIs
- [ ] 100% file operations working
- [ ] AI response time < 5 seconds
- [ ] Zero data loss during operations
- [ ] Cross-platform compatibility verified

### User Experience KPIs
- [ ] Intuitive project creation workflow
- [ ] Seamless AI content integration
- [ ] Responsive UI performance
- [ ] Reliable auto-save functionality

### Business KPIs
- [ ] 1 complete book project per month
- [ ] 10+ blog posts per week capability
- [ ] 90%+ content quality score
- [ ] Integration with 3+ other agents

## 🎯 Next Immediate Actions

### Week 1 Priority Tasks
1. **Fix Content Persistence** - Implement save functionality
2. **AI Integration** - Connect to OpenAI/Ollama for content generation
3. **Agent Status Update** - Mark Ghost Agent as operational
4. **Basic Context Panel** - Implement right sidebar with project info

### Week 2 Priority Tasks
1. **Template Management** - Dynamic template system
2. **Inter-Agent Communication** - Basic PSICO_LAG integration
3. **Advanced AI Features** - Implement suggestion dropdown actions
4. **Testing Framework** - Comprehensive test suite

## 🤝 Team Coordination

### Dependencies
- **CEO_LAG**: Project approval and coordination
- **PSICO_LAG**: Emotional analysis integration
- **SEO_LAG**: Content optimization
- **DONNA_LAG**: Scheduling and quality control

### Communication Protocol
- Daily progress updates to CEO_LAG
- Weekly integration testing with PSICO_LAG/SEO_LAG
- Monthly performance reviews and optimization

---

## 📞 Support & Maintenance

### Documentation Updates
- Update this guide as features are completed
- Maintain API documentation
- Keep user guides current

### Monitoring & Alerts
- Agent health checks
- Performance monitoring
- Error tracking and resolution

### Backup & Recovery
- Daily project backups
- Configuration versioning
- Disaster recovery procedures

---

**🎯 Goal**: Transform Ghost Agent from partially implemented to fully operational AI writing assistant within 6 weeks.**

**📊 Success Definition**: Capable of generating high-quality, long-form content with full project management, AI assistance, and inter-agent coordination.** 