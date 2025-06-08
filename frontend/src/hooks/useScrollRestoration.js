import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

const SCROLL_POSITIONS = new Map();

export const useScrollRestoration = () => {
  const location = useLocation();
  const prevPathRef = useRef(location.pathname);

  // Save scroll position when leaving a page
  useEffect(() => {
    const handleScroll = () => {
      SCROLL_POSITIONS.set(location.pathname, window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  // Restore scroll position when returning to a page
  useEffect(() => {
    if (prevPathRef.current !== location.pathname) {
      // If we have a saved position and we're using the back button
      if (window.history.state?.type === 'back' && SCROLL_POSITIONS.has(location.pathname)) {
        // Restore to the saved position
        window.scrollTo(0, SCROLL_POSITIONS.get(location.pathname));
      } else {
        // Scroll to top for new page visits
        window.scrollTo(0, 0);
      }
      prevPathRef.current = location.pathname;
    }
  }, [location.pathname]);

  return null;
}; 