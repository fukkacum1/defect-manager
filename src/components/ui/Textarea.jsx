import React, { forwardRef } from 'react';

const Textarea = forwardRef(({ 
  label, 
  error, 
  helperText, 
  className = '',
  ...props 
}, ref) => {
  const textareaClasses = `
    input
    resize-none
    ${error ? 'input-error' : ''}
    ${className}
  `.trim();
  
  return (
    <div className="w-full">
      {label && (
        <label className="label">
          {label}
        </label>
      )}
      
      <textarea
        ref={ref}
        className={textareaClasses}
        {...props}
      />
      
      {error && (
        <p className="mt-1 text-sm text-danger-600 dark:text-danger-400">
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {helperText}
        </p>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';

export default Textarea;
