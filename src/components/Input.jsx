import React from 'react'

const Input = ({ label, name, type = "text", className, inputClassName, isRequired = true, placeholder, value, onChange, style }) => {
    return (
        <div className={`${className}`}>
            <label htmlFor={name} className='block mb-2 text-sm font-medium text-gray-800'>{label}</label>
            <input type={type} id={name} className={`bg-gray-50 border-2 border-gray-300 text-gray-800 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 ${inputClassName}`} placeholder={placeholder} value={value} onChange={onChange} required={isRequired} />
        </div>
    )
}

export default Input