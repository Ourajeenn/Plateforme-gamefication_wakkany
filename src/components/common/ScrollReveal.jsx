import React, { useState, useEffect, useRef } from 'react';

/**
 * ScrollReveal - A premium component to reveal children with scroll animations.
 * 
 * Props:
 * - children: The elements to reveal
 * - className: Optional class names for the wrapper div
 * - animation: 'fade-up' | 'fade-down' | 'fade-left' | 'fade-right' | 'scale-up' | 'scale-down'
 * - delay: Animation delay in milliseconds
 * - duration: Animation duration in milliseconds
 * - threshold: Intersection threshold (0 to 1)
 */
export default function ScrollReveal({ 
  children, 
  className = '', 
  animation = 'fade-up', 
  delay = 0, 
  duration = 800,
  threshold = 0.05
}) {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef(null);

  useEffect(() => {
    const currentRef = domRef.current;
    if (!currentRef) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(currentRef);
        }
      },
      { 
        threshold, 
        rootMargin: '0px 0px -40px 0px' // Trigger slightly before element enters viewport
      }
    );

    observer.observe(currentRef);

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [threshold]);

  const getAnimationStyles = () => {
    if (isVisible) {
      return {
        opacity: 1,
        transform: 'translate(0, 0) scale(1)',
        transition: `opacity ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
      };
    }

    const styles = {
      opacity: 0,
      transition: `opacity ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
      willChange: 'transform, opacity',
    };

    switch (animation) {
      case 'fade-up':
        styles.transform = 'translateY(40px)';
        break;
      case 'fade-down':
        styles.transform = 'translateY(-40px)';
        break;
      case 'fade-left':
        styles.transform = 'translateX(40px)';
        break;
      case 'fade-right':
        styles.transform = 'translateX(-40px)';
        break;
      case 'scale-up':
        styles.transform = 'scale(0.94)';
        break;
      case 'scale-down':
        styles.transform = 'scale(1.06)';
        break;
      default:
        styles.transform = 'translateY(40px)';
    }

    return styles;
  };

  return (
    <div ref={domRef} style={getAnimationStyles()} className={className}>
      {children}
    </div>
  );
}
