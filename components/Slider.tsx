import React, { useState } from 'react'

type Props = {
 min: number
 max: number
 initialValue?: number
 onChange?: (value: string) => void
 label: string
 id: string
}

const Slider = (props: Props) => {
 const { min, max, initialValue, onChange, label, id } = props
 const [value, setValue] = useState(initialValue || min)

 const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  const newValue = Number(event.target.value)
  setValue(newValue)
  if (onChange) {
   onChange(newValue.toString())
  }
 }

 return (
  <div className="w-full">
   <label htmlFor={id} className="block text-sm font-medium mb-2">
    {label}
   </label>
   <div className="flex items-center">
    <input
     type="range"
     id={id}
     name={id}
     min={min}
     max={max}
     value={value}
     onChange={handleChange}
     className="mr-2 focus:ring-purple-500 hover:cursor-pointer focus:border-purple-500 block w-full sm:text-sm border-gray-300 rounded-md"
    />
    <span className="text-sm font-medium">{value}</span>
   </div>
  </div>
 )
}

export default Slider
