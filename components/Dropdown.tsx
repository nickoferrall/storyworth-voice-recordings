import React, { useState } from 'react'
import { Menu } from './Menu/Menu'
import { MenuContent } from './Menu/MenuContext'
import { MenuItem } from './Menu/MenuItem'
import { ChevronDown } from 'lucide-react'
import { upperFirst } from '../lib/upperFirst'

type Props = {
  id: string
  options: string[]
  selectedOption: string
  onOptionSelect: (id: string, option: string) => void
  readonly?: boolean
}

const Dropdown = ({ id, options, selectedOption, onOptionSelect, readonly }: Props) => {
  const [selected, setSelected] = useState(selectedOption)

  const handleClick = (option: string) => {
    setSelected(option)
    onOptionSelect(id, option)
  }

  return (
    <div>
      <Menu
        trigger={
          <button
            className={`flex z-100 items-center text-xs font-medium text-purple-600 focus:outline-none border border-purple-600 rounded-xl px-2 hover:text-purple-700 py-1`}
          >
            {upperFirst(selected)}
            {!readonly && <ChevronDown className="ml-1 h-4 w-4" />}
          </button>
        }
      >
        <MenuContent>
          {options.map((option) => (
            <MenuItem className="py-2" key={option} onClick={() => handleClick(option)}>
              {option}
            </MenuItem>
          ))}
        </MenuContent>
      </Menu>
    </div>
  )
}

export default Dropdown
