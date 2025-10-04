import React, { forwardRef } from 'react';

const Select = forwardRef(({ 
  label, 
  error, 
  helperText, 
  options = [],
  placeholder = 'Выберите...',
  className = '',
  ...props 
}, ref) => {
  const selectClasses = `
    input
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
      
      <select
        ref={ref}
        className={selectClasses}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      
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

Select.displayName = 'Select';

export default Select;
