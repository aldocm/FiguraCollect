'use client'

import { useState, forwardRef, TextareaHTMLAttributes } from 'react'

interface TextAreaBaseProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'className'> {
  label: string
  error?: string
  helperText?: string
}

const TextAreaBase = forwardRef<HTMLTextAreaElement, TextAreaBaseProps>(
  ({ label, error, helperText, id, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false)
    const hasValue = props.value !== undefined && props.value !== ''
    const isActive = isFocused || hasValue

    const inputId = id || `textarea-${label.toLowerCase().replace(/\s+/g, '-')}`

    return (
      <div className="relative w-full">
        {/* Textarea container */}
        <div className="relative">
          <textarea
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
              min-h-[100px]
              px-4
              pt-6
              pb-2
              font-body
              text-textWhite
              bg-transparent
              border
              rounded
              outline-none
              transition-all
              duration-200
              resize-y
              ${error
                ? 'border-primary'
                : isFocused
                  ? 'border-accent'
                  : 'border-textWhite/30 hover:border-textWhite/60'
              }
            `}
          />

          {/* Floating label */}
          <label
            htmlFor={inputId}
            className={`
              absolute
              left-3
              font-body
              transition-all
              duration-200
              pointer-events-none
              ${isActive
                ? `
                  top-1
                  text-xs
                  px-1
                  ${error ? 'text-primary' : isFocused ? 'text-accent' : 'text-textWhite/70'}
                `
                : `
                  top-4
                  text-base
                  text-textWhite/50
                `
              }
            `}
          >
            {/* Background notch for label */}
            <span className={`
              relative
              ${isActive ? 'bg-background px-1 -mx-1' : ''}
            `}>
              {label}
            </span>
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

TextAreaBase.displayName = 'TextAreaBase'

export default TextAreaBase
