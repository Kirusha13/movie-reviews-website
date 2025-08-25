import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const MovieForm = ({ 
    movie = null, 
    onSubmit, 
    onCancel, 
    isEditing = false,
    genres = [],
    actors = []
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
        setFormData(prev => ({
            ...prev,
            selectedGenres: prev.selectedGenres.includes(genre)
                ? prev.selectedGenres.filter(g => g !== genre)
                : [...prev.selectedGenres, genre]
        }));
    };

    const handleActorChange = (actor) => {
        setFormData(prev => ({
            ...prev,
            selectedActors: prev.selectedActors.includes(actor)
                ? prev.selectedActors.filter(a => a !== actor)
                : [...prev.selectedActors, actor]
        }));
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
                    <SectionTitle>Жанры</SectionTitle>
                    <GenresGrid>
                        {genres.map(genre => (
                            <GenreCheckbox key={genre.id || genre}>
                                <input
                                    type="checkbox"
                                    id={`genre-${genre.id || genre}`}
                                    checked={formData.selectedGenres.includes(genre.name || genre)}
                                    onChange={() => handleGenreChange(genre.name || genre)}
                                />
                                <label htmlFor={`genre-${genre.id || genre}`}>
                                    {genre.name || genre}
                                </label>
                            </GenreCheckbox>
                        ))}
                    </GenresGrid>
                </FormSection>

                <FormSection>
                    <SectionTitle>Актеры</SectionTitle>
                    <GenresGrid>
                        {actors.map(actor => (
                            <GenreCheckbox key={actor.id || actor}>
                                <input
                                    type="checkbox"
                                    id={`actor-${actor.id || actor}`}
                                    checked={formData.selectedActors.includes(actor.name || actor)}
                                    onChange={() => handleActorChange(actor.name || actor)}
                                />
                                <label htmlFor={`actor-${actor.id || actor}`}>
                                    {actor.name || actor}
                                </label>
                            </GenreCheckbox>
                        ))}
                    </GenresGrid>
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

export default MovieForm;
