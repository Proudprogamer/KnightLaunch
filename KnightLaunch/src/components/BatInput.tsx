import React, { InputHTMLAttributes } from 'react';

interface BatInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export function BatInput({ label, ...props }: BatInputProps) {
  return (
    <div className="mb-6">
      <label className="block text-yellow-500 text-sm font-bold mb-2">
        {label}
      </label>
      <input
        {...props}
        className="w-full bg-gray-900 border-2 border-yellow-500 rounded-lg py-3 px-4 text-gray-100 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition-all duration-200"
      />
    </div>
  );
}