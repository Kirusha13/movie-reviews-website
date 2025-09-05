import React from 'react';
import styled from 'styled-components';

const TierMovieCard = React.memo(({
    movie,
    onDragStart,
    onRemove,
    showRemoveButton = true,
    size = 'medium'
}) => {
    const handleDragStart = (e) => {
        e.dataTransfer.setData('application/json', JSON.stringify({
            movieId: movie.id,
            fromTier: null,
            fromPosition: null
        }));
        onDragStart && onDragStart(movie.id);
    };

    const sizeStyles = {
        small: {
            posterWidth: 50,
            posterHeight: 75
        },
        medium: {
            posterWidth: 70,
            posterHeight: 100
        },
        large: {
            posterWidth: 90,
            posterHeight: 130
        }
    };

    const currentSize = sizeStyles[size];

    return (
        <CardContainer>
            <MoviePoster
                src={movie.poster_url || '/placeholder-movie.jpg'}
                alt={movie.title}
                draggable
                onDragStart={handleDragStart}
                onError={(e) => {
                    e.target.src = '/placeholder-movie.jpg';
                }}
                width={currentSize.posterWidth}
                height={currentSize.posterHeight}
            />

            {showRemoveButton && onRemove && (
                <RemoveButton
                    onClick={() => onRemove(movie.id)}
                    title="Удалить фильм"
                >
                    ×
                </RemoveButton>
            )}
        </CardContainer>
    );
});

// Styled Components
const CardContainer = styled.div`
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4px;
    background: white;
    border-radius: 6px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
    cursor: grab;

    &:hover {
        transform: translateY(-1px);
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
    }

    &:active {
        cursor: grabbing;
    }
`;

const MoviePoster = styled.img`
    width: ${props => props.width}px;
    height: ${props => props.height}px;
    object-fit: cover;
    border-radius: 3px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);

    &:hover {
        transform: scale(1.02);
    }
`;

const RemoveButton = styled.button`
    position: absolute;
    top: -6px;
    right: -6px;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #e74c3c;
    color: white;
    border: none;
    font-size: 11px;
    font-weight: bold;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: all 0.2s ease;

    ${CardContainer}:hover & {
        opacity: 1;
    }

    &:hover {
        background: #c0392b;
        transform: scale(1.1);
    }
`;

export default TierMovieCard;
