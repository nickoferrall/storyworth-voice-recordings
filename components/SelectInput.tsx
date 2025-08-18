import clsx from 'clsx'
import { Info } from 'lucide-react'
import React from 'react'
import CustomizedTooltip from './Tooltip'

type Props = {
 name?: string
 label?: string
 value: string
 onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void
 options: { value: string; label: string }[]
 className?: string
 onBlur?: () => void
 onFocus?: (e: React.FocusEvent<HTMLSelectElement>) => void
 isDisabled?: boolean
 tooltip?: string
 required?: boolean
}

const SelectInput = (props: Props) => {
 const {
  label,
  name = label,
  value,
  onChange,
  options,
  className,
  onBlur,
  onFocus,
  isDisabled,
  tooltip,
  required,
 } = props
 const inputName = name
  ? name.charAt(0).toLowerCase() + name.replace(/ /g, '').slice(1)
  : ''
 return (
  <div className={clsx('mb-4', className)}>
   {label && (
    <label className="block text-sm mb-2" htmlFor={inputName}>
     {label}
     {tooltip && (
      <CustomizedTooltip title={tooltip}>
       <Info
        className="hover:cursor-pointer ml-1 mb-0.5 inline"
        size={16}
        color="grey"
       />
      </CustomizedTooltip>
     )}
    </label>
   )}
   <select
    name={inputName}
    value={value}
    onBlur={onBlur}
    onChange={onChange}
    onFocus={onFocus}
    className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline focus:border-purple-500 focus:ring-purple-500 hover:cursor-pointer"
    disabled={isDisabled}
    required={required}
   >
    {options.map((option) => (
     <option
      className="hover:cursor-pointer"
      key={option.value}
      value={option.value}
     >
      {option.label}
     </option>
    ))}
   </select>
  </div>
 )
}

export default SelectInput
