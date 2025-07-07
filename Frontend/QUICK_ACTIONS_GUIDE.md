# Quick Actions Guide - Book Workspace System

## 🚀 How to Use Quick Actions Effectively

### **Current Issues & Solutions**

#### 1. **Delete Functionality Fixed** ✅
- **Issue**: Items couldn't be deleted due to path resolution problems
- **Solution**: Fixed the delete function to use proper file paths
- **Status**: ✅ Working now

#### 2. **Quick Actions Not Creating Content** 🔧
- **Issue**: AI agent wasn't properly parsing FILE_OPERATION format due to JSON formatting issues
- **Solution**: Enhanced JSON parsing to handle triple quotes and malformed JSON
- **Status**: 🔧 Fixed, testing needed

#### 3. **Context Loading** 📚
- **Issue**: Example files weren't being used as context for generation
- **Solution**: The system now properly loads all `.md` files in the project as context
- **Status**: ✅ Working

---

## 📋 **How to Use the System**

### **Step 1: Prepare Your Project**
1. **Create a project** with example files:
   - `01 – BePolite_ Ser educado con la IA.md` (example tip)
   - `101 Tips para Hablar con la IA.md` (tip descriptions)
   - `tip_template.md` (template for new tips)
   - `tips_list.md` (list of available tips)

### **Step 2: Use Quick Actions**
1. **Open your book project** in the workspace
2. **Look for the Quick Actions panel** (should appear automatically)
3. **Select an action**:
   - **"Generar Tip"** - Creates a new tip using the example format
   - **"Generar Capítulo"** - Creates a new chapter
   - **"Generar Contenido"** - Generates general content
   - **"Crear Sección"** - Creates a new section

### **Step 3: Alternative Method - Chat with Agent**
If quick actions don't work, you can:

1. **Open the chat drawer** (chat icon)
2. **Add context files** by dragging them into the chat
3. **Ask the agent directly**:
   ```
   "Crea un nuevo tip para el libro siguiendo el formato del archivo de ejemplo.
   El tip debe ser práctico, útil y bien estructurado.
   Usa el formato === FILE_OPERATION === para crear el archivo.
   
   Contexto del proyecto: Boceto_101_Tips_para_Hablar_con_la_IA
   Tipo de libro: Libro de Tips
   Idioma: both"
   ```

---

## 🔧 **Troubleshooting**

### **Quick Actions Not Working?**
1. **Check the browser console** for errors
2. **Verify project context is loaded** - you should see "Context loaded successfully" in the logs
3. **Try refreshing the project** using the refresh button
4. **Check if the AI agent is running** - look for "GET /api/agents/status 200" in the logs

### **Files Not Being Created?**
1. **Check the AI response** in the browser console
2. **Look for FILE_OPERATION blocks** in the response
3. **Verify the JSON format** is correct
4. **Check file permissions** in the project directory

### **Context Not Loading?**
1. **Verify example files exist** in your project
2. **Check file names** match the expected format
3. **Refresh the project context** using the refresh button
4. **Clear browser cache** and reload

---

## 📁 **Required File Structure**

For a tips book to work properly, you need:

```
Your_Project/
├── 01 – BePolite_ Ser educado con la IA.md    # Example tip
├── 101 Tips para Hablar con la IA.md          # Tip descriptions
├── tip_template.md                            # Template for new tips
├── tips_list.md                               # List of available tips
├── chapter_template.md                        # Chapter template
└── README.md                                  # Project description
```

---

## 🎯 **Best Practices**

### **For Quick Actions:**
1. **Always have example files** in your project
2. **Use descriptive file names** that match the expected format
3. **Keep templates simple and clear**
4. **Test with one action at a time**

### **For Chat with Agent:**
1. **Be specific** about what you want to create
2. **Reference existing files** in your prompt
3. **Use the FILE_OPERATION format** in your request
4. **Provide clear context** about your project

### **For File Management:**
1. **Use the refresh button** after creating files
2. **Check the file structure** regularly
3. **Backup important files** before making changes
4. **Use descriptive names** for all files

---

## 🔍 **Debugging Information**

### **Check These Logs:**
1. **Browser Console** - Look for:
   - `Context loaded successfully`
   - `Quick action completed`
   - `FILE_OPERATION` blocks
   - Any error messages

2. **Network Tab** - Check:
   - `/api/projects/context/enhanced` - Should return 200
   - `/api/ai/ghost-agent` - Should return 200
   - `/api/unified-file-operations` - Should return 200

3. **Terminal/Server Logs** - Look for:
   - `=== ENHANCED CONTEXT API ===`
   - `=== GHOST AGENT: Processing request ===`
   - `=== SEARCHING FOR FILE OPERATIONS ===`

---

## 🚨 **Common Issues & Solutions**

| Issue | Cause | Solution |
|-------|-------|----------|
| "Item not found" when deleting | Wrong file path | ✅ Fixed - now uses correct path |
| Quick actions not creating files | JSON parsing errors | ✅ Fixed - enhanced JSON parsing |
| Context not loading | Missing example files | Add required template files |
| AI not responding | Ollama not running | Start Ollama server |
| Files created but not visible | Cache not refreshed | Click refresh button |

---

## 📞 **Getting Help**

If you're still having issues:

1. **Check the browser console** for specific error messages
2. **Verify all required files** are present in your project
3. **Try the chat method** instead of quick actions
4. **Restart the development server** if needed
5. **Check that Ollama is running** and accessible

---

## 🎉 **Success Indicators**

You'll know the system is working when you see:

✅ **Context loaded successfully** in the logs  
✅ **Quick action completed** messages  
✅ **Files being created** in your project  
✅ **FILE_OPERATION blocks** in AI responses  
✅ **No error messages** in the console  

---

*Last updated: January 2025* 