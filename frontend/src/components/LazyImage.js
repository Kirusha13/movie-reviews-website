import React, { useState, useRef, useEffect, useCallback } from 'react';
import styled from 'styled-components';

const LazyImage = React.memo(({ 
    src, 
    alt, 
    fallbackSrc = '/default-poster.jpg',
    className,
    onLoad,
    onError,
    ...props 
}) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isInView, setIsInView] = useState(false);
    const [hasError, setHasError] = useState(false);
    const imgRef = useRef(null);
    const observerRef = useRef(null);

    const handleLoad = useCallback(() => {
        setIsLoaded(true);
        onLoad?.();
    }, [onLoad]);

    const handleError = useCallback(() => {
        setHasError(true);
        onError?.();
    }, [onError]);

    useEffect(() => {
        if (!imgRef.current) return;

        // Создаем Intersection Observer для ленивой загрузки
        observerRef.current = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setIsInView(true);
                        // Отключаем observer после первого появления
                        observerRef.current?.unobserve(entry.target);
                    }
                });
            },
            {
                rootMargin: '50px', // Загружаем изображение за 50px до появления
                threshold: 0.1
            }
        );

        observerRef.current.observe(imgRef.current);

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, []);

    const imageSrc = hasError ? fallbackSrc : (isInView ? src : fallbackSrc);

    return (
        <ImageContainer className={className} {...props}>
            <StyledImage
                ref={imgRef}
                src={imageSrc}
                alt={alt}
                onLoad={handleLoad}
                onError={handleError}
                isLoaded={isLoaded}
                {...props}
            />
            {!isLoaded && !hasError && (
                <LoadingPlaceholder>
                    <LoadingSpinner />
                </LoadingPlaceholder>
            )}
        </ImageContainer>
    );
});

// Styled Components
const ImageContainer = styled.div`
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
`;

const StyledImage = styled.img`
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: opacity 0.3s ease;
    opacity: ${props => props.isLoaded ? 1 : 0};
`;

const LoadingPlaceholder = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: #f0f0f0;
    display: flex;
    align-items: center;
    justify-content: center;
`;

const LoadingSpinner = styled.div`
    width: 20px;
    height: 20px;
    border: 2px solid #e0e0e0;
    border-top: 2px solid #3498db;
    border-radius: 50%;
    animation: spin 1s linear infinite;

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;

export default LazyImage;
