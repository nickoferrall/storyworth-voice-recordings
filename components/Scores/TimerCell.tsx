import React, { useState, useEffect } from 'react'
import { Button } from '../../src/components/ui/button'
import { Play, Pause, RotateCcw } from 'lucide-react'

interface TimerCellProps {
  id: string
  workoutId: string
}

const TimerCell: React.FC<TimerCellProps> = ({ id, workoutId }) => {
  const [startTime, setStartTime] = useState<number | null>(null)
  const [isActive, setIsActive] = useState(false)
  const [elapsedTime, setElapsedTime] = useState(0) // Total time when paused
  const [totalElapsedTime, setTotalElapsedTime] = useState(0) // Updated every second when active
  const [isInitialized, setIsInitialized] = useState(false)

  // Load timer data from localStorage on mount
  useEffect(() => {
    const storedData = localStorage.getItem(`timer-${workoutId}-${id}`)
    if (storedData) {
      const { startTime, isActive, elapsedTime } = JSON.parse(storedData)
      setStartTime(startTime)
      setIsActive(isActive)
      setElapsedTime(elapsedTime)
      setTotalElapsedTime(elapsedTime)
    }
    setIsInitialized(true) // Set after loading
  }, [id, workoutId])

  useEffect(() => {
    if (isInitialized) {
      // Only save if initialized
      localStorage.setItem(
        `timer-${workoutId}-${id}`,
        JSON.stringify({ startTime, isActive, elapsedTime }),
      )
    }
  }, [id, workoutId, startTime, isActive, elapsedTime, isInitialized])

  // Update totalElapsedTime every second when timer is active
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    if (isActive && startTime) {
      interval = setInterval(() => {
        const timeElapsedSinceStart = Math.floor((Date.now() - startTime) / 1000)
        setTotalElapsedTime(elapsedTime + timeElapsedSinceStart)
      }, 1000)
    } else {
      // When timer is not active, ensure totalElapsedTime is set correctly
      setTotalElapsedTime(elapsedTime)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isActive, startTime, elapsedTime])

  // Toggle timer start/pause
  const toggleTimer = () => {
    if (isActive) {
      // Pause the timer
      if (startTime) {
        const timeElapsedSinceStart = Math.floor((Date.now() - startTime) / 1000)
        setElapsedTime((prevElapsedTime) => prevElapsedTime + timeElapsedSinceStart)
        setTotalElapsedTime((prevElapsedTime) => prevElapsedTime + timeElapsedSinceStart)
      }
      setIsActive(false)
      setStartTime(null)
    } else {
      // Start the timer
      setStartTime(Date.now())
      setIsActive(true)
    }
  }

  // Reset the timer
  const resetTimer = () => {
    setIsActive(false)
    setElapsedTime(0)
    setTotalElapsedTime(0)
    setStartTime(null)
  }

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds
      .toString()
      .padStart(2, '0')}`
  }

  return (
    <div className="flex items-center justify-center space-x-2">
      <span>{formatTime(totalElapsedTime)}</span>
      <Button variant="ghost" size="sm" onClick={toggleTimer} className="p-0 h-8 w-8">
        {isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </Button>
      <Button variant="ghost" size="sm" onClick={resetTimer} className="p-0 h-8 w-8">
        <RotateCcw className="h-4 w-4" />
      </Button>
    </div>
  )
}

export default TimerCell
