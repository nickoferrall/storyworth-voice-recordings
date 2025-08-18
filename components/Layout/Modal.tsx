import React, { useEffect, useRef, useState } from 'react'
import ReactDOM from 'react-dom'

type Input = {
  buttonRef: React.MutableRefObject<any>
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  dropdownWidth?: number
}

const Modal = ({ buttonRef, isOpen, onClose, children, dropdownWidth = 250 }: Input) => {
  const modalRef = useRef<HTMLDivElement>(null)
  const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 })

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  useEffect(() => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      const viewportWidth = window.innerWidth

      let left = rect.left + rect.width / 2 - dropdownWidth / 2 // Center the dropdown beneath the button

      if (left < 0) {
        // Check if dropdown overflows the left side of viewport.
        left = 0
      } else if (left + dropdownWidth > viewportWidth) {
        // Check if dropdown overflows the right side of viewport.
        left = viewportWidth - dropdownWidth
      }

      setModalPosition({
        top: rect.top + rect.height + window.scrollY,
        left: left + window.scrollX,
      })
    }
  }, [buttonRef, isOpen])

  return (
    isOpen &&
    ReactDOM.createPortal(
      <div
        ref={modalRef}
        style={{
          position: 'absolute',
          top: modalPosition.top,
          left: modalPosition.left,
          zIndex: 9999,
        }}
        className="origin-top-right absolute mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
      >
        <div
          className="py-1"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="options-menu"
        >
          {children}
        </div>
      </div>,
      document.body,
    )
  )
}

export default Modal
