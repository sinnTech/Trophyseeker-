import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Button from './Button';
import Card from './Card';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Focus on the input when modal opens
      setTimeout(() => inputRef.current?.focus(), 100);
      // Prevent scrolling on the body when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setUsername(''); // Clear input on close
    }
    return () => {
      document.body.style.overflow = ''; // Ensure overflow is reset on unmount
    };
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() === '') return;

    setIsLoggingIn(true);
    // Simulate API call for login
    setTimeout(() => {
      login(username.trim());
      setIsLoggingIn(false);
      onClose();
      alert(`Welcome, ${username.trim()}! You are now logged in.`);
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4 animate-fade-in"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-modal-title"
    >
      <Card
        className="relative w-full max-w-md p-8 bg-gray-800 rounded-lg shadow-xl border border-blue-700 animate-scale-in"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
      >
        <h2 id="login-modal-title" className="text-3xl font-bold text-blue-400 mb-6 text-center">
          Login to TrophySeeker
        </h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="username" className="block text-gray-300 text-sm font-medium mb-2">
              Enter your username:
            </label>
            <input
              type="text"
              id="username"
              ref={inputRef}
              className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., PlatinumHunter24"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoggingIn}
              aria-required="true"
              aria-label="Username input for login"
            />
          </div>
          <Button
            type="submit"
            isLoading={isLoggingIn}
            disabled={isLoggingIn || username.trim() === ''}
            className="w-full flex items-center justify-center"
            size="lg"
            aria-label="Login button"
          >
            Login
          </Button>
        </form>
        <Button
          onClick={onClose}
          variant="secondary"
          className="w-full mt-4"
          disabled={isLoggingIn}
          aria-label="Close login modal"
        >
          Cancel
        </Button>
      </Card>
    </div>
  );
};

export default LoginModal;