import React, { ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'

type Props = {
 label?: string | ReactNode
 options: string[]
 value?: string
 onChange?: (value: unknown) => void
 className?: string
 disabled?: boolean
}

const Menu = (props: Props) => {
 const { label, options, value, onChange, className, disabled } = props

 const handleOnChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  if (onChange) {
   onChange(e.target.value)
  }
 }

 return (
  <label className="block">
   {label && (
    <label className="block text-sm font-medium">{label}</label>
   )}
   <select
    value={value}
    disabled={disabled}
    onChange={handleOnChange}
    className={twMerge(
     `hover:cursor-pointer mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50`,
     disabled ? 'bg-gray-100 ' : '',
     className,
    )}
   >
    {options.map((option, idx) => (
     <option key={`${idx}-${option}`} value={option}>
      {option}
     </option>
    ))}
   </select>
  </label>
 )
}

export default Menu
