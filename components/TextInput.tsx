import clsx from 'clsx'
import { Info } from 'lucide-react'
import React from 'react'
import CustomizedTooltip from './Tooltip'

type Props = {
 name?: string
 label: string
 value?: string | number
 onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
 isNumber?: boolean
 className?: string
 onBlur?: () => void
 onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void
 isDisabled?: boolean
 tooltip?: string
 placeholder?: string
 required?: boolean
 readOnly?: boolean
 maxLength?: number
 labelSize?: 'xs' | 'sm' | 'md' | 'lg'
 max?: number
}

const TextInput = (props: Props) => {
 const {
  label,
  name = label,
  value,
  onChange,
  isNumber,
  className,
  onBlur,
  onFocus,
  isDisabled,
  tooltip,
  placeholder,
  required,
  readOnly,
  maxLength,
  max,
 } = props
 const inputName = name.charAt(0).toLowerCase() + name.replace(/ /g, '').slice(1)
 const labelSize = props.labelSize || 'sm'

 return (
  <div className={clsx('mb-4 min-w-[240px]', className)}>
   <label className={`block text-${labelSize} mb-2`} htmlFor={inputName}>
    {label}
    {tooltip && (
     <CustomizedTooltip title={tooltip}>
      <Info
       className="hover:cursor-pointer inline ml-1 mb-0.5"
       size={16}
       color="gray"
      />
     </CustomizedTooltip>
    )}
   </label>
   <input
    type={isNumber ? 'number' : 'text'}
    name={inputName}
    value={value}
    maxLength={maxLength}
    onBlur={onBlur}
    onChange={onChange}
    onFocus={onFocus}
    readOnly={readOnly}
    className={clsx(
     'shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline focus:border-purple-500 focus:ring-purple-500',
     { 'bg-gray-100 hover:cursor-not-allowed': isDisabled },
    )}
    disabled={isDisabled}
    placeholder={placeholder}
    required={required}
    max={max}
    step={isNumber ? 'any' : undefined}
   />
  </div>
 )
}

export default TextInput
