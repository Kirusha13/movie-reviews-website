import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { genreService } from '../services/genreService';
import { actorService } from '../services/actorService';

const MovieForm = ({ 
    movie = null, 
    onSubmit, 
    onCancel, 
    isEditing = false,
    genres = [],
    actors = [],
    isLoading = false,
    onRefreshGenresAndActors
}) => {
    const [formData, setFormData] = useState({
        title: '',
        original_title: '',
        release_year: new Date().getFullYear(),
        director: '',
        poster_url: '',
        trailer_url: '',
        duration: '',
        description: '',
        country: '',
        language: '',
        status: 'watched',
        selectedGenres: [],
        selectedActors: []
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showGenreModal, setShowGenreModal] = useState(false);
    const [showActorModal, setShowActorModal] = useState(false);
    const [newGenre, setNewGenre] = useState({ name: '', description: '' });
    const [newActor, setNewActor] = useState({ name: '', biography: '', birth_date: '', photo_url: '' });
    const [isCreatingGenre, setIsCreatingGenre] = useState(false);
    const [isCreatingActor, setIsCreatingActor] = useState(false);

    // Заполняем форму данными фильма при редактировании
    useEffect(() => {
        if (movie) {
            setFormData({
                title: movie.title || '',
                original_title: movie.original_title || '',
                release_year: movie.release_year || new Date().getFullYear(),
                director: movie.director || '',
                poster_url: movie.poster_url || '',
                trailer_url: movie.trailer_url || '',
                duration: movie.duration || '',
                description: movie.description || '',
                country: movie.country || '',
                language: movie.language || '',
                status: movie.status || 'watched',
                selectedGenres: movie.genres || [],
                selectedActors: movie.actors || []
            });
        }
    }, [movie]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Очищаем ошибку для этого поля
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleGenreChange = (genre) => {
        const genreName = typeof genre === 'string' ? genre : (genre.name || genre);
        setFormData(prev => ({
            ...prev,
            selectedGenres: prev.selectedGenres.includes(genreName)
                ? prev.selectedGenres.filter(g => g !== genreName)
                : [...prev.selectedGenres, genreName]
        }));
    };

    const handleActorChange = (actor) => {
        const actorName = typeof actor === 'string' ? actor : (actor.name || actor);
        setFormData(prev => ({
            ...prev,
            selectedActors: prev.selectedActors.includes(actorName)
                ? prev.selectedActors.filter(a => a !== actorName)
                : [...prev.selectedActors, actorName]
        }));
    };

    const handleCreateGenre = async () => {
        if (!newGenre.name.trim()) return;
        
        setIsCreatingGenre(true);
        try {
            const response = await genreService.createGenre(newGenre);
            if (response.success) {
                // Обновляем список жанров в родительском компоненте
                if (onRefreshGenresAndActors) {
                    await onRefreshGenresAndActors();
                }
                setShowGenreModal(false);
                setNewGenre({ name: '', description: '' });
                alert('Жанр успешно добавлен!');
            }
        } catch (error) {
            console.error('Ошибка создания жанра:', error);
            alert(`Ошибка создания жанра: ${error.message}`);
        } finally {
            setIsCreatingGenre(false);
        }
    };

    const handleCreateActor = async () => {
        if (!newActor.name.trim()) return;
        
        setIsCreatingActor(true);
        try {
            const response = await actorService.createActor(newActor);
            if (response.success) {
                // Обновляем список актеров в родительском компоненте
                if (onRefreshGenresAndActors) {
                    await onRefreshGenresAndActors();
                }
                setShowActorModal(false);
                setNewActor({ name: '', biography: '', birth_date: '', photo_url: '' });
                alert('Актер успешно добавлен!');
            }
        } catch (error) {
            console.error('Ошибка создания актера:', error);
            alert(`Ошибка создания актера: ${error.message}`);
        } finally {
            setIsCreatingActor(false);
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Название фильма обязательно';
        }

        if (!formData.release_year) {
            newErrors.release_year = 'Год выпуска обязателен';
        } else if (formData.release_year < 1888 || formData.release_year > new Date().getFullYear() + 1) {
            newErrors.release_year = 'Некорректный год выпуска';
        }

        if (formData.duration && (formData.duration < 1 || formData.duration > 600)) {
            newErrors.duration = 'Длительность должна быть от 1 до 600 минут';
        }

        if (formData.poster_url && !isValidUrl(formData.poster_url)) {
            newErrors.poster_url = 'Некорректный URL постера';
        }

        if (formData.trailer_url && !isValidUrl(formData.trailer_url)) {
            newErrors.trailer_url = 'Некорректный URL трейлера';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const isValidUrl = (string) => {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);
        
        try {
            // Форматируем данные для отправки
            const movieData = {
                title: formData.title.trim(),
                original_title: formData.original_title.trim() || null,
                release_year: parseInt(formData.release_year),
                director: formData.director.trim() || null,
                poster_url: formData.poster_url.trim() || null,
                trailer_url: formData.trailer_url.trim() || null,
                duration: formData.duration ? parseInt(formData.duration) : null,
                description: formData.description.trim() || null,
                country: formData.country.trim() || null,
                language: formData.language.trim() || null,
                status: formData.status,
                // Преобразуем названия жанров в ID (пока используем заглушки)
                genres: formData.selectedGenres.map(genreName => {
                    // Здесь нужно будет получить ID жанра по названию
                    // Пока используем заглушку
                    return { name: genreName };
                }),
                // Преобразуем названия актеров в ID (пока используем заглушки)
                actors: formData.selectedActors.map(actorName => {
                    // Здесь нужно будет получить ID актера по названию
                    // Пока используем заглушку
                    return { name: actorName };
                })
            };

            await onSubmit(movieData);
        } catch (error) {
            console.error('Ошибка отправки формы:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const currentYear = new Date().getFullYear();
    const yearOptions = [];
    for (let year = currentYear + 1; year >= 1888; year--) {
        yearOptions.push(year);
    }

    return (
        <FormContainer>
            <FormTitle>
                {isEditing ? 'Редактировать фильм' : 'Добавить новый фильм'}
            </FormTitle>
            
            <Form onSubmit={handleSubmit}>
                <FormSection>
                    <SectionTitle>Основная информация</SectionTitle>
                    
                    <FormRow>
                        <FormGroup>
                            <Label htmlFor="title">Название фильма *</Label>
                            <Input
                                type="text"
                                id="title"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                placeholder="Введите название фильма"
                                hasError={!!errors.title}
                            />
                            {errors.title && <ErrorMessage>{errors.title}</ErrorMessage>}
                        </FormGroup>
                        
                        <FormGroup>
                            <Label htmlFor="original_title">Оригинальное название</Label>
                            <Input
                                type="text"
                                id="original_title"
                                name="original_title"
                                value={formData.original_title}
                                onChange={handleInputChange}
                                placeholder="Оригинальное название"
                            />
                        </FormGroup>
                    </FormRow>

                    <FormRow>
                        <FormGroup>
                            <Label htmlFor="release_year">Год выпуска *</Label>
                            <Select
                                id="release_year"
                                name="release_year"
                                value={formData.release_year}
                                onChange={handleInputChange}
                                hasError={!!errors.release_year}
                            >
                                {yearOptions.map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </Select>
                            {errors.release_year && <ErrorMessage>{errors.release_year}</ErrorMessage>}
                        </FormGroup>
                        
                        <FormGroup>
                            <Label htmlFor="director">Режиссер</Label>
                            <Input
                                type="text"
                                id="director"
                                name="director"
                                value={formData.director}
                                onChange={handleInputChange}
                                placeholder="Имя режиссера"
                            />
                        </FormGroup>
                    </FormRow>

                    <FormRow>
                        <FormGroup>
                            <Label htmlFor="duration">Длительность (минуты)</Label>
                            <Input
                                type="number"
                                id="duration"
                                name="duration"
                                value={formData.duration}
                                onChange={handleInputChange}
                                placeholder="120"
                                min="1"
                                max="600"
                                hasError={!!errors.duration}
                            />
                            {errors.duration && <ErrorMessage>{errors.duration}</ErrorMessage>}
                        </FormGroup>
                        
                        <FormGroup>
                            <Label htmlFor="status">Статус</Label>
                            <Select
                                id="status"
                                name="status"
                                value={formData.status}
                                onChange={handleInputChange}
                            >
                                <option value="watched">Просмотрен</option>
                                <option value="watchlist">В списке желаемых</option>
                            </Select>
                        </FormGroup>
                    </FormRow>
                </FormSection>

                <FormSection>
                    <SectionTitle>Дополнительная информация</SectionTitle>
                    
                    <FormRow>
                        <FormGroup>
                            <Label htmlFor="country">Страна</Label>
                            <Input
                                type="text"
                                id="country"
                                name="country"
                                value={formData.country}
                                onChange={handleInputChange}
                                placeholder="Страна производства"
                            />
                        </FormGroup>
                        
                        <FormGroup>
                            <Label htmlFor="language">Язык</Label>
                            <Input
                                type="text"
                                id="language"
                                name="language"
                                value={formData.language}
                                onChange={handleInputChange}
                                placeholder="Основной язык"
                            />
                        </FormGroup>
                    </FormRow>

                    <FormGroup>
                        <Label htmlFor="description">Описание</Label>
                        <Textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            placeholder="Краткое описание фильма"
                            rows="4"
                        />
                    </FormGroup>
                </FormSection>

                <FormSection>
                    <SectionTitle>Ссылки</SectionTitle>
                    
                    <FormGroup>
                        <Label htmlFor="poster_url">URL постера</Label>
                        <Input
                            type="url"
                            id="poster_url"
                            name="poster_url"
                            value={formData.poster_url}
                            onChange={handleInputChange}
                            placeholder="https://example.com/poster.jpg"
                            hasError={!!errors.poster_url}
                        />
                        {errors.poster_url && <ErrorMessage>{errors.poster_url}</ErrorMessage>}
                    </FormGroup>
                    
                    <FormGroup>
                        <Label htmlFor="trailer_url">URL трейлера</Label>
                        <Input
                            type="url"
                            id="trailer_url"
                            name="trailer_url"
                            value={formData.trailer_url}
                            onChange={handleInputChange}
                            placeholder="https://youtube.com/watch?v=..."
                            hasError={!!errors.trailer_url}
                        />
                        {errors.trailer_url && <ErrorMessage>{errors.trailer_url}</ErrorMessage>}
                    </FormGroup>
                </FormSection>

                <FormSection>
                    <SectionTitle>
                        Жанры
                        <AddButton type="button" onClick={() => setShowGenreModal(true)}>
                            + Добавить жанр
                        </AddButton>
                    </SectionTitle>
                    {isLoading ? (
                        <LoadingText>Загрузка жанров...</LoadingText>
                    ) : (
                        <GenresGrid>
                            {Array.isArray(genres) && genres.length > 0 ? (
                                genres.map(genre => {
                                    const genreId = genre.id || genre;
                                    const genreName = genre.name || genre;
                                    return (
                                        <GenreCheckbox key={genreId}>
                                            <input
                                                type="checkbox"
                                                id={`genre-${genreId}`}
                                                checked={formData.selectedGenres.includes(genreName)}
                                                onChange={() => handleGenreChange(genre)}
                                            />
                                            <label htmlFor={`genre-${genreId}`}>
                                                {genreName}
                                            </label>
                                        </GenreCheckbox>
                                    );
                                })
                            ) : (
                                <LoadingText>Жанры не найдены</LoadingText>
                            )}
                        </GenresGrid>
                    )}
                </FormSection>

                <FormSection>
                    <SectionTitle>
                        Актеры
                        <AddButton type="button" onClick={() => setShowActorModal(true)}>
                            + Добавить актера
                        </AddButton>
                    </SectionTitle>
                    {isLoading ? (
                        <LoadingText>Загрузка актеров...</LoadingText>
                    ) : (
                        <GenresGrid>
                            {Array.isArray(actors) && actors.length > 0 ? (
                                actors.map(actor => {
                                    const actorId = actor.id || actor;
                                    const actorName = actor.name || actor;
                                    return (
                                        <GenreCheckbox key={actorId}>
                                            <input
                                                type="checkbox"
                                                id={`actor-${actorId}`}
                                                checked={formData.selectedActors.includes(actorName)}
                                                onChange={() => handleActorChange(actor)}
                                            />
                                            <label htmlFor={`actor-${actorId}`}>
                                                {actorName}
                                            </label>
                                        </GenreCheckbox>
                                    );
                                })
                            ) : (
                                <LoadingText>Актеры не найдены</LoadingText>
                            )}
                        </GenresGrid>
                    )}
                </FormSection>

                <ButtonGroup>
                    <CancelButton type="button" onClick={onCancel}>
                        Отмена
                    </CancelButton>
                    <SubmitButton type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Сохранение...' : (isEditing ? 'Обновить' : 'Добавить')}
                    </SubmitButton>
                </ButtonGroup>
            </Form>

            {/* Модальное окно для добавления жанра */}
            {showGenreModal && (
                <Modal>
                    <ModalContent>
                        <ModalHeader>
                            <ModalTitle>Добавить новый жанр</ModalTitle>
                            <CloseButton onClick={() => setShowGenreModal(false)}>&times;</CloseButton>
                        </ModalHeader>
                        <ModalBody>
                            <FormGroup>
                                <Label htmlFor="genre-name">Название жанра *</Label>
                                <Input
                                    type="text"
                                    id="genre-name"
                                    value={newGenre.name}
                                    onChange={(e) => setNewGenre(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="Введите название жанра"
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label htmlFor="genre-description">Описание</Label>
                                <Textarea
                                    id="genre-description"
                                    value={newGenre.description}
                                    onChange={(e) => setNewGenre(prev => ({ ...prev, description: e.target.value }))}
                                    placeholder="Краткое описание жанра"
                                    rows="3"
                                />
                            </FormGroup>
                        </ModalBody>
                        <ModalFooter>
                            <CancelButton type="button" onClick={() => setShowGenreModal(false)}>
                                Отмена
                            </CancelButton>
                            <SubmitButton type="button" onClick={handleCreateGenre} disabled={isCreatingGenre}>
                                {isCreatingGenre ? 'Добавление...' : 'Добавить'}
                            </SubmitButton>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
            )}

            {/* Модальное окно для добавления актера */}
            {showActorModal && (
                <Modal>
                    <ModalContent>
                        <ModalHeader>
                            <ModalTitle>Добавить нового актера</ModalTitle>
                            <CloseButton onClick={() => setShowActorModal(false)}>&times;</CloseButton>
                        </ModalHeader>
                        <ModalBody>
                            <FormGroup>
                                <Label htmlFor="actor-name">Имя актера *</Label>
                                <Input
                                    type="text"
                                    id="actor-name"
                                    value={newActor.name}
                                    onChange={(e) => setNewActor(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="Введите имя актера"
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label htmlFor="actor-biography">Биография</Label>
                                <Textarea
                                    id="actor-biography"
                                    value={newActor.biography}
                                    onChange={(e) => setNewActor(prev => ({ ...prev, biography: e.target.value }))}
                                    placeholder="Краткая биография актера"
                                    rows="3"
                                />
                            </FormGroup>
                            <FormRow>
                                <FormGroup>
                                    <Label htmlFor="actor-birth-date">Дата рождения</Label>
                                    <Input
                                        type="date"
                                        id="actor-birth-date"
                                        value={newActor.birth_date}
                                        onChange={(e) => setNewActor(prev => ({ ...prev, birth_date: e.target.value }))}
                                    />
                                </FormGroup>
                                <FormGroup>
                                    <Label htmlFor="actor-photo-url">URL фото</Label>
                                    <Input
                                        type="url"
                                        id="actor-photo-url"
                                        value={newActor.photo_url}
                                        onChange={(e) => setNewActor(prev => ({ ...prev, photo_url: e.target.value }))}
                                        placeholder="https://example.com/photo.jpg"
                                    />
                                </FormGroup>
                            </FormRow>
                        </ModalBody>
                        <ModalFooter>
                            <CancelButton type="button" onClick={() => setShowActorModal(false)}>
                                Отмена
                            </CancelButton>
                            <SubmitButton type="button" onClick={handleCreateActor} disabled={isCreatingActor}>
                                {isCreatingActor ? 'Добавление...' : 'Добавить'}
                            </SubmitButton>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
            )}
        </FormContainer>
    );
};

// Styled Components
const FormContainer = styled.div`
    max-width: 800px;
    margin: 0 auto;
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    padding: 30px;
`;

const FormTitle = styled.h2`
    text-align: center;
    color: #333;
    margin-bottom: 30px;
    font-size: 28px;
    font-weight: 600;
`;

const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: 30px;
`;

const FormSection = styled.div`
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 20px;
    background: #fafafa;
`;

const SectionTitle = styled.h3`
    color: #555;
    margin-bottom: 20px;
    font-size: 18px;
    font-weight: 500;
    border-bottom: 2px solid #667eea;
    padding-bottom: 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const FormRow = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    
    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`;

const FormGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

const Label = styled.label`
    font-weight: 500;
    color: #333;
    font-size: 14px;
`;

const Input = styled.input`
    padding: 12px 16px;
    border: 2px solid ${props => props.hasError ? '#e74c3c' : '#e0e0e0'};
    border-radius: 6px;
    font-size: 14px;
    transition: border-color 0.3s ease;
    
    &:focus {
        outline: none;
        border-color: #667eea;
    }
    
    &::placeholder {
        color: #999;
    }
`;

const Select = styled.select`
    padding: 12px 16px;
    border: 2px solid ${props => props.hasError ? '#e74c3c' : '#e0e0e0'};
    border-radius: 6px;
    font-size: 14px;
    background: white;
    transition: border-color 0.3s ease;
    
    &:focus {
        outline: none;
        border-color: #667eea;
    }
`;

const Textarea = styled.textarea`
    padding: 12px 16px;
    border: 2px solid #e0e0e0;
    border-radius: 6px;
    font-size: 14px;
    font-family: inherit;
    resize: vertical;
    transition: border-color 0.3s ease;
    
    &:focus {
        outline: none;
        border-color: #667eea;
    }
    
    &::placeholder {
        color: #999;
    }
`;

const ErrorMessage = styled.span`
    color: #e74c3c;
    font-size: 12px;
    margin-top: 4px;
`;

const GenresGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 12px;
`;

const GenreCheckbox = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    
    input[type="checkbox"] {
        width: 18px;
        height: 18px;
        accent-color: #667eea;
    }
    
    label {
        font-size: 14px;
        color: #333;
        cursor: pointer;
        user-select: none;
    }
`;

const ButtonGroup = styled.div`
    display: flex;
    gap: 16px;
    justify-content: flex-end;
    margin-top: 20px;
    
    @media (max-width: 768px) {
        flex-direction: column;
    }
`;

const Button = styled.button`
    padding: 12px 24px;
    border: none;
    border-radius: 6px;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;

const SubmitButton = styled(Button)`
    background: #667eea;
    color: white;
    
    &:hover:not(:disabled) {
        background: #5a6fd8;
        transform: translateY(-2px);
    }
`;

const CancelButton = styled(Button)`
    background: #f8f9fa;
    color: #666;
    border: 1px solid #e0e0e0;
    
    &:hover {
        background: #e9ecef;
        color: #333;
    }
`;

const AddButton = styled.button`
    background: #28a745;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 6px 12px;
    font-size: 12px;
    cursor: pointer;
    transition: background-color 0.3s ease;
    margin-left: 15px;
    
    &:hover {
        background: #218838;
    }
`;

const LoadingText = styled.div`
    text-align: center;
    color: #666;
    padding: 20px;
    font-style: italic;
`;

const Modal = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
`;

const ModalContent = styled.div`
    background: white;
    border-radius: 8px;
    width: 90%;
    max-width: 500px;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
`;

const ModalHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    border-bottom: 1px solid #e0e0e0;
`;

const ModalTitle = styled.h3`
    margin: 0;
    color: #333;
    font-size: 18px;
`;

const CloseButton = styled.button`
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #666;
    
    &:hover {
        color: #333;
    }
`;

const ModalBody = styled.div`
    padding: 20px;
`;

const ModalFooter = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    padding: 20px;
    border-top: 1px solid #e0e0e0;
`;

export default MovieForm;
