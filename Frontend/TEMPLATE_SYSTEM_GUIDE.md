# Template System Guide

## Overview

The new template system provides a flexible, user-friendly way to manage templates and sample files for book projects. Unlike the previous hardcoded system, this new approach allows users to:

- Create and manage templates dynamically
- Import templates from project directories
- Use templates with variable substitution
- Organize templates by type and category
- Apply templates through an intuitive UI

## Key Features

### 1. Dynamic Template Discovery
The system automatically scans project directories for template files using these patterns:
- `*template*.md`
- `*sample*.md`
- `*example*.md`
- `*guide*.md`
- Files with `.template.` in the name

### 2. Template Types
- **Template**: Reusable content structures
- **Sample**: Example content for reference
- **Example**: Practical demonstrations
- **Guide**: Step-by-step instructions

### 3. Variable Support
Templates support variable substitution using `{variableName}` syntax:
```markdown
# {title}

**Author:** {author}
**Date:** {date}

{content}
```

### 4. Metadata Extraction
The system automatically extracts metadata from:
- Frontmatter (YAML at the top of files)
- Filename patterns
- Directory structure
- Content analysis

## How to Use

### Creating Templates

1. **Create Template Files**
   Create `.md` files in your project directory with template content:

   ```markdown
   ---
   name: Chapter Template
   type: template
   category: chapters
   language: both
   tags: [chapter, structure, content]
   ---

   # {chapterTitle}

   ## Introduction
   {introduction}

   ## {section1Title}
   {section1Content}

   ## {section2Title}
   {section2Content}

   ## Conclusion
   {conclusion}
   ```

2. **Using Variables**
   Define variables in your templates:
   - `{variableName}` - Basic variable substitution
   - `{date}` - Current date
   - `{timestamp}` - Current timestamp
   - `{year}`, `{month}`, `{day}` - Date components

### Managing Templates

1. **Template Manager UI**
   - Access through the BookWorkspace
   - View all available templates
   - Edit template properties
   - Create new templates
   - Delete unused templates

2. **Quick Actions Panel**
   - Use templates directly from the quick actions
   - Fill in variables through a modal
   - Apply templates to current content

3. **Custom Prompts**
   - Write custom prompts for the AI agent
   - Reference templates in prompts
   - Execute complex workflows

### Template Categories

#### Tips Book Templates
- **tip_template.md**: Standard tip structure
- **chapter_template.md**: Chapter outline
- **tips_list.md**: List of available tips

#### Guide Book Templates
- **guide_template.md**: Step-by-step guide structure
- **step_template.md**: Individual step format
- **example_template.md**: Example demonstrations

#### Story Book Templates
- **story_template.md**: Story structure
- **character_template.md**: Character profiles
- **plot_template.md**: Plot development

#### Technical Book Templates
- **technical_template.md**: Technical documentation
- **code_template.md**: Code examples
- **diagram_template.md**: Diagram descriptions

## API Endpoints

### Project Templates
```
GET /api/templates/project?projectPath={path}
```
Scans a project directory for template files and returns structured template data.

### Global Templates
```
GET /api/templates/global
```
Returns globally available templates.

### Template Management
```
POST /api/templates
PUT /api/templates/{id}
DELETE /api/templates/{id}
```
CRUD operations for template management.

## File Structure

### Template File Format
```markdown
---
name: Template Name
nameEn: Template Name (English)
description: Template description
descriptionEn: Template description (English)
type: template|sample|example|guide
category: general|tips|chapters|sections
language: es|en|both
tags: [tag1, tag2, tag3]
---

# Template Content

Use {variables} for dynamic content.

## Section 1
{section1Content}

## Section 2
{section2Content}
```

### Project Directory Structure
```
project/
├── tip_template.md
├── chapter_template.md
├── tips_list.md
├── Capítulos/
│   └── chapter_example.md
├── Secciones/
│   └── section_template.md
└── Ejemplos e Ideas/
    └── sample_tip.md
```

## Best Practices

### 1. Template Naming
- Use descriptive names: `chapter_template.md`, `tip_structure.md`
- Include type in filename: `*_template.md`, `*_sample.md`
- Use consistent naming conventions

### 2. Variable Naming
- Use descriptive variable names: `{chapterTitle}`, `{authorName}`
- Avoid generic names: `{text}`, `{content}`
- Document variables in template description

### 3. Organization
- Group related templates in subdirectories
- Use consistent categories across projects
- Tag templates appropriately for easy discovery

### 4. Content Structure
- Include clear sections and subsections
- Use consistent formatting
- Provide examples where helpful
- Include placeholders for dynamic content

## Integration with AI Agent

### Template-Aware Prompts
The AI agent can now:
- Reference specific templates by name
- Use template variables in generated content
- Apply template structures to new content
- Suggest template improvements

### Example AI Prompts
```
"Create a new tip using the tip_template.md format"
"Generate a chapter following the chapter_template.md structure"
"Apply the guide_template.md to create a tutorial"
```

## Troubleshooting

### Common Issues

1. **Templates Not Loading**
   - Check file naming conventions
   - Verify file permissions
   - Ensure files are in `.md` format

2. **Variables Not Substituting**
   - Check variable syntax: `{variableName}`
   - Ensure variables are provided in the UI
   - Verify template content format

3. **Template Not Found**
   - Check project path configuration
   - Verify template file exists
   - Check template discovery patterns

### Debug Information
- Check browser console for errors
- Review API response logs
- Verify template metadata extraction
- Test variable substitution manually

## Future Enhancements

### Planned Features
- Template versioning and history
- Template sharing between projects
- Advanced variable validation
- Template preview functionality
- Bulk template operations
- Template analytics and usage tracking

### Customization Options
- Custom template discovery patterns
- User-defined template categories
- Template inheritance and composition
- Advanced variable types (arrays, objects)
- Template import/export functionality

## Conclusion

The new template system provides a flexible, powerful foundation for managing book content. By following these guidelines and best practices, users can create efficient, reusable templates that enhance their writing workflow and improve content consistency across projects. 