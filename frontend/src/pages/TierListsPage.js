import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import useToast from '../hooks/useToast';
import tierListService from '../services/tierListService';
import ConfirmDialog from '../components/ConfirmDialog';
import TierListCreator from '../components/TierListCreator';
import AddMoviesToTierModal from '../components/AddMoviesToTierModal';

const TierListsPage = React.memo(() => {
    const [tierLists, setTierLists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState({ show: false, id: null, name: '' });
    const [editingTierList, setEditingTierList] = useState(null);
    const [editName, setEditName] = useState('');
    const [selectedTierListForMovies, setSelectedTierListForMovies] = useState(null);
    const [showAddMoviesModal, setShowAddMoviesModal] = useState(false);
    
    const navigate = useNavigate();
    const { showToast } = useToast();

    const fetchTierLists = useCallback(async () => {
        try {
            setLoading(true);
            console.log('Загружаем tier-листы...');
            
            const response = await tierListService.getAllTierLists();
            console.log('Ответ API tier-листов:', response);
            
            // Проверяем различные форматы ответа
            let tierListsData = [];
            
            if (response.success && Array.isArray(response.data)) {
                tierListsData = response.data;
            } else if (response.success && response.data && !Array.isArray(response.data)) {
                // Формат: { success: true, data: {...} } - один объект
                tierListsData = [response.data];
            } else if (Array.isArray(response)) {
                tierListsData = response;
            } else if (response.data && Array.isArray(response.data)) {
                tierListsData = response.data;
            } else {
                console.error('Неожиданный формат ответа API:', response);
                tierListsData = [];
            }
            
            console.log('Устанавливаем tier-листы:', tierListsData);
            setTierLists(tierListsData);
            setError(null);
        } catch (error) {
            console.error('Ошибка загрузки tier-листов:', error);
            setError('Ошибка загрузки tier-листов');
            showToast('Ошибка загрузки tier-листов', 'error');
            setTierLists([]);
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    const isInitialized = useRef(false);

    useEffect(() => {
        if (!isInitialized.current) {
            isInitialized.current = true;
            fetchTierLists();
        }
    }, [fetchTierLists]);

    const handleCreateTierList = useCallback(async (name, selectedMovies) => {
        try {
            console.log('Создаем tier-лист:', { name, selectedMovies });
            
            const response = await tierListService.createTierList(name, selectedMovies);
            console.log('Ответ создания tier-листа:', response);
            
            if (response.success) {
                showToast('Tier-лист успешно создан', 'success');
                setShowCreateModal(false);
                
                // Обновляем список tier-листов
                setTimeout(() => {
                    fetchTierLists();
                }, 100);
            } else {
                throw new Error(response.error || 'Ошибка создания tier-листа');
            }
        } catch (error) {
            console.error('Ошибка создания tier-листа:', error);
            showToast(`Ошибка создания tier-листа: ${error.message}`, 'error');
        }
    }, [fetchTierLists, showToast]);

    const handleTierListClick = useCallback((id) => {
        navigate(`/tier-lists/${id}`);
    }, [navigate]);

    const handleDeleteTierList = useCallback(async (id) => {
        try {
            await tierListService.deleteTierList(id);
            setTierLists(prev => prev.filter(tl => tl.id !== id));
            showToast('Tier-лист успешно удален', 'success');
        } catch (error) {
            showToast(`Ошибка удаления: ${error.message}`, 'error');
        }
    }, [showToast]);

    const handleEditStart = (tierList) => {
        setEditingTierList(tierList.id);
        setEditName(tierList.name);
    };

    const handleEditCancel = () => {
        setEditingTierList(null);
        setEditName('');
    };

    const handleEditSave = async (tierListId) => {
        try {
            if (!editName.trim()) {
                showToast('Название не может быть пустым', 'error');
                return;
            }

            const response = await tierListService.updateTierList(tierListId, editName.trim());
            if (response.success) {
                setTierLists(prev => 
                    prev.map(tl => tl.id === tierListId ? { ...tl, name: editName.trim() } : tl)
                );
                setEditingTierList(null);
                setEditName('');
                showToast('Название tier-листа обновлено', 'success');
            }
        } catch (error) {
            showToast(`Ошибка обновления: ${error.message}`, 'error');
        }
    };

    const handleAddMovies = (tierList) => {
        setSelectedTierListForMovies(tierList);
        setShowAddMoviesModal(true);
    };

    const handleMoviesAdded = () => {
        // Обновляем список tier-листов
        fetchTierLists();
    };

    const pageTitle = useMemo(() => 'Tier-листы', []);
    const pageSubtitle = useMemo(() => 'Создавайте и управляйте вашими tier-листами', []);
    const isEmpty = useMemo(() => tierLists.length === 0, [tierLists.length]);

    if (loading) {
        return (
            <PageContainer>
                <LoadingSpinner>Загрузка tier-листов...</LoadingSpinner>
            </PageContainer>
        );
    }

    if (error) {
        return (
            <PageContainer>
                <ErrorMessage>{error}</ErrorMessage>
                <RetryButton onClick={fetchTierLists}>Повторить попытку</RetryButton>
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            <PageHeader>
                <PageTitle>{pageTitle}</PageTitle>
                <PageSubtitle>{pageSubtitle}</PageSubtitle>
            </PageHeader>

            {isEmpty ? (
                <EmptyState>
                    <EmptyIcon>📊</EmptyIcon>
                    <EmptyTitle>У вас пока нет tier-листов</EmptyTitle>
                    <EmptyText>Создайте первый tier-лист, чтобы начать ранжировать фильмы</EmptyText>
                    <CreateButton onClick={() => setShowCreateModal(true)}>
                        Создать Tier-лист
                    </CreateButton>
                </EmptyState>
            ) : (
                <>
                    <CreateButton onClick={() => setShowCreateModal(true)}>
                        ➕ Создать Tier-лист
                    </CreateButton>
                    
                    <TierListsGrid>
                        {tierLists.map((tierList) => (
                            <TierListCardContainer key={tierList.id}>
                                {editingTierList === tierList.id ? (
                                    <EditForm onSubmit={(e) => {
                                        e.preventDefault();
                                        handleEditSave(tierList.id);
                                    }}>
                                        <EditInput
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            placeholder="Введите название"
                                            autoFocus
                                        />
                                        <EditButtons>
                                            <SaveButton type="submit">💾</SaveButton>
                                            <CancelButton type="button" onClick={handleEditCancel}>❌</CancelButton>
                                        </EditButtons>
                                    </EditForm>
                                ) : (
                                    <>
                                        <CardHeader onClick={() => handleTierListClick(tierList.id)}>
                                            <CardTitle>{tierList.name}</CardTitle>
                                            <MovieCount>{tierList.movie_count || 0} фильмов</MovieCount>
                                        </CardHeader>
                                        <CardFooter>
                                            <CreatedDate>
                                                Создан: {new Date(tierList.created_at).toLocaleDateString('ru-RU')}
                                            </CreatedDate>
                                            <ActionButtons>
                                                <EditButton
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleEditStart(tierList);
                                                    }}
                                                    title="Редактировать название"
                                                >
                                                    ✏️
                                                </EditButton>
                                                <AddMoviesButton
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleAddMovies(tierList);
                                                    }}
                                                    title="Добавить фильмы"
                                                >
                                                    🎬
                                                </AddMoviesButton>
                                                <DeleteButton
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setDeleteDialog({
                                                            show: true,
                                                            id: tierList.id,
                                                            name: tierList.name
                                                        });
                                                    }}
                                                    title="Удалить tier-лист"
                                                >
                                                    🗑️
                                                </DeleteButton>
                                            </ActionButtons>
                                        </CardFooter>
                                    </>
                                )}
                            </TierListCardContainer>
                        ))}
                    </TierListsGrid>
                </>
            )}

            {showCreateModal && (
                <TierListCreator
                    onClose={() => setShowCreateModal(false)}
                    onSubmit={handleCreateTierList}
                />
            )}

            <ConfirmDialog
                isOpen={deleteDialog.show}
                title="Удалить tier-лист"
                message={`Вы уверены, что хотите удалить tier-лист "${deleteDialog.name}"?`}
                onConfirm={() => {
                    handleDeleteTierList(deleteDialog.id);
                    setDeleteDialog({ show: false, id: null, name: '' });
                }}
                onCancel={() => setDeleteDialog({ show: false, id: null, name: '' })}
            />
            <AddMoviesToTierModal
                isOpen={showAddMoviesModal}
                onClose={() => setShowAddMoviesModal(false)}
                tierListId={selectedTierListForMovies?.id}
                tierListName={selectedTierListForMovies?.name}
                onMoviesAdded={handleMoviesAdded}
            />
        </PageContainer>
    );
});

