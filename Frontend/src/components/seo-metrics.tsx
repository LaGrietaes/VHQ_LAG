"use client"

import { seoMetrics } from "@/lib/seo-agent-data"
import { FileText, Hash, Tag, Clock, CheckCircle, AlertTriangle, Cpu } from "lucide-react"

const PlaceholderCard = ({ title }: { title: string }) => (
  <div className="bg-card border border-border p-4 h-full flex flex-col">
    <h3 className="text-lg font-bold text-primary mb-4">{title}</h3>
    <div className="flex-grow flex items-center justify-center">
      <p className="text-muted-foreground text-sm">[DATA UNAVAILABLE]</p>
    </div>
  </div>
);

export function SEOMetrics() {
  return <PlaceholderCard title="SEO METRICS" />;
}

export function CalendarWidget() {
  return <PlaceholderCard title="CALENDAR" />;
}

export function EngagementOptimization() {
  return <PlaceholderCard title="ENGAGEMENT OPTIMIZATION" />;
}

export function TrendAnalysis() {
  return <PlaceholderCard title="TREND ANALYSIS" />;
}

export function TodoList() {
  return <PlaceholderCard title="TODO LIST" />;
}

export function ProjectTimeline() {
  return <PlaceholderCard title="PROJECT TIMELINE" />;
}

export function ProcessingQueue() {
  return <PlaceholderCard title="PROCESSING QUEUE" />;
}
