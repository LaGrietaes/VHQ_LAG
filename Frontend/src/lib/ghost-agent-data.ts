export type Platform = "youtube" | "instagram" | "tiktok" | "youtube_shorts" | "x";

export const initialBlogCategories = ["Street Art", "Cultura", "Deporte", "Musica", "Comida", "Viajes", "Fotografia", "Diseño"];

export const platformCharLimits: { [key in Platform]?: number } = {
    instagram: 2200,
    x: 280,
    tiktok: 2200,
    youtube: 5000, // For description
};

export const mockProjects = {
  scripts: [
    { id: "scr-01", title: "El Guion Perdido", status: "Borrador", lastEdit: "2h ago", progress: 30, category: "Video", platforms: ["youtube"], duration: "12:45", relatedProjectIds: ["scr-04", "blg-02"] },
    { id: "scr-02", title: "Crónicas del Futuro", status: "Revisión", lastEdit: "1d ago", progress: 75, category: "Video", platforms: ["youtube"], duration: "21:30" },
    { id: "scr-03", title: "Proyecto Quantum", status: "Pausado", lastEdit: "3d ago", progress: 10, category: "Short", platforms: ["instagram", "tiktok"], duration: "0:58" },
    { id: "scr-04", title: "Promo para 'El Guion Perdido'", status: "Finalizado", lastEdit: "5d ago", progress: 100, category: "Short", platforms: ["youtube_shorts", "instagram", "tiktok"], duration: "0:45", relatedProjectIds: ["scr-01", "blg-02"] },
  ],
  blogs: [
    { id: "blg-01", title: "Minimalismo Digital", status: "Finalizado", lastEdit: "3d ago", progress: 100, blogCategory: "Diseño", readingTime: "5 min read" },
    { id: "blg-02", title: "El Arte del Storytelling (Análisis de 'El Guion Perdido')", status: "Escribiendo", lastEdit: "1h ago", progress: 40, blogCategory: "Cultura", readingTime: "8 min read", relatedProjectIds: ["scr-01", "scr-04"] },
  ],
  books: [
    { id: "bok-01", title: "La Sombra del Silicio", status: "Escribiendo", lastEdit: "4h ago", progress: 55 },
    { id: "bok-02", title: "Memorias de un Viajero", status: "Planificado", lastEdit: "1w ago", progress: 5 },
  ],
  socials: [
      { id: "soc-01", title: "Tweet for 'El Guion Perdido'", status: "Borrador", lastEdit: "1h ago", progress: 20, socialPlatforms: ["x"], relatedProjectIds: ["scr-01"], content: "Check out the new video! #ElGuionPerdido", platformOverrides: {}},
      { id: "soc-02", title: "Instagram post for 'El Guion Perdido'", status: "Revisión", lastEdit: "3h ago", progress: 80, socialPlatforms: ["instagram"], relatedProjectIds: ["scr-01"] },
  ]
};

export interface OutlineItem {
  id: string;
  title: string;
  content?: string;
  type: 'folder' | 'file';
  children?: OutlineItem[];
  isNew?: boolean;
}

// Base Project Type
interface BaseProject {
  id: string;
  title: string;
  lastEdit: string;
  progress: number;
  description?: string;
  relatedProjectIds?: string[];
  path: string;
}

export interface ScriptProject extends BaseProject {
  type: 'script';
  status: "Borrador" | "Revisión" | "Pausado" | "Finalizado";
  category: "Video" | "Short";
  platforms: Platform[];
  duration: string;
}

export interface BlogPostProject extends BaseProject {
  type: 'blog';
  status: "Finalizado" | "Escribiendo";
  blogCategory: string;
  readingTime: string;
}

export interface BookProject extends BaseProject {
  type: 'book';
  status: "Escribiendo" | "Planificado";
  name: string;
  outline: OutlineItem[];
}

export interface SocialPostProject extends BaseProject {
    type: 'social';
    status: "Borrador" | "Revisión";
    socialPlatforms: Platform[];
    content?: string;
    platformOverrides?: { [key in Platform]?: string };
}

export type Project = ScriptProject | BlogPostProject | BookProject | SocialPostProject;

// Let's fix the mock data
mockProjects.scripts = [
    { ...mockProjects.scripts[0], type: 'script' as const, path: 'GHOST_Proyectos/scripts/el-guion-perdido' },
    { ...mockProjects.scripts[1], type: 'script' as const, path: 'GHOST_Proyectos/scripts/cronicas-del-futuro' },
    { ...mockProjects.scripts[2], type: 'script' as const, path: 'GHOST_Proyectos/scripts/proyecto-quantum' },
    { ...mockProjects.scripts[3], type: 'script' as const, path: 'GHOST_Proyectos/scripts/promo-el-guion-perdido' },
];

mockProjects.blogs = [
    { ...mockProjects.blogs[0], type: 'blog' as const, path: 'GHOST_Proyectos/blog_posts/minimalismo-digital' },
    { ...mockProjects.blogs[1], type: 'blog' as const, path: 'GHOST_Proyectos/blog_posts/el-arte-del-storytelling' },
];

mockProjects.socials = [
    { ...mockProjects.socials[0], type: 'social' as const, path: 'GHOST_Proyectos/social/tweet-el-guion-perdido' },
    { ...mockProjects.socials[1], type: 'social' as const, path: 'GHOST_Proyectos/social/instagram-el-guion-perdido' },
];

// The books data was fixed in a previous step, but let's ensure it conforms to the new structure.
const books: BookProject[] = [
    { 
      id: "Test_Project", 
      title: "Test Project", 
      status: "Escribiendo", 
      lastEdit: "4h ago", 
      progress: 55, 
      type: 'book',
      name: 'Test_Project',
      path: 'GHOST_Proyectos/libros/Test_Project',
      description: 'A deep dive into the silicon revolution.',
      outline: [
        { id: '1', title: 'Chapter 1: The Beginning', type: 'file', children: [] },
        { id: '2', title: 'Folder 1', type: 'folder', children: [
            { id: '2-1', title: 'Chapter 2: The Middle', type: 'file', children: [] },
            { id: '2-2', title: 'Chapter 3: The Other Middle', type: 'file', children: [] },
        ] },
        { id: '3', title: 'Chapter 4: The End', type: 'file', children: [] },
      ]
    },
    { 
      id: "bok-02", 
      title: "Memorias de un Viajero", 
      status: "Planificado", 
      lastEdit: "1w ago", 
      progress: 5, 
      type: 'book',
      name: 'Memorias de un Viajero',
      path: 'GHOST_Proyectos/libros/Memorias de un Viajero',
      description: 'Tales from a world traveler.',
      outline: []
    },
];

mockProjects.books = books; 