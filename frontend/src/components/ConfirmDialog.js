import React from 'react';
import styled from 'styled-components';

const ConfirmDialog = ({ 
    isOpen, 
    title, 
    message, 
    confirmText = 'Подтвердить', 
    cancelText = 'Отмена',
    onConfirm, 
    onCancel,
    type = 'danger' // danger, warning, info
}) => {
    if (!isOpen) return null;

    return (
        <Overlay onClick={(e) => e.stopPropagation()}>
            <DialogContainer onClick={(e) => e.stopPropagation()}>
                <DialogHeader type={type}>
                    <DialogTitle>{title}</DialogTitle>
                    <CloseButton onClick={(e) => {
                        e.stopPropagation();
                        onCancel();
                    }}>&times;</CloseButton>
                </DialogHeader>
                
                <DialogBody>
                    <DialogMessage>{message}</DialogMessage>
                </DialogBody>
                
                <DialogFooter>
                    <CancelButton onClick={(e) => {
                        e.stopPropagation();
                        onCancel();
                    }}>
                        {cancelText}
                    </CancelButton>
                    <ConfirmButton type={type} onClick={(e) => {
                        e.stopPropagation();
                        onConfirm();
                    }}>
                        {confirmText}
                    </ConfirmButton>
                </DialogFooter>
            </DialogContainer>
        </Overlay>
    );
};

// Styled Components
const Overlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10000;
    animation: fadeIn 0.2s ease-out;
    
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
`;

const DialogContainer = styled.div`
    background: white;
    border-radius: 12px;
    width: 90%;
    max-width: 450px;
    max-height: 90vh;
    overflow: hidden;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    animation: slideUp 0.3s ease-out;
    
    @keyframes slideUp {
        from {
            transform: translateY(20px);
            opacity: 0;
        }
        to {
            transform: translateY(0);
            opacity: 1;
        }
    }
    
    @media (max-width: 768px) {
        width: 95%;
        margin: 20px;
        max-height: calc(100vh - 40px);
    }
`;

const DialogHeader = styled.div`
    background: ${props => {
        switch (props.type) {
            case 'danger': return '#f44336';
            case 'warning': return '#ff9800';
            case 'info': return '#2196f3';
            default: return '#333';
        }
    }};
    color: white;
    padding: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const DialogTitle = styled.h3`
    margin: 0;
    font-size: 18px;
    font-weight: 600;
`;

const CloseButton = styled.button`
    background: none;
    border: none;
    color: white;
    font-size: 24px;
    cursor: pointer;
    padding: 0;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0.8;
    transition: opacity 0.2s ease;
    
    &:hover {
        opacity: 1;
    }
`;

const DialogBody = styled.div`
    padding: 20px;
`;

const DialogMessage = styled.p`
    margin: 0;
    color: #333;
    font-size: 14px;
    line-height: 1.5;
`;

const DialogFooter = styled.div`
    padding: 20px;
    display: flex;
    gap: 12px;
    justify-content: flex-end;
    border-top: 1px solid #e0e0e0;
    background: #fafafa;
    
    @media (max-width: 768px) {
        flex-direction: column;
        gap: 8px;
    }
`;

const Button = styled.button`
    padding: 10px 20px;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:hover {
        transform: translateY(-1px);
    }
    
    &:active {
        transform: translateY(0);
    }
`;

const CancelButton = styled(Button)`
    background: #f8f9fa;
    color: #666;
    border: 1px solid #e0e0e0;
    
    &:hover {
        background: #e9ecef;
        color: #333;
    }
`;

const ConfirmButton = styled(Button)`
    background: ${props => {
        switch (props.type) {
            case 'danger': return '#f44336';
            case 'warning': return '#ff9800';
            case 'info': return '#2196f3';
            default: return '#333';
        }
    }};
    color: white;
    
    &:hover {
        background: ${props => {
            switch (props.type) {
                case 'danger': return '#d32f2f';
                case 'warning': return '#f57c00';
                case 'info': return '#1976d2';
                default: return '#555';
            }
        }};
    }
`;

export default ConfirmDialog;
