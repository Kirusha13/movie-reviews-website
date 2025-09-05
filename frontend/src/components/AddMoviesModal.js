import React, { useState, useEffect, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import movieService from '../services/movieService';
import tierListService from '../services/tierListService';
import useToast from '../hooks/useToast';

const AddMoviesModal = ({ tierListId, onClose, onMoviesAdded }) => {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedMovies, setSelectedMovies] = useState([]);
    const { showToast } = useToast();

    useEffect(() => {
        fetchMovies();
    }, []);

    const fetchMovies = useCallback(async () => {
        try {
            setLoading(true);
            const response = await movieService.getAllMovies();
            setMovies(response.data || []);
        } catch (error) {
            showToast('Ошибка загрузки фильмов', 'error');
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    const filteredMovies = useMemo(() => {
        if (searchQuery.trim() === '') {
            return movies;
        }
        return movies.filter(movie =>
            movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (movie.original_title && movie.original_title.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    }, [movies, searchQuery]);

    const handleMovieToggle = useCallback((movieId) => {
        setSelectedMovies(prev => 
            prev.includes(movieId)
                ? prev.filter(id => id !== movieId)
                : [...prev, movieId]
        );
    }, []);

    const handleSubmit = useCallback(async () => {
        if (selectedMovies.length === 0) {
            showToast('Выберите хотя бы один фильм', 'warning');
            return;
        }

        try {
            // Добавляем фильмы в tier-лист
            for (const movieId of selectedMovies) {
                await tierListService.addMovieToTier(tierListId, movieId, 'C', 0);
            }
            
            showToast(`${selectedMovies.length} фильмов добавлено в tier-лист`, 'success');
            onMoviesAdded();
            onClose();
        } catch (error) {
            showToast('Ошибка добавления фильмов', 'error');
        }
    }, [selectedMovies, tierListId, onMoviesAdded, onClose, showToast]);

    return (
        <Overlay onClick={onClose}>
            <Modal onClick={(e) => e.stopPropagation()}>
                <ModalHeader>
                    <ModalTitle>Добавить фильмы в Tier-лист</ModalTitle>
                    <CloseButton onClick={onClose}>×</CloseButton>
                </ModalHeader>

                <ModalContent>
                    <SearchInput
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Поиск фильмов..."
                    />

                    {loading ? (
                        <LoadingText>Загрузка фильмов...</LoadingText>
                    ) : (
                        <MoviesList>
                            {filteredMovies.map((movie) => (
                                <MovieItem key={movie.id}>
                                    <MovieCheckbox
                                        type="checkbox"
                                        checked={selectedMovies.includes(movie.id)}
                                        onChange={() => handleMovieToggle(movie.id)}
                                    />
                                    <MovieInfo>
                                        <MovieTitle>{movie.title}</MovieTitle>
                                        {movie.original_title && (
                                            <MovieOriginalTitle>{movie.original_title}</MovieOriginalTitle>
                                        )}
                                        {movie.release_year && (
                                            <MovieYear>{movie.release_year}</MovieYear>
                                        )}
                                    </MovieInfo>
                                </MovieItem>
                            ))}
                        </MoviesList>
                    )}

                    <SelectionInfo>
                        Выбрано: {selectedMovies.length} фильмов
                    </SelectionInfo>
                </ModalContent>

                <ModalActions>
                    <CancelButton onClick={onClose}>
                        Отмена
                    </CancelButton>
                    <SubmitButton 
                        onClick={handleSubmit}
                        disabled={selectedMovies.length === 0}
                    >
                        Добавить выбранные
                    </SubmitButton>
                </ModalActions>
            </Modal>
        </Overlay>
    );
};

// Styled Components
const Overlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 20px;
`;

const Modal = styled.div`
    background: white;
    border-radius: 16px;
    max-width: 500px;
    width: 90%;
    max-height: 80vh;
    overflow: hidden;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
`;

const ModalHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 20px 0 20px;
    border-bottom: 1px solid #e9ecef;
    padding-bottom: 16px;
`;

const ModalTitle = styled.h2`
    font-size: 24px;
    font-weight: 600;
    color: #2c3e50;
    margin: 0;
`;

const CloseButton = styled.button`
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #7f8c8d;
    padding: 4px;
    border-radius: 4px;
    transition: all 0.2s ease;

    &:hover {
        background: #f8f9fa;
        color: #2c3e50;
    }
`;

const ModalContent = styled.div`
    padding: 20px;
    max-height: 350px;
    overflow-y: auto;
`;

const SearchInput = styled.input`
    width: 100%;
    padding: 10px 14px;
    border: 2px solid #e9ecef;
    border-radius: 8px;
    font-size: 16px;
    margin-bottom: 12px;
    transition: all 0.2s ease;
    box-sizing: border-box;

    &:focus {
        outline: none;
        border-color: #667eea;
        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }
`;

const LoadingText = styled.div`
    text-align: center;
    color: #7f8c8d;
    padding: 20px;
`;

const MoviesList = styled.div`
    max-height: 250px;
    overflow-y: auto;
    border: 2px solid #e9ecef;
    border-radius: 8px;
    padding: 6px;
    margin-bottom: 12px;
`;

const MovieItem = styled.div`
    display: flex;
    align-items: center;
    padding: 10px;
    border-radius: 6px;
    transition: all 0.2s ease;

    &:hover {
        background: #f8f9fa;
    }
`;

const MovieCheckbox = styled.input`
    margin-right: 12px;
    transform: scale(1.2);
`;

const MovieInfo = styled.div`
    flex: 1;
`;

const MovieTitle = styled.div`
    font-weight: 500;
    color: #2c3e50;
    margin-bottom: 2px;
`;

const MovieOriginalTitle = styled.div`
    font-size: 14px;
    color: #7f8c8d;
    font-style: italic;
    margin-bottom: 2px;
`;

const MovieYear = styled.div`
    font-size: 12px;
    color: #95a5a6;
`;

const SelectionInfo = styled.div`
    text-align: center;
    font-size: 14px;
    color: #7f8c8d;
    padding: 12px;
    background: #f8f9fa;
    border-radius: 8px;
`;

const ModalActions = styled.div`
    display: flex;
    gap: 10px;
    justify-content: flex-end;
    padding: 20px;
    border-top: 1px solid #e9ecef;
`;

const CancelButton = styled.button`
    background: #95a5a6;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: #7f8c8d;
    }
`;

const SubmitButton = styled.button`
    background: #667eea;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover:not(:disabled) {
        background: #5a6fd8;
    }

    &:disabled {
        background: #bdc3c7;
        cursor: not-allowed;
    }
`;

export default AddMoviesModal;