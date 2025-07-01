# Ghost Agent Feature TODO List

This document outlines the features in the `BookWorkspace` that are currently incomplete, using mock data, or not yet implemented.

- [ ] **Content Persistence**:
  - [ ] Implement saving the content of an active file. The `handleSave` function currently only updates the local component state. An API endpoint (`/api/workspace/updateItemContent`) needs to be created and called on save.
  - [ ] The save button should probably trigger a call to the backend to persist the file content.

- [ ] **AI-Powered Features**:
  - [ ] Implement "Sugerir Mejoras" functionality.
  - [ ] Implement "Optimizar para SEO" functionality.
  - [ ] Implement "Cambiar Tono" functionality.
  - [ ] These features are currently just placeholders in a dropdown menu. They will require backend AI model integration.

- [ ] **Context Panel**:
  - [ ] The right-hand context panel is currently empty.
  - [ ] It should be populated with relevant contextual information, such as linked projects, research notes, or AI suggestions.

- [ ] **Template Management**:
  - [ ] The `bookTemplates` are hardcoded. A system for users to create, save, and manage their own templates needs to be built.
  - [ ] `saveNewTemplate` only updates the component state. Templates should be saved to a user-specific configuration file or a database.

- [ ] **Project Linking**:
  - [ ] While the `LinkProjectDialog` exists, the full functionality for linking and unlinking projects needs to be verified and potentially completed. This includes showing linked project data in the context panel.

- [ ] **Drag and Drop Persistence**:
  - [ ] After a drag-and-drop operation in the outline, the new structure is only held in the component's state. This change needs to be persisted on the backend by making an API call. A new endpoint like `/api/workspace/moveItem` might be needed.

- [ ] **Import Functionality**:
  - [ ] The import logic for files and folders creates new items in the outline but does not actually copy the files into the project directory on the server. The backend needs to handle receiving the files and creating them. 