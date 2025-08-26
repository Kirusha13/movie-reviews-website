import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { actorService } from '../services/actorService';

const ActorManager = () => {
    const [actors, setActors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editingActor, setEditingActor] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        biography: '',
        birth_date: '',
        photo_url: ''
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0
    });

    useEffect(() => {
        fetchActors();
    }, [pagination.page]);

    const fetchActors = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await actorService.getAllActors({
                page: pagination.page,
                limit: pagination.limit
            });
            if (response.success) {
                setActors(response.data);
                setPagination(prev => ({
                    ...prev,
                    total: response.pagination.total,
                    totalPages: response.pagination.totalPages
                }));
            } else {
                setError(response.message || 'Ошибка получения актеров');
            }
        } catch (error) {
            console.error('Ошибка получения актеров:', error);
            setError('Не удалось загрузить актеров');
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
            if (editingActor) {
                await actorService.updateActor(editingActor.id, formData);
                alert('Актер успешно обновлен!');
            } else {
                await actorService.createActor(formData);
                alert('Актер успешно создан!');
            }
            
            setShowForm(false);
            setEditingActor(null);
            setFormData({ name: '', biography: '', birth_date: '', photo_url: '' });
            fetchActors();
        } catch (error) {
            console.error('Ошибка сохранения актера:', error);
            alert(`Ошибка: ${error.message}`);
        }
    };

    const handleEdit = (actor) => {
        setEditingActor(actor);
        setFormData({
            name: actor.name,
            biography: actor.biography || '',
            birth_date: actor.birth_date ? actor.birth_date.split('T')[0] : '',
            photo_url: actor.photo_url || ''
        });
        setShowForm(true);
    };

    const handleDelete = async (actor) => {
        if (window.confirm(`Вы уверены, что хотите удалить актера "${actor.name}"?`)) {
            try {
                await actorService.deleteActor(actor.id);
                alert('Актер успешно удален!');
                fetchActors();
            } catch (error) {
                console.error('Ошибка удаления актера:', error);
                alert(`Ошибка: ${error.message}`);
            }
        }
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingActor(null);
        setFormData({ name: '', biography: '', birth_date: '', photo_url: '' });
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            fetchActors();
            return;
        }

        try {
            setLoading(true);
            const response = await actorService.searchActors(searchQuery);
            if (response.success) {
                setActors(response.data);
                setPagination(prev => ({
                    ...prev,
                    total: response.data.length,
                    totalPages: 1
                }));
            } else {
                setError(response.message || 'Ошибка поиска');
            }
        } catch (error) {
            console.error('Ошибка поиска актеров:', error);
            setError('Ошибка поиска');
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (newPage) => {
        setPagination(prev => ({ ...prev, page: newPage }));
    };

    if (loading && actors.length === 0) {
        return <LoadingContainer>Загрузка актеров...</LoadingContainer>;
    }

    return (
        <Container>
            <Header>
                <Title>Управление актерами</Title>
                <AddButton onClick={() => setShowForm(true)}>
                    + Добавить актера
                </AddButton>
            </Header>

            <SearchSection>
                <SearchInput
                    type="text"
                    placeholder="Поиск актеров..."
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
                        fetchActors();
                    }}>
                        Очистить
                    </ClearButton>
                )}
            </SearchSection>

            {error && (
                <ErrorMessage>
                    {error}
                    <RetryButton onClick={fetchActors}>Повторить</RetryButton>
                </ErrorMessage>
            )}

            {showForm && (
                <FormOverlay>
                    <FormContainer>
                        <FormTitle>
                            {editingActor ? 'Редактировать актера' : 'Добавить актера'}
                        </FormTitle>
                        <Form onSubmit={handleSubmit}>
                            <FormGroup>
                                <Label>Имя актера *</Label>
                                <Input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="Введите имя актера"
                                    required
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label>Биография</Label>
                                <Textarea
                                    name="biography"
                                    value={formData.biography}
                                    onChange={handleInputChange}
                                    placeholder="Биография актера (необязательно)"
                                    rows="4"
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label>Дата рождения</Label>
                                <Input
                                    type="date"
                                    name="birth_date"
                                    value={formData.birth_date}
                                    onChange={handleInputChange}
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label>URL фотографии</Label>
                                <Input
                                    type="url"
                                    name="photo_url"
                                    value={formData.photo_url}
                                    onChange={handleInputChange}
                                    placeholder="Ссылка на фотографию"
                                />
                            </FormGroup>
                            <FormActions>
                                <SubmitButton type="submit">
                                    {editingActor ? 'Обновить' : 'Создать'}
                                </SubmitButton>
                                <CancelButton type="button" onClick={handleCancel}>
                                    Отмена
                                </CancelButton>
                            </FormActions>
                        </Form>
                    </FormContainer>
                </FormOverlay>
            )}

            <ActorsList>
                {actors.map(actor => (
                    <ActorCard key={actor.id}>
                        <ActorPhoto>
                            {actor.photo_url ? (
                                <img src={actor.photo_url} alt={actor.name} />
                            ) : (
                                <DefaultPhoto>🎭</DefaultPhoto>
                            )}
                        </ActorPhoto>
                        <ActorInfo>
                            <ActorName>{actor.name}</ActorName>
                            {actor.biography && (
                                <ActorBiography>
                                    {actor.biography.length > 150 
                                        ? actor.biography.substring(0, 150) + '...'
                                        : actor.biography
                                    }
                                </ActorBiography>
                            )}
                            {actor.birth_date && (
                                <ActorBirthDate>
                                    Дата рождения: {new Date(actor.birth_date).toLocaleDateString()}
                                </ActorBirthDate>
                            )}
                            <ActorMeta>
                                Создан: {new Date(actor.created_at).toLocaleDateString()}
                            </ActorMeta>
                        </ActorInfo>
                        <ActorActions>
                            <EditButton onClick={() => handleEdit(actor)}>
                                ✏️ Редактировать
                            </EditButton>
                            <DeleteButton onClick={() => handleDelete(actor)}>
                                🗑️ Удалить
                            </DeleteButton>
                        </ActorActions>
                    </ActorCard>
                ))}
            </ActorsList>

            {actors.length === 0 && !loading && (
                <EmptyState>
                    {searchQuery ? 'По вашему запросу ничего не найдено' : 'Актеры не найдены'}
                </EmptyState>
            )}

            {pagination.totalPages > 1 && (
                <Pagination>
                    <PaginationButton 
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page === 1}
                    >
                        ← Предыдущая
                    </PaginationButton>
                    <PageInfo>
                        Страница {pagination.page} из {pagination.totalPages}
                    </PageInfo>
                    <PaginationButton 
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page === pagination.totalPages}
                    >
                        Следующая →
                    </PaginationButton>
                </Pagination>
            )}
        </Container>
    );
};

