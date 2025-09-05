import React, { useState, useEffect, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import useToast from '../hooks/useToast';
import tierListService from '../services/tierListService';
import ConfirmDialog from '../components/ConfirmDialog';
import AddMoviesModal from '../components/AddMoviesModal';
import TierRow from '../components/TierRow';
import UnassignedMovies from '../components/UnassignedMovies';


const TierListEditor = React.memo(() => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [tierList, setTierList] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddMoviesModal, setShowAddMoviesModal] = useState(false);
    const [draggedMovieId, setDraggedMovieId] = useState(null);
    const [dragOverTier, setDragOverTier] = useState(null);

    // Цвета для разных tier'ов
    const tierColors = {
        'S': '#ff6b6b',
        'A': '#4ecdc4',
        'B': '#45b7d1',
        'C': '#96ceb4',
        'D': '#ffeaa7',
        'F': '#dda0dd'
    };

    const fetchTierList = useCallback(async () => {
        try {
            setLoading(true);
            const response = await tierListService.getTierListById(id);
            setTierList(response.data);
            setError(null);
        } catch (error) {
            setError('Ошибка загрузки tier-листа');
            showToast('Ошибка загрузки tier-листа', 'error');
        } finally {
            setLoading(false);
        }
    }, [id, showToast]);

    useEffect(() => {
        fetchTierList();
    }, [fetchTierList]);

    const handleBackToList = useCallback(() => {
        navigate('/tier-lists');
    }, [navigate]);

    const handleAddMovies = useCallback(() => {
        setShowAddMoviesModal(true);
    }, []);

    // Drag & Drop handlers
    const handleMovieDragStart = useCallback((movieId) => {
        setDraggedMovieId(movieId);
    }, []);

    const handleTierDragOver = useCallback((tier) => {
        setDragOverTier(tier);
    }, []);

    const handleTierDragLeave = useCallback(() => {
        setDragOverTier(null);
    }, []);

    const handleMovieDrop = useCallback(async (tier, movieData) => {
        try {
            const { movieId, fromTier } = movieData;
            setDragOverTier(null);
            setDraggedMovieId(null);

            // Оптимистичное обновление состояния
            setTierList(prev => {
                if (!prev) return prev;

                const newTierMovies = { ...prev.tierMovies };
                const newUnassignedMovies = [...prev.unassignedMovies];

                // Удаляем фильм из старого места
                if (fromTier) {
                    // Удаляем из старого tier'а
                    if (newTierMovies[fromTier]) {
                        newTierMovies[fromTier] = newTierMovies[fromTier].filter(movie => movie.id !== movieId);
                    }
                } else {
                    // Удаляем из нераспределенных
                    const unassignedIndex = newUnassignedMovies.findIndex(movie => movie.id === movieId);
                    if (unassignedIndex !== -1) {
                        newUnassignedMovies.splice(unassignedIndex, 1);
                    }
                }

                // Дополнительная проверка - удаляем фильм из всех tier'ов (на случай если он там остался)
                Object.keys(newTierMovies).forEach(tierKey => {
                    if (tierKey !== tier) { // Не трогаем целевой tier
                        newTierMovies[tierKey] = newTierMovies[tierKey].filter(movie => movie.id !== movieId);
                    }
                });

                // Добавляем фильм в новый tier
                if (!newTierMovies[tier]) {
                    newTierMovies[tier] = [];
                }

                // Проверяем, что фильм еще не в целевом tier'е
                const alreadyInTargetTier = newTierMovies[tier].some(movie => movie.id === movieId);

                if (!alreadyInTargetTier) {
                    // Ищем фильм для добавления
                    let movieToAdd;
                    if (fromTier && prev.tierMovies[fromTier]) {
                        // Фильм переносится между tier'ами - ищем в оригинальном состоянии
                        movieToAdd = prev.tierMovies[fromTier].find(m => m.id === movieId);
                    } else {
                        // Фильм переносится из нераспределенных - ищем в оригинальном состоянии
                        movieToAdd = prev.unassignedMovies.find(m => m.id === movieId);
                    }

                    if (movieToAdd) {
                        newTierMovies[tier].push({ ...movieToAdd, position: 0 });
                    }
                }

                return {
                    ...prev,
                    tierMovies: newTierMovies,
                    unassignedMovies: newUnassignedMovies
                };
            });

            // Небольшая задержка для стабильности UI
            await new Promise(resolve => setTimeout(resolve, 100));

            // Обновляем на сервере
            if (fromTier) {
                // Фильм уже в этом tier-листе, обновляем позицию
                await tierListService.updateMoviePosition(id, movieId, tier, 0);
            } else {
                // Фильм из нераспределенных, добавляем в tier
                await tierListService.addMovieToTier(id, movieId, tier, 0);
            }

            showToast('Фильм перемещен', 'success');
        } catch (error) {
            console.error('Ошибка перемещения фильма:', error);
            showToast('Ошибка перемещения фильма', 'error');
            // В случае ошибки перезагружаем данные
            fetchTierList();
        }
    }, [id, showToast, fetchTierList]);

    const handleMovieReorder = useCallback(async (tier, movieId, newPosition) => {
        try {
            // Оптимистичное обновление состояния
            setTierList(prev => {
                if (!prev) return prev;

                const newTierMovies = { ...prev.tierMovies };
                const tierMovies = [...(newTierMovies[tier] || [])];

                // Находим индекс фильма в текущем массиве
                const currentIndex = tierMovies.findIndex(movie => movie.id === movieId);
                if (currentIndex === -1) return prev;

                // Удаляем фильм из текущей позиции
                const [movie] = tierMovies.splice(currentIndex, 1);

                // Вставляем фильм в новую позицию
                tierMovies.splice(newPosition, 0, movie);

                // Обновляем позиции для всех фильмов в tier'е
                const updatedMovies = tierMovies.map((movie, index) => ({
                    ...movie,
                    position: index
                }));

                newTierMovies[tier] = updatedMovies;

                return {
                    ...prev,
                    tierMovies: newTierMovies
                };
            });

            // Обновляем позиции на сервере
            const tierMovies = tierList.tierMovies[tier] || [];
            const reorderedMovies = [...tierMovies];

            // Находим индекс фильма
            const currentIndex = reorderedMovies.findIndex(movie => movie.id === movieId);
            if (currentIndex !== -1) {
                // Удаляем и вставляем в новую позицию
                const [movie] = reorderedMovies.splice(currentIndex, 1);
                reorderedMovies.splice(newPosition, 0, movie);

                // Обновляем позиции на сервере
                for (let i = 0; i < reorderedMovies.length; i++) {
                    await tierListService.updateMoviePosition(id, reorderedMovies[i].id, tier, i);
                }
            }

            showToast('Порядок фильмов изменен', 'success');
        } catch (error) {
            console.error('Ошибка изменения порядка фильмов:', error);
            showToast('Ошибка изменения порядка фильмов', 'error');
            // В случае ошибки перезагружаем данные
            fetchTierList();
        }
    }, [id, showToast, fetchTierList, tierList]);

    const handleMovieRemove = useCallback(async (movieId) => {
        // Оптимистичное обновление состояния
        setTierList(prev => {
            if (!prev) return prev;

            const newTierMovies = { ...prev.tierMovies };
            const newUnassignedMovies = [...prev.unassignedMovies];

            // Удаляем фильм из всех tier'ов
            Object.keys(newTierMovies).forEach(tierKey => {
                newTierMovies[tierKey] = newTierMovies[tierKey].filter(movie => movie.id !== movieId);
            });

            // Добавляем фильм обратно в нераспределенные
            const movie = Object.values(prev.tierMovies).flat()
                .find(m => m.id === movieId);

            if (movie) {
                newUnassignedMovies.push(movie);
            }

            return {
                ...prev,
                tierMovies: newTierMovies,
                unassignedMovies: newUnassignedMovies
            };
        });

        // Небольшая задержка для стабильности UI
        await new Promise(resolve => setTimeout(resolve, 50));

        // Обновляем на сервере
        try {
            await tierListService.removeMovieFromTier(id, movieId);
            showToast('Фильм удален из tier-листа', 'success');
        } catch (error) {
            console.error('Ошибка удаления фильма:', error);
            showToast('Ошибка удаления фильма', 'error');
            // В случае ошибки перезагружаем данные
            fetchTierList();
        }
    }, [id, showToast, fetchTierList]);

    if (loading) {
        return (
            <PageContainer>
                <LoadingSpinner>Загрузка tier-листа...</LoadingSpinner>
            </PageContainer>
        );
    }

    if (error || !tierList) {
        return (
            <PageContainer>
                <ErrorMessage>{error || 'Tier-лист не найден'}</ErrorMessage>
                <BackButton onClick={handleBackToList}>← Назад к списку</BackButton>
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            <PageHeader>
                <HeaderContent>
                    <BackButton onClick={handleBackToList}>← Назад</BackButton>
                    <TitleSection>
                        <PageTitle>{tierList.name}</PageTitle>
                        <AddMoviesButton onClick={handleAddMovies}>
                            ➕ Добавить фильмы
                        </AddMoviesButton>
                    </TitleSection>
                </HeaderContent>
            </PageHeader>

            <TierListContent>
                <TiersContainer>
                    {['S', 'A', 'B', 'C', 'D', 'F'].map(tier => (
                        <TierRow
                            key={tier}
                            tier={tier}
                            movies={tierList.tierMovies[tier] || []}
                            tierColors={tierColors}
                            onMovieDrop={handleMovieDrop}
                            onMovieDragStart={handleMovieDragStart}
                            onMovieRemove={handleMovieRemove}
                            onMovieReorder={handleMovieReorder}
                            isDragOver={dragOverTier === tier}
                            onDragOver={handleTierDragOver}
                            onDragLeave={handleTierDragLeave}
                        />
                    ))}
                </TiersContainer>

                <UnassignedMovies
                    movies={tierList.unassignedMovies || []}
                    onMovieDragStart={handleMovieDragStart}
                    onMovieRemove={handleMovieRemove}
                />
            </TierListContent>

            {showAddMoviesModal && (
                <AddMoviesModal
                    tierListId={id}
                    onClose={() => setShowAddMoviesModal(false)}
                    onMoviesAdded={fetchTierList}
                />
            )}
        </PageContainer>
    );
});