// Styled Components
const AddMoviesButton = styled.button`
    background: none;
    border: none;
    font-size: 18px;
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    transition: all 0.2s ease;

    &:hover {
        background: #fff3e0;
        color: #f57c00;
    }
`;

const PageContainer = styled.div`
    max-width: 1200px;
    margin: 0 auto;
    padding: 24px;
`;

const PageHeader = styled.div`
    background: white;
    border-radius: 16px;
    padding: 24px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    margin-bottom: 32px;
    text-align: center;
`;

const PageTitle = styled.h1`
    font-size: 32px;
    font-weight: 700;
    color: #2c3e50;
    margin: 0 0 8px 0;
`;

const PageSubtitle = styled.p`
    font-size: 18px;
    color: #7f8c8d;
    margin: 0 0 24px 0;
`;

const CreateButton = styled.button`
    background: #667eea;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    margin-bottom: 24px;

    &:hover {
        background: #5a6fd8;
        transform: translateY(-2px);
        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
    }
`;

const TierListsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 24px;
`;

const TierListCardContainer = styled.div`
    background: white;
    border-radius: 16px;
    padding: 24px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    transition: all 0.2s ease;

    &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
    }
`;

const CardHeader = styled.div`
    margin-bottom: 16px;
    cursor: pointer;
