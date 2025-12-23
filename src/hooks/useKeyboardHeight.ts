import { useState, useEffect } from 'react';

/**
 * Hook to detect keyboard visibility and height on mobile devices
 * Uses Visual Viewport API for accurate keyboard detection
 */
export const useKeyboardHeight = () => {
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    // Only run on mobile devices
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (!isMobile) return;

    // Check if Visual Viewport API is available
    if (!window.visualViewport) return;

    const handleResize = () => {
      const viewport = window.visualViewport;
      if (!viewport) return;

      // Calculate keyboard height
      // When keyboard opens, visualViewport.height decreases
      const windowHeight = window.innerHeight;
      const viewportHeight = viewport.height;
      const heightDiff = windowHeight - viewportHeight;

      // Threshold to determine if keyboard is open (accounts for browser UI changes)
      const isOpen = heightDiff > 150;

      setIsKeyboardVisible(isOpen);
      setKeyboardHeight(isOpen ? heightDiff : 0);
    };

    // Listen to viewport resize events
    window.visualViewport.addEventListener('resize', handleResize);
    window.visualViewport.addEventListener('scroll', handleResize);

    // Initial check
    handleResize();

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize);
        window.visualViewport.removeEventListener('scroll', handleResize);
      }
    };
  }, []);

  return { keyboardHeight, isKeyboardVisible };
};
