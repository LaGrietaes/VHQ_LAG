# Ghost Agent File Creation Guide

## Overview

The Ghost Agent now has the ability to create and write files directly in the workspace. This powerful feature allows the agent to generate content, create documentation, and organize projects automatically based on user requests.

## Capabilities

### ✅ What the Ghost Agent Can Do

1. **Create Files**: Generate new `.md` files with custom content
2. **Create Folders**: Organize content with new directories
3. **Update Files**: Modify existing files with new content
4. **Write Complex Content**: Generate comprehensive documents, guides, and manuals
5. **Organize Projects**: Create structured project hierarchies

### 📁 Supported File Operations

- `create_file`: Create new files with content
- `create_folder`: Create new directories
- `update_file`: Update existing files

## How It Works

### 1. User Request
Users can ask the Ghost Agent to create files in natural language:

```
"Crea un archivo llamado 'guia_escritura.md' con una guía completa sobre escritura"
"Crea una carpeta llamada 'recursos' para organizar el proyecto"
"Actualiza el archivo 'manual.md' con nueva información"
```

### 2. Agent Processing
The Ghost Agent:
1. Understands the request
2. Generates appropriate content
3. Formats file operations using the special syntax
4. Executes the operations automatically

### 3. File Operation Format
The agent uses a structured format to specify file operations:

```
=== FILE_OPERATION ===
{
  "type": "create_file",
  "projectPath": "GHOST_Proyectos/libros/[project_name]",
  "fileName": "filename.md",
  "content": "Complete file content here"
}
=== END_FILE_OPERATION ===
```

### 4. Automatic Execution
The system:
1. Detects file operation blocks in the response
2. Parses the JSON configuration
3. Executes the file operations
4. Returns success/failure status
5. Displays results to the user

## Usage Examples

### Example 1: Create a Simple File
**User Request:**
```
Crea un archivo llamado "notas.md" con el contenido "Estas son mis notas importantes."
```

**Agent Response:**
```
He creado el archivo "notas.md" con el contenido solicitado.

📁 **Operaciones de archivos:**
✅ File created successfully: notas.md
```

### Example 2: Create a Complex Document
**User Request:**
```
Crea un manual completo sobre productividad con secciones sobre gestión del tiempo, organización y herramientas.
```

**Agent Response:**
```
He creado un manual completo sobre productividad con todas las secciones solicitadas.

📁 **Operaciones de archivos:**
✅ File created successfully: manual_productividad.md
```

### Example 3: Create Folder Structure
**User Request:**
```
Crea una carpeta llamada "documentacion" y dentro crea archivos para cada sección del proyecto.
```

**Agent Response:**
```
He creado la estructura de carpetas y archivos solicitada.

📁 **Operaciones de archivos:**
✅ Folder created successfully: documentacion
✅ File created successfully: introduccion.md
✅ File created successfully: instalacion.md
✅ File created successfully: uso.md
```

## File Operation Types

### 1. Create File (`create_file`)
Creates a new file with specified content.

```json
{
  "type": "create_file",
  "projectPath": "GHOST_Proyectos/libros/mi_proyecto",
  "fileName": "archivo.md",
  "content": "Contenido del archivo"
}
```

**Parameters:**
- `projectPath`: Path to the project directory
- `fileName`: Name of the file to create (`.md` extension added automatically)
- `content`: Content to write in the file

### 2. Create Folder (`create_folder`)
Creates a new directory.

```json
{
  "type": "create_folder",
  "projectPath": "GHOST_Proyectos/libros/mi_proyecto",
  "folderName": "nueva_carpeta"
}
```

**Parameters:**
- `projectPath`: Path to the project directory
- `folderName`: Name of the folder to create

### 3. Update File (`update_file`)
Updates an existing file with new content.

```json
{
  "type": "update_file",
  "projectPath": "GHOST_Proyectos/libros/mi_proyecto",
  "fileName": "archivo_existente.md",
  "content": "Nuevo contenido del archivo"
}
```

**Parameters:**
- `projectPath`: Path to the project directory
- `fileName`: Name of the file to update
- `content`: New content for the file

## Project Paths

The Ghost Agent can work with different project types:

- **Books**: `GHOST_Proyectos/libros/[book_name]`
- **Blogs**: `GHOST_Proyectos/blog_posts/[blog_name]`
- **Scripts**: `GHOST_Proyectos/scripts/[script_name]`
- **Ebooks**: `GHOST_Proyectos/ebooks/[ebook_name]`

## Error Handling

The system provides detailed error messages for various scenarios:

- **File Already Exists**: Prevents overwriting existing files
- **Folder Already Exists**: Prevents duplicate folder creation
- **File Not Found**: When trying to update non-existent files
- **Project Not Found**: When the specified project path doesn't exist
- **Permission Errors**: When file system permissions prevent operations

## Best Practices

### 1. Be Specific
Instead of: "Crea un archivo"
Use: "Crea un archivo llamado 'guia_usuarios.md' con una guía completa para usuarios"

### 2. Provide Context
Include relevant information in your request:
```
"Crea un archivo de documentación técnica para el proyecto 'mi_app' que incluya instalación, configuración y uso"
```

### 3. Use Descriptive Names
Choose clear, descriptive file and folder names:
- ✅ `guia_instalacion.md`
- ❌ `doc1.md`

### 4. Request Structure
For complex projects, ask for organized structure:
```
"Crea una carpeta 'documentacion' y dentro crea archivos separados para: README, instalacion, configuracion, y ejemplos"
```

## Testing

Use the test file `test-file-creation.html` to verify functionality:

1. **Simple File Creation**: Test basic file creation
2. **Content Creation**: Test files with complex content
3. **Folder Creation**: Test directory creation
4. **File Updates**: Test updating existing files
5. **Complex Projects**: Test multi-file project creation

## Security Considerations

- Files are created only in the `GHOST_Proyectos` directory
- File extensions are automatically added (`.md` for files)
- Existing files are protected from accidental overwrites
- All operations are logged for audit purposes

## Integration with Chat

The file creation feature integrates seamlessly with the chat system:

1. **Multiple Contexts**: Can use context from multiple files to inform content creation
2. **Real-time Feedback**: Users see immediate results of file operations
3. **Error Reporting**: Clear feedback when operations fail
4. **Workspace Integration**: Created files appear in the workspace immediately

## Advanced Features

### 1. Content Generation
The agent can generate various types of content:
- Technical documentation
- User guides and manuals
- Project outlines and structures
- Research notes and summaries
- Creative writing and stories

### 2. Project Organization
Create complete project structures:
```
proyecto/
├── README.md
├── documentacion/
│   ├── instalacion.md
│   ├── configuracion.md
│   └── uso.md
├── ejemplos/
│   ├── ejemplo1.md
│   └── ejemplo2.md
└── recursos/
    └── enlaces.md
```

### 3. Template-Based Creation
The agent can create files based on templates and best practices for different content types.

## Troubleshooting

### Common Issues

1. **File Not Created**: Check if the project path exists
2. **Permission Errors**: Verify file system permissions
3. **Content Not Saved**: Ensure the agent used the correct file operation format
4. **Wrong Location**: Verify the project path is correct

### Debug Tips

1. Check the chat response for file operation results
2. Verify the project exists in the workspace
3. Check file system permissions
4. Use the test page to isolate issues

## Future Enhancements

- [ ] File templates and snippets
- [ ] Batch file operations
- [ ] File versioning and history
- [ ] Advanced content formatting
- [ ] Integration with external tools
- [ ] Real-time collaboration features 