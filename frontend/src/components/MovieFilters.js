import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const MovieFilters = ({ 
    filters, 
    onFiltersChange, 
    genres = [], 
    onSearch 
}) => {
    const [localFilters, setLocalFilters] = useState(filters);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        setLocalFilters(filters);
    }, [filters]);

    const handleFilterChange = (key, value) => {
        const newFilters = { ...localFilters, [key]: value };
        setLocalFilters(newFilters);
        onFiltersChange(newFilters);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            onSearch(searchQuery.trim());
        }
    };

    const clearFilters = () => {
        const clearedFilters = {
            genre: '',
            minRating: 0,
            maxRating: 10,
            status: localFilters.status || '', // Сохраняем текущий статус
            sortBy: 'created_at',
            sortOrder: 'DESC'
        };
        setLocalFilters(clearedFilters);
        onFiltersChange(clearedFilters);
    };

    const hasActiveFilters = () => {
        return localFilters.genre || 
               localFilters.minRating > 0 || 
               localFilters.maxRating < 10 || 
               localFilters.status ||
               localFilters.sortBy !== 'created_at' ||
               localFilters.sortOrder !== 'DESC';
    };

    return (
        <FiltersContainer>
            <SearchSection>
                <SearchForm onSubmit={handleSearch}>
                    <SearchInput
                        type="text"
                        placeholder="Поиск по названию, актерам..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <SearchButton type="submit">
                        🔍 Поиск
                    </SearchButton>
                </SearchForm>
            </SearchSection>

            <FiltersSection>
                <FilterGroup>
                    <FilterLabel>Жанр:</FilterLabel>
                    <FilterSelect
                        value={localFilters.genre || ''}
                        onChange={(e) => handleFilterChange('genre', e.target.value)}
                    >
                        <option value="">Все жанры</option>
                        {genres.map((genre) => (
                            <option key={genre.id} value={genre.name}>
                                {genre.name}
                            </option>
                        ))}
                    </FilterSelect>
                </FilterGroup>

                <FilterGroup>
                    <FilterLabel>Оценка:</FilterLabel>
                    <RatingRange>
                        <RatingInput
                            type="number"
                            min="0"
                            max="10"
                            step="0.5"
                            placeholder="От"
                            value={localFilters.minRating || ''}
                            onChange={(e) => handleFilterChange('minRating', parseFloat(e.target.value) || 0)}
                        />
                        <RatingSeparator>-</RatingSeparator>
                        <RatingInput
                            type="number"
                            min="0"
                            max="10"
                            step="0.5"
                            placeholder="До"
                            value={localFilters.maxRating || ''}
                            onChange={(e) => handleFilterChange('maxRating', parseFloat(e.target.value) || 10)}
                        />
                    </RatingRange>
                </FilterGroup>



                <FilterGroup>
                    <FilterLabel>Сортировка:</FilterLabel>
                    <SortContainer>
                        <FilterSelect
                            value={localFilters.sortBy || 'created_at'}
                            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                        >
                            <option value="created_at">По дате добавления</option>
                            <option value="title">По названию</option>
                            <option value="release_year">По году выпуска</option>
                            <option value="rating">По рейтингу</option>
                            <option value="duration">По длительности</option>
                        </FilterSelect>
                        <SortOrderButton
                            type="button"
                            onClick={() => handleFilterChange('sortOrder', 
                                localFilters.sortOrder === 'ASC' ? 'DESC' : 'ASC'
                            )}
                        >
                            {localFilters.sortOrder === 'ASC' ? '↑' : '↓'}
                        </SortOrderButton>
                    </SortContainer>
                </FilterGroup>
            </FiltersSection>

            <ActionsSection>
                {hasActiveFilters() && (
                    <ClearButton onClick={clearFilters}>
                        🗑️ Очистить фильтры
                    </ClearButton>
                )}
            </ActionsSection>
        </FiltersContainer>
    );
};

// Styled Components
const FiltersContainer = styled.div`
    background: transparent;
    border-radius: 0;
    padding: 20px;
    margin-bottom: 0;
    box-shadow: none;
`;

const SearchSection = styled.div`
    margin-bottom: 24px;
    padding-bottom: 20px;
    border-bottom: 1px solid #eee;
`;

const SearchForm = styled.form`
    display: flex;
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
`;

const SearchInput = styled.input`
    flex: 1;
    padding: 12px 16px;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    font-size: 16px;
    transition: border-color 0.2s ease;

    &:focus {
        outline: none;
        border-color: #4CAF50;
    }

    &::placeholder {
        color: #999;
    }
`;

const SearchButton = styled.button`
    background: #4CAF50;
    color: white;
    border: none;
    padding: 12px 20px;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s ease;
    white-space: nowrap;

    &:hover {
        background: #45a049;
    }

    &:active {
        transform: translateY(1px);
    }
`;

const FiltersSection = styled.div`
    display: flex;
    flex-direction: column;
    gap: 20px;
    margin-bottom: 20px;
`;

const FilterGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

const FilterLabel = styled.label`
    font-size: 14px;
    font-weight: 600;
    color: #333;
    margin-bottom: 4px;
`;

const FilterSelect = styled.select`
    padding: 10px 12px;
    border: 2px solid #e0e0e0;
    border-radius: 6px;
    font-size: 14px;
    background: white;
    cursor: pointer;
    transition: border-color 0.2s ease;

    &:focus {
        outline: none;
        border-color: #4CAF50;
    }
`;

const RatingRange = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
`;

const RatingInput = styled.input`
    flex: 1;
    padding: 10px 12px;
    border: 2px solid #e0e0e0;
    border-radius: 6px;
    font-size: 14px;
    text-align: center;
    transition: border-color 0.2s ease;

    &:focus {
        outline: none;
        border-color: #4CAF50;
    }

    &::placeholder {
        color: #999;
    }
`;

const RatingSeparator = styled.span`
    color: #666;
    font-weight: 500;
`;

const SortContainer = styled.div`
    display: flex;
    gap: 8px;
    align-items: center;
`;

const SortOrderButton = styled.button`
    background: #f5f5f5;
    border: 2px solid #e0e0e0;
    color: #666;
    padding: 10px 12px;
    border-radius: 6px;
    font-size: 16px;
    cursor: pointer;
    transition: all 0.2s ease;
    min-width: 44px;

    &:hover {
        background: #e8e8e8;
        border-color: #ccc;
    }

    &:active {
        transform: translateY(1px);
    }
`;

const ActionsSection = styled.div`
    display: flex;
    justify-content: flex-end;
    padding-top: 16px;
    border-top: 1px solid #eee;
`;

const ClearButton = styled.button`
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

    &:active {
        transform: translateY(1px);
    }
`;

export default MovieFilters;
