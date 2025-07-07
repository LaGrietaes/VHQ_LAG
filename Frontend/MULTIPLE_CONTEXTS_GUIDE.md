# Multiple Contexts Guide

## Overview

The VHQ_LAG agent chat system now supports multiple context files simultaneously. This allows you to provide agents with information from multiple sources, making conversations more comprehensive and contextually rich.

## How to Use Multiple Contexts

### 1. Adding Contexts

1. **Open the chat drawer** by clicking the chat icon in the bottom-right corner
2. **Select your agents** from the left sidebar
3. **Click "@ Add Context"** in the chat header
4. **Browse and select projects/files**:
   - Navigate through your projects (books, scripts, blogs)
   - Click on a project to browse its files
   - Select specific files or entire projects as context
5. **Add multiple contexts** by repeating the selection process

### 2. Managing Contexts

- **View selected contexts**: All selected contexts appear as tags above the message input
- **Remove individual contexts**: Click the "X" button on any context tag
- **Clear all contexts**: Click the "Limpiar" (Clear) button
- **Context persistence**: Selected contexts are saved in localStorage and persist between sessions

### 3. Context Display

Each context is displayed as a tag showing:
- Project title
- File name (if a specific file was selected)
- Remove button

Example: `My Book - chapter1.md`

## Technical Implementation

### Frontend Changes

- **Context Selection**: The `ContextFinder` component supports adding multiple contexts
- **State Management**: `selectedContexts` is an array of `ProjectContext[]`
- **API Requests**: All contexts are sent to agents as `contexts` array

### Backend Changes

- **Ghost Agent API**: Updated to handle `contexts` array instead of single `context`
- **CEO Agent API**: Updated to handle `contexts` array
- **Context Processing**: Each context is fetched and combined with clear separators

### API Format

```typescript
// Request format
{
  message: "Your message",
  contexts: [
    {
      path: "project/path",
      specificFile: "optional/specific/file.md"
    },
    {
      path: "another/project/path"
    }
  ]
}
```

## Context Processing

When multiple contexts are provided:

1. **Individual Fetching**: Each context is fetched from the context API
2. **Content Combination**: All contexts are combined with clear separators
3. **Agent Processing**: Agents receive all context content in a structured format

### Context Format

```
=== CONTEXT: filename1.md ===

[Content of first context]

=== END CONTEXT ===

=== CONTEXT: filename2.md ===

[Content of second context]

=== END CONTEXT ===
```

## Benefits

1. **Comprehensive Information**: Agents can access multiple sources simultaneously
2. **Cross-Reference Capability**: Agents can compare and relate information from different files
3. **Flexible Workflows**: Users can combine project files, documentation, and other resources
4. **Better Responses**: More context leads to more accurate and helpful responses

## Examples

### Example 1: Writing with Multiple Sources
- Context 1: Book outline
- Context 2: Research notes
- Context 3: Style guide
- Result: Agent can write content using all three sources

### Example 2: Project Analysis
- Context 1: Project requirements
- Context 2: Technical specifications
- Context 3: User feedback
- Result: Agent can provide comprehensive project analysis

### Example 3: Content Review
- Context 1: Original content
- Context 2: Brand guidelines
- Context 3: Target audience profile
- Result: Agent can review content against multiple criteria

## Testing

Use the test file `test-multiple-contexts.html` to verify functionality:

1. **Single Context Test**: Verifies backward compatibility
2. **Multiple Contexts Test**: Tests multiple context handling
3. **No Contexts Test**: Verifies behavior without contexts

## Troubleshooting

### Common Issues

1. **Context not loading**: Check file paths and permissions
2. **Agent not responding**: Verify context format and API endpoints
3. **Performance issues**: Large context files may slow down responses

### Debug Tips

1. Check browser console for API errors
2. Verify context file paths are correct
3. Test with smaller context files first
4. Use the test page to isolate issues

## Future Enhancements

- [ ] Context prioritization
- [ ] Context search and filtering
- [ ] Context versioning
- [ ] Context templates
- [ ] Real-time context updates 