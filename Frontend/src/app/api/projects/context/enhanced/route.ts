import { NextRequest, NextResponse } from 'next/server';
import ProjectContextLoader from '@/lib/project-context-loader';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectPath = searchParams.get('projectPath');
    const language = searchParams.get('language') as 'es' | 'en' | 'both' || 'both';

    if (!projectPath) {
      return NextResponse.json(
        { error: 'Project path is required' },
        { status: 400 }
      );
    }

    console.log('=== ENHANCED CONTEXT API ===');
    console.log('Project path:', projectPath);
    console.log('Language:', language);

    const contextLoader = ProjectContextLoader.getInstance();
    const context = await contextLoader.loadProjectContext(projectPath, language);

    console.log('Context loaded successfully');
    console.log('Book type:', context.bookType.name);
    console.log('Available tips:', context.availableTips?.length || 0);
    console.log('Total files:', context.currentStructure.totalFiles);

    return NextResponse.json({
      success: true,
      context: {
        projectPath: context.projectPath,
        projectName: context.projectName,
        bookType: {
          id: context.bookType.id,
          name: context.bookType.name,
          nameEn: context.bookType.nameEn,
          description: context.bookType.description,
          descriptionEn: context.bookType.descriptionEn,
          language: context.bookType.language,
          categories: context.bookType.categories
        },
        structure: context.currentStructure,
        availableTips: context.availableTips,
        language: context.language,
        metadata: context.metadata,
        sampleFiles: Object.keys(context.sampleFiles)
      }
    });

  } catch (error) {
    console.error('Error in enhanced context API:', error);
    return NextResponse.json(
      { 
        error: 'Failed to load project context',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { projectPath, language = 'both', action } = await request.json();

    if (!projectPath) {
      return NextResponse.json(
        { error: 'Project path is required' },
        { status: 400 }
      );
    }

    const contextLoader = ProjectContextLoader.getInstance();

    switch (action) {
      case 'clear_cache':
        contextLoader.clearCache(projectPath);
        return NextResponse.json({
          success: true,
          message: 'Cache cleared successfully'
        });

      case 'get_book_types':
        const bookTypes = contextLoader.getAvailableBookTypes();
        return NextResponse.json({
          success: true,
          bookTypes: bookTypes.map(bt => ({
            id: bt.id,
            name: bt.name,
            nameEn: bt.nameEn,
            description: bt.description,
            descriptionEn: bt.descriptionEn,
            language: bt.language,
            categories: bt.categories
          }))
        });

      case 'create_book_type':
        const { bookType } = await request.json();
        const newBookType = contextLoader.createBookType(bookType);
        return NextResponse.json({
          success: true,
          bookType: newBookType
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Error in enhanced context API POST:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 