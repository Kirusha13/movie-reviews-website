import React, { useState, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import ConfirmDialog from './ConfirmDialog';

// Функция для определения цвета оценки
const getRatingColor = (rating) => {
    const numRating = Number(rating) || 0;
    if (numRating === 0) return '#9E9E9E'; // Серый для 0
    if (numRating >= 8) return '#4CAF50'; // Зеленый для высоких оценок
    if (numRating >= 6) return '#FF9800'; // Оранжевый для средних
    if (numRating >= 4) return '#FFC107'; // Желтый для низких
    return '#F44336'; // Красный для очень низких
};

const MovieCard = React.memo(({ movie, onMovieClick, onAddToWatchlist, onRemoveFromWatchlist, onEditMovie, onDeleteMovie }) => {

    const [isHovered, setIsHovered] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // Мемоизируем функции с useCallback
    const handleMouseEnter = useCallback(() => setIsHovered(true), []);
    const handleMouseLeave = useCallback(() => setIsHovered(false), []);
    
    const handleDeleteClick = useCallback((e) => {
        e.stopPropagation();
        setShowDeleteConfirm(true);
    }, []);
    
    const handleConfirmDelete = useCallback(() => {
        if (onDeleteMovie && movie.id) {
            onDeleteMovie(movie.id);
        }
        setShowDeleteConfirm(false);
    }, [onDeleteMovie, movie.id]);

    const handleMovieClick = useCallback(() => {
        if (!showDeleteConfirm && onMovieClick) {
            onMovieClick(movie);
        }
    }, [showDeleteConfirm, onMovieClick, movie]);

    // Мемоизируем вычисляемые значения
    const formattedDuration = useMemo(() => {
        const numMinutes = Number(movie.duration) || 0;
        if (!numMinutes) return '';
        const hours = Math.floor(numMinutes / 60);
        const mins = numMinutes % 60;
        return hours > 0 ? `${hours}ч ${mins}м` : `${mins}м`;
    }, [movie.duration]);

    const movieRating = useMemo(() => {
        const rating = Number(movie.rating) || 0;
        return rating && !isNaN(rating) ? rating.toFixed(1) : 'N/A';
    }, [movie.rating]);

    const movieTitle = useMemo(() => movie.title || 'Без названия', [movie.title]);
    const movieYear = useMemo(() => movie.release_year || 'Год не указан', [movie.release_year]);
    const hasOriginalTitle = useMemo(() => 
        movie.original_title && 
        movie.original_title !== movie.title && 
        movie.original_title.trim() !== '', 
        [movie.original_title, movie.title]
    );

    const displayGenres = useMemo(() => {
        if (!Array.isArray(movie.genres) || movie.genres.length === 0) return null;
        
        const visibleGenres = movie.genres.slice(0, 3);
        const hasMore = movie.genres.length > 3;
        
        return { visibleGenres, hasMore, total: movie.genres.length };
    }, [movie.genres]);

    const hasReviews = useMemo(() => 
        Array.isArray(movie.reviews) && movie.reviews.length > 0, 
        [movie.reviews]
    );

    return (
        <CardContainer
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={handleMovieClick}
        >
            <PosterContainer>
                <Poster 
                    src={movie.poster_url || '/logo192.png'} 
                    alt={movieTitle}
                    loading="lazy"
                    onError={(e) => {
                        e.target.src = '/logo192.png';
                    }}
                />
                <RatingBadge rating={Number(movie.rating) || 0}>
                    {movieRating}
                </RatingBadge>

            </PosterContainer>

            <CardContent>
                <Title>{movieTitle}</Title>
                {hasOriginalTitle && (
                    <OriginalTitle>{movie.original_title}</OriginalTitle>
                )}
                <Year>{movieYear}</Year>
                {movie.duration && <Duration>{formattedDuration}</Duration>}
                
                {displayGenres && (
                    <GenresContainer>
                        {displayGenres.visibleGenres.map((genre, index) => (
                            <GenreTag key={index}>{genre}</GenreTag>
                        ))}
                        {displayGenres.hasMore && (
                            <GenreTag>+{displayGenres.total - 3}</GenreTag>
                        )}
                    </GenresContainer>
                )}
            </CardContent>

            {/* Hover overlay с оценками */}
            {isHovered && (
                <HoverOverlay>
                    <HoverContent>
                        <HoverTitle>{movieTitle}</HoverTitle>
                        
                        {hasReviews && (
                            <ReviewsContainer>
                                {movie.reviews.map((review, index) => (
                                    <ReviewItem key={index}>
                                        <ReviewerName>
                                            {review.reviewer_name === 'Цеха' ? 'Цеха' : 'Паша'}
                                        </ReviewerName>
                                        <ReviewRating rating={Number(review.rating) || 0}>
                                            {review.rating && !isNaN(Number(review.rating)) ? Number(review.rating) : 0}/10
                                        </ReviewRating>
                                        {review.review_text && (
                                            <ReviewText>
                                                {review.review_text.length > 100 
                                                    ? review.review_text.substring(0, 100) + '...'
                                                    : review.review_text
                                                }
                                            </ReviewText>
                                        )}
                                    </ReviewItem>
                                ))}
                            </ReviewsContainer>
                        )}

                        <ActionButtons>
                            <EditButton onClick={(e) => {
                                e.stopPropagation();
                                if (onEditMovie) onEditMovie(movie);
                            }} title="Редактировать">
                                ✏️
                            </EditButton>
                            
                            {movie.status === 'watchlist' ? (
                                <WatchedButton onClick={(e) => {
                                    e.stopPropagation();
                                    if (movie.id) onRemoveFromWatchlist(movie.id);
                                }} title="Отметить как просмотренное">
                                    👁️
                                </WatchedButton>
                            ) : (
                                <AddButton onClick={(e) => {
                                    e.stopPropagation();
                                    if (movie.id) onAddToWatchlist(movie.id);
                                }} title="В список желаемых">
                                    📋
                                </AddButton>
                            )}
                            
                            <DeleteButton onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteClick(e);
                            }} title="Удалить фильм">
                                🗑️
                            </DeleteButton>
                        </ActionButtons>
                    </HoverContent>
                </HoverOverlay>
            )}
            
            {/* Диалог подтверждения удаления */}
            {showDeleteConfirm && (
                <ConfirmDialog
                    isOpen={showDeleteConfirm}
                    title="Удалить фильм"
                    message={`Вы уверены, что хотите удалить фильм "${movie.title}"? Это действие нельзя отменить.`}
                    confirmText="Удалить"
                    cancelText="Отмена"
                    type="danger"
                    onConfirm={handleConfirmDelete}
                    onCancel={() => setShowDeleteConfirm(false)}
                />
            )}
        </CardContainer>
    );
});

