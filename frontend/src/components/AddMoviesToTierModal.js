import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import useToast from '../hooks/useToast'; // ✅ default export
import { movieService } from '../services/movieService'; // ✅ named export
import tierListService from '../services/tierListService'; // ✅ default export

const Modal = styled.div`
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
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  max-width: 700px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 2px solid #ecf0f1;
`;

const ModalTitle = styled.h2`
  margin: 0;
  color: #2c3e50;
  font-size: 24px;
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const RefreshButton = styled.button`
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #667eea;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: rgba(102, 126, 234, 0.1);
    transform: rotate(45deg);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #7f8c8d;

  &:hover {
    color: #e74c3c;
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #ecf0f1;
  border-radius: 8px;
  font-size: 16px;
  margin-bottom: 20px;
  
  &:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
  }
`;

const MoviesList = styled.div`
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid #ecf0f1;
  border-radius: 8px;
  padding: 8px;
`;

const MovieItem = styled.div`
  display: flex;
  align-items: center;
  padding: 12px;
  border: 1px solid #ecf0f1;
  border-radius: 8px;
  margin-bottom: 8px;
  transition: all 0.2s ease;
  
  &:hover {
    background: #f8f9fa;
    border-color: #3498db;
  }
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const MovieCheckbox = styled.input`
  margin-right: 12px;
  transform: scale(1.2);
  cursor: pointer;
`;

const MovieInfo = styled.div`
  flex: 1;
`;

const MovieTitle = styled.div`
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 4px;
`;

const MovieDetails = styled.div`
  font-size: 14px;
  color: #7f8c8d;
`;

const SelectionInfo = styled.div`
  background: #e8f5e8;
  border: 1px solid #4caf50;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 20px;
  text-align: center;
  color: #2e7d32;
  font-weight: 500;
`;

const Actions = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 2px solid #ecf0f1;
`;

const Button = styled.button`
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &.primary {
    background: #27ae60;
    color: white;
    
    &:hover {
      background: #229954;
      transform: translateY(-2px);
    }
    
    &:disabled {
      background: #95a5a6;
      cursor: not-allowed;
      transform: none;
    }
  }
  
  &.secondary {
    background: #95a5a6;
    color: white;
    
    &:hover {
      background: #7f8c8d;
    }
  }
`;

const LoadingText = styled.div`
  text-align: center;
  padding: 20px;
  color: #7f8c8d;
  font-style: italic;
