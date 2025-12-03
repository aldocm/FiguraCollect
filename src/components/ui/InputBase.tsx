'use client'

import { useState, forwardRef, InputHTMLAttributes, KeyboardEvent } from 'react'
import { Eye, EyeOff } from 'lucide-react' // Using lucide-react for icons

interface InputBaseProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> {
  label: string
  error?: string
  helperText?: string
}

const InputBase = forwardRef<HTMLInputElement, InputBaseProps>(
  ({ label, error, helperText, id, type, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [isCapsLockOn, setIsCapsLockOn] = useState(false)
    const hasValue = props.value !== undefined && props.value !== ''
    const isActive = isFocused || hasValue

    const inputId = id || `input-${label.toLowerCase().replace(/\s+/g, '-')}`
    const isPassword = type === 'password'

    const handleKeyUp = (e: KeyboardEvent<HTMLInputElement>) => {
      if (isPassword) {
        setIsCapsLockOn(e.getModifierState('CapsLock'))
      }
      props.onKeyUp?.(e)
    }

    const togglePasswordVisibility = () => {
      setShowPassword(prev => !prev)
    }

    const currentType = isPassword ? (showPassword ? 'text' : 'password') : type

    return (
      <div className="relative w-full">
        {/* Input container */}
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            type={currentType}
            {...props}
            onFocus={(e) => {
              setIsFocused(true)
              props.onFocus?.(e)
            }}
            onBlur={(e) => {
              setIsFocused(false)
              props.onBlur?.(e)
            }}
            onKeyUp={handleKeyUp}
            className={`
              peer
              w-full
              h-14
              px-4
              pt-4
              pb-2
              font-body
              text-textWhite
              bg-transparent
              border
              rounded
              outline-none
              transition-all
              duration-200
              ${isPassword ? 'pr-12' : ''}
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
                  top-1/2
                  -translate-y-1/2
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

          {/* Password visibility toggle */}
          {isPassword && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="text-textWhite/70 hover:text-accent focus:outline-none"
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          )}
        </div>

        {/* Helper text / Error message / CapsLock Hint */}
        <div className="mt-1 ml-3 text-xs font-body">
          {(error || helperText) && (
            <p className={error ? 'text-primary' : 'text-textWhite/50'}>
              {error || helperText}
            </p>
          )}
          {isCapsLockOn && (
            <p className="text-accent">
              Bloq Mayús está activado
            </p>
          )}
        </div>
      </div>
    )
  }
)

InputBase.displayName = 'InputBase'

export default InputBase