`;

const CardTitle = styled.h3`
    font-size: 20px;
    font-weight: 600;
    color: #2c3e50;
    margin: 0 0 8px 0;
`;

const MovieCount = styled.p`
    font-size: 14px;
    color: #7f8c8d;
    margin: 0;
`;

const CardFooter = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const CreatedDate = styled.span`
    font-size: 12px;
    color: #95a5a6;
`;

const ActionButtons = styled.div`
    display: flex;
    gap: 8px;
`;

const EditButton = styled.button`
    background: none;
    border: none;
    font-size: 18px;
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    transition: all 0.2s ease;

    &:hover {
        background: #e3f2fd;
        color: #1976d2;
    }
`;

const DeleteButton = styled.button`
    background: none;
    border: none;
    font-size: 18px;
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    transition: all 0.2s ease;

    &:hover {
        background: #ffebee;
        color: #d32f2f;
    }
`;

const EditForm = styled.form`
    display: flex;
    flex-direction: column;
    gap: 12px;
`;

const EditInput = styled.input`
    padding: 12px 16px;
    border: 2px solid #3498db;
    border-radius: 8px;
    font-size: 16px;
    outline: none;
    
    &:focus {
        border-color: #2980b9;
        box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
    }
`;

const EditButtons = styled.div`
    display: flex;
    gap: 8px;
`;

const SaveButton = styled.button`
    background: #27ae60;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 6px;
    font-size: 16px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: #229954;
    }
`;

const CancelButton = styled.button`
    background: #95a5a6;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 6px;
    font-size: 16px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: #7f8c8d;
    }
`;

const EmptyState = styled.div`
    background: white;
    border-radius: 16px;
    padding: 48px 24px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    text-align: center;
`;

const EmptyIcon = styled.div`
    font-size: 64px;
    margin-bottom: 16px;
`;

const EmptyTitle = styled.h3`
    font-size: 24px;
    font-weight: 600;
    color: #2c3e50;
    margin: 0 0 8px 0;
`;

const EmptyText = styled.p`
    font-size: 16px;
    color: #7f8c8d;
    margin: 0 0 24px 0;
`;

const LoadingSpinner = styled.div`
    text-align: center;
    font-size: 18px;
    color: #7f8c8d;
    padding: 48px;
`;

const ErrorMessage = styled.div`
    text-align: center;
    font-size: 18px;
    color: #e74c3c;
    padding: 48px;
    margin-bottom: 16px;
`;

const RetryButton = styled.button`
    background: #667eea;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    display: block;
    margin: 0 auto;

    &:hover {
        background: #5a6fd8;
    }
`;

export default TierListsPage;