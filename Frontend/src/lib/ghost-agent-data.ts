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

export type Project = {
  id: string;
  title: string;
  status: "Borrador" | "Revisión" | "Pausado" | "Finalizado" | "Escribiendo" | "Planificado";
  lastEdit: string;
  progress: number;
  category?: "Video" | "Short";
  platforms?: Platform[];
  socialPlatforms?: Platform[];
  blogCategory?: string;
  duration?: string;
  readingTime?: string;
  relatedProjectIds?: string[];
  content?: string;
  platformOverrides?: { [key in Platform]?: string };
}; 