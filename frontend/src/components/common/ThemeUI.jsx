import React from 'react';

/**
 * ==============================================================================
 * FOUNDERS WORKSPACE DESIGN SYSTEM UI PRIMITIVES
 * Use these unified components for any new page, card, or modal in the website
 * to maintain 100% theme consistency with the light executive portal.
 * ==============================================================================
 */

/**
 * PortalCard - The primary white card container for all portal modules
 */
export const PortalCard = ({ 
  children, 
  className = '', 
  interactive = false, 
  hoverBorder = 'orange', // 'orange' | 'amber' | 'blue'
  ...props 
}) => {
  const hoverClass = interactive 
    ? hoverBorder === 'amber' 
      ? 'hover:border-amber-400 hover:shadow-xl cursor-pointer'
      : hoverBorder === 'blue'
      ? 'hover:border-blue-400 hover:shadow-xl cursor-pointer'
      : 'hover:border-orange-400 hover:shadow-xl cursor-pointer'
    : '';

  return (
    <div 
      className={`p-5 md:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm transition-all duration-300 ${hoverClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * PortalSection - Inner gray-50 background container for grouping controls, pipelines, or lists
 */
export const PortalSection = ({ children, className = '', ...props }) => (
  <div 
    className={`p-4 rounded-2xl border bg-slate-50 border-slate-200/80 space-y-3 ${className}`}
    {...props}
  >
    {children}
  </div>
);

/**
 * PortalSubCard - Nested card for stages, metrics, or individual list items
 */
export const PortalSubCard = ({ 
  children, 
  className = '', 
  interactive = true, 
  ...props 
}) => (
  <div 
    className={`p-3 rounded-xl border bg-white border-slate-200/90 shadow-2xs transition-all ${
      interactive ? 'hover:border-orange-300 hover:shadow-xs' : ''
    } ${className}`}
    {...props}
  >
    {children}
  </div>
);

/**
 * PortalBadge - Standardized status pill / badge
 * variants: 'orange' | 'amber' | 'emerald' | 'blue' | 'slate' | 'red'
 */
export const PortalBadge = ({ 
  children, 
  variant = 'orange', 
  className = '',
  icon: Icon,
  ...props 
}) => {
  const variantStyles = {
    orange: 'bg-orange-50 text-orange-700 border-orange-200',
    amber: 'bg-amber-50 text-amber-800 border-amber-200',
    emerald: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
    red: 'bg-rose-50 text-rose-700 border-rose-200',
  };

  const selected = variantStyles[variant] || variantStyles.orange;

  return (
    <span 
      className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full border font-mono tracking-tight ${selected} ${className}`}
      {...props}
    >
      {Icon && <Icon className="w-3 h-3 shrink-0" />}
      <span>{children}</span>
    </span>
  );
};

/**
 * PortalButton - Standard button styles
 * variants: 'primary' | 'secondary' | 'amber' | 'ghost' | 'danger'
 */
export const PortalButton = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  icon: Icon,
  ...props 
}) => {
  const sizeStyles = {
    sm: 'px-2.5 py-1 text-xs rounded-xl',
    md: 'px-3.5 py-2 text-xs rounded-xl font-bold',
    lg: 'px-4 py-2.5 text-sm rounded-2xl font-bold',
  };

  const variantStyles = {
    primary: 'bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white shadow-md shadow-orange-600/20 hover:shadow-lg',
    secondary: 'bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 hover:border-slate-300 shadow-2xs',
    amber: 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 shadow-2xs',
    orange: 'bg-orange-50 hover:bg-orange-100 text-orange-800 border border-orange-200 shadow-2xs',
    ghost: 'text-slate-600 hover:text-slate-900 hover:bg-slate-100',
    danger: 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 shadow-2xs',
  };

  return (
    <button 
      className={`inline-flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
      <span>{children}</span>
    </button>
  );
};

/**
 * PortalProgressBar - Uniform progress bar
 */
export const PortalProgressBar = ({ 
  value = 0, 
  className = '',
  variant = 'gradient' // 'gradient' | 'emerald' | 'amber'
}) => {
  const clamped = Math.min(100, Math.max(0, value));

  const barColor = 
    variant === 'emerald' || clamped >= 100
      ? 'bg-emerald-500'
      : variant === 'amber'
      ? 'bg-amber-500'
      : 'bg-gradient-to-r from-orange-600 to-amber-500';

  return (
    <div className={`w-full h-1.5 rounded-full overflow-hidden bg-slate-100 ${className}`}>
      <div 
        className={`h-full rounded-full transition-all duration-500 ${barColor}`} 
        style={{ width: `${clamped}%` }} 
      />
    </div>
  );
};

/**
 * PortalStatBox - Metric / detail display box
 */
export const PortalStatBox = ({ 
  label, 
  value, 
  icon: Icon, 
  className = '' 
}) => (
  <div className={`p-2.5 rounded-2xl border border-slate-200/90 bg-slate-50 space-y-1 ${className}`}>
    <span className="text-[10px] block font-medium text-slate-500">
      {label}
    </span>
    <span className="font-bold text-xs flex items-center gap-1 text-slate-800">
      {Icon && <Icon className="w-3 h-3 text-orange-500" />}
      <span>{value}</span>
    </span>
  </div>
);

/**
 * PortalInput - Standardized input field
 */
export const PortalInput = ({ className = '', ...props }) => (
  <input 
    className={`w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 text-xs focus:ring-2 focus:ring-orange-500 focus:border-transparent focus:outline-none transition-all placeholder:text-slate-400 ${className}`}
    {...props}
  />
);
