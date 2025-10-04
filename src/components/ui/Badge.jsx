import React from 'react';

const Badge = ({ 
  children, 
  variant = 'default',
  size = 'md',
  className = '',
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center font-medium rounded-full';
  
  const variantClasses = {
    default: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200',
    primary: 'bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200',
    success: 'bg-success-100 dark:bg-success-900 text-success-800 dark:text-success-200',
    warning: 'bg-warning-100 dark:bg-warning-900 text-warning-800 dark:text-warning-200',
    danger: 'bg-danger-100 dark:bg-danger-900 text-danger-800 dark:text-danger-200',
    // Status variants
    new: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
    'in-progress': 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200',
    'under-review': 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200',
    closed: 'bg-success-100 dark:bg-success-900 text-success-800 dark:text-success-200',
    canceled: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200',
    // Priority variants
    high: 'bg-danger-100 dark:bg-danger-900 text-danger-800 dark:text-danger-200',
    medium: 'bg-warning-100 dark:bg-warning-900 text-warning-800 dark:text-warning-200',
    low: 'bg-success-100 dark:bg-success-900 text-success-800 dark:text-success-200',
  };
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-xs',
    lg: 'px-3 py-1 text-sm',
  };
  
  const classes = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${className}
  `.trim();
  
  return (
    <span className={classes} {...props}>
      {children}
    </span>
  );
};

export default Badge;
