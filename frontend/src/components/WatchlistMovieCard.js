import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import ConfirmDialog from './ConfirmDialog';

const WatchlistMovieCard = ({ movie, onRemoveFromWatchlist }) => {
    const navigate = useNavigate();
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // Обработчик клика по карточке
    const handleCardClick = () => {
        navigate(`/movie/${movie.id}`);
    };

    // Обработчик удаления из списка желаемых
    const handleRemoveClick = (e) => {
        e.stopPropagation();
        setShowDeleteConfirm(true);
    };

    // Подтверждение удаления
    const handleConfirmRemove = async () => {
        await onRemoveFromWatchlist(movie.id);
        setShowDeleteConfirm(false);
    };

    // Отмена удаления
    const handleCancelRemove = () => {
        setShowDeleteConfirm(false);
    };

    // Форматирование года
    const formatYear = (year) => {
        return year || 'Неизвестно';
    };

    // Форматирование длительности
    const formatDuration = (duration) => {
        if (!duration) return 'Неизвестно';
        const hours = Math.floor(duration / 60);
        const minutes = duration % 60;
        return hours > 0 ? `${hours}ч ${minutes}мин` : `${minutes}мин`;
    };

    // Форматирование жанров
    const formatGenres = (genres) => {
        if (!genres || !Array.isArray(genres)) return 'Неизвестно';
        return genres.slice(0, 2).join(', ') + (genres.length > 2 ? '...' : '');
    };

    return (
        <>
            <CardContainer onClick={handleCardClick}>
                <PosterContainer>
                    <Poster 
                        src={movie.poster_url || '/placeholder-poster.jpg'} 
                        alt={movie.title}
                        onError={(e) => {
                            e.target.src = '/placeholder-poster.jpg';
                        }}
                    />
                    <RemoveButton onClick={handleRemoveClick}>
                        ❌
                    </RemoveButton>
                </PosterContainer>

                <CardContent>
                    <MovieTitle>{movie.title}</MovieTitle>
                    
                    {movie.original_title && movie.original_title !== movie.title && (
                        <OriginalTitle>{movie.original_title}</OriginalTitle>
                    )}

                    <MovieInfo>
                        <InfoItem>
                            <InfoLabel>Год:</InfoLabel>
                            <InfoValue>{formatYear(movie.release_year)}</InfoValue>
                        </InfoItem>
                        
                        <InfoItem>
                            <InfoLabel>Длительность:</InfoLabel>
                            <InfoValue>{formatDuration(movie.duration)}</InfoValue>
                        </InfoItem>
                        
                        <InfoItem>
                            <InfoLabel>Жанры:</InfoLabel>
                            <InfoValue>{formatGenres(movie.genres)}</InfoValue>
                        </InfoItem>
                    </MovieInfo>

                    {movie.director && (
                        <Director>
                            <DirectorLabel>Режиссер:</DirectorLabel>
                            <DirectorName>{movie.director}</DirectorName>
                        </Director>
                    )}

                    <AddDate>
                        Добавлено: {new Date(movie.added_at || movie.created_at).toLocaleDateString('ru-RU')}
                    </AddDate>
                </CardContent>
            </CardContainer>

            <ConfirmDialog
                isOpen={showDeleteConfirm}
                title="Убрать из списка желаемых"
                message={`Вы уверены, что хотите убрать фильм "${movie.title}" из списка желаемых?`}
                confirmText="Убрать"
                cancelText="Отмена"
                type="warning"
                onConfirm={handleConfirmRemove}
                onCancel={handleCancelRemove}
            />
        </>
    );
};

// Styled Components
const CardContainer = styled.div`
    background: white;
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;

    &:hover {
        transform: translateY(-8px);
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
    }

    @media (max-width: 768px) {
        &:hover {
            transform: none;
        }
    }
`;

const PosterContainer = styled.div`
    position: relative;
    width: 100%;
    height: 200px;
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

const RemoveButton = styled.button`
    position: absolute;
    top: 12px;
    right: 12px;
    background: rgba(231, 76, 60, 0.9);
    color: white;
    border: none;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    cursor: pointer;
    font-size: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    backdrop-filter: blur(10px);

    &:hover {
        background: rgba(231, 76, 60, 1);
        transform: scale(1.1);
    }
`;

const CardContent = styled.div`
    padding: 20px;
`;

const MovieTitle = styled.h3`
    font-size: 1.2rem;
    font-weight: 600;
    color: #2c3e50;
    margin: 0 0 8px 0;
    line-height: 1.3;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
`;

const OriginalTitle = styled.p`
    font-size: 0.9rem;
    color: #7f8c8d;
    margin: 0 0 16px 0;
    font-style: italic;
`;

const MovieInfo = styled.div`
    margin-bottom: 16px;
`;

const InfoItem = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    font-size: 0.9rem;
`;

const InfoLabel = styled.span`
    color: #7f8c8d;
    font-weight: 500;
`;

const InfoValue = styled.span`
    color: #2c3e50;
    font-weight: 600;
    text-align: right;
    max-width: 60%;
`;

const Director = styled.div`
    display: flex;
    flex-direction: column;
    margin-bottom: 16px;
`;

const DirectorLabel = styled.span`
    font-size: 0.9rem;
    color: #7f8c8d;
    font-weight: 500;
    margin-bottom: 4px;
`;

const DirectorName = styled.span`
    font-size: 0.9rem;
    color: #2c3e50;
    font-weight: 600;
`;

const AddDate = styled.div`
    font-size: 0.8rem;
    color: #95a5a6;
    text-align: center;
    padding-top: 16px;
    border-top: 1px solid #ecf0f1;
`;

export default WatchlistMovieCard;
