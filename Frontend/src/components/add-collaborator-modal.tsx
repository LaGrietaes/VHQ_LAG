"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, Save, User, Star } from "lucide-react"

interface AddCollaboratorModalProps {
  onClose: () => void
  onSave: (collaborator: any) => void
}

export function AddCollaboratorModal({ onClose, onSave }: AddCollaboratorModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    type: "talent",
    contact_info: "",
    social_media: {
      instagram: "",
      youtube: "",
      twitter: "",
      tiktok: "",
      website: "",
    },
    score: {
      views: 0,
      creativity: 0,
      altruism: 0,
      message: 0,
    },
    comments: "",
  })

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSocialMediaChange = (platform: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      social_media: {
        ...prev.social_media,
        [platform]: value,
      },
    }))
  }

  const handleScoreChange = (criteria: string, value: number) => {
    setFormData((prev) => ({
      ...prev,
      score: {
        ...prev.score,
        [criteria]: Math.max(0, Math.min(10, value)),
      },
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const totalScore = Object.values(formData.score).reduce((sum, score) => sum + score, 0)

    const newCollaborator = {
      ...formData,
      id: `col_${Date.now()}`,
      status: "pending",
      score: {
        ...formData.score,
        total: totalScore,
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    onSave(newCollaborator)
    onClose()
  }

  const totalScore = Object.values(formData.score).reduce((sum, score) => sum + score, 0)

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-b from-gray-900 to-black border border-gray-800 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div className="flex items-center space-x-2">
            <User className="h-5 w-5 text-red-600" />
            <h2 className="text-lg font-bold text-white font-mono">ADD NEW COLLABORATOR</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-gray-400 hover:text-red-400">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-md font-bold text-red-400 font-mono">BASIC INFORMATION</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 font-mono mb-2">NAME *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white font-mono"
                  placeholder="Enter collaborator name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 font-mono mb-2">EMAIL *</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white font-mono"
                  placeholder="Enter email address"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 font-mono mb-2">TYPE *</label>
                <select
                  value={formData.type}
                  onChange={(e) => handleInputChange("type", e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 text-white font-mono px-3 py-2"
                  required
                >
                  <option value="talent">TALENT</option>
                  <option value="brand">BRAND</option>
                  <option value="young_promise">YOUNG PROMISE</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 font-mono mb-2">CONTACT INFO</label>
                <Input
                  value={formData.contact_info}
                  onChange={(e) => handleInputChange("contact_info", e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white font-mono"
                  placeholder="Phone, address, etc."
                />
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div className="space-y-4">
            <h3 className="text-md font-bold text-red-400 font-mono">SOCIAL MEDIA PROFILES</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 font-mono mb-2">INSTAGRAM</label>
                <Input
                  value={formData.social_media.instagram}
                  onChange={(e) => handleSocialMediaChange("instagram", e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white font-mono"
                  placeholder="https://instagram.com/username"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 font-mono mb-2">YOUTUBE</label>
                <Input
                  value={formData.social_media.youtube}
                  onChange={(e) => handleSocialMediaChange("youtube", e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white font-mono"
                  placeholder="https://youtube.com/channel"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 font-mono mb-2">TWITTER</label>
                <Input
                  value={formData.social_media.twitter}
                  onChange={(e) => handleSocialMediaChange("twitter", e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white font-mono"
                  placeholder="https://twitter.com/username"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 font-mono mb-2">TIKTOK</label>
                <Input
                  value={formData.social_media.tiktok}
                  onChange={(e) => handleSocialMediaChange("tiktok", e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white font-mono"
                  placeholder="https://tiktok.com/@username"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm text-gray-400 font-mono mb-2">WEBSITE</label>
                <Input
                  value={formData.social_media.website}
                  onChange={(e) => handleSocialMediaChange("website", e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white font-mono"
                  placeholder="https://website.com"
                />
              </div>
            </div>
          </div>

          {/* Scoring System */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-md font-bold text-red-400 font-mono">SCORING SYSTEM</h3>
              <div className="text-sm font-mono text-white">
                TOTAL: <span className="text-red-400 font-bold">{totalScore}/40</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { key: "views", label: "VIEWS POTENTIAL", description: "Audience reach and visibility" },
                { key: "creativity", label: "CREATIVITY", description: "Originality and artistic value" },
                { key: "altruism", label: "ALTRUISM", description: "Community impact and social good" },
                { key: "message", label: "MESSAGE ALIGNMENT", description: "Brand values compatibility" },
              ].map((criteria) => (
                <div key={criteria.key} className="bg-gray-800 border border-gray-700 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="text-sm font-mono text-white font-bold">{criteria.label}</div>
                      <div className="text-xs text-gray-400 font-mono">{criteria.description}</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Star className="h-4 w-4 text-yellow-400" />
                      <span className="text-lg font-bold text-white font-mono">
                        {formData.score[criteria.key as keyof typeof formData.score]}/10
                      </span>
                    </div>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={formData.score[criteria.key as keyof typeof formData.score]}
                    onChange={(e) => handleScoreChange(criteria.key, Number.parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />

                  <div className="flex justify-between text-xs text-gray-500 font-mono mt-1">
                    <span>0</span>
                    <span>5</span>
                    <span>10</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Comments */}
          <div className="space-y-4">
            <h3 className="text-md font-bold text-red-400 font-mono">ADDITIONAL COMMENTS</h3>
            <textarea
              value={formData.comments}
              onChange={(e) => handleInputChange("comments", e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 text-white font-mono p-3 h-24 resize-none"
              placeholder="Add any additional notes about this collaborator..."
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-800">
            <div className="text-xs text-gray-400 font-mono">* Required fields | Score range: 0-40 points total</div>

            <div className="flex items-center space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="border-gray-600 text-gray-400 hover:text-white font-mono"
              >
                CANCEL
              </Button>
              <Button
                type="submit"
                className="bg-red-600 hover:bg-red-700 text-white font-mono"
                disabled={!formData.name || !formData.email}
              >
                <Save className="h-3 w-3 mr-1" />
                SAVE COLLABORATOR
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
