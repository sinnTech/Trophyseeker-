import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  // Added onClick prop to allow handling clicks on the card itself
  onClick?: React.MouseEventHandler<HTMLDivElement>;
}

const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => {
  return (
    <div className={`bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 ${className}`} onClick={onClick}>
      {children}
    </div>
  );
};

export default Card;