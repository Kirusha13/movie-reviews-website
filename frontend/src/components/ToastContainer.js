import React from 'react';
import styled from 'styled-components';
import Toast from './Toast';

const ToastContainer = ({ toasts, onHideToast }) => {
    return (
        <Container>
            {toasts.map((toast, index) => (
                <Toast
                    key={toast.id}
                    message={toast.message}
                    type={toast.type}
                    duration={toast.duration}
                    isVisible={toast.isVisible}
                    onClose={() => onHideToast(toast.id)}
                />
            ))}
        </Container>
    );
};

// Styled Components
const Container = styled.div`
    position: fixed;
    top: 0;
    right: 0;
    z-index: 10000;
    pointer-events: none;
    
    /* Позволяем кликать по toast уведомлениям */
    > * {
        pointer-events: auto;
    }
`;

export default ToastContainer;
