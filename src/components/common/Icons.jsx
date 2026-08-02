import React from 'react';

const icons = {
  arrowLeft: ({ width, height, className, ...props }) => (
    <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <path d="M15 18l-6-6 6-6" />
    </svg>
  ),
  triangleLogo: ({ width, height, className, ...props }) => (
    <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <path d="M12 5L4 19h16L12 5z" />
      <path d="M12 9.5v5.5" />
    </svg>
  ),
  shield: ({ width, height, className, ...props }) => (
    <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <path d="M12 3l7 3v5c0 5-3 8.5-7 10-4-1.5-7-5-7-10V6l7-3z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  ),
  sword: ({ width, height, className, ...props }) => (
    <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <path d="M7 17L17 7" />
      <path d="M11.5 3.5l9 9" />
      <path d="M14 6l4 4" />
      <path d="M8 16l-3 3 3 3 3-3" />
      <path d="M15 12l3 3" />
    </svg>
  ),
  gauge: ({ width, height, className, ...props }) => (
    <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <path d="M4 12a8 8 0 0 1 16 0" />
      <path d="M12 12l3-3" />
      <path d="M7 18h10" />
    </svg>
  ),
  zap: ({ width, height, className, ...props }) => (
    <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <path d="M13 2L3 14h7l-1 8L21 10h-7l1-8z" />
    </svg>
  ),
  logout: ({ width, height, className, ...props }) => (
    <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  ),
  menu: ({ width, height, className, ...props }) => (
    <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" className={className} {...props}>
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </svg>
  ),
  close: ({ width, height, className, ...props }) => (
    <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" className={className} {...props}>
      <path d="M6 6l12 12" />
      <path d="M18 6L6 18" />
    </svg>
  ),
  user: ({ width, height, className, ...props }) => (
    <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  trophy: ({ width, height, className, ...props }) => (
    <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <path d="M6 3h12v4a4 4 0 0 1-4 4H10a4 4 0 0 1-4-4V3z" />
      <path d="M8 7H6a4 4 0 0 1-4-4v0" />
      <path d="M18 7h2a4 4 0 0 0 4-4v0" />
      <path d="M10 21h4" />
      <path d="M12 11v10" />
    </svg>
  ),
  scroll: ({ width, height, className, ...props }) => (
    <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <path d="M6 3h10a3 3 0 0 1 3 3v14a3 3 0 0 1-3 3H6" />
      <path d="M9 3v18" />
      <path d="M15 3v18" />
    </svg>
  ),
  gitBranch: ({ width, height, className, ...props }) => (
    <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <circle cx="6" cy="18" r="2" />
      <circle cx="18" cy="6" r="2" />
      <circle cx="18" cy="18" r="2" />
      <path d="M8 18h8" />
      <path d="M18 8v8" />
      <path d="M6 20V8a4 4 0 0 1 4-4h8" />
    </svg>
  ),
  gamepad: ({ width, height, className, ...props }) => (
    <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <rect x="3" y="7" width="18" height="10" rx="3" />
      <path d="M8 12h.01" />
      <path d="M12 10v4" />
      <path d="M14 12h2" />
      <path d="M6 12h2" />
    </svg>
  ),
};

export default function Icon({ name, width = 24, height = 24, className = '', ...props }) {
  const IconComponent = icons[name];
  if (!IconComponent) return null;
  return <IconComponent width={width} height={height} className={className} {...props} />;
}
