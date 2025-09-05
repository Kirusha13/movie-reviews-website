import React from 'react';
import styled from 'styled-components';

const TierRow = React.memo(({
    tier,
    movies = [],
    tierColors,
    onMovieDrop,
    onMovieDragStart,
    onMovieRemove,
    onMovieReorder,
    isDragOver = false,
    onDragOver,
    onDragLeave,
    onDrop
}) => {
    const tierInfo = {
        'S': { label: 'S', description: 'Лучшие фильмы' },
        'A': { label: 'A', description: 'Отличные фильмы' },
        'B': { label: 'B', description: 'Хорошие фильмы' },
        'C': { label: 'C', description: 'Средние фильмы' },
        'D': { label: 'D', description: 'Плохие фильмы' },
        'F': { label: 'F', description: 'Ужасные фильмы' }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        onDragOver && onDragOver(tier);
    };

    const handleDragLeave = (e) => {
        onDragLeave && onDragLeave(tier);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const movieData = JSON.parse(e.dataTransfer.getData('application/json'));
        onMovieDrop && onMovieDrop(tier, movieData);
    };

    return (
        <RowContainer>
            <TierHeader>
                <TierLabel color={tierColors[tier]}>
                    {tierInfo[tier].label}
                </TierLabel>
                <MovieCount>({movies.length})</MovieCount>
            </TierHeader>

            <MoviesArea
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                isDragOver={isDragOver}
            >
                {movies.length === 0 ? (
                    <EmptySlot>Перетащите фильмы сюда</EmptySlot>
                ) : (
                    <>
                        {/* Зона для вставки в начало */}
                        <InsertZone
                            onDragOver={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                e.currentTarget.style.backgroundColor = 'rgba(102, 126, 234, 0.2)';
                            }}
                            onDragLeave={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                            onDrop={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                e.currentTarget.style.backgroundColor = 'transparent';

                                const dragData = JSON.parse(e.dataTransfer.getData('application/json'));
                                if (dragData.fromTier === tier && dragData.movieId !== movies[0]?.id) {
                                    onMovieReorder && onMovieReorder(tier, dragData.movieId, 0);
                                }
                            }}
                        />
                        {movies
                            .sort((a, b) => (a.position || 0) - (b.position || 0))
                            .map((movie, index) => (
                            <MovieSlot
                                key={movie.id}
                                data-position={index}
                                onDragOver={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    e.currentTarget.style.borderLeft = '3px solid #667eea';
                                    e.currentTarget.style.backgroundColor = 'rgba(102, 126, 234, 0.1)';
                                }}
                                onDragLeave={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    e.currentTarget.style.borderLeft = '3px solid transparent';
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                }}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    e.currentTarget.style.borderLeft = '3px solid transparent';
                                    e.currentTarget.style.backgroundColor = 'transparent';

                                    const dragData = JSON.parse(e.dataTransfer.getData('application/json'));
                                    if (dragData.fromTier === tier && dragData.movieId !== movie.id) {
                                        // Перемещение внутри одного tier'а
                                        onMovieReorder && onMovieReorder(tier, dragData.movieId, index);
                                    }
                                }}
                            >
                                <MoviePoster
                                    src={movie.poster_url || '/placeholder-movie.jpg'}
                                    alt={movie.title}
                                    draggable
                                    onDragStart={(e) => {
                                        e.dataTransfer.setData('application/json', JSON.stringify({
                                            movieId: movie.id,
                                            fromTier: tier,
                                            fromPosition: index
                                        }));
                                        onMovieDragStart && onMovieDragStart(movie.id);
                                    }}
                                    onError={(e) => {
                                        e.target.src = '/placeholder-movie.jpg';
                                    }}
                                />
                                <RemoveButton
                                    onClick={() => onMovieRemove && onMovieRemove(movie.id)}
                                    title="Удалить фильм"
                                >
                                    ×
                                </RemoveButton>
                            </MovieSlot>
                        ))}
                    </>
                )}
            </MoviesArea>
        </RowContainer>
    );
});

// Styled Components
const RowContainer = styled.div`
    display: flex;
    align-items: center;
    margin-bottom: 6px;
    padding: 6px 10px;
    background: white;
    border-radius: 6px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    min-height: 60px;
    transition: all 0.3s ease;
`;

const TierHeader = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 60px;
    margin-right: 12px;
    text-align: center;
`;

const TierLabel = styled.div`
    font-size: 18px;
    font-weight: 700;
    color: ${props => props.color || '#666'};
    margin-bottom: 1px;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
`;

const MovieCount = styled.div`
    font-size: 11px;
    color: #95a5a6;
    font-weight: 500;
`;

const MoviesArea = styled.div`
    position: relative;
    flex: 1;
    display: flex;
    align-items: center;
    gap: 8px;
    min-height: 50px;
    padding: 8px;
    border: 1px dashed ${props => props.isDragOver ? '#667eea' : '#e9ecef'};
    border-radius: 6px;
    background: ${props => props.isDragOver ? 'rgba(102, 126, 234, 0.05)' : '#fafbfc'};
    transition: all 0.3s ease;
    overflow-x: auto;

    &:hover {
        border-color: #667eea;
        background: rgba(102, 126, 234, 0.02);
    }
`;

const EmptySlot = styled.div`
    flex: 1;
    text-align: center;
    color: #95a5a6;
    font-size: 14px;
    padding: 20px;
`;

const InsertZone = styled.div`
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 8px;
    background-color: transparent;
    transition: background-color 0.3s ease;
    border-radius: 4px 0 0 4px;
    z-index: 1;
`;

const MovieSlot = styled.div`
    position: relative;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 50px;
    text-align: center;
    margin: 0 2px;
    transition: all 0.3s ease;
    border-left: 3px solid transparent;
    border-radius: 4px;
    padding: 2px;

    &:hover {
        border-left-color: rgba(102, 126, 234, 0.3);
        background-color: rgba(102, 126, 234, 0.05);
    }
`;

const MoviePoster = styled.img`
    width: 42px;
    height: 63px;
    object-fit: cover;
    border-radius: 3px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    cursor: grab;
    transition: all 0.2s ease;

    &:hover {
        transform: scale(1.05);
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
    }

    &:active {
        cursor: grabbing;
        transform: scale(0.95);
    }
`;

const RemoveButton = styled.button`
    position: absolute;
    top: -6px;
    right: -6px;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #e74c3c;
    color: white;
    border: none;
    font-size: 10px;
    font-weight: bold;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: all 0.2s ease;

    ${MovieSlot}:hover & {
        opacity: 1;
    }

    &:hover {
        background: #c0392b;
        transform: scale(1.1);
    }
`;

export default TierRow;
