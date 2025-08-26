import { useState, useEffect, useCallback } from 'react';

/**
 * Хук для создания debounced значения
 * @param {any} value - Значение для debounce
 * @param {number} delay - Задержка в миллисекундах
 * @returns {any} - Debounced значение
 */
export const useDebounce = (value, delay = 500) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
};

/**
 * Хук для создания debounced функции
 * @param {Function} callback - Функция для debounce
 * @param {number} delay - Задержка в миллисекундах
 * @returns {Function} - Debounced функция
 */
export const useDebouncedCallback = (callback, delay = 500) => {
    const [debounceTimer, setDebounceTimer] = useState(null);

    const debouncedCallback = useCallback((...args) => {
        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }

        const newTimer = setTimeout(() => {
            callback(...args);
        }, delay);

        setDebounceTimer(newTimer);
    }, [callback, delay, debounceTimer]);

    // Очищаем таймер при размонтировании
    useEffect(() => {
        return () => {
            if (debounceTimer) {
                clearTimeout(debounceTimer);
            }
        };
    }, [debounceTimer]);

    return debouncedCallback;
};

/**
 * Хук для создания throttled функции
 * @param {Function} callback - Функция для throttle
 * @param {number} limit - Лимит вызовов в миллисекундах
 * @returns {Function} - Throttled функция
 */
export const useThrottledCallback = (callback, limit = 100) => {
    const [lastCall, setLastCall] = useState(0);

    const throttledCallback = useCallback((...args) => {
        const now = Date.now();
        
        if (now - lastCall >= limit) {
            callback(...args);
            setLastCall(now);
        }
    }, [callback, limit, lastCall]);

    return throttledCallback;
};

/**
 * Хук для создания memoized функции с кэшированием
 * @param {Function} callback - Функция для мемоизации
 * @param {Array} dependencies - Зависимости для useCallback
 * @returns {Function} - Мемоизированная функция
 */
export const useMemoizedCallback = (callback, dependencies = []) => {
    return useCallback(callback, dependencies);
};

/**
 * Хук для создания функции с retry логикой
 * @param {Function} callback - Функция для выполнения
 * @param {number} maxRetries - Максимальное количество попыток
 * @param {number} delay - Задержка между попытками
 * @returns {Function} - Функция с retry логикой
 */
export const useRetryCallback = (callback, maxRetries = 3, delay = 1000) => {
    const [retryCount, setRetryCount] = useState(0);

    const retryCallback = useCallback(async (...args) => {
        try {
            return await callback(...args);
        } catch (error) {
            if (retryCount < maxRetries) {
                setRetryCount(prev => prev + 1);
                
                // Ждем перед следующей попыткой
                await new Promise(resolve => setTimeout(resolve, delay));
                
                // Рекурсивно вызываем функцию
                return retryCallback(...args);
            } else {
                // Сбрасываем счетчик попыток
                setRetryCount(0);
                throw error;
            }
        }
    }, [callback, maxRetries, delay, retryCount]);

    // Сбрасываем счетчик при успешном выполнении
    const resetRetryCount = useCallback(() => {
        setRetryCount(0);
    }, []);

    return { retryCallback, retryCount, resetRetryCount };
};
