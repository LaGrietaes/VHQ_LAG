# Testing the New Ghost Agent System

## Quick Test Steps

### 1. Open the Project
1. Navigate to the "Boceto_101_Tips_para_Hablar_con_la_IA" project
2. You should see the project structure with files and folders

### 2. Mark Files
1. **Mark Example File:**
   - Find the file "01 – BePolite_ Ser educado con la IA.md" in the "Ejemplos e Ideas" folder
   - Hover over it to see the action icons
   - Click the **blue book icon** (📖) to mark it as example

2. **Mark Ideas File:**
   - Find the file "101 Tips para Hablar con la IA.md" in the "Ejemplos e Ideas" folder
   - Hover over it to see the action icons
   - Click the **yellow lightbulb icon** (💡) to mark it as ideas

### 3. Use Ghost Agent
1. **Open Ghost Agent:**
   - Click the "Mostrar Ghost Agent" button in the left panel
   - You should see the file status indicators showing your marked files

2. **Run Analysis:**
   - Click "Realizar Análisis" in Step 1
   - Wait for the analysis to complete
   - You should see the detected content type and recommendations

3. **Confirm Content Type:**
   - In Step 2, verify the detected content type (should be "Libro de Tips")
   - Click "Confirmar Tipo de Contenido"

4. **Generate Content:**
   - In Step 3, choose "Individual" mode
   - Set quantity to 1
   - Click "Generar Elementos"
   - Wait for generation to complete

### 4. Check Results
1. **Refresh the project** to see the new generated file
2. **Open the generated file** to verify the content
3. **Check the format** - it should match your example file structure

## Expected Behavior

### File Marking
- ✅ Icons appear on hover
- ✅ Clicking marks files with visual indicators
- ✅ Status panel shows marked files
- ✅ Can unmark by clicking again

### Ghost Agent Workflow
- ✅ Step 1: Analysis completes successfully
- ✅ Step 2: Content type is auto-detected
- ✅ Step 3: Content generation works
- ✅ Progress bar shows real-time status
- ✅ Success/error messages are clear

### File Operations
- ✅ Generated files appear in project structure
- ✅ Files follow the example format
- ✅ Content is based on ideas file
- ✅ Files are properly saved

## Troubleshooting

### If files aren't found:
- Check that files are in the "Ejemplos e Ideas" folder
- Verify file names match exactly
- Try refreshing the project

### If analysis fails:
- Ensure both files are marked
- Check that files contain content
- Look at browser console for errors

### If generation fails:
- Check the AI response in the console
- Verify the Ghost Agent API is working
- Try with different parameters

## Debug Information

### Console Logs to Watch For:
```
[GhostAgentPanel] Looking for file: [filename], found path: [fullpath]
[API/unified-file-operations] Request: { action: 'getContent', ... }
[API/unified-file-operations] Operation completed: { success: true/false, ... }
```

### API Endpoints:
- `/api/unified-file-operations` - File operations
- `/api/ai/ghost-agent` - Ghost Agent processing

## Success Indicators

✅ **File marking works** - Icons appear and files are marked
✅ **Analysis completes** - Step 1 shows success message
✅ **Content type detected** - Step 2 shows correct type
✅ **Generation works** - Step 3 creates new files
✅ **Files appear** - New content shows in project structure
✅ **Format matches** - Generated content follows example structure

---

**Ready to test! 🚀** 