import React from 'react';
import './Card.css';

const Card = ({ children, className = '', hover = true }) => {
    return (
        <div className={`card ${hover ? 'card-hover' : ''} ${className}`}>
            {children}
        </div>
    );
};

export default Card;
