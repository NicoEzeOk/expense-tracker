"use client"

import { useState } from 'react'

interface FormInputProps {
  id: string
  type: string
  label: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  required?: boolean
  icon?: string
}

export default function FormInput({ id, type, label, value, onChange, required = false, icon }: FormInputProps) {
  const [isFocused, setIsFocused] = useState(false)

  return (
    <div className="relative group">
      <div className={`
        absolute left-3 transition-all duration-300 pointer-events-none z-10
        ${(isFocused || value) 
          ? '-top-2 text-xs text-violet-600 dark:text-violet-400 bg-white dark:bg-gray-800 px-2' 
          : 'top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400'}
        ${icon ? 'left-10' : 'left-3'}
      `}>
        {label}
      </div>
      
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-xl">
            {icon}
          </div>
        )}
        <input
          type={type}
          id={id}
          value={value}
          onChange={onChange}
          required={required}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`
            w-full h-14 transition-all duration-300
            ${icon ? 'pl-10 pr-3' : 'px-3'}
            rounded-xl
            ${isFocused 
              ? 'border-2 border-violet-500 dark:border-violet-400 shadow-lg shadow-violet-100/50 dark:shadow-violet-900/50' 
              : 'border border-gray-200 dark:border-gray-600'}
            bg-white dark:bg-gray-800 text-gray-900 dark:text-white
            focus:outline-none focus:ring-0
            placeholder-transparent
            group-hover:border-violet-400 dark:group-hover:border-violet-500
          `}
          placeholder={label}
        />
      </div>

      {/* Efecto de brillo en el borde */}
      <div className={`
        absolute inset-0 rounded-xl transition-opacity duration-300 pointer-events-none
        bg-gradient-to-r from-violet-500/20 to-indigo-500/20 opacity-0
        ${isFocused ? 'opacity-100' : 'group-hover:opacity-50'}
      `} />
    </div>
  )
} 