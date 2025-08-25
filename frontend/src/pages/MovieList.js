import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import MovieCard from '../components/MovieCard';
import MovieFilters from '../components/MovieFilters';
import { movieService } from '../services/movieService';

const MovieList = () => {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        genre: '',
        minRating: 0,
        maxRating: 10,
        status: '',
        sortBy: 'created_at',
        sortOrder: 'DESC'
    });
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 12,
        total: 0,
        totalPages: 0
    });
    const [genres, setGenres] = useState([]);

    useEffect(() => {
        fetchGenres();
        fetchMovies();
    }, [filters, pagination.page]);

    const fetchGenres = async () => {
        try {
            // Здесь можно добавить API для получения жанров
            // Пока используем статические данные
            const staticGenres = [
                { id: 1, name: 'Боевик' },
                { id: 2, name: 'Комедия' },
                { id: 3, name: 'Драма' },
                { id: 4, name: 'Ужасы' },
                { id: 5, name: 'Фантастика' },
                { id: 6, name: 'Триллер' },
                { id: 7, name: 'Романтика' },
                { id: 8, name: 'Документальный' },
                { id: 9, name: 'Анимация' },
                { id: 10, name: 'Криминал' },
                { id: 11, name: 'Приключения' },
                { id: 12, name: 'Семейный' }
            ];
            setGenres(staticGenres);
        } catch (error) {
            console.error('Ошибка получения жанров:', error);
        }
    };

    const fetchMovies = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await movieService.getMovies({
                ...filters,
                page: pagination.page,
                limit: pagination.limit
            });

            if (response.success) {
                setMovies(response.data);
                setPagination(prev => ({
                    ...prev,
                    total: response.pagination.total,
                    totalPages: response.pagination.totalPages
                }));
            } else {
                setError(response.message || 'Ошибка получения фильмов');
            }
        } catch (error) {
            console.error('Ошибка получения фильмов:', error);
            setError('Не удалось загрузить фильмы');
        } finally {
            setLoading(false);
        }
    };

    const handleFiltersChange = (newFilters) => {
        setFilters(newFilters);
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const handleSearch = async (searchQuery) => {
        try {
            setLoading(true);
            setError(null);

            const response = await movieService.searchMovies(searchQuery, {
                page: 1,
                limit: pagination.limit
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
    };

    const handlePageChange = (newPage) => {
        setPagination(prev => ({ ...prev, page: newPage }));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleMovieClick = (movie) => {
        // Здесь можно добавить навигацию к детальной странице фильма
        console.log('Клик по фильму:', movie);
    };

    const handleAddToWatchlist = async (movieId) => {
        try {
            const response = await movieService.addToWatchlist(movieId);
            if (response.success) {
                // Обновляем список фильмов
                fetchMovies();
            } else {
                setError(response.message || 'Ошибка добавления в список желаемых');
            }
        } catch (error) {
            console.error('Ошибка добавления в список желаемых:', error);
            setError('Не удалось добавить в список желаемых');
        }
    };

    const handleRemoveFromWatchlist = async (movieId) => {
        try {
            const response = await movieService.removeFromWatchlist(movieId);
            if (response.success) {
                // Обновляем список фильмов
                fetchMovies();
            } else {
                setError(response.message || 'Ошибка удаления из списка желаемых');
            }
        } catch (error) {
            console.error('Ошибка удаления из списка желаемых:', error);
            setError('Не удалось убрать из списка желаемых');
        }
    };

    if (loading && movies.length === 0) {
        return (
            <LoadingContainer>
                <LoadingSpinner />
                <LoadingText>Загружаем фильмы...</LoadingText>
            </LoadingContainer>
        );
    }

    return (
        <PageContainer>
            <Header>
                <Title>🎬 Мои фильмы</Title>
                <Subtitle>Управляйте своей коллекцией фильмов и рецензий</Subtitle>
            </Header>

            <MovieFilters
                filters={filters}
                onFiltersChange={handleFiltersChange}
                genres={genres}
                onSearch={handleSearch}
            />

            {error && (
                <ErrorMessage>
                    ❌ {error}
                    <DismissButton onClick={() => setError(null)}>✕</DismissButton>
                </ErrorMessage>
            )}

            {movies.length === 0 && !loading ? (
                <EmptyState>
                    <EmptyIcon>🎭</EmptyIcon>
                    <EmptyTitle>Фильмы не найдены</EmptyTitle>
                    <EmptyText>
                        Попробуйте изменить фильтры или добавить новый фильм
                    </EmptyText>
                </EmptyState>
            ) : (
                <>
                    <MoviesGrid>
                        {movies.map((movie) => (
                            <MovieCard
                                key={movie.id}
                                movie={movie}
                                onMovieClick={handleMovieClick}
                                onAddToWatchlist={handleAddToWatchlist}
                                onRemoveFromWatchlist={handleRemoveFromWatchlist}
                            />
                        ))}
                    </MoviesGrid>

                    {pagination.totalPages > 1 && (
                        <Pagination>
                            <PaginationButton
                                onClick={() => handlePageChange(pagination.page - 1)}
                                disabled={pagination.page === 1}
                            >
                                ← Назад
                            </PaginationButton>

                            <PageNumbers>
                                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                                    .filter(page => {
                                        const start = Math.max(1, pagination.page - 2);
                                        const end = Math.min(pagination.totalPages, pagination.page + 2);
                                        return page >= start && page <= end;
                                    })
                                    .map(page => (
                                        <PageButton
                                            key={page}
                                            onClick={() => handlePageChange(page)}
                                            active={page === pagination.page}
                                        >
                                            {page}
                                        </PageButton>
                                    ))}
                            </PageNumbers>

                            <PaginationButton
                                onClick={() => handlePageChange(pagination.page + 1)}
                                disabled={pagination.page === pagination.totalPages}
                            >
                                Вперед →
                            </PaginationButton>
                        </Pagination>
                    )}
                </>
            )}

            {loading && movies.length > 0 && (
                <LoadingOverlay>
                    <LoadingSpinner />
                    <LoadingText>Загружаем...</LoadingText>
                </LoadingOverlay>
            )}
        </PageContainer>
    );
};

// Styled Components
const PageContainer = styled.div`
    max-width: 1400px;
    margin: 0 auto;
    padding: 24px;
`;

const Header = styled.div`
    text-align: center;
    margin-bottom: 32px;
`;

const Title = styled.h1`
    font-size: 2.5rem;
    font-weight: 700;
    color: #333;
    margin: 0 0 12px 0;
`;

const Subtitle = styled.p`
    font-size: 1.1rem;
    color: #666;
    margin: 0;
`;

const MoviesGrid = styled.div`
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 16px;
    margin-bottom: 32px;
`;

const Pagination = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 16px;
    margin-top: 32px;
`;

const PaginationButton = styled.button`
    background: #4CAF50;
    color: white;
    border: none;
    padding: 12px 20px;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover:not(:disabled) {
        background: #45a049;
        transform: translateY(-1px);
    }

    &:disabled {
        background: #ccc;
        cursor: not-allowed;
        transform: none;
    }
`;

const PageNumbers = styled.div`
    display: flex;
    gap: 8px;
`;

const PageButton = styled.button`
    background: ${props => props.active ? '#4CAF50' : '#f5f5f5'};
    color: ${props => props.active ? 'white' : '#333'};
    border: 2px solid ${props => props.active ? '#4CAF50' : '#e0e0e0'};
    padding: 10px 16px;
    border-radius: 6px;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    min-width: 44px;

    &:hover:not(.active) {
        background: #e8e8e8;
        border-color: #ccc;
    }

    &:active {
        transform: translateY(1px);
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

const LoadingOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.9);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 20px;
    z-index: 1000;
`;

const LoadingSpinner = styled.div`
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #4CAF50;
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

const ErrorMessage = styled.div`
    background: #ffebee;
    color: #c62828;
    padding: 16px;
    border-radius: 8px;
    margin-bottom: 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-left: 4px solid #f44336;
`;

const DismissButton = styled.button`
    background: none;
    border: none;
    color: #c62828;
    font-size: 18px;
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;

    &:hover {
        background: rgba(198, 40, 40, 0.1);
    }
`;

const EmptyState = styled.div`
    text-align: center;
    padding: 60px 20px;
    color: #666;
`;

const EmptyIcon = styled.div`
    font-size: 4rem;
    margin-bottom: 20px;
`;

const EmptyTitle = styled.h3`
    font-size: 1.5rem;
    margin: 0 0 12px 0;
    color: #333;
`;

const EmptyText = styled.p`
    font-size: 1.1rem;
    margin: 0;
    color: #888;
`;

export default MovieList;
