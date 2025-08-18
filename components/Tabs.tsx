import React, { useState } from 'react'

type Props = {
 tabs: string[]
 activeTab: string
 setActiveTab: (value: string) => void
}

const Tabs = (props: Props) => {
 const { tabs, activeTab, setActiveTab } = props

 return (
  <div className="w-fit flex flex-shrink-0 justify-center overflow-x-auto">
   <div className="flex flex-nowrap">
    {tabs.map((tab) => (
     <button
      key={tab}
      onClick={() => setActiveTab(tab)}
      className={`py-2 px-4 text-sm font-medium ${
       activeTab === tab
        ? 'border-b-2 border-purple-500 text-purple-500'
        : ' hover:'
      }`}
     >
      {tab}
     </button>
    ))}
   </div>
  </div>
 )
}

export default Tabs
