import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';

const PerformanceMonitor = React.memo(() => {
    const [renderCount, setRenderCount] = useState(0);
    const [fps, setFps] = useState(0);
    const [memoryUsage, setMemoryUsage] = useState(null);
    const [isVisible, setIsVisible] = useState(false);
    const frameCount = useRef(0);
    const lastTime = useRef(performance.now());
    const animationId = useRef(null);

    // Счетчик рендеров
    useEffect(() => {
        setRenderCount(prev => prev + 1);
    }, []);

    // Измерение FPS
    const measureFPS = useCallback(() => {
        frameCount.current++;
        const currentTime = performance.now();
        
        if (currentTime - lastTime.current >= 1000) {
            setFps(Math.round((frameCount.current * 1000) / (currentTime - lastTime.current)));
            frameCount.current = 0;
            lastTime.current = currentTime;
        }
        
        animationId.current = requestAnimationFrame(measureFPS);
    }, []);

    useEffect(() => {
        if (isVisible) {
            measureFPS();
        }
        
        return () => {
            if (animationId.current) {
                cancelAnimationFrame(animationId.current);
            }
        };
    }, [isVisible, measureFPS]);

    // Измерение использования памяти (если доступно)
    useEffect(() => {
        if (isVisible && 'memory' in performance) {
            const updateMemory = () => {
                const memory = performance.memory;
                setMemoryUsage({
                    used: Math.round(memory.usedJSHeapSize / 1024 / 1024 * 100) / 100,
                    total: Math.round(memory.totalJSHeapSize / 1024 / 1024 * 100) / 100,
                    limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024 * 100) / 100
                });
            };
            
            updateMemory();
            const interval = setInterval(updateMemory, 2000);
            
            return () => clearInterval(interval);
        }
    }, [isVisible]);

    // Переключение видимости
    const toggleVisibility = useCallback(() => {
        setIsVisible(!isVisible);
    }, [isVisible]);

    if (!isVisible) {
        return (
            <ToggleButton onClick={toggleVisibility}>
                📊 Показать монитор
            </ToggleButton>
        );
    }

    return (
        <MonitorContainer>
            <MonitorHeader>
                <h3>📊 Монитор производительности</h3>
                <ToggleButton onClick={toggleVisibility}>✕</ToggleButton>
            </MonitorHeader>
            
            <MetricsGrid>
                <MetricItem>
                    <MetricLabel>Рендеры:</MetricLabel>
                    <MetricValue>{renderCount}</MetricValue>
                </MetricItem>
                
                <MetricItem>
                    <MetricLabel>FPS:</MetricLabel>
                    <MetricValue 
                        color={fps >= 55 ? '#4CAF50' : fps >= 30 ? '#FF9800' : '#F44336'}
                    >
                        {fps}
                    </MetricValue>
                </MetricItem>
                
                {memoryUsage && (
                    <>
                        <MetricItem>
                            <MetricLabel>Память (MB):</MetricLabel>
                            <MetricValue>
                                {memoryUsage.used} / {memoryUsage.total}
                            </MetricValue>
                        </MetricItem>
                        
                        <MetricItem>
                            <MetricLabel>Лимит (MB):</MetricLabel>
                            <MetricValue>{memoryUsage.limit}</MetricValue>
                        </MetricItem>
                    </>
                )}
            </MetricsGrid>
            
            <PerformanceTips>
                <h4>💡 Советы по оптимизации:</h4>
                <ul>
                    <li>FPS ≥ 55: Отлично</li>
                    <li>FPS 30-54: Хорошо</li>
                    <li>FPS &lt; 30: Требует оптимизации</li>
                    <li>Много рендеров: Проверьте React.memo</li>
                </ul>
            </PerformanceTips>
        </MonitorContainer>
    );
});

// Styled Components
const ToggleButton = styled.button`
    position: fixed;
    top: 20px;
    right: 20px;
    background: #2196F3;
    color: white;
    border: none;
    padding: 10px 16px;
    border-radius: 8px;
    font-size: 14px;
    cursor: pointer;
    z-index: 10000;
    transition: all 0.2s ease;
    
    &:hover {
        background: #1976D2;
        transform: translateY(-2px);
    }
`;

const MonitorContainer = styled.div`
    position: fixed;
    top: 20px;
    right: 20px;
    width: 300px;
    background: rgba(0, 0, 0, 0.9);
    color: white;
    border-radius: 12px;
    padding: 16px;
    z-index: 10000;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
`;

const MonitorHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    
    h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
    }
`;

const MetricsGrid = styled.div`
    display: grid;
    gap: 12px;
    margin-bottom: 16px;
`;

const MetricItem = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
`;

const MetricLabel = styled.span`
    font-size: 14px;
    color: #ccc;
`;

const MetricValue = styled.span`
    font-size: 16px;
    font-weight: 600;
    color: ${props => props.color || '#4CAF50'};
`;

const PerformanceTips = styled.div`
    border-top: 1px solid rgba(255, 255, 255, 0.2);
    padding-top: 12px;
    
    h4 {
        margin: 0 0 8px 0;
        font-size: 14px;
        color: #FFD700;
    }
    
    ul {
        margin: 0;
        padding-left: 16px;
        font-size: 12px;
        color: #ccc;
        
        li {
            margin-bottom: 4px;
        }
    }
`;

export default PerformanceMonitor;
