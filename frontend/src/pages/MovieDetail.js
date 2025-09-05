import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import { movieService } from '../services/movieService';
import ReviewForm from '../components/ReviewForm';
import ReviewList from '../components/ReviewList';
import ToastContainer from '../components/ToastContainer';
import ConfirmDialog from '../components/ConfirmDialog';

const MovieDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    // Создаем локальный toast для MovieDetail
    const [toasts, setToasts] = useState([]);
    
    const showLocalSuccess = (message) => {
        const id = Date.now() + Math.random();
        const newToast = { id, message, type: 'success', isVisible: true };
        setToasts(prev => [...prev, newToast]);
        
        // Автоматически скрываем toast через 4 секунды
        setTimeout(() => {
            setToasts(prev => prev.filter(toast => toast.id !== id));
        }, 4000);
    };
    
    const showLocalError = (message) => {
        const id = Date.now() + Math.random();
        const newToast = { id, message, type: 'error', isVisible: true };
        setToasts(prev => [...prev, newToast]);
        
        // Автоматически скрываем toast через 4 секунды
        setTimeout(() => {
            setToasts(prev => prev.filter(toast => toast.id !== id));
        }, 4000);
    };
    
    const hideToast = (id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    };
    
    const [movie, setMovie] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [editingReview, setEditingReview] = useState(null);
    const [defaultReviewer, setDefaultReviewer] = useState('Цеха');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [reviewToDelete, setReviewToDelete] = useState(null);
    const [showEditConfirm, setShowEditConfirm] = useState(false);
    const [reviewToEdit, setReviewToEdit] = useState(null);

    useEffect(() => {
        fetchMovieDetails();
    }, [id]);

    const fetchMovieDetails = async () => {
        try {
            setLoading(true);
            setError(null);

            // Получаем информацию о фильме
            const movieResponse = await movieService.getMovie(id);
            if (movieResponse.success) {
                console.log('Данные фильма:', movieResponse.data);
                setMovie(movieResponse.data);
            } else {
                throw new Error(movieResponse.message || 'Ошибка получения фильма');
            }

            // Получаем рецензии
            const reviewsResponse = await movieService.getMovieReviews(id);
            if (reviewsResponse.success) {
                setReviews(reviewsResponse.data);
            } else {
                console.warn('Не удалось загрузить рецензии:', reviewsResponse.message);
                setReviews([]);
            }
        } catch (error) {
            console.error('Ошибка загрузки фильма:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAddReview = (reviewerName = 'Цеха') => {
        console.log('MovieDetail: handleAddReview вызван с reviewerName:', reviewerName);
        console.log('MovieDetail: текущие reviews:', reviews);

        setDefaultReviewer(reviewerName);
        if (reviewerName === 'Паша') {
            // Для Паши просто показываем форму создания
            console.log('MovieDetail: открываем форму для Паши');
            setEditingReview(null);
            setShowReviewForm(true);
        } else {
            // Для Цеха проверяем, есть ли уже рецензия
            const existingReview = reviews.find(review => review.reviewer_name === 'Цеха');
            console.log('MovieDetail: existingReview для Цеха:', existingReview);

            if (existingReview) {
                // Если рецензия уже есть, предлагаем отредактировать её
                console.log('MovieDetail: показываем диалог редактирования для Цеха');
                setReviewToEdit(existingReview);
                setShowEditConfirm(true);
            } else {
                // Если рецензии нет, создаём новую
                console.log('MovieDetail: открываем форму создания для Цеха');
                setEditingReview(null);
                setShowReviewForm(true);
            }
        }
    };

    const handleEditReview = (review) => {
        setEditingReview(review);
        setShowReviewForm(true);
    };

    const handleCancelReview = () => {
        setShowReviewForm(false);
        setEditingReview(null);
    };

    const handleConfirmEdit = () => {
        setEditingReview(reviewToEdit);
        setShowReviewForm(true);
        setShowEditConfirm(false);
        setReviewToEdit(null);
    };

    const handleCancelEdit = () => {
        setShowEditConfirm(false);
        setReviewToEdit(null);
    };

    // Добавить фильм в список желаемых
    const handleAddToWatchlist = async () => {
        try {
            const response = await movieService.addToWatchlist(movie.id);
            if (response.success) {
                showLocalSuccess('Фильм добавлен в список желаемых!');
                // Обновляем данные фильма
                await fetchMovieDetails();
            } else {
                throw new Error(response.message || 'Ошибка добавления в список желаемых');
            }
        } catch (error) {
            console.error('Ошибка добавления в список желаемых:', error);
            showLocalError(`Не удалось добавить фильм в список желаемых: ${error.message}`);
        }
    };

    // Убрать фильм из списка желаемых
    const handleRemoveFromWatchlist = async () => {
        try {
            const response = await movieService.removeFromWatchlist(movie.id);
            if (response.success) {
                showLocalSuccess('Фильм убран из списка желаемых!');
                // Обновляем данные фильма
                await fetchMovieDetails();
            } else {
                throw new Error(response.message || 'Ошибка удаления из списка желаемых');
            }
        } catch (error) {
            console.error('Ошибка удаления из списка желаемых:', error);
            showLocalError(`Не удалось убрать фильм из списка желаемых: ${error.message}`);
        }
    };

    const handleSubmitReview = async (reviewData) => {
        try {
            console.log('MovieDetail: handleSubmitReview вызван');
            console.log('MovieDetail: reviewData:', reviewData);
            console.log('MovieDetail: editingReview:', editingReview);

            let response;
            if (editingReview) {
                console.log('MovieDetail: обновление рецензии');
                response = await movieService.updateReview(editingReview.id, reviewData);
            } else {
                console.log('MovieDetail: создание новой рецензии');
                response = await movieService.createReview(parseInt(id), reviewData);
            }

            console.log('MovieDetail: ответ от сервера:', response);

            if (response.success) {
                // Обновляем список рецензий
                await fetchMovieDetails();
                setShowReviewForm(false);
                setEditingReview(null);

                // Уведомление об успехе
                showLocalSuccess(editingReview ? 'Рецензия успешно обновлена!' : 'Рецензия успешно добавлена!');
            } else {
                throw new Error(response.message || 'Ошибка сохранения рецензии');
            }
        } catch (error) {
            console.error('Ошибка сохранения рецензии:', error);
            showLocalError(`Ошибка сохранения рецензии: ${error.message}`);
        }
    };

    const handleDeleteReview = async (reviewId) => {
        setReviewToDelete({ id: reviewId });
        setShowDeleteConfirm(true);
    };

    const handleConfirmDelete = async () => {
        try {
            const response = await movieService.deleteReview(reviewToDelete.id);
            if (response.success) {
                // Обновляем список рецензий
                await fetchMovieDetails();
                showLocalSuccess('Рецензия успешно удалена!');
            } else {
                throw new Error(response.message || 'Ошибка удаления рецензии');
            }
        } catch (error) {
            console.error('Ошибка удаления рецензии:', error);
            showLocalError(`Ошибка удаления рецензии: ${error.message}`);
        } finally {
            setShowDeleteConfirm(false);
            setReviewToDelete(null);
        }
    };

    if (loading) {
        return (
            <LoadingContainer>
                <LoadingSpinner />
                <LoadingText>Загружаем фильм...</LoadingText>
            </LoadingContainer>
        );
    }

    if (error) {
        return (
            <ErrorContainer>
                <ErrorIcon>❌</ErrorIcon>
                <ErrorTitle>Ошибка загрузки</ErrorTitle>
                <ErrorText>{error}</ErrorText>
                <BackButton onClick={() => navigate('/')}>
                    ← Вернуться к списку
                </BackButton>
            </ErrorContainer>
        );
    }

    if (!movie) {
        return (
            <ErrorContainer>
                <ErrorIcon>🎭</ErrorIcon>
                <ErrorTitle>Фильм не найден</ErrorTitle>
                <ErrorText>Запрашиваемый фильм не существует</ErrorText>
                <BackButton onClick={() => navigate('/')}>
                    ← Вернуться к списку
                </BackButton>
            </ErrorContainer>
        );
    }

    return (
        <PageContainer>
            <BackButtonContainer>
                <BackButton onClick={() => navigate('/')}>
                    <BackIcon>←</BackIcon>
                    <BackText>К списку</BackText>
                </BackButton>
            </BackButtonContainer>

            {showReviewForm ? (
                <ReviewForm
                    movie={movie}
                    review={editingReview}
                    onSubmit={handleSubmitReview}
                    onCancel={handleCancelReview}
                    isEditing={!!editingReview}
                    defaultReviewer={defaultReviewer}
                />
            ) : (
                <>
                    <MovieHeader>
                        <MoviePoster src={movie.poster_url && movie.poster_url.trim() ? movie.poster_url : '/placeholder-poster.jpg'} alt={movie.title || 'Фильм'} />
                        <MovieInfo>
                            <TitleRow>
                                <MovieTitle>{movie.title || 'Без названия'}</MovieTitle>
                                <TitleActions>
                                    <ActionButton onClick={() => {
                                        console.log('MovieDetail: кнопка "Добавить рецензию" нажата');
                                        handleAddReview();
                                    }} title="Добавить рецензию">
                                        ✍️
                                    </ActionButton>
                                    {movie.status === 'watchlist' ? (
                                        <ActionButton onClick={handleRemoveFromWatchlist} title="Убрать из списка желаемых">
                                            ❌
                                        </ActionButton>
                                    ) : (
                                        <ActionButton onClick={handleAddToWatchlist} title="Добавить в список желаемых">
                                            📋
                                        </ActionButton>
                                    )}
                                </TitleActions>
                            </TitleRow>
                            {movie.original_title && movie.original_title.trim() && movie.original_title !== movie.title && (
                                <MovieOriginalTitle>{movie.original_title}</MovieOriginalTitle>
                            )}
                            
                            <MovieMeta>
                                {movie.release_year && !isNaN(parseInt(movie.release_year)) && parseInt(movie.release_year) > 1900 && (
                                    <MetaItem>
                                        <MetaLabel>Год:</MetaLabel>
                                        <MetaValue>{parseInt(movie.release_year)}</MetaValue>
                                    </MetaItem>
                                )}
                                
                                {movie.director && movie.director.trim() && movie.director.length > 0 && (
                                    <MetaItem>
                                        <MetaLabel>Режиссер:</MetaLabel>
                                        <MetaValue>{movie.director}</MetaValue>
                                    </MetaItem>
                                )}
                                
                                {movie.duration && !isNaN(parseInt(movie.duration)) && parseInt(movie.duration) > 0 && (
                                    <MetaItem>
                                        <MetaLabel>Длительность:</MetaLabel>
                                        <MetaValue>{parseInt(movie.duration)} мин</MetaValue>
                                    </MetaItem>
                                )}
                                
                                {movie.country && movie.country.trim() && movie.country.length > 0 && (
                                    <MetaItem>
                                        <MetaLabel>Страна:</MetaLabel>
                                        <MetaValue>{movie.country}</MetaValue>
                                    </MetaItem>
                                )}
                                
                                {movie.language && movie.language.trim() && movie.language.length > 0 && (
                                    <MetaItem>
                                        <MetaLabel>Язык:</MetaLabel>
                                        <MetaValue>{movie.language}</MetaValue>
                                    </MetaItem>
                                )}
                            </MovieMeta>

                            {movie.rating && !isNaN(parseFloat(movie.rating)) && parseFloat(movie.rating) >= 0 && parseFloat(movie.rating) <= 10 && (
                                <RatingSection>
                                    <RatingLabel>Средняя оценка:</RatingLabel>
                                    <RatingValue>{parseFloat(movie.rating).toFixed(1)}/10</RatingValue>
                                    <RatingCount>({movie.total_reviews && !isNaN(parseInt(movie.total_reviews)) && parseInt(movie.total_reviews) >= 0 ? parseInt(movie.total_reviews) : 0} рецензий)</RatingCount>
                                </RatingSection>
                            )}

                            {movie.description && movie.description.trim() && movie.description.length > 0 && (
                                <DescriptionSection>
                                    <DescriptionTitle>Описание:</DescriptionTitle>
                                    <DescriptionText>{movie.description}</DescriptionText>
                                </DescriptionSection>
                            )}


                        </MovieInfo>
                    </MovieHeader>

                    {/* Рецензии (показываем только если они есть) */}
                    {reviews && reviews.length > 0 && (
                        <ReviewsSection>
                            <ReviewList
                                reviews={reviews}
                                movie={movie}
                                onAddReview={handleAddReview}
                                onEditReview={handleEditReview}
                                onDeleteReview={handleDeleteReview}
                            />
                        </ReviewsSection>
                    )}

                    {movie.genres && Array.isArray(movie.genres) && movie.genres.length > 0 && movie.genres.some(genre => genre && (typeof genre === 'string' ? genre.trim() : genre.name)) && (
                        <GenresSection>
                            <SectionTitle>Жанры:</SectionTitle>
                            <GenresList>
                                {movie.genres.filter(genre => genre && (typeof genre === 'string' ? genre.trim() : genre.name)).map((genre, index) => (
                                    <GenreTag key={index}>{typeof genre === 'string' ? genre : genre.name || 'Неизвестный жанр'}</GenreTag>
                                ))}
                            </GenresList>
                        </GenresSection>
                    )}

                    {movie.actors && Array.isArray(movie.actors) && movie.actors.length > 0 && movie.actors.some(actor => actor && (typeof actor === 'string' ? actor.trim() : actor.name)) && (
                        <ActorsSection>
                            <SectionTitle>Актеры:</SectionTitle>
                            <ActorsList>
                                {movie.actors.filter(actor => actor && (typeof actor === 'string' ? actor.trim() : actor.name)).map((actor, index) => (
                                    <ActorTag key={index}>{typeof actor === 'string' ? actor : actor.name || 'Неизвестный актер'}</ActorTag>
                                ))}
                            </ActorsList>
                        </ActorsSection>
                    )}
                </>
            )}

            {/* Диалог подтверждения удаления рецензии */}
            <ConfirmDialog
                isOpen={showDeleteConfirm}
                title="Удалить рецензию"
                message="Вы уверены, что хотите удалить эту рецензию? Это действие нельзя отменить."
                confirmText="Удалить"
                cancelText="Отмена"
                type="danger"
                onConfirm={handleConfirmDelete}
                onCancel={() => {
                    setShowDeleteConfirm(false);
                    setReviewToDelete(null);
                }}
            />

            {/* Диалог подтверждения редактирования рецензии */}
            <ConfirmDialog
                isOpen={showEditConfirm}
                title="Редактировать рецензию"
                message="У вас уже есть рецензия на этот фильм. Хотите отредактировать её?"
                confirmText="Редактировать"
                cancelText="Отмена"
                type="info"
                onConfirm={handleConfirmEdit}
                onCancel={handleCancelEdit}
            />

            {/* Toast уведомления */}
            <ToastContainer toasts={toasts} onHideToast={hideToast} />
        </PageContainer>
    );
};

// Styled Components
const PageContainer = styled.div`
    max-width: 1200px;
    margin: 0 auto;
    padding: 24px;
`;

const BackButtonContainer = styled.div`
    position: relative;
    margin-bottom: 24px;
`;

const BackButton = styled.button`
    background: transparent;
    color: #667eea;
    border: none;
    padding: 8px 16px;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 8px;
    border-radius: 20px;
    position: relative;
    overflow: hidden;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(45deg, #667eea, #764ba2);
        opacity: 0;
        transition: opacity 0.3s ease;
        z-index: -1;
    }

    &:hover {
        color: white;
        transform: translateY(-2px);
        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);

        &::before {
            opacity: 1;
        }
    }

    &:active {
        transform: translateY(0);
    }
`;

const BackIcon = styled.span`
    font-size: 18px;
    font-weight: bold;
`;

const BackText = styled.span`
    font-weight: 500;
`;

const MovieHeader = styled.div`
    display: flex;
    gap: 32px;
    margin-bottom: 32px;
    background: white;
    border-radius: 16px;
    padding: 32px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    
    @media (max-width: 768px) {
        flex-direction: column;
        gap: 24px;
        padding: 24px;
    }
`;

const MoviePoster = styled.img`
    width: 200px;
    height: 300px;
    object-fit: cover;
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
    
    @media (max-width: 768px) {
        width: 150px;
        height: 225px;
        align-self: center;
    }
`;

const MovieInfo = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 20px;
`;

const TitleRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 20px;
    
    @media (max-width: 768px) {
        flex-direction: column;
        align-items: center;
        gap: 16px;
    }
`;

const TitleActions = styled.div`
    display: flex;
    gap: 8px;
    flex-shrink: 0;
`;

const ActionButton = styled.button`
    background: #667eea;
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
        background: #5a6fd8;
        transform: scale(1.1);
    }
`;

const MovieTitle = styled.h1`
    margin: 0;
    font-size: 2.5rem;
    font-weight: 700;
    color: #333;
    flex: 1;
    
    @media (max-width: 768px) {
        font-size: 2rem;
        text-align: center;
    }
`;

const MovieOriginalTitle = styled.p`
    margin: 0;
    font-size: 1.2rem;
    color: #666;
    font-style: italic;
    
    @media (max-width: 768px) {
        text-align: center;
    }
`;

const MovieMeta = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
`;

const MetaItem = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
`;

const MetaLabel = styled.span`
    font-weight: 600;
    color: #666;
    min-width: 80px;
`;

const MetaValue = styled.span`
    color: #333;
`;

const RatingSection = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px;
    background: #f8f9fa;
    border-radius: 8px;
    border-left: 4px solid #667eea;
`;

const RatingLabel = styled.span`
    font-weight: 600;
    color: #333;
`;

const RatingValue = styled.span`
    font-size: 1.5rem;
    font-weight: 700;
    color: #667eea;
`;

const RatingCount = styled.span`
    color: #666;
    font-size: 0.9rem;
`;

const DescriptionSection = styled.div`
    display: flex;
    flex-direction: column;
    gap: 12px;
`;

const DescriptionTitle = styled.h3`
    margin: 0;
    font-size: 1.2rem;
    font-weight: 600;
    color: #333;
`;

const DescriptionText = styled.p`
    margin: 0;
    line-height: 1.6;
    color: #555;
`;

const WatchlistSection = styled.div`
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid #ecf0f1;
`;

const WatchlistButton = styled.button`
    background: ${props => props.type === 'remove' ? '#e74c3c' : '#3498db'};
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    width: 100%;
    max-width: 300px;

    &:hover {
        background: ${props => props.type === 'remove' ? '#c0392b' : '#2980b9'};
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    &:active {
        transform: translateY(0);
    }
`;

const SectionTitle = styled.h3`
    margin: 0 0 16px 0;
    font-size: 1.2rem;
    font-weight: 600;
    color: #333;
`;

const ReviewsSection = styled.div`
    margin-bottom: 24px;
`;

const GenresSection = styled.div`
    margin-bottom: 24px;
    background: white;
    border-radius: 16px;
    padding: 24px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
`;

const GenresList = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
`;

const GenreTag = styled.span`
    background: #f8f9fa;
    color: #333;
    padding: 8px 16px;
    border-radius: 20px;
    font-size: 14px;
    border: 2px solid #e9ecef;
    transition: all 0.2s ease;

    &:hover {
        border-color: #667eea;
        background: #667eea;
        color: white;
    }
`;

const ActorsSection = styled.div`
    margin-bottom: 24px;
    background: white;
    border-radius: 16px;
    padding: 24px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
`;

const ActorsList = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
`;

const ActorTag = styled.span`
    background: #f8f9fa;
    color: #333;
    padding: 8px 16px;
    border-radius: 20px;
    font-size: 14px;
    border: 2px solid #e9ecef;
    transition: all 0.2s ease;

    &:hover {
        border-color: #667eea;
        background: #667eea;
        color: white;
    }
`;

const LoadingContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 60vh;
    gap: 20px;
`;

const LoadingSpinner = styled.div`
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #667eea;
    border-radius: 50%;
    animation: spin 1s linear infinite;

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;

const LoadingText = styled.p`
    font-size: 18px;
    color: #666;
    margin: 0;
`;

const ErrorContainer = styled.div`
    text-align: center;
    padding: 60px 20px;
    color: #666;
`;

const ErrorIcon = styled.div`
    font-size: 4rem;
    margin-bottom: 20px;
`;

const ErrorTitle = styled.h3`
    font-size: 1.5rem;
    margin: 0 0 12px 0;
    color: #333;
`;

const ErrorText = styled.p`
    font-size: 1.1rem;
    margin: 0 0 24px 0;
    color: #888;
`;

export default MovieDetail;