`;

const AddMoviesToTierModal = ({ isOpen, onClose, tierListId, tierListName, onMoviesAdded }) => {
  const [movies, setMovies] = useState([]);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [selectedMovies, setSelectedMovies] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchMovies();
    }
  }, [isOpen]);

  useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = movies.filter(movie => 
        movie.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (movie.original_title && movie.original_title.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredMovies(filtered);
    } else {
      setFilteredMovies(movies);
    }
  }, [searchTerm, movies]);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      console.log('AddMoviesModal: Начинаем загрузку фильмов...');

      // Используем простой метод получения фильмов
      const response = await movieService.getMovies();
      console.log('AddMoviesModal: Ответ от movieService:', response);

      let moviesData = [];

      // Проверяем ответ
      if (response && response.data && Array.isArray(response.data)) {
        moviesData = response.data;
        console.log('AddMoviesModal: Получено фильмов:', moviesData.length);
      } else if (response && Array.isArray(response)) {
        moviesData = response;
        console.log('AddMoviesModal: Используем response как массив');
      } else {
        console.error('AddMoviesModal: Неожиданный формат ответа:', response);
        moviesData = [];
      }

      // Фильтруем фильмы - показываем только те, которые еще не в этом tier-листе
      // Для этого нужно получить текущие фильмы tier-листа
      try {
        const tierListResponse = await tierListService.getTierListById(tierListId);
        const existingMovieIds = new Set();

        // Собираем ID всех фильмов, которые уже есть в tier-листе
        if (tierListResponse.data && tierListResponse.data.tierMovies) {
          Object.values(tierListResponse.data.tierMovies).forEach(tierMovies => {
            tierMovies.forEach(movie => existingMovieIds.add(movie.id));
          });
        }

        // Фильтруем только те фильмы, которых нет в tier-листе
        const availableMovies = moviesData.filter(movie => !existingMovieIds.has(movie.id));
        console.log('AddMoviesModal: Доступных фильмов для добавления:', availableMovies.length);

        setMovies(availableMovies);
        setFilteredMovies(availableMovies);
      } catch (tierListError) {
        console.error('AddMoviesModal: Ошибка получения tier-листа:', tierListError);
        // В случае ошибки показываем все фильмы
        setMovies(moviesData);
        setFilteredMovies(moviesData);
      }
    } catch (error) {
      console.error('AddMoviesModal: Ошибка загрузки фильмов:', error);
      showToast(`Ошибка загрузки фильмов: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleMovieToggle = (movieId) => {
    setSelectedMovies(prev => 
      prev.includes(movieId) 
        ? prev.filter(id => id !== movieId)
        : [...prev, movieId]
    );
  };

  const handleAddMovies = async () => {
    if (selectedMovies.length === 0) {
      showToast('Выберите фильмы для добавления', 'error');
      return;
    }

    try {
      setLoading(true);
      
      // Добавляем фильмы в tier-лист
      for (const movieId of selectedMovies) {
        await tierListService.addMovieToTier(tierListId, movieId, 'C', 0);
      }
      
      showToast(`${selectedMovies.length} фильмов добавлено в tier-лист`, 'success');
      setSelectedMovies([]);

      // Обновляем список фильмов после добавления
      await fetchMovies();

      onMoviesAdded();
      onClose();
    } catch (error) {
      showToast(`Ошибка добавления фильмов: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal onClick={onClose}>
      <ModalContent onClick={e => e.stopPropagation()}>
                        <ModalHeader>
          <ModalTitle>Добавить фильмы в "{tierListName}"</ModalTitle>
          <HeaderActions>
            <RefreshButton onClick={fetchMovies} title="Обновить список" disabled={loading}>
              🔄
            </RefreshButton>
            <CloseButton onClick={onClose}>&times;</CloseButton>
          </HeaderActions>
        </ModalHeader>
        
        <SearchInput
          type="text"
          placeholder="Поиск фильмов по названию..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        
        {selectedMovies.length > 0 && (
          <SelectionInfo>
            Выбрано фильмов: {selectedMovies.length}
          </SelectionInfo>
        )}
        
        <MoviesList>
          {loading ? (
            <LoadingText>Загрузка фильмов...</LoadingText>
          ) : filteredMovies.length === 0 ? (
            <LoadingText>
              {searchTerm ? 'Фильмы не найдены' : 'Все фильмы уже добавлены в этот tier-лист'}
            </LoadingText>
          ) : (
            filteredMovies.map(movie => (
              <MovieItem key={movie.id}>
                <MovieCheckbox
                  type="checkbox"
                  checked={selectedMovies.includes(movie.id)}
                  onChange={() => handleMovieToggle(movie.id)}
                />
                <MovieInfo>
                  <MovieTitle>{movie.title}</MovieTitle>
                  <MovieDetails>
                    {movie.original_title && `${movie.original_title} • `}
                    {movie.release_year} • {movie.director}
                  </MovieDetails>
                </MovieInfo>
              </MovieItem>
            ))
          )}
        </MoviesList>
        
        <Actions>
          <Button 
            className="primary" 
            onClick={handleAddMovies}
            disabled={selectedMovies.length === 0 || loading}
          >
            Добавить выбранные ({selectedMovies.length})
          </Button>
          <Button className="secondary" onClick={onClose}>
            Отмена
          </Button>
        </Actions>
      </ModalContent>
    </Modal>
  );
};

export default AddMoviesToTierModal;