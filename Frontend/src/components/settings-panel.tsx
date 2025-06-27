"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  X,
  Monitor,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  Bell,
  BellOff,
  RefreshCw,
  Save,
  RotateCcw,
  Palette,
  Shield,
  Database,
  Cpu,
} from "lucide-react"

interface SettingsPanelProps {
  onClose: () => void
}

interface VHQSettings {
  theme: "dark" | "light"
  notifications: boolean
  soundEffects: boolean
  autoRefresh: boolean
  refreshInterval: number
  systemMonitoring: boolean
  glitchEffects: boolean
  compactMode: boolean
  showTemperatures: boolean
  agentAnimations: boolean
}

export function SettingsPanel({ onClose }: SettingsPanelProps) {
  const [settings, setSettings] = useState<VHQSettings>({
    theme: "dark",
    notifications: true,
    soundEffects: true,
    autoRefresh: true,
    refreshInterval: 3,
    systemMonitoring: true,
    glitchEffects: true,
    compactMode: false,
    showTemperatures: true,
    agentAnimations: true,
  })

  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem("vhq-settings")
    if (savedSettings) {
      const loadedSettings = JSON.parse(savedSettings)
      setSettings(loadedSettings)

      // Apply theme immediately
      const root = document.documentElement
      if (loadedSettings.theme === "light") {
        root.classList.add("light-theme")
        document.body.style.backgroundColor = "white"
        document.body.style.color = "black"
      } else {
        root.classList.remove("light-theme")
        document.body.style.backgroundColor = "black"
        document.body.style.color = "white"
      }
    }
  }, [])

  const updateSetting = <K extends keyof VHQSettings>(key: K, value: VHQSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }

  const saveSettings = () => {
    localStorage.setItem("vhq-settings", JSON.stringify(settings))

    // Apply theme change to document
    const root = document.documentElement
    if (settings.theme === "light") {
      root.classList.add("light-theme")
      document.body.style.backgroundColor = "white"
      document.body.style.color = "black"
    } else {
      root.classList.remove("light-theme")
      document.body.style.backgroundColor = "black"
      document.body.style.color = "white"
    }

    setHasChanges(false)

    // Trigger a custom event to notify other components
    window.dispatchEvent(new CustomEvent("settings-changed", { detail: settings }))
  }

  const resetSettings = () => {
    const defaultSettings: VHQSettings = {
      theme: "dark",
      notifications: true,
      soundEffects: true,
      autoRefresh: true,
      refreshInterval: 3,
      systemMonitoring: true,
      glitchEffects: true,
      compactMode: false,
      showTemperatures: true,
      agentAnimations: true,
    }
    setSettings(defaultSettings)
    setHasChanges(true)
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-b from-gray-900 to-black border border-gray-800 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-red-600" />
            <h2 className="text-lg font-bold text-white font-mono">VHQ SYSTEM SETTINGS</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-gray-400 hover:text-red-400">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6 space-y-8">
          {/* Appearance Settings */}
          <div className="space-y-4">
            <h3 className="text-md font-bold text-red-400 font-mono flex items-center space-x-2">
              <Palette className="h-4 w-4" />
              <span>APPEARANCE</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-800 border border-gray-700 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    {settings.theme === "dark" ? (
                      <Moon className="h-4 w-4 text-blue-400" />
                    ) : (
                      <Sun className="h-4 w-4 text-yellow-400" />
                    )}
                    <span className="text-sm font-mono text-white">THEME MODE</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    onClick={() => updateSetting("theme", "dark")}
                    className={`flex-1 font-mono text-xs ${
                      settings.theme === "dark"
                        ? "bg-red-600 text-white"
                        : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    }`}
                  >
                    <Moon className="h-3 w-3 mr-1" />
                    DARK
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => updateSetting("theme", "light")}
                    className={`flex-1 font-mono text-xs ${
                      settings.theme === "light"
                        ? "bg-red-600 text-white"
                        : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    }`}
                  >
                    <Sun className="h-3 w-3 mr-1" />
                    LIGHT
                  </Button>
                </div>
              </div>

              <div className="bg-gray-800 border border-gray-700 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Monitor className="h-4 w-4 text-purple-400" />
                    <span className="text-sm font-mono text-white">GLITCH EFFECTS</span>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => updateSetting("glitchEffects", !settings.glitchEffects)}
                    className={`font-mono text-xs ${
                      settings.glitchEffects ? "bg-green-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    }`}
                  >
                    {settings.glitchEffects ? "ON" : "OFF"}
                  </Button>
                </div>
              </div>

              <div className="bg-gray-800 border border-gray-700 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Monitor className="h-4 w-4 text-cyan-400" />
                    <span className="text-sm font-mono text-white">COMPACT MODE</span>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => updateSetting("compactMode", !settings.compactMode)}
                    className={`font-mono text-xs ${
                      settings.compactMode ? "bg-green-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    }`}
                  >
                    {settings.compactMode ? "ON" : "OFF"}
                  </Button>
                </div>
              </div>

              <div className="bg-gray-800 border border-gray-700 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <RefreshCw className="h-4 w-4 text-green-400" />
                    <span className="text-sm font-mono text-white">AGENT ANIMATIONS</span>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => updateSetting("agentAnimations", !settings.agentAnimations)}
                    className={`font-mono text-xs ${
                      settings.agentAnimations
                        ? "bg-green-600 text-white"
                        : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    }`}
                  >
                    {settings.agentAnimations ? "ON" : "OFF"}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* System Settings */}
          <div className="space-y-4">
            <h3 className="text-md font-bold text-red-400 font-mono flex items-center space-x-2">
              <Cpu className="h-4 w-4" />
              <span>SYSTEM MONITORING</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-800 border border-gray-700 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Monitor className="h-4 w-4 text-blue-400" />
                    <span className="text-sm font-mono text-white">SYSTEM MONITORING</span>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => updateSetting("systemMonitoring", !settings.systemMonitoring)}
                    className={`font-mono text-xs ${
                      settings.systemMonitoring
                        ? "bg-green-600 text-white"
                        : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    }`}
                  >
                    {settings.systemMonitoring ? "ON" : "OFF"}
                  </Button>
                </div>
              </div>

              <div className="bg-gray-800 border border-gray-700 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Monitor className="h-4 w-4 text-orange-400" />
                    <span className="text-sm font-mono text-white">SHOW TEMPERATURES</span>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => updateSetting("showTemperatures", !settings.showTemperatures)}
                    className={`font-mono text-xs ${
                      settings.showTemperatures
                        ? "bg-green-600 text-white"
                        : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    }`}
                  >
                    {settings.showTemperatures ? "ON" : "OFF"}
                  </Button>
                </div>
              </div>

              <div className="bg-gray-800 border border-gray-700 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <RefreshCw className="h-4 w-4 text-green-400" />
                    <span className="text-sm font-mono text-white">AUTO REFRESH</span>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => updateSetting("autoRefresh", !settings.autoRefresh)}
                    className={`font-mono text-xs ${
                      settings.autoRefresh ? "bg-green-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    }`}
                  >
                    {settings.autoRefresh ? "ON" : "OFF"}
                  </Button>
                </div>
                {settings.autoRefresh && (
                  <div>
                    <div className="text-xs text-gray-400 font-mono mb-2">INTERVAL: {settings.refreshInterval}s</div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={settings.refreshInterval}
                      onChange={(e) => updateSetting("refreshInterval", Number.parseInt(e.target.value))}
                      className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Notifications & Audio */}
          <div className="space-y-4">
            <h3 className="text-md font-bold text-red-400 font-mono flex items-center space-x-2">
              <Bell className="h-4 w-4" />
              <span>NOTIFICATIONS & AUDIO</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-800 border border-gray-700 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {settings.notifications ? (
                      <Bell className="h-4 w-4 text-blue-400" />
                    ) : (
                      <BellOff className="h-4 w-4 text-gray-400" />
                    )}
                    <span className="text-sm font-mono text-white">NOTIFICATIONS</span>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => updateSetting("notifications", !settings.notifications)}
                    className={`font-mono text-xs ${
                      settings.notifications ? "bg-green-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    }`}
                  >
                    {settings.notifications ? "ON" : "OFF"}
                  </Button>
                </div>
              </div>

              <div className="bg-gray-800 border border-gray-700 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {settings.soundEffects ? (
                      <Volume2 className="h-4 w-4 text-green-400" />
                    ) : (
                      <VolumeX className="h-4 w-4 text-gray-400" />
                    )}
                    <span className="text-sm font-mono text-white">SOUND EFFECTS</span>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => updateSetting("soundEffects", !settings.soundEffects)}
                    className={`font-mono text-xs ${
                      settings.soundEffects ? "bg-green-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    }`}
                  >
                    {settings.soundEffects ? "ON" : "OFF"}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Security & Privacy */}
          <div className="space-y-4">
            <h3 className="text-md font-bold text-red-400 font-mono flex items-center space-x-2">
              <Shield className="h-4 w-4" />
              <span>SECURITY & PRIVACY</span>
            </h3>

            <div className="bg-gray-800 border border-gray-700 p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-mono text-white">Session Timeout</span>
                  <span className="text-xs font-mono text-gray-400">30 minutes</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-mono text-white">Data Encryption</span>
                  <span className="text-xs font-mono text-green-400">ENABLED</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-mono text-white">Agent Logs Retention</span>
                  <span className="text-xs font-mono text-gray-400">7 days</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-800">
          <div className="flex items-center space-x-2">
            <Database className="h-4 w-4 text-gray-400" />
            <span className="text-xs font-mono text-gray-400">
              Settings stored locally • Last saved: {new Date().toLocaleString()}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={resetSettings}
              className="border-gray-600 text-gray-400 hover:text-white font-mono"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              RESET
            </Button>
            <Button
              size="sm"
              onClick={saveSettings}
              disabled={!hasChanges}
              className={`font-mono ${
                hasChanges ? "bg-red-600 hover:bg-red-700 text-white" : "bg-gray-700 text-gray-400 cursor-not-allowed"
              }`}
            >
              <Save className="h-3 w-3 mr-1" />
              SAVE CHANGES
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
