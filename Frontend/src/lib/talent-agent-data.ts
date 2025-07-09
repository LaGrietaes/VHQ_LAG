export interface Collaborator {
  id: string
  name: string
  type: "talent" | "brand" | "young_promise"
  email: string
  status: "active" | "pending" | "completed" | "rejected" | "toxic"
  social_media: {
    instagram?: string
    youtube?: string
    twitter?: string
    tiktok?: string
    website?: string
  }
  score?: {
    views: number
    creativity: number
    altruism: number
    message: number
    total: number
  }
  contact_info?: string
  photo_path?: string
  comments?: string
  created_at: string
  updated_at: string
  last_contact?: string
}

export interface BoostPlan {
  id: string
  collaborator_id: string
  amount: number
  instagram_budget: number
  youtube_budget: number
  status: "pending" | "active" | "completed"
  start_date?: string
  end_date?: string
  results?: {
    instagram_reach?: number
    youtube_views?: number
    engagement_rate?: number
  }
}

export const mockCollaborators: Collaborator[] = [
  {
    id: "col_001",
    name: "Alex Rivera",
    type: "talent",
    email: "alex@example.com",
    status: "active",
    social_media: {
      instagram: "https://instagram.com/alexrivera",
      youtube: "https://youtube.com/alexrivera",
    },
    score: {
      views: 8,
      creativity: 9,
      altruism: 7,
      message: 8,
      total: 32,
    },
    contact_info: "+34 600 123 456",
    comments: "Excellent urban artist with strong social message",
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-20T15:30:00Z",
    last_contact: "2024-01-18T12:00:00Z",
  },
  {
    id: "col_002",
    name: "Sofia Martinez",
    type: "young_promise",
    email: "sofia@example.com",
    status: "pending",
    social_media: {
      instagram: "https://instagram.com/sofiamartinez",
      tiktok: "https://tiktok.com/@sofiamartinez",
    },
    score: {
      views: 6,
      creativity: 8,
      altruism: 9,
      message: 7,
      total: 30,
    },
    contact_info: "+34 600 789 012",
    comments: "Young talent with great potential for community engagement",
    created_at: "2024-01-20T14:00:00Z",
    updated_at: "2024-01-22T09:15:00Z",
  },
  {
    id: "col_003",
    name: "Urban Brand Co.",
    type: "brand",
    email: "contact@urbanbrand.com",
    status: "completed",
    social_media: {
      instagram: "https://instagram.com/urbanbrandco",
      website: "https://urbanbrand.com",
    },
    score: {
      views: 7,
      creativity: 6,
      altruism: 8,
      message: 9,
      total: 30,
    },
    contact_info: "+34 900 123 456",
    comments: "Brand collaboration completed successfully",
    created_at: "2024-01-10T08:00:00Z",
    updated_at: "2024-01-25T16:45:00Z",
    last_contact: "2024-01-24T11:30:00Z",
  },
]

export const mockBoostPlans: BoostPlan[] = [
  {
    id: "boost_001",
    collaborator_id: "col_001",
    amount: 500,
    instagram_budget: 300,
    youtube_budget: 200,
    status: "active",
    start_date: "2024-01-20T00:00:00Z",
    end_date: "2024-02-20T00:00:00Z",
    results: {
      instagram_reach: 15000,
      youtube_views: 8500,
      engagement_rate: 7.2,
    },
  },
  {
    id: "boost_002",
    collaborator_id: "col_002",
    amount: 250,
    instagram_budget: 150,
    youtube_budget: 100,
    status: "pending",
  },
]

export const talentMetrics = {
  total_collaborators: mockCollaborators.length,
  active_collaborators: mockCollaborators.filter((c) => c.status === "active").length,
  pending_collaborators: mockCollaborators.filter((c) => c.status === "pending").length,
  total_boost_budget: mockBoostPlans.reduce((sum, plan) => sum + plan.amount, 0),
  active_campaigns: mockBoostPlans.filter((p) => p.status === "active").length,
  avg_score: mockCollaborators.reduce((sum, c) => sum + (c.score?.total || 0), 0) / mockCollaborators.length,
}
