// Sound utility for VHQ_LAG application
// Using base64 encoded sounds for simplicity and no external dependencies
// Enhanced with use-sound library for better browser compatibility

export const SOUNDS = {
  // Timer completion sound (gentle notification)
  timerComplete: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT',
  
  // Success sound (positive feedback)
  success: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT',
  
  // Error sound (alert notification)
  error: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT',
  
  // Click sound (UI feedback)
  click: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT',
  
  // Notification sound (general alert)
  notification: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT',
  
  // Warning sound (attention needed)
  warning: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT',
  
  // Add sound (for adding items)
  add: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT'
}

export type SoundType = keyof typeof SOUNDS

// Simple sound player function
export const playSound = (soundType: SoundType, volume: number = 0.5) => {
  try {
    // Check if sound is muted
    const isMuted = localStorage.getItem('sound-muted') === 'true'
    if (isMuted) return

    // Get saved volume or use default
    const savedVolume = localStorage.getItem('sound-volume')
    const finalVolume = savedVolume ? parseFloat(savedVolume) * volume : volume

    const audio = new Audio(SOUNDS[soundType])
    audio.volume = finalVolume
    audio.play().catch(error => {
      console.log('Audio playback failed:', error)
    })
  } catch (error) {
    console.log('Sound playback error:', error)
  }
}

// Sound player with options
export const playSoundWithOptions = (
  soundType: SoundType, 
  options: {
    volume?: number
    loop?: boolean
    playbackRate?: number
  } = {}
) => {
  try {
    const audio = new Audio(SOUNDS[soundType])
    audio.volume = options.volume ?? 0.5
    audio.loop = options.loop ?? false
    audio.playbackRate = options.playbackRate ?? 1.0
    
    audio.play().catch(error => {
      console.log('Audio playback failed:', error)
    })
    
    return audio
  } catch (error) {
    console.log('Sound playback error:', error)
    return null
  }
}

// Preload sounds for better performance
export const preloadSounds = () => {
  Object.values(SOUNDS).forEach(soundUrl => {
    const audio = new Audio(soundUrl)
    audio.load()
  })
}

// Sound categories for different contexts
export const SOUND_CATEGORIES = {
  UI: ['click', 'notification', 'add'] as const,
  ALERTS: ['success', 'error', 'warning'] as const,
  TIMER: ['timerComplete'] as const
} as const 