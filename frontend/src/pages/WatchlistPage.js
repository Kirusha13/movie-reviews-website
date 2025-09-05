import React, { useState, useEffect, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { movieService } from '../services/movieService';
import WatchlistMovieCard from '../components/WatchlistMovieCard';
import MovieFilters from '../components/MovieFilters';
import Pagination from '../components/Pagination';
import useToast from '../hooks/useToast';

const WatchlistPage = React.memo(() => {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { showToast } = useToast();
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 12,
        total: 0,
        totalPages: 0
    });
    const [filters, setFilters] = useState({
        genre: '',
        minRating: 0,
        maxRating: 10,
        sortBy: 'created_at',
        sortOrder: 'DESC'
    });
    const [isFiltersPanelOpen, setIsFiltersPanelOpen] = useState(false);

    // Загружаем список желаемых фильмов
    const fetchWatchlist = useCallback(async (page = 1, newFilters = filters) => {
        try {
            setLoading(true);
            
            const response = await movieService.getWatchlist({
                page,
                limit: pagination.limit,
                ...newFilters
            });

            if (response.success) {
                setMovies(response.data || []);
                setPagination({
                    page,
                    limit: pagination.limit,
                    total: response.data ? response.data.length : 0,
                    totalPages: 1
                });
            } else {
                throw new Error(response.message || 'Ошибка загрузки списка желаемых');
            }
        } catch (error) {
            console.error('Ошибка загрузки списка желаемых:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }, [filters, pagination.limit]);

    // Обработчик изменения фильтров
    const handleFiltersChange = useCallback((newFilters) => {
        setFilters(newFilters);
        setPagination(prev => ({ ...prev, page: 1 }));
        fetchWatchlist(1, newFilters);
    }, [fetchWatchlist]);

    const toggleFiltersPanel = useCallback(() => {
        setIsFiltersPanelOpen(!isFiltersPanelOpen);
    }, [isFiltersPanelOpen]);

    const hasActiveFilters = useCallback(() => {
        return filters.genre || 
               filters.minRating > 0 || 
               filters.maxRating < 10 || 
               filters.sortBy !== 'created_at' ||
               filters.sortOrder !== 'DESC';
    }, [filters]);

    // Обработчик поиска
    const handleSearch = useCallback(async (searchQuery) => {
        try {
            setLoading(true);
            setError(null);

            const response = await movieService.searchMovies(searchQuery, {
                page: 1,
                limit: pagination.limit,
                status: 'watchlist' // Ищем только в watchlist
            });

            if (response.success) {
                setMovies(response.data);
                setPagination(prev => ({
                    ...prev,
                    page: 1,
                    total: response.pagination.total,
                    totalPages: response.pagination.totalPages
                }));
            } else {
                setError(response.message || 'Ошибка поиска');
            }
        } catch (error) {
            console.error('Ошибка поиска:', error);
            setError('Не удалось выполнить поиск');
        } finally {
            setLoading(false);
        }
    }, [pagination.limit]);

    // Обработчик изменения страницы
    const handlePageChange = useCallback((newPage) => {
        setPagination(prev => ({ ...prev, page: newPage }));
        fetchWatchlist(newPage, filters);
    }, [fetchWatchlist, filters]);

    // Обработчик удаления фильма из списка желаемых (перенос в просмотренные)
    const handleRemoveFromWatchlist = useCallback(async (movieId) => {
        try {
            const response = await movieService.removeFromWatchlist(movieId);
            if (response.success) {
                // Обновляем список
                await fetchWatchlist(pagination.page, filters);
                showToast('Фильм отмечен как просмотренный', 'success');
            } else {
                throw new Error(response.message || 'Ошибка переноса в просмотренные');
            }
        } catch (error) {
            console.error('Ошибка переноса в просмотренные:', error);
            setError(error.message);
        }
    }, [fetchWatchlist, pagination.page, filters, showToast]);

    // Обработчик полного удаления фильма
    const handleDeleteMovie = useCallback(async (movieId) => {
        try {
            const response = await movieService.deleteMovie(movieId);
            if (response.success) {
                // Обновляем список
                await fetchWatchlist(pagination.page, filters);
                showToast('Фильм полностью удален', 'success');
            } else {
                throw new Error(response.message || 'Ошибка удаления фильма');
            }
        } catch (error) {
            console.error('Ошибка удаления фильма:', error);
            setError(error.message);
        }
    }, [fetchWatchlist, pagination.page, filters, showToast]);

    // Загружаем данные при монтировании компонента
    useEffect(() => {
        fetchWatchlist();
    }, [fetchWatchlist]);

    // Обработка нажатия Escape для закрытия панели
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isFiltersPanelOpen) {
                setIsFiltersPanelOpen(false);
            }
        };

        if (isFiltersPanelOpen) {
            document.addEventListener('keydown', handleEscape);
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isFiltersPanelOpen]);

    // Мемоизируем вычисляемые значения
    const pageTitle = useMemo(() => '📋 Список желаемых фильмов', []);
    const pageSubtitle = useMemo(() => {
        if (movies.length > 0) {
            return 'Ваши фильмы для будущего просмотра';
        }
        return 'Ваш список желаемых пуст';
    }, [movies.length]);

    const showFilters = useMemo(() => movies.length > 0, [movies.length]);
    const showPagination = useMemo(() => pagination.totalPages > 1, [pagination.totalPages]);
    const isEmpty = useMemo(() => movies.length === 0, [movies.length]);

    if (loading && movies.length === 0) {
        return (
            <PageContainer>
                <PageHeader>
                    <PageTitle>{pageTitle}</PageTitle>
                </PageHeader>
                <LoadingContainer>
                    <LoadingSpinner />
                    <LoadingText>Загружаем ваш список желаемых...</LoadingText>
                </LoadingContainer>
            </PageContainer>
        );
    }

    if (error) {
        return (
            <PageContainer>
                <PageHeader>
                    <PageTitle>{pageTitle}</PageTitle>
                </PageHeader>
                <ErrorContainer>
                    <ErrorMessage>Ошибка: {error}</ErrorMessage>
                    <RetryButton onClick={() => fetchWatchlist()}>
                        Попробовать снова
                    </RetryButton>
                </ErrorContainer>
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            {/* Кнопка открытия панели фильтров */}
            <FiltersToggleButton onClick={toggleFiltersPanel}>
                {isFiltersPanelOpen ? '✕' : '🔍'}
                <span>{isFiltersPanelOpen ? 'Закрыть' : 'Фильтры'}</span>
            </FiltersToggleButton>
            
            {/* Индикатор активных фильтров */}
            {!isFiltersPanelOpen && hasActiveFilters() && (
                <ActiveFiltersIndicator />
            )}

            {/* Выдвигающаяся панель фильтров */}
            <FiltersPanel isOpen={isFiltersPanelOpen}>
                <FiltersPanelHeader>
                    <h3>Поиск и фильтры</h3>
                    <CloseButton onClick={toggleFiltersPanel}>✕</CloseButton>
                </FiltersPanelHeader>
                <MovieFilters
                    filters={filters}
                    onFiltersChange={handleFiltersChange}
                    genres={[]} // Пока пустой массив, можно добавить загрузку жанров
                    onSearch={handleSearch}
                />
            </FiltersPanel>

            {/* Затемнение фона при открытой панели */}
            {isFiltersPanelOpen && <Overlay onClick={toggleFiltersPanel} />}

            <PageHeader>
                <PageTitle>{pageTitle}</PageTitle>
                <PageSubtitle>{pageSubtitle}</PageSubtitle>
            </PageHeader>

            {isEmpty ? (
                <EmptyState>
                    <EmptyIcon>🎬</EmptyIcon>
                    <EmptyTitle>Список желаемых пуст</EmptyTitle>
                    <EmptyText>
                        Добавьте фильмы в список желаемых, чтобы не забыть их посмотреть
                    </EmptyText>
                    <EmptyButton onClick={() => window.history.back()}>
                        Вернуться к фильмам
                    </EmptyButton>
                </EmptyState>
            ) : (
                <>
                    <MoviesGrid>
                        {movies.map(movie => (
                            <WatchlistMovieCard
                                key={movie.id}
                                movie={movie}
                                onRemoveFromWatchlist={handleRemoveFromWatchlist}
                                onEditMovie={() => {
                                    // Для фильмов из watchlist редактирование не нужно,
                                    // так как они уже добавлены и их можно только удалить
                                    console.log('Редактирование фильмов из watchlist не поддерживается');
                                }}
                                onDeleteMovie={handleDeleteMovie}
                            />
                        ))}
                    </MoviesGrid>

                    {showPagination && (
                        <PaginationContainer>
                            <Pagination
                                currentPage={pagination.page}
                                totalPages={pagination.totalPages}
                                onPageChange={handlePageChange}
                            />
                        </PaginationContainer>
                    )}
                </>
            )}
        </PageContainer>
    );
});

// Styled Components
const PageContainer = styled.div`
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
    min-height: 100vh;
`;

const PageHeader = styled.div`
    text-align: center;
    margin-bottom: 30px;
    background: white;
    border-radius: 16px;
    padding: 24px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
`;

const PageTitle = styled.h1`
    font-size: 2.5rem;
    color: #2c3e50;
    margin: 0 0 10px 0;
    font-weight: 700;
`;

const PageSubtitle = styled.p`
    font-size: 1.1rem;
    color: #7f8c8d;
    margin: 0;
`;

const FiltersToggleButton = styled.button`
    position: fixed;
    top: 100px;
    right: 20px;
    background: #2c3e50;
    color: white;
    border: none;
    padding: 12px 20px;
    border-radius: 25px;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    box-shadow: 0 4px 20px rgba(44, 62, 80, 0.3);
    transition: all 0.3s ease;
    z-index: 1000;
    display: flex;
    align-items: center;
    gap: 8px;

    &:hover {
        background: #34495e;
        transform: translateY(-2px);
        box-shadow: 0 6px 25px rgba(44, 62, 80, 0.4);
    }

    @media (max-width: 768px) {
        top: 80px;
        right: 15px;
        padding: 10px 16px;
        font-size: 14px;
    }
`;

const ActiveFiltersIndicator = styled.div`
    position: fixed;
    top: 100px;
    right: 20px;
    width: 12px;
    height: 12px;
    background: #e74c3c;
    border-radius: 50%;
    z-index: 999;
    animation: pulse 2s infinite;

    @keyframes pulse {
        0% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.2); opacity: 0.7; }
        100% { transform: scale(1); opacity: 1; }
    }

    @media (max-width: 768px) {
        top: 80px;
        right: 15px;
    }
`;

const FiltersPanel = styled.div`
    position: fixed;
    top: 0;
    right: ${props => props.isOpen ? '0' : '-400px'};
    width: 400px;
    height: 100vh;
    background: white;
    box-shadow: -5px 0 25px rgba(0, 0, 0, 0.15);
    transition: right 0.3s ease;
    z-index: 1001;
    overflow-y: auto;

    @media (max-width: 768px) {
        width: 100%;
        right: ${props => props.isOpen ? '0' : '-100%'};
    }
`;

const FiltersPanelHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    border-bottom: 1px solid #eee;
    background: #f8f9fa;

    h3 {
        margin: 0;
        font-size: 1.2rem;
        color: #333;
    }
`;

const CloseButton = styled.button`
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #666;
    padding: 5px;
    border-radius: 5px;
    transition: background-color 0.2s ease;

    &:hover {
        background: #e9ecef;
    }
`;

const Overlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    z-index: 1000;
`;

const FiltersSection = styled.div`
    margin-bottom: 30px;
`;

const MoviesGrid = styled.div`
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 16px;
    margin-bottom: 32px;
`;

const PaginationContainer = styled.div`
    display: flex;
    justify-content: center;
    margin-top: 40px;
`;

const LoadingContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 400px;
`;

const LoadingSpinner = styled.div`
    width: 50px;
    height: 50px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #3498db;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 20px;

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;

const LoadingText = styled.p`
    font-size: 1.1rem;
    color: #7f8c8d;
    margin: 0;
`;

const ErrorContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 400px;
    text-align: center;
`;

const ErrorMessage = styled.p`
    font-size: 1.1rem;
    color: #e74c3c;
    margin: 0 0 20px 0;
`;

const RetryButton = styled.button`
    background: #3498db;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 8px;
    font-size: 1rem;
    cursor: pointer;
    transition: background-color 0.3s ease;

    &:hover {
        background: #2980b9;
    }
`;

const EmptyState = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 400px;
    text-align: center;
`;

const EmptyIcon = styled.div`
    font-size: 4rem;
    margin-bottom: 20px;
`;

const EmptyTitle = styled.h2`
    font-size: 1.8rem;
    color: #2c3e50;
    margin: 0 0 15px 0;
`;

const EmptyText = styled.p`
    font-size: 1.1rem;
    color: #7f8c8d;
    margin: 0 0 25px 0;
    max-width: 400px;
    line-height: 1.6;
`;

const EmptyButton = styled.button`
    background: #3498db;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 8px;
    font-size: 1rem;
    cursor: pointer;
    transition: background-color 0.3s ease;

    &:hover {
        background: #2980b9;
    }
`;

export default WatchlistPage;
