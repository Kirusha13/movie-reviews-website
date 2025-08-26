import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import styled from 'styled-components';

const VirtualizedList = React.memo(({ 
    items, 
    itemHeight = 400, 
    containerHeight = 800,
    renderItem,
    overscan = 3,
    className 
}) => {
    const [scrollTop, setScrollTop] = useState(0);
    const containerRef = useRef(null);
    const scrollElementRef = useRef(null);

    // Вычисляем видимые элементы
    const visibleRange = useMemo(() => {
        const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
        const endIndex = Math.min(
            items.length - 1,
            Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
        );
        
        return { startIndex, endIndex };
    }, [scrollTop, containerHeight, itemHeight, overscan, items.length]);

    // Получаем только видимые элементы
    const visibleItems = useMemo(() => {
        const { startIndex, endIndex } = visibleRange;
        return items.slice(startIndex, endIndex + 1).map((item, index) => ({
            ...item,
            virtualIndex: startIndex + index
        }));
    }, [items, visibleRange]);

    // Общая высота списка
    const totalHeight = useMemo(() => items.length * itemHeight, [items.length, itemHeight]);

    // Обработчик скролла
    const handleScroll = useCallback((e) => {
        setScrollTop(e.target.scrollTop);
    }, []);

    // Прокрутка к элементу
    const scrollToItem = useCallback((index) => {
        if (scrollElementRef.current) {
            const scrollTop = index * itemHeight;
            scrollElementRef.current.scrollTop = scrollTop;
        }
    }, [itemHeight]);

    // Прокрутка к началу
    const scrollToTop = useCallback(() => {
        scrollToItem(0);
    }, [scrollToItem]);

    // Прокрутка к концу
    const scrollToBottom = useCallback(() => {
        scrollToItem(items.length - 1);
    }, [scrollToItem, items.length]);

    // Автоматическая прокрутка при изменении элементов
    useEffect(() => {
        if (items.length > 0 && scrollTop > 0) {
            // Прокручиваем к последнему добавленному элементу
            const lastItemIndex = items.length - 1;
            const lastItemScrollTop = lastItemIndex * itemHeight;
            
            if (scrollTop < lastItemScrollTop) {
                scrollToItem(lastItemIndex);
            }
        }
    }, [items.length, scrollTop, itemHeight, scrollToItem]);

    return (
        <Container 
            ref={containerRef}
            className={className}
            style={{ height: containerHeight }}
        >
            <ScrollContainer
                ref={scrollElementRef}
                onScroll={handleScroll}
                style={{ height: totalHeight }}
            >
                <VisibleItemsContainer
                    style={{
                        transform: `translateY(${visibleRange.startIndex * itemHeight}px)`
                    }}
                >
                    {visibleItems.map((item) => (
                        <ItemWrapper
                            key={item.id || item.virtualIndex}
                            style={{ height: itemHeight }}
                        >
                            {renderItem(item, item.virtualIndex)}
                        </ItemWrapper>
                    ))}
                </VisibleItemsContainer>
            </ScrollContainer>
            
            {/* Навигационные кнопки */}
            {items.length > 10 && (
                <NavigationButtons>
                    <NavButton onClick={scrollToTop} title="В начало">
                        ↑
                    </NavButton>
                    <NavButton onClick={scrollToBottom} title="В конец">
                        ↓
                    </NavButton>
                </NavigationButtons>
            )}
        </Container>
    );
});

// Styled Components
const Container = styled.div`
    position: relative;
    overflow: hidden;
    border-radius: 8px;
`;

const ScrollContainer = styled.div`
    overflow-y: auto;
    overflow-x: hidden;
    
    /* Кастомный скроллбар */
    &::-webkit-scrollbar {
        width: 8px;
    }
    
    &::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 4px;
    }
    
    &::-webkit-scrollbar-thumb {
        background: #c1c1c1;
        border-radius: 4px;
        
        &:hover {
            background: #a8a8a8;
        }
    }
`;

const VisibleItemsContainer = styled.div`
    position: relative;
`;

const ItemWrapper = styled.div`
    position: relative;
    overflow: hidden;
`;

const NavigationButtons = styled.div`
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    flex-direction: column;
    gap: 8px;
    z-index: 10;
`;

const NavButton = styled.button`
    width: 40px;
    height: 40px;
    border: none;
    border-radius: 50%;
    background: rgba(52, 152, 219, 0.9);
    color: white;
    font-size: 18px;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    
    &:hover {
        background: rgba(52, 152, 219, 1);
        transform: scale(1.1);
    }
    
    &:active {
        transform: scale(0.95);
    }
`;

export default VirtualizedList;