// Styled Components
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
    max-height: 90vh;
    overflow-y: auto;
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

const ActorsList = styled.div`
    display: grid;
    gap: 20px;
    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
`;

const ActorCard = styled.div`
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s, box-shadow 0.2s;
    display: flex;
    gap: 20px;

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    }
`;

const ActorPhoto = styled.div`
    width: 80px;
    height: 80px;
    flex-shrink: 0;

    img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 50%;
    }
`;

const DefaultPhoto = styled.div`
    width: 100%;
    height: 100%;
    background: #f0f0f0;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32px;
    color: #999;
`;

const ActorInfo = styled.div`
    flex: 1;
    margin-bottom: 15px;
`;

const ActorName = styled.h3`
    margin: 0 0 10px 0;
    color: #333;
    font-size: 20px;
`;

const ActorBiography = styled.p`
    color: #666;
    margin: 0 0 10px 0;
    line-height: 1.5;
`;

const ActorBirthDate = styled.div`
    color: #777;
    margin: 0 0 8px 0;
    font-size: 14px;
`;

const ActorMeta = styled.small`
    color: #999;
    font-size: 12px;
`;

const ActorActions = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
    justify-content: center;
`;

const EditButton = styled.button`
    background: #2196F3;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;

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

const Pagination = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 20px;
    margin-top: 30px;
    padding: 20px 0;
`;

const PaginationButton = styled.button`
    background: #2196F3;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;

    &:hover:not(:disabled) {
        background: #1976D2;
    }

    &:disabled {
        background: #ccc;
        cursor: not-allowed;
    }
`;

const PageInfo = styled.span`
    color: #666;
    font-size: 14px;
`;

export default ActorManager;
