import React, { useState } from 'react';
import styled from 'styled-components';
import { useToast } from '../hooks/useToast';
import { tierListService } from '../services/tierListService';

const Card = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  }
`;

const Title = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 8px;
`;

const MovieCount = styled.div`
  color: #7f8c8d;
  font-size: 14px;
`;

const EditForm = styled.form`
  display: flex;
  gap: 10px;
  align-items: center;
`;

const EditInput = styled.input`
  flex: 1;
  padding: 8px 12px;
  border: 2px solid #3498db;
  border-radius: 6px;
  font-size: 16px;
  outline: none;
  
  &:focus {
    border-color: #2980b9;
  }
`;

const Button = styled.button`
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &.save {
    background: #27ae60;
    color: white;
    
    &:hover {
      background: #229954;
    }
  }
  
  &.cancel {
    background: #95a5a6;
    color: white;
    
    &:hover {
      background: #7f8c8d;
    }
  }
`;

const TierListCard = ({ tierList, onUpdate, onDelete, onAddMovies }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(tierList.name);
  const { showSuccess, showError } = useToast();

  const handleEdit = () => {
    setIsEditing(true);
    setEditName(tierList.name);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    if (!editName.trim()) {
      showError('Название не может быть пустым');
      return;
    }

    try {
      const updatedTierList = await tierListService.updateTierList(tierList.id, editName.trim());
      onUpdate(updatedTierList);
      setIsEditing(false);
      showSuccess('Название tier-листа обновлено');
    } catch (error) {
      showError(`Ошибка обновления: ${error.message}`);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditName(tierList.name);
  };

  const handleDelete = async () => {
    if (window.confirm(`Удалить tier-лист "${tierList.name}"?`)) {
      try {
        await tierListService.deleteTierList(tierList.id);
        onDelete(tierList.id);
        showSuccess('Tier-лист удален');
      } catch (error) {
        showError(`Ошибка удаления: ${error.message}`);
      }
    }
  };

  return (
    <Card>
      {isEditing ? (
        <EditForm onSubmit={handleSave}>
          <EditInput
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            autoFocus
            placeholder="Введите название"
          />
          <Button type="submit" className="save">
            ��
          </Button>
          <Button type="button" className="cancel" onClick={handleCancel}>
            ❌
          </Button>
        </EditForm>
      ) : (
        <>
          <Title onClick={handleEdit}>{tierList.name}</Title>
          <MovieCount>{tierList.movie_count || 0} фильмов</MovieCount>
          <div style={{ marginTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <Button onClick={handleEdit} style={{ background: '#3498db', color: 'white' }}>
              ✏️ Редактировать
            </Button>
            <Button onClick={onAddMovies} style={{ background: '#f39c12', color: 'white' }}>
              🎬 Добавить фильмы
            </Button>
            <Button onClick={handleDelete} style={{ background: '#e74c3c', color: 'white' }}>
              🗑️ Удалить
            </Button>
          </div>
        </>
      )}
    </Card>
  );
};

export default TierListCard;