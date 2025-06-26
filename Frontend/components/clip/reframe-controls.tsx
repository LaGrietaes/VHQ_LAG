"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { reframeOptions, outputFormats } from "@/lib/clip-agent-data"
import { Upload, Settings, Zap } from "lucide-react"

export function ReframeControls() {
  const [reframeMode, setReframeMode] = useState("smart")
  const [outputFormat, setOutputFormat] = useState("tiktok")
  const [clipDuration, setClipDuration] = useState([30])
  const [autoGenerate, setAutoGenerate] = useState(true)
  const [faceTracking, setFaceTracking] = useState(true)

  return (
    <Card className="bg-gradient-to-b from-gray-900 to-black border-gray-800">
      <CardHeader>
        <CardTitle className="text-white font-mono flex items-center space-x-2">
          <Settings className="h-5 w-5 text-orange-400" />
          <span>REFRAME CONTROLS</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Upload Section */}
        <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
          <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <div className="text-white font-mono mb-2">Drop video files here</div>
          <div className="text-xs text-gray-400 font-mono">Supports MP4, MOV, AVI (max 2GB)</div>
          <Button className="mt-3 bg-orange-600 hover:bg-orange-700 text-white font-mono">SELECT FILES</Button>
        </div>

        {/* Reframe Mode */}
        <div className="space-y-2">
          <label className="text-sm text-gray-400 font-mono">REFRAME MODE</label>
          <Select value={reframeMode} onValueChange={setReframeMode}>
            <SelectTrigger className="bg-black border-gray-700 text-white font-mono">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-black border-gray-700">
              {reframeOptions.map((option) => (
                <SelectItem key={option.id} value={option.id} className="text-white font-mono">
                  <div>
                    <div className="font-bold">{option.name}</div>
                    <div className="text-xs text-gray-400">{option.description}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Output Format */}
        <div className="space-y-2">
          <label className="text-sm text-gray-400 font-mono">OUTPUT FORMAT</label>
          <Select value={outputFormat} onValueChange={setOutputFormat}>
            <SelectTrigger className="bg-black border-gray-700 text-white font-mono">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-black border-gray-700">
              {outputFormats.map((format) => (
                <SelectItem key={format.id} value={format.id} className="text-white font-mono">
                  <div>
                    <div className="font-bold">{format.name}</div>
                    <div className="text-xs text-gray-400">
                      {format.resolution} @ {format.fps}fps
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Clip Duration */}
        <div className="space-y-3">
          <label className="text-sm text-gray-400 font-mono">CLIP DURATION: {clipDuration[0]}s</label>
          <Slider value={clipDuration} onValueChange={setClipDuration} max={60} min={15} step={5} className="w-full" />
        </div>

        {/* Options */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-400 font-mono">AUTO-GENERATE CLIPS</label>
            <Switch checked={autoGenerate} onCheckedChange={setAutoGenerate} />
          </div>
          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-400 font-mono">FACE TRACKING</label>
            <Switch checked={faceTracking} onCheckedChange={setFaceTracking} />
          </div>
        </div>

        {/* Process Button */}
        <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white font-mono flex items-center space-x-2">
          <Zap className="h-4 w-4" />
          <span>START PROCESSING</span>
        </Button>
      </CardContent>
    </Card>
  )
}
