/**
 * useIntersectionObserver — Lazy loading des sections pour améliorer les perfs
 */

import { useEffect, useRef, useState } from 'react';

export function useIntersectionObserver(options = {}) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        // Unobserve after first visibility
        observer.unobserve(ref.current);
      }
    }, {
      threshold: 0.1,
      ...options,
    });

    observer.observe(ref.current);

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [options]);

  return [ref, isVisible];
}

/**
 * LazySection — Section qui se charge que lorsqu'elle est visible
 */
export function LazySection({ children, className = '', fallback = null, ...props }) {
  const [ref, isVisible] = useIntersectionObserver();

  return (
    <div ref={ref} className={className} {...props}>
      {isVisible ? children : fallback}
    </div>
  );
}
