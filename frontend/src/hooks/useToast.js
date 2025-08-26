import { useState, useCallback } from 'react';

const useToast = () => {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((message, type = 'info', duration = 4000) => {
        const id = Date.now() + Math.random();
        const newToast = { id, message, type, duration, isVisible: true };
        
        setToasts(prev => [...prev, newToast]);
        
        // Автоматически скрываем toast через указанное время
        if (duration > 0) {
            setTimeout(() => {
                hideToast(id);
            }, duration);
        }
        
        return id;
    }, []);

    const hideToast = useCallback((id) => {
        setToasts(prev => prev.map(toast => 
            toast.id === id ? { ...toast, isVisible: false } : toast
        ));
        
        // Удаляем toast из DOM после анимации
        setTimeout(() => {
            setToasts(prev => prev.filter(toast => toast.id !== id));
        }, 300);
    }, []);

    const showSuccess = useCallback((message, duration) => {
        return showToast(message, 'success', duration);
    }, [showToast]);

    const showError = useCallback((message, duration) => {
        return showToast(message, 'error', duration);
    }, [showToast]);

    const showWarning = useCallback((message, duration) => {
        return showToast(message, 'warning', duration);
    }, [showToast]);

    const showInfo = useCallback((message, duration) => {
        return showToast(message, 'info', duration);
    }, [showToast]);

    const clearAllToasts = useCallback(() => {
        setToasts([]);
    }, []);

    return {
        toasts,
        showToast,
        hideToast,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        clearAllToasts
    };
};

export default useToast;