// Styled Components
const CardContainer = styled.div`
    position: relative;
    width: 280px;
    height: 420px;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    cursor: pointer;
    transition: all 0.3s ease;
    margin: 16px;

    &:hover {
        transform: translateY(-8px);
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
    }
`;

const PosterContainer = styled.div`
    position: relative;
    width: 100%;
    height: 280px;
    overflow: hidden;
`;

const Poster = styled.img`
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;

    ${CardContainer}:hover & {
        transform: scale(1.05);
    }
`;

const RatingBadge = styled.div`
    position: absolute;
    top: 12px;
    right: 12px;
    background: ${props => {
        const rating = Number(props.rating) || 0;
        if (rating === 0) return 'rgba(128, 128, 128, 0.8)'; // Серый для 0
        if (rating >= 8) return 'rgba(76, 175, 80, 0.9)'; // Зеленый для высоких
        if (rating >= 6) return 'rgba(255, 152, 0, 0.9)'; // Оранжевый для средних
        if (rating >= 4) return 'rgba(255, 193, 7, 0.9)'; // Желтый для низких
        return 'rgba(244, 67, 54, 0.9)'; // Красный для очень низких
    }};
    color: white;
    padding: 6px 10px;
    border-radius: 20px;
    font-size: 14px;
    font-weight: bold;
    backdrop-filter: blur(10px);
`;

