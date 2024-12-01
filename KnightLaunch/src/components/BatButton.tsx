import React from 'react';

interface BatButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export function BatButton({ children, ...props }: BatButtonProps) {
  return (
    <button
      {...props}
      className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 px-8 rounded-lg transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-yellow-500/50"
    >
      {children}
    </button>
  );
}