"use client"

import { UnifiedHeader } from "@/components/unified-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProcessingQueue } from "@/components/seo/processing-queue"
import { KeywordsHashtags } from "@/components/seo/keywords-hashtags"
import { SEOMetrics } from "@/components/seo/seo-metrics"
import { Search } from "lucide-react"

export default function SEOAgentPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <UnifiedHeader
        title="SEO AGENT - OPTIMIZACIÓN SEO"
        subtitle="Análisis de palabras clave trending y optimización de contenido"
        icon={Search}
        status="OPERATIONAL"
        agentId="01_SEO_LAG"
      />

      <div className="container mx-auto px-6 py-8">
        <Tabs defaultValue="keywords" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-gray-900 border border-gray-800">
            <TabsTrigger value="keywords" className="font-mono">
              KEYWORDS
            </TabsTrigger>
            <TabsTrigger value="processing" className="font-mono">
              PROCESSING
            </TabsTrigger>
            <TabsTrigger value="metrics" className="font-mono">
              METRICS
            </TabsTrigger>
            <TabsTrigger value="optimization" className="font-mono">
              OPTIMIZATION
            </TabsTrigger>
          </TabsList>

          <TabsContent value="keywords">
            <KeywordsHashtags />
          </TabsContent>

          <TabsContent value="processing">
            <ProcessingQueue />
          </TabsContent>

          <TabsContent value="metrics">
            <SEOMetrics />
          </TabsContent>

          <TabsContent value="optimization" className="space-y-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="font-mono text-white">CONTENT OPTIMIZATION</CardTitle>
                <CardDescription className="font-mono text-gray-400">
                  AI-powered content optimization suggestions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-400 font-mono">Optimization tools coming soon...</div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