const WatchlistBadge = styled.div`
    position: absolute;
    top: 12px;
    left: 12px;
    background: rgba(76, 175, 80, 0.9);
    color: white;
    padding: 6px 10px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: bold;
    backdrop-filter: blur(10px);
`;

const CardContent = styled.div`
    padding: 16px;
    height: 140px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
`;

const Title = styled.h3`
    margin: 0 0 8px 0;
    font-size: 18px;
    font-weight: 600;
    color: #333;
    line-height: 1.3;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
`;

const OriginalTitle = styled.p`
    margin: 0 0 8px 0;
    font-size: 14px;
    color: #666;
    font-style: italic;
    line-height: 1.2;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
`;

const Year = styled.span`
    font-size: 14px;
    color: #888;
    margin-bottom: 8px;
`;

const Duration = styled.span`
    font-size: 14px;
    color: #888;
    margin-bottom: 8px;
`;

const GenresContainer = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: auto;
`;

const GenreTag = styled.span`
    background: #f0f0f0;
    color: #666;
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 500;
`;

// Hover Overlay
const HoverOverlay = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.9);
    backdrop-filter: blur(10px);
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding: 20px;
    animation: fadeIn 0.3s ease;
    overflow-y: auto;

    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
`;

const HoverContent = styled.div`
    color: white;
    text-align: center;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
`;

const HoverTitle = styled.h3`
    margin: 0 0 20px 0;
    font-size: 18px;
    font-weight: 600;
    line-height: 1.3;
    word-wrap: break-word;
    overflow-wrap: break-word;
    hyphens: auto;
    max-width: 100%;
    
    /* Ограничиваем высоту для очень длинных названий */
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const ReviewsContainer = styled.div`
    margin-bottom: 20px;
`;

const ReviewItem = styled.div`
    margin-bottom: 12px;
    padding: 10px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    text-align: left;
    max-width: 100%;
`;

const ReviewerName = styled.div`
    font-size: 14px;
    font-weight: 600;
    color: #666;
    margin-bottom: 8px;
`;

const ReviewRating = styled.div`
    font-size: 18px;
    font-weight: bold;
    color: ${props => getRatingColor(props.rating)};
    margin-bottom: 8px;
`;

const ReviewText = styled.div`
    font-size: 12px;
    color: #ccc;
    line-height: 1.4;
    word-wrap: break-word;
    overflow-wrap: break-word;
    
    /* Ограничиваем высоту для длинных рецензий */
    display: -webkit-box;
    -webkit-line-clamp: 4;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
`;



const ActionButtons = styled.div`
    display: flex;
    flex-direction: row;
    gap: 8px;
    align-items: center;
    justify-content: center;
`;

const AddButton = styled.button`
    background: #4CAF50;
    color: white;
    border: none;
    padding: 8px;
    border-radius: 6px;
    font-size: 16px;
    cursor: pointer;
    transition: all 0.2s ease;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
        background: #45a049;
        transform: scale(1.1);
    }
`;

const EditButton = styled.button`
    background: #2196F3;
    color: white;
    border: none;
    padding: 8px;
    border-radius: 6px;
    font-size: 16px;
    cursor: pointer;
    transition: all 0.2s ease;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
        background: #1976D2;
        transform: scale(1.1);
    }
`;

const WatchedButton = styled.button`
    background: #4CAF50;
    color: white;
    border: none;
    padding: 8px;
    border-radius: 6px;
    font-size: 16px;
    cursor: pointer;
    transition: all 0.2s ease;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
        background: #45a049;
        transform: scale(1.1);
    }
`;

const DeleteButton = styled.button`
    background: #dc3545;
    color: white;
    border: none;
    padding: 8px;
    border-radius: 6px;
    font-size: 16px;
    cursor: pointer;
    transition: all 0.2s ease;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
        background: #c82333;
        transform: scale(1.1);
    }
`;

export default MovieCard;