// Styled Components
const PageContainer = styled.div`
    max-width: 1200px;
    margin: 0 auto;
    padding: 24px;
`;

const PageHeader = styled.div`
    background: white;
    border-radius: 16px;
    padding: 24px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    margin-bottom: 32px;
`;

const HeaderContent = styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;
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
    border-radius: 20px;
    align-self: flex-start;

    &:hover {
        background: #f8f9fa;
        transform: translateY(-2px);
    }
`;

const TitleSection = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 20px;

    @media (max-width: 768px) {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
    }
`;

const PageTitle = styled.h1`
    font-size: 32px;
    font-weight: 700;
    color: #2c3e50;
    margin: 0;
`;

const AddMoviesButton = styled.button`
    background: #667eea;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: #5a6fd8;
        transform: translateY(-2px);
        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
    }
`;

const TierListContent = styled.div`
    background: white;
    border-radius: 16px;
    padding: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
`;

const TiersContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-bottom: 16px;
    transition: all 0.3s ease;
`;

const LoadingSpinner = styled.div`
    text-align: center;
    font-size: 18px;
    color: #7f8c8d;
    padding: 48px;
`;

const ErrorMessage = styled.div`
    text-align: center;
    font-size: 18px;
    color: #e74c3c;
    padding: 48px;
`;

export default TierListEditor;