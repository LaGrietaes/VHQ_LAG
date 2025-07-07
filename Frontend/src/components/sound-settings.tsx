"use client"

import { useState, useEffect } from 'react'
import { Volume2, VolumeX, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { playSound, SOUND_CATEGORIES } from '@/lib/sound-utils'

interface SoundSettingsProps {
  className?: string
}

export function SoundSettings({ className = '' }: SoundSettingsProps) {
  const [isMuted, setIsMuted] = useState(false)
  const [volume, setVolume] = useState(0.5)
  const [showSettings, setShowSettings] = useState(false)

  // Load sound preferences from localStorage
  useEffect(() => {
    const savedMuted = localStorage.getItem('sound-muted')
    const savedVolume = localStorage.getItem('sound-volume')
    
    if (savedMuted !== null) {
      setIsMuted(savedMuted === 'true')
    }
    if (savedVolume !== null) {
      setVolume(parseFloat(savedVolume))
    }
  }, [])

  // Save preferences to localStorage
  const savePreferences = (muted: boolean, vol: number) => {
    localStorage.setItem('sound-muted', muted.toString())
    localStorage.setItem('sound-volume', vol.toString())
  }

  const toggleMute = () => {
    const newMuted = !isMuted
    setIsMuted(newMuted)
    savePreferences(newMuted, volume)
    
    if (!newMuted) {
      // Play a test sound when unmuting
      playSound('click', volume)
    }
  }

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume)
    savePreferences(isMuted, newVolume)
    
    if (!isMuted) {
      // Play a test sound
      playSound('click', newVolume)
    }
  }

  const testSound = (category: keyof typeof SOUND_CATEGORIES) => {
    if (isMuted) return
    
    const sounds = SOUND_CATEGORIES[category]
    if (sounds.length > 0) {
      playSound(sounds[0], volume)
    }
  }

  return (
    <div className={`relative ${className}`}>
      {/* Main sound toggle button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleMute}
        className="p-2 text-gray-400 hover:text-white"
      >
        {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
      </Button>

      {/* Settings button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowSettings(!showSettings)}
        className="p-2 text-gray-400 hover:text-white"
      >
        <Settings className="h-4 w-4" />
      </Button>

      {/* Settings panel */}
      {showSettings && (
        <div className="absolute top-full right-0 mt-2 bg-gray-800 border border-gray-700 rounded-lg p-4 min-w-[200px] z-50">
          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-400 font-mono mb-2 block">
                VOLUME
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="w-full"
                disabled={isMuted}
              />
              <div className="text-xs text-gray-500 mt-1">
                {Math.round(volume * 100)}%
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-400 font-mono mb-2 block">
                TEST SOUNDS
              </label>
              <div className="space-y-2">
                <button
                  onClick={() => testSound('UI')}
                  className="w-full text-left text-xs text-gray-300 hover:text-white p-1 rounded"
                >
                  UI Sounds
                </button>
                <button
                  onClick={() => testSound('ALERTS')}
                  className="w-full text-left text-xs text-gray-300 hover:text-white p-1 rounded"
                >
                  Alert Sounds
                </button>
                <button
                  onClick={() => testSound('TIMER')}
                  className="w-full text-left text-xs text-gray-300 hover:text-white p-1 rounded"
                >
                  Timer Sounds
                </button>
              </div>
            </div>

            <div className="pt-2 border-t border-gray-700">
              <div className="text-xs text-gray-500">
                {isMuted ? 'Sound is muted' : 'Sound is enabled'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 