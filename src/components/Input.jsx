import React from 'react'

const Input = ({ label, name, type = "text", className, isRequired = true, placeholder, value, onChange }) => {
    return (
        <div className='w-2/3 lg:w-1/2'>
            <label htmlFor={name} className='block mb-2 text-sm font-medium text-gray-800'>{label}</label>
            <input type={type} id={name} className={`bg-gray-50 border-2 border-gray-300 text-gray-800 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 ${className}`} placeholder={placeholder} value={value} onChange={onChange} required={isRequired} />
        </div>
    )
}

export default Input