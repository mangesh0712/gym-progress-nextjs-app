'use client';

import { useEffect, useState } from 'react';

export function ThemeSwitcher() {
  const [isDark, setIsDark] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Get saved theme from localStorage
    const savedTheme = localStorage.getItem('gym-theme') || 'dark';
    const darkMode = savedTheme === 'dark';

    setIsDark(darkMode);

    // Apply theme to HTML element
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    setIsMounted(true);
  }, []);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);

    // Update HTML class
    if (newIsDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('gym-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('gym-theme', 'light');
    }
  };

  if (!isMounted) {
    return (
      <button className="btn btn-ghost btn-circle" disabled>
        ◯
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="btn btn-ghost btn-circle transition-all"
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      aria-label={`Current theme: ${isDark ? 'dark' : 'light'}`}
    >
      {isDark ? '☀️' : '🌙'}
    </button>
  );
}
