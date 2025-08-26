import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const ReviewForm = ({
    movie,
    review = null,
    onSubmit,
    onCancel,
    isEditing = false,
    defaultReviewer = 'Цеха'
}) => {
    const [formData, setFormData] = useState({
        reviewer_name: defaultReviewer,
        rating: 5,
        review_text: ''
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (review) {
            setFormData({
                reviewer_name: review.reviewer_name || defaultReviewer,
                rating: review.rating || 5,
                review_text: review.review_text || ''
            });
        } else {
            // Если это новая рецензия, используем defaultReviewer
            setFormData(prev => ({
                ...prev,
                reviewer_name: defaultReviewer
            }));
        }
    }, [review, defaultReviewer]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Очищаем ошибку при изменении поля
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: null
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.reviewer_name) {
            newErrors.reviewer_name = 'Выберите рецензента';
        }

        if (!formData.rating || formData.rating < 1 || formData.rating > 10) {
            newErrors.rating = 'Оценка должна быть от 1 до 10';
        }

        if (!formData.review_text.trim()) {
            newErrors.review_text = 'Текст рецензии обязателен';
        } else if (formData.review_text.trim().length < 10) {
            newErrors.review_text = 'Рецензия должна содержать минимум 10 символов';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);
        
        try {
            let reviewData;
            
            if (isEditing) {
                // При редактировании отправляем только те поля, которые можно изменять
                reviewData = {
                    rating: parseInt(formData.rating) || 5,
                    review_text: formData.review_text ? formData.review_text.trim() : ''
                };
                
                // Проверяем, что данные корректны
                if (!reviewData.rating || reviewData.rating < 1 || reviewData.rating > 10) {
                    throw new Error('Некорректная оценка');
                }
                if (!reviewData.review_text || reviewData.review_text.length < 10) {
                    throw new Error('Текст рецензии должен содержать минимум 10 символов');
                }
            } else {
                // При создании отправляем все поля
                reviewData = {
                    ...formData,
                    reviewer_name: formData.reviewer_name ? formData.reviewer_name.trim() : 'Цеха',
                    rating: parseInt(formData.rating) || 5,
                    review_text: formData.review_text ? formData.review_text.trim() : ''
                };
            }

            // Отладочная информация
            console.log('Отправляем данные рецензии:', {
                isEditing,
                reviewData
            });

            await onSubmit(reviewData);
        } catch (error) {
            console.error('Ошибка отправки рецензии:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <FormContainer>
            <FormTitle>
                {isEditing ? 'Редактировать рецензию' : 'Добавить рецензию'}
            </FormTitle>
            
            {movie && (
                <MovieInfo>
                    <MoviePoster src={movie.poster_url || '/placeholder-poster.jpg'} alt={movie.title} />
                    <MovieDetails>
                        <MovieTitle>{movie.title}</MovieTitle>
                        {movie.original_title && movie.original_title !== movie.title && (
                            <MovieOriginalTitle>{movie.original_title}</MovieOriginalTitle>
                        )}
                        <MovieYear>{movie.release_year}</MovieYear>
                    </MovieDetails>
                </MovieInfo>
            )}

            <Form onSubmit={handleSubmit}>
                <FormSection>
                    <SectionTitle>Информация о рецензии</SectionTitle>
                    
                    <FormRow>
                        <FormGroup>
                            <Label htmlFor="reviewer_name">Рецензент *</Label>
                            <Select
                                id="reviewer_name"
                                name="reviewer_name"
                                value={formData.reviewer_name}
                                onChange={handleInputChange}
                                hasError={!!errors.reviewer_name}
                                disabled={isEditing} // При редактировании нельзя менять рецензента
                            >
                                <option value="Цеха">Цеха</option>
                                <option value="Паша">Паша</option>
                            </Select>
                            {errors.reviewer_name && <ErrorMessage>{errors.reviewer_name}</ErrorMessage>}
                        </FormGroup>
                        
                        <FormGroup>
                            <Label htmlFor="rating">Оценка *</Label>
                            <RatingContainer>
                                <RatingInput
                                    type="number"
                                    id="rating"
                                    name="rating"
                                    min="1"
                                    max="10"
                                    value={formData.rating}
                                    onChange={handleInputChange}
                                    hasError={!!errors.rating}
                                />
                                <RatingDisplay>
                                    <RatingStars rating={formData.rating} />
                                    <RatingValue>{formData.rating}/10</RatingValue>
                                </RatingDisplay>
                            </RatingContainer>
                            {errors.rating && <ErrorMessage>{errors.rating}</ErrorMessage>}
                        </FormGroup>
                    </FormRow>
                </FormSection>

                <FormSection>
                    <SectionTitle>Текст рецензии</SectionTitle>
                    <FormGroup>
                        <Label htmlFor="review_text">Рецензия *</Label>
                        <Textarea
                            id="review_text"
                            name="review_text"
                            value={formData.review_text}
                            onChange={handleInputChange}
                            placeholder="Напишите ваши впечатления о фильме..."
                            rows="6"
                            hasError={!!errors.review_text}
                        />
                        {errors.review_text && <ErrorMessage>{errors.review_text}</ErrorMessage>}
                        <CharCount>
                            {formData.review_text.length}/1000 символов
                        </CharCount>
                    </FormGroup>
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

// Компонент для отображения звездочек рейтинга
const RatingStars = ({ rating }) => {
    const stars = [];
    for (let i = 1; i <= 10; i++) {
        stars.push(
            <Star key={i} filled={i <= rating}>
                {i <= rating ? '★' : '☆'}
            </Star>
        );
    }
    return <StarsContainer>{stars}</StarsContainer>;
};

// Styled Components
const FormContainer = styled.div`
    max-width: 800px;
    margin: 0 auto;
    background: white;
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    overflow: hidden;
`;

const FormTitle = styled.h2`
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    margin: 0;
    padding: 24px;
    text-align: center;
    font-size: 24px;
    font-weight: 600;
`;

const MovieInfo = styled.div`
    display: flex;
    align-items: center;
    gap: 20px;
    padding: 24px;
    background: #f8f9fa;
    border-bottom: 1px solid #e9ecef;
`;

const MoviePoster = styled.img`
    width: 80px;
    height: 120px;
    object-fit: cover;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
`;

const MovieDetails = styled.div`
    flex: 1;
`;

const MovieTitle = styled.h3`
    margin: 0 0 8px 0;
    font-size: 20px;
    font-weight: 600;
    color: #333;
`;

const MovieOriginalTitle = styled.p`
    margin: 0 0 8px 0;
    font-size: 16px;
    color: #666;
    font-style: italic;
`;

const MovieYear = styled.p`
    margin: 0;
    font-size: 16px;
    color: #888;
`;

const Form = styled.form`
    padding: 24px;
`;

const FormSection = styled.div`
    margin-bottom: 32px;
`;

const SectionTitle = styled.h3`
    margin: 0 0 20px 0;
    font-size: 18px;
    font-weight: 600;
    color: #333;
    padding-bottom: 12px;
    border-bottom: 2px solid #f0f0f0;
`;

const FormRow = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    
    @media (max-width: 768px) {
        grid-template-columns: 1fr;
        gap: 16px;
    }
`;

const FormGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

const Label = styled.label`
    font-size: 14px;
    font-weight: 600;
    color: #333;
`;

const Select = styled.select`
    padding: 12px 16px;
    border: 2px solid ${props => props.hasError ? '#ff4757' : '#e0e0e0'};
    border-radius: 8px;
    font-size: 16px;
    background: ${props => props.disabled ? '#f8f9fa' : 'white'};
    cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
    transition: border-color 0.2s ease;
    opacity: ${props => props.disabled ? 0.7 : 1};

    &:focus {
        outline: none;
        border-color: #667eea;
    }
`;

const RatingContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 12px;
`;

const RatingInput = styled.input`
    padding: 12px 16px;
    border: 2px solid ${props => props.hasError ? '#ff4757' : '#e0e0e0'};
    border-radius: 8px;
    font-size: 16px;
    text-align: center;
    transition: border-color 0.2s ease;

    &:focus {
        outline: none;
        border-color: #667eea;
    }
`;

const RatingDisplay = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
`;

const StarsContainer = styled.div`
    display: flex;
    gap: 2px;
`;

const Star = styled.span`
    color: ${props => props.filled ? '#ffd700' : '#ddd'};
    font-size: 18px;
    transition: color 0.2s ease;
`;

const RatingValue = styled.span`
    font-size: 16px;
    font-weight: 600;
    color: #333;
`;

const Textarea = styled.textarea`
    padding: 16px;
    border: 2px solid ${props => props.hasError ? '#ff4757' : '#e0e0e0'};
    border-radius: 8px;
    font-size: 16px;
    font-family: inherit;
    resize: vertical;
    min-height: 120px;
    transition: border-color 0.2s ease;

    &:focus {
        outline: none;
        border-color: #667eea;
    }

    &::placeholder {
        color: #999;
    }
`;

const CharCount = styled.div`
    text-align: right;
    font-size: 12px;
    color: #666;
    margin-top: 4px;
`;

const ErrorMessage = styled.div`
    color: #ff4757;
    font-size: 14px;
    margin-top: 4px;
`;

const ButtonGroup = styled.div`
    display: flex;
    gap: 16px;
    justify-content: flex-end;
    margin-top: 32px;
    padding-top: 24px;
    border-top: 1px solid #e9ecef;
    
    @media (max-width: 768px) {
        flex-direction: column-reverse;
    }
`;

const Button = styled.button`
    padding: 12px 24px;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    min-width: 120px;

    &:hover:not(:disabled) {
        transform: translateY(-1px);
    }

    &:active {
        transform: translateY(0);
    }
`;

const CancelButton = styled(Button)`
    background: #f8f9fa;
    color: #666;
    border: 2px solid #e9ecef;

    &:hover {
        background: #e9ecef;
        border-color: #dee2e6;
    }
`;

const SubmitButton = styled(Button)`
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;

    &:hover:not(:disabled) {
        background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
    }

    &:disabled {
        background: #ccc;
        cursor: not-allowed;
        transform: none;
    }
`;

export default ReviewForm;
