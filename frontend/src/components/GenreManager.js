import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { genreService } from '../services/genreService';

const GenreManager = () => {
    const [genres, setGenres] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editingGenre, setEditingGenre] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: ''
    });
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchGenres();
    }, []);

    const fetchGenres = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await genreService.getAllGenres();
            if (response.success) {
                setGenres(response.data);
            } else {
                setError(response.message || 'Ошибка получения жанров');
            }
        } catch (error) {
            console.error('Ошибка получения жанров:', error);
            setError('Не удалось загрузить жанры');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            if (editingGenre) {
                await genreService.updateGenre(editingGenre.id, formData);
                alert('Жанр успешно обновлен!');
            } else {
                await genreService.createGenre(formData);
                alert('Жанр успешно создан!');
            }
            
            setShowForm(false);
            setEditingGenre(null);
            setFormData({ name: '', description: '' });
            fetchGenres();
        } catch (error) {
            console.error('Ошибка сохранения жанра:', error);
            alert(`Ошибка: ${error.message}`);
        }
    };

    const handleEdit = (genre) => {
        setEditingGenre(genre);
        setFormData({
            name: genre.name,
            description: genre.description || ''
        });
        setShowForm(true);
    };

    const handleDelete = async (genre) => {
        if (window.confirm(`Вы уверены, что хотите удалить жанр "${genre.name}"?`)) {
            try {
                await genreService.deleteGenre(genre.id);
                alert('Жанр успешно удален!');
                fetchGenres();
            } catch (error) {
                console.error('Ошибка удаления жанра:', error);
                alert(`Ошибка: ${error.message}`);
            }
        }
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingGenre(null);
        setFormData({ name: '', description: '' });
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            fetchGenres();
            return;
        }

        try {
            setLoading(true);
            const response = await genreService.searchGenres(searchQuery);
            if (response.success) {
                setGenres(response.data);
            } else {
                setError(response.message || 'Ошибка поиска');
            }
        } catch (error) {
            console.error('Ошибка поиска жанров:', error);
            setError('Ошибка поиска');
        } finally {
            setLoading(false);
        }
    };

    if (loading && genres.length === 0) {
        return <LoadingContainer>Загрузка жанров...</LoadingContainer>;
    }

    return (
        <Container>
            <Header>
                <Title>Управление жанрами</Title>
                <AddButton onClick={() => setShowForm(true)}>
                    + Добавить жанр
                </AddButton>
            </Header>

            <SearchSection>
                <SearchInput
                    type="text"
                    placeholder="Поиск жанров..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <SearchButton onClick={handleSearch}>
                    🔍 Поиск
                </SearchButton>
                {searchQuery && (
                    <ClearButton onClick={() => {
                        setSearchQuery('');
                        fetchGenres();
                    }}>
                        Очистить
                    </ClearButton>
                )}
            </SearchSection>

            {error && (
                <ErrorMessage>
                    {error}
                    <RetryButton onClick={fetchGenres}>Повторить</RetryButton>
                </ErrorMessage>
            )}

            {showForm && (
                <FormOverlay>
                    <FormContainer>
                        <FormTitle>
                            {editingGenre ? 'Редактировать жанр' : 'Добавить жанр'}
                        </FormTitle>
                        <Form onSubmit={handleSubmit}>
                            <FormGroup>
                                <Label>Название жанра *</Label>
                                <Input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="Введите название жанра"
                                    required
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label>Описание</Label>
                                <Textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Описание жанра (необязательно)"
                                    rows="3"
                                />
                            </FormGroup>
                            <FormActions>
                                <SubmitButton type="submit">
                                    {editingGenre ? 'Обновить' : 'Создать'}
                                </SubmitButton>
                                <CancelButton type="button" onClick={handleCancel}>
                                    Отмена
                                </CancelButton>
                            </FormActions>
                        </Form>
                    </FormContainer>
                </FormOverlay>
            )}

            <GenresList>
                {genres.map(genre => (
                    <GenreCard key={genre.id}>
                        <GenreInfo>
                            <GenreName>{genre.name}</GenreName>
                            {genre.description && (
                                <GenreDescription>{genre.description}</GenreDescription>
                            )}
                            <GenreMeta>
                                Создан: {new Date(genre.created_at).toLocaleDateString()}
                            </GenreMeta>
                        </GenreInfo>
                        <GenreActions>
                            <EditButton onClick={() => handleEdit(genre)}>
                                ✏️ Редактировать
                            </EditButton>
                            <DeleteButton onClick={() => handleDelete(genre)}>
                                🗑️ Удалить
                            </DeleteButton>
                        </GenreActions>
                    </GenreCard>
                ))}
            </GenresList>

            {genres.length === 0 && !loading && (
                <EmptyState>
                    {searchQuery ? 'По вашему запросу ничего не найдено' : 'Жанры не найдены'}
                </EmptyState>
            )}
        </Container>
    );
};

