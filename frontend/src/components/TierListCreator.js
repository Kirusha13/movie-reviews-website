import React, { useState, useEffect, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import movieService from '../services/movieService';
import useToast from '../hooks/useToast';

const TierListCreator = ({ onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        name: '',
        selectedMovies: []
    });
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredMovies, setFilteredMovies] = useState([]);
    const { showToast } = useToast();

    useEffect(() => {
        fetchMovies();
    }, []);

    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredMovies(movies);
        } else {
            const filtered = movies.filter(movie =>
                movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (movie.original_title && movie.original_title.toLowerCase().includes(searchQuery.toLowerCase()))
            );
            setFilteredMovies(filtered);
        }
    }, [movies, searchQuery]);

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

    const handleNameChange = useCallback((e) => {
        setFormData(prev => ({ ...prev, name: e.target.value }));
    }, []);

    const handleMovieToggle = useCallback((movieId) => {
        setFormData(prev => ({
            ...prev,
            selectedMovies: prev.selectedMovies.includes(movieId)
                ? prev.selectedMovies.filter(id => id !== movieId)
                : [...prev.selectedMovies, movieId]
        }));
    }, []);

    const handleSubmit = useCallback((e) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            showToast('Введите название tier-листа', 'warning');
            return;
        }
        onSubmit(formData.name.trim(), formData.selectedMovies);
    }, [formData, onSubmit, showToast]);

    const handleCancel = useCallback(() => {
        onClose();
    }, [onClose]);

    const isFormValid = useMemo(() => formData.name.trim() !== '', [formData.name]);

    return (
        <Overlay onClick={handleCancel}>
            <Modal onClick={(e) => e.stopPropagation()}>
                <ModalHeader>
                    <ModalTitle>Создать Tier-лист</ModalTitle>
                    <CloseButton onClick={handleCancel}>×</CloseButton>
                </ModalHeader>

                <Form onSubmit={handleSubmit}>
                    <FormGroup>
                        <Label>Название tier-листа</Label>
                        <Input
                            type="text"
                            value={formData.name}
                            onChange={handleNameChange}
                            placeholder="Введите название..."
                            required
                        />
                    </FormGroup>

                    <FormGroup>
                        <Label>Выберите фильмы (необязательно)</Label>
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
                                            checked={formData.selectedMovies.includes(movie.id)}
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
                    </FormGroup>

                    <FormActions>
                        <CancelButton type="button" onClick={handleCancel}>
                            Отмена
                        </CancelButton>
                        <SubmitButton type="submit" disabled={!isFormValid}>
                            Создать
                        </SubmitButton>
                    </FormActions>
                </Form>
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
    overflow-y: auto;
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

const Form = styled.form`
    padding: 20px;
`;

const FormGroup = styled.div`
    margin-bottom: 20px;
`;

const Label = styled.label`
    display: block;
    font-size: 16px;
    font-weight: 500;
    color: #2c3e50;
    margin-bottom: 8px;
`;

const Input = styled.input`
    width: 100%;
    padding: 10px 14px;
    border: 2px solid #e9ecef;
    border-radius: 8px;
    font-size: 16px;
    transition: all 0.2s ease;
    box-sizing: border-box;

    &:focus {
        outline: none;
        border-color: #667eea;
        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }
`;

const SearchInput = styled(Input)`
    margin-bottom: 12px;
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

const FormActions = styled.div`
    display: flex;
    gap: 10px;
    justify-content: flex-end;
    margin-top: 20px;
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

export default TierListCreator;