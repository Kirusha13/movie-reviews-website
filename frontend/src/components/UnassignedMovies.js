import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import TierMovieCard from './TierMovieCard';

const UnassignedMovies = React.memo(({
    movies = [],
    onMovieDragStart,
    onMovieRemove,
    title = "Нераспределенные фильмы"
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('title');

    const filteredAndSortedMovies = useMemo(() => {
        let filtered = movies;

        // Фильтрация по поиску
        if (searchQuery.trim()) {
            filtered = filtered.filter(movie =>
                movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (movie.original_title && movie.original_title.toLowerCase().includes(searchQuery.toLowerCase()))
            );
        }

        // Сортировка
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'title':
                    return a.title.localeCompare(b.title);
                case 'year':
                    return (b.release_year || 0) - (a.release_year || 0);
                case 'rating':
                    return (Number(b.rating) || 0) - (Number(a.rating) || 0);
                default:
                    return 0;
            }
        });

        return filtered;
    }, [movies, searchQuery, sortBy]);

    return (
        <Container>
            <Header>
                <Title>{title}</Title>
                <MovieCount>({filteredAndSortedMovies.length})</MovieCount>
            </Header>

            <Controls>
                <SearchInput
                    type="text"
                    placeholder="Поиск фильмов..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />

                <SortSelect value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                    <option value="title">По названию</option>
                    <option value="year">По году</option>
                    <option value="rating">По рейтингу</option>
                </SortSelect>
            </Controls>

            <MoviesGrid>
                {filteredAndSortedMovies.length === 0 ? (
                    <EmptyState>
                        {searchQuery ? 'Фильмы не найдены' : 'Нет нераспределенных фильмов'}
                    </EmptyState>
                ) : (
                    filteredAndSortedMovies.map(movie => (
                        <TierMovieCard
                            key={movie.id}
                            movie={movie}
                            onDragStart={onMovieDragStart}
                            onRemove={onMovieRemove}
                            size="small"
                        />
                    ))
                )}
            </MoviesGrid>
        </Container>
    );
});

// Styled Components
const Container = styled.div`
    background: white;
    border-radius: 12px;
    padding: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    margin-top: 16px;
`;

const Header = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
`;

const Title = styled.h3`
    font-size: 18px;
    font-weight: 600;
    color: #2c3e50;
    margin: 0;
`;

const MovieCount = styled.span`
    font-size: 14px;
    color: #7f8c8d;
    font-weight: 500;
`;

const Controls = styled.div`
    display: flex;
    gap: 12px;
    margin-bottom: 16px;

    @media (max-width: 768px) {
        flex-direction: column;
    }
`;

const SearchInput = styled.input`
    flex: 1;
    padding: 10px 14px;
    border: 2px solid #e9ecef;
    border-radius: 8px;
    font-size: 14px;
    outline: none;
    transition: all 0.2s ease;

    &:focus {
        border-color: #667eea;
        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }
`;

const SortSelect = styled.select`
    padding: 10px 14px;
    border: 2px solid #e9ecef;
    border-radius: 8px;
    font-size: 14px;
    outline: none;
    background: white;
    cursor: pointer;
    transition: all 0.2s ease;

    &:focus {
        border-color: #667eea;
        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }
`;

const MoviesGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
    gap: 12px;
    max-height: 300px;
    overflow-y: auto;
    padding: 6px;

    &::-webkit-scrollbar {
        width: 6px;
    }

    &::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 3px;
    }

    &::-webkit-scrollbar-thumb {
        background: #c1c1c1;
        border-radius: 3px;

        &:hover {
            background: #a8a8a8;
        }
    }
`;

const EmptyState = styled.div`
    grid-column: 1 / -1;
    text-align: center;
    color: #95a5a6;
    font-size: 16px;
    padding: 40px 20px;
`;

export default UnassignedMovies;
