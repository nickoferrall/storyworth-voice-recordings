import React, { useState, useRef, useEffect } from 'react'
import dayjs from 'dayjs'
import advancedFormat from 'dayjs/plugin/advancedFormat' // Import advancedFormat for formatting
dayjs.extend(advancedFormat) // Extend dayjs with advancedFormat

type Heat = {
  id: string
  startTime: string
}

type Props = {
  heats: Heat[]
  handleSave: (id: string) => void
  loading: boolean
}

const SelectHeat: React.FC<Props> = ({ heats, handleSave, loading }) => {
  const [selectedHeatId, setSelectedHeatId] = useState<string | null>(null)
  const saveButtonRef = useRef<HTMLButtonElement>(null)

  const handleSelect = (id: string) => {
    setSelectedHeatId(id)
  }

  useEffect(() => {
    if (selectedHeatId && saveButtonRef.current) {
      const scrollTimeout = setTimeout(() => {
        saveButtonRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 400)

      return () => clearTimeout(scrollTimeout)
    }
  }, [selectedHeatId])

  if (loading) {
    return (
      <div className="pb-12">
        <h1 className="text-3xl font-semibold text-white mb-4">Select Heat Time</h1>
        <div className="border border-gray-400 p-4 mb-4 rounded-xl animate-pulse">
          <div className="flex justify-between items-center">
            <div className="font-semibold text-foreground">
              Loading<span className="animate-pulse">...</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="pb-24">
      <h1 className="text-3xl font-semibold text-white mb-4">Select Heat Time</h1>
      {heats.map((heat) => (
        <div
          key={heat.id}
          className={`border p-4 mb-4 rounded-xl cursor-pointer ${
            heat.id === selectedHeatId
              ? 'border-2 border-black font-bold'
              : 'border-gray-400'
          }`}
          onClick={() => handleSelect(heat.id)}
        >
          <div className="flex justify-between items-center">
            <div className="font-semibold text-foreground">
              {dayjs(heat.startTime).format('dddd Do MMMM, h:mm A')}
            </div>
          </div>
        </div>
      ))}
      <button
        ref={saveButtonRef}
        onClick={() => handleSave(selectedHeatId!)}
        disabled={!selectedHeatId}
        className={`
        ${!selectedHeatId && 'cursor-not-allowed opacity-50'}
        mt-10 bg-purple-500 hover:bg-purple-600 !text-white font-bold py-2 px-4 rounded-xl w-full sticky bottom-4`}
      >
        Save
      </button>
    </div>
  )
}

export default SelectHeat
