import React, { useState } from 'react';
import styled from 'styled-components';

// Функция для определения цвета оценки
const getRatingColor = (rating) => {
    const numRating = Number(rating) || 0;
    if (numRating >= 8) return '#4CAF50'; // Зеленый для высоких оценок
    if (numRating >= 6) return '#FF9800'; // Оранжевый для средних
    if (numRating >= 4) return '#FFC107'; // Желтый для низких
    return '#F44336'; // Красный для очень низких
};

const MovieCard = ({ movie, onMovieClick, onAddToWatchlist, onRemoveFromWatchlist, onEditMovie }) => {
    const [isHovered, setIsHovered] = useState(false);

    const handleMouseEnter = () => setIsHovered(true);
    const handleMouseLeave = () => setIsHovered(false);

    const formatDuration = (minutes) => {
        const numMinutes = Number(minutes) || 0;
        if (!numMinutes) return '';
        const hours = Math.floor(numMinutes / 60);
        const mins = numMinutes % 60;
        return hours > 0 ? `${hours}ч ${mins}м` : `${mins}м`;
    };

    return (
        <CardContainer
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={() => onMovieClick && onMovieClick(movie)}
        >
            <PosterContainer>
                <Poster 
                    src={movie.poster_url || '/default-poster.jpg'} 
                    alt={movie.title || 'Постер фильма'}
                    onError={(e) => {
                        e.target.src = '/default-poster.jpg';
                    }}
                />
                <RatingBadge rating={Number(movie.rating) || 0}>
                    {movie.rating && !isNaN(Number(movie.rating)) ? Number(movie.rating).toFixed(1) : 'N/A'}
                </RatingBadge>
                {movie.status === 'watchlist' && (
                    <WatchlistBadge>В списке</WatchlistBadge>
                )}
            </PosterContainer>

            <CardContent>
                <Title>{movie.title || 'Без названия'}</Title>
                {movie.original_title && movie.original_title !== movie.title && movie.original_title.trim() !== '' && (
                    <OriginalTitle>{movie.original_title}</OriginalTitle>
                )}
                <Year>{movie.release_year || 'Год не указан'}</Year>
                {movie.duration && <Duration>{formatDuration(movie.duration)}</Duration>}
                
                {Array.isArray(movie.genres) && movie.genres.length > 0 && (
                    <GenresContainer>
                        {movie.genres.slice(0, 3).map((genre, index) => (
                            <GenreTag key={index}>{genre}</GenreTag>
                        ))}
                        {movie.genres.length > 3 && (
                            <GenreTag>+{movie.genres.length - 3}</GenreTag>
                        )}
                    </GenresContainer>
                )}
            </CardContent>

            {/* Hover overlay с оценками */}
            {isHovered && (
                <HoverOverlay>
                    <HoverContent>
                        <HoverTitle>{movie.title}</HoverTitle>
                        
                        {Array.isArray(movie.reviews) && movie.reviews.length > 0 ? (
                            <ReviewsContainer>
                                {movie.reviews.map((review, index) => (
                                    <ReviewItem key={index}>
                                        <ReviewerName>
                                            {review.reviewer_name === 'user' ? 'Вы' : 'Друг'}
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
                        ) : (
                            <NoReviews>Нет рецензий</NoReviews>
                        )}

                        <ActionButtons>
                            <EditButton onClick={(e) => {
                                e.stopPropagation();
                                if (onEditMovie) onEditMovie(movie);
                            }}>
                                ✏️ Редактировать
                            </EditButton>
                            
                            {movie.status === 'watchlist' ? (
                                <RemoveButton onClick={(e) => {
                                    e.stopPropagation();
                                    if (movie.id) onRemoveFromWatchlist(movie.id);
                                }}>
                                    Убрать из списка
                                </RemoveButton>
                            ) : (
                                <AddButton onClick={(e) => {
                                    e.stopPropagation();
                                    if (movie.id) onAddToWatchlist(movie.id);
                                }}>
                                    В список желаемых
                                </AddButton>
                            )}
                        </ActionButtons>
                    </HoverContent>
                </HoverOverlay>
            )}
        </CardContainer>
    );
};

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
    background: ${props => (props.rating && !isNaN(Number(props.rating))) ? 'rgba(0, 0, 0, 0.8)' : 'rgba(128, 128, 128, 0.8)'};
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
    align-items: center;
    justify-content: center;
    padding: 20px;
    animation: fadeIn 0.3s ease;

    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
`;

const HoverContent = styled.div`
    color: white;
    text-align: center;
    width: 100%;
`;

const HoverTitle = styled.h3`
    margin: 0 0 20px 0;
    font-size: 20px;
    font-weight: 600;
    line-height: 1.3;
`;

const ReviewsContainer = styled.div`
    margin-bottom: 20px;
`;

const ReviewItem = styled.div`
    margin-bottom: 16px;
    padding: 12px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    text-align: left;
`;

const ReviewerName = styled.div`
    font-size: 14px;
    font-weight: 600;
    color: #4CAF50;
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
`;

const NoReviews = styled.div`
    font-size: 16px;
    color: #ccc;
    margin-bottom: 20px;
`;

const ActionButtons = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: center;
`;

const AddButton = styled.button`
    background: #4CAF50;
    color: white;
    border: none;
    padding: 10px 16px;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s ease;

    &:hover {
        background: #45a049;
    }
`;

const EditButton = styled.button`
    background: #2196F3;
    color: white;
    border: none;
    padding: 10px 16px;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s ease;

    &:hover {
        background: #1976D2;
    }
`;

const RemoveButton = styled.button`
    background: #f44336;
    color: white;
    border: none;
    padding: 10px 16px;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s ease;

    &:hover {
        background: #da190b;
    }
`;

export default MovieCard;
