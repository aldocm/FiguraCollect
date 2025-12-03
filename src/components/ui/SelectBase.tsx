'use client'

import { useState, forwardRef, SelectHTMLAttributes } from 'react'

interface SelectBaseProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'className'> {
  label: string
  error?: string
  helperText?: string
  children: React.ReactNode
}

const SelectBase = forwardRef<HTMLSelectElement, SelectBaseProps>(
  ({ label, error, helperText, id, children, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false)
    // En un select siempre hay una opción seleccionada, así que el label siempre está arriba
    const isActive = true

    const inputId = id || `select-${label.toLowerCase().replace(/\s+/g, '-')}`

    return (
      <div className="relative w-full">
        {/* Select container */}
        <div className="relative">
          <select
            ref={ref}
            id={inputId}
            {...props}
            onFocus={(e) => {
              setIsFocused(true)
              props.onFocus?.(e)
            }}
            onBlur={(e) => {
              setIsFocused(false)
              props.onBlur?.(e)
            }}
            className={`
              peer
              w-full
              h-14
              px-4
              pt-5
              pb-1
              font-body
              text-textWhite
              text-sm
              bg-uiBase
              border
              rounded-lg
              outline-none
              transition-all
              duration-200
              appearance-none
              cursor-pointer
              [&>option]:bg-uiBase
              [&>option]:text-textWhite
              [&>option]:py-2
              ${error
                ? 'border-primary'
                : isFocused
                  ? 'border-accent'
                  : 'border-textWhite/20 hover:border-textWhite/40'
              }
            `}
          >
            {children}
          </select>

          {/* Dropdown arrow */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg
              className={`w-5 h-5 transition-colors duration-200 ${
                error ? 'text-primary' : isFocused ? 'text-accent' : 'text-textWhite/50'
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          {/* Floating label */}
          <label
            htmlFor={inputId}
            className={`
              absolute
              left-4
              font-body
              transition-all
              duration-200
              pointer-events-none
              ${isActive
                ? `
                  top-1.5
                  text-xs
                  ${error ? 'text-primary' : isFocused ? 'text-accent' : 'text-textWhite/50'}
                `
                : `
                  top-1/2
                  -translate-y-1/2
                  text-sm
                  text-textWhite/50
                `
              }
            `}
          >
            {label}
          </label>
        </div>

        {/* Helper text / Error message */}
        {(error || helperText) && (
          <p className={`
            mt-1
            ml-3
            text-xs
            font-body
            ${error ? 'text-primary' : 'text-textWhite/50'}
          `}>
            {error || helperText}
          </p>
        )}
      </div>
    )
  }
)

SelectBase.displayName = 'SelectBase'

export default SelectBase
