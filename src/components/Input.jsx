import React, { useState } from 'react';
import './Input.css';

const Input = ({
    label,
    type = 'text',
    value,
    onChange,
    placeholder,
    icon,
    error,
    required = false,
    ...props
}) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <div className="input-group">
            {label && (
                <label className={`input-label ${isFocused || value ? 'input-label-float' : ''}`}>
                    {label} {required && <span className="input-required">*</span>}
                </label>
            )}
            <div className="input-wrapper">
                {icon && <span className="input-icon">{icon}</span>}
                <input
                    type={type}
                    value={value}
                    onChange={onChange}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder={placeholder}
                    className={`input ${icon ? 'input-with-icon' : ''} ${error ? 'input-error' : ''}`}
                    {...props}
                />
            </div>
            {error && <span className="input-error-text">{error}</span>}
        </div>
    );
};

export default Input;
