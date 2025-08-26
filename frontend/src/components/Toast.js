import React, { useEffect } from 'react';
import styled from 'styled-components';

const Toast = ({ 
    message, 
    type = 'info', 
    duration = 4000, 
    onClose, 
    isVisible 
}) => {
    useEffect(() => {
        if (isVisible && duration > 0) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [isVisible, duration, onClose]);

    if (!isVisible) return null;

    return (
        <ToastContainer type={type}>
            <ToastIcon type={type}>
                {type === 'success' && '✓'}
                {type === 'error' && '✕'}
                {type === 'warning' && '⚠'}
                {type === 'info' && 'ℹ'}
            </ToastIcon>
            <ToastMessage>{message}</ToastMessage>
            <CloseButton onClick={onClose}>&times;</CloseButton>
        </ToastContainer>
    );
};

// Styled Components
const ToastContainer = styled.div`
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${props => {
        switch (props.type) {
            case 'success': return '#4caf50';
            case 'error': return '#f44336';
            case 'warning': return '#ff9800';
            case 'info': return '#2196f3';
            default: return '#333';
        }
    }};
    color: white;
    padding: 16px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 300px;
    max-width: 400px;
    z-index: 10000;
    animation: slideIn 0.3s ease-out;
    
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @media (max-width: 768px) {
        top: 10px;
        right: 10px;
        left: 10px;
        min-width: auto;
        max-width: none;
        padding: 12px 16px;
        font-size: 13px;
    }
`;

const ToastIcon = styled.div`
    font-size: 18px;
    font-weight: bold;
    flex-shrink: 0;
`;

const ToastMessage = styled.div`
    flex: 1;
    font-size: 14px;
    line-height: 1.4;
`;

const CloseButton = styled.button`
    background: none;
    border: none;
    color: white;
    font-size: 20px;
    cursor: pointer;
    padding: 0;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0.8;
    transition: opacity 0.2s ease;
    
    &:hover {
        opacity: 1;
    }
`;

export default Toast;
