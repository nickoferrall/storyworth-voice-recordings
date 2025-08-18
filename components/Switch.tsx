import React from 'react'

type Props = {
  activeTab: string
  tabs: { label: string; value: string }[]
  onChange: (value: string) => void
}

const TabSwitcher = ({ activeTab, tabs, onChange }: Props) => {
  const handleClick = (value: string, event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    if (onChange) {
      onChange(value)
    }
  }

  return (
    <div className="flex w-full justify-center">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={(e) => handleClick(tab.value, e)}
          className={`mr-4 py-2 px-4 rounded-md focus:outline-none ${
            activeTab === tab.value ? 'bg-gray-200' : 'bg-white'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

export default TabSwitcher