const Container = styled.div`
    padding: 20px;
    max-width: 1200px;
    margin: 0 auto;
`;

const Header = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
`;

const Title = styled.h1`
    font-size: 28px;
    color: #333;
    margin: 0;
`;

const AddButton = styled.button`
    background: #4CAF50;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 6px;
    font-size: 16px;
    cursor: pointer;
    transition: background 0.3s;

    &:hover {
        background: #45a049;
    }
`;

const SearchSection = styled.div`
    display: flex;
    gap: 10px;
    margin-bottom: 30px;
    align-items: center;
`;

const SearchInput = styled.input`
    flex: 1;
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 16px;
`;

const SearchButton = styled.button`
    background: #2196F3;
    color: white;
    border: none;
    padding: 12px 20px;
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.3s;

    &:hover {
        background: #1976D2;
    }
`;

const ClearButton = styled.button`
    background: #f44336;
    color: white;
    border: none;
    padding: 12px 20px;
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.3s;

    &:hover {
        background: #d32f2f;
    }
`;

const ErrorMessage = styled.div`
    background: #ffebee;
    color: #c62828;
    padding: 15px;
    border-radius: 6px;
    margin-bottom: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const RetryButton = styled.button`
    background: #f44336;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;

    &:hover {
        background: #d32f2f;
    }
`;

const FormOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
`;

const FormContainer = styled.div`
    background: white;
    padding: 30px;
    border-radius: 8px;
    width: 90%;
    max-width: 500px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
`;

const FormTitle = styled.h2`
    margin: 0 0 20px 0;
    color: #333;
`;

const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: 20px;
`;

const FormGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

const Label = styled.label`
    font-weight: 600;
    color: #555;
`;

const Input = styled.input`
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 16px;

    &:focus {
        outline: none;
        border-color: #2196F3;
    }
`;

const Textarea = styled.textarea`
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 16px;
    resize: vertical;

    &:focus {
        outline: none;
        border-color: #2196F3;
    }
`;

const FormActions = styled.div`
    display: flex;
    gap: 10px;
    justify-content: flex-end;
`;

const SubmitButton = styled.button`
    background: #4CAF50;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 16px;

    &:hover {
        background: #45a049;
    }
`;

const CancelButton = styled.button`
    background: #9e9e9e;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 16px;

    &:hover {
        background: #757575;
    }
`;

const GenresList = styled.div`
    display: grid;
    gap: 20px;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
`;

const GenreCard = styled.div`
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s, box-shadow 0.2s;

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    }
`;

const GenreInfo = styled.div`
    margin-bottom: 15px;
`;

const GenreName = styled.h3`
    margin: 0 0 10px 0;
    color: #333;
    font-size: 20px;
`;

const GenreDescription = styled.p`
    color: #666;
    margin: 0 0 10px 0;
    line-height: 1.5;
`;

const GenreMeta = styled.small`
    color: #999;
    font-size: 12px;
`;

const GenreActions = styled.div`
    display: flex;
    gap: 10px;
`;

const EditButton = styled.button`
    background: #2196F3;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    flex: 1;

    &:hover {
        background: #1976D2;
    }
`;

const DeleteButton = styled.button`
    background: #f44336;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    flex: 1;

    &:hover {
        background: #d32f2f;
    }
`;

const LoadingContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 200px;
    font-size: 18px;
    color: #666;
`;

const EmptyState = styled.div`
    text-align: center;
    padding: 40px;
    color: #666;
    font-size: 18px;
`;

export default GenreManager;
