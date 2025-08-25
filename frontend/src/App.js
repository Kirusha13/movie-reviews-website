import React, { useState } from 'react';
import styled from 'styled-components';
import MovieList from './pages/MovieList';
import MovieForm from './components/MovieForm';
import { movieService } from './services/movieService';
import './App.css';

const App = () => {
  const [currentView, setCurrentView] = useState('list'); // 'list' или 'form'
  const [editingMovie, setEditingMovie] = useState(null);

  const handleAddMovie = () => {
    setEditingMovie(null);
    setCurrentView('form');
  };

  const handleEditMovie = (movie) => {
    setEditingMovie(movie);
    setCurrentView('form');
  };

  const handleCancelForm = () => {
    setCurrentView('list');
    setEditingMovie(null);
  };

  const handleSubmitMovie = async (movieData) => {
    try {
      console.log('Отправляем данные фильма:', movieData);
      
      let response;
      if (editingMovie) {
        // Обновляем существующий фильм
        response = await movieService.updateMovie(editingMovie.id, movieData);
      } else {
        // Создаем новый фильм
        response = await movieService.createMovie(movieData);
      }
      
      if (response.success) {
        // После успешной отправки возвращаемся к списку
        setCurrentView('list');
        setEditingMovie(null);
        
        // Уведомление об успехе
        alert(editingMovie ? 'Фильм успешно обновлен!' : 'Фильм успешно добавлен!');
        
        // Обновляем список фильмов
        // TODO: Добавить функцию обновления списка без перезагрузки страницы
      } else {
        throw new Error(response.message || 'Ошибка при сохранении фильма');
      }
    } catch (error) {
      console.error('Ошибка при сохранении фильма:', error);
      alert(`Произошла ошибка при сохранении фильма: ${error.message}`);
    }
  };

  return (
    <AppContainer>
      <Header>
        <HeaderContent>
          <Logo>🎬 Movie Reviews</Logo>
          <Nav>
            <NavButton 
              active={currentView === 'list'} 
              onClick={() => setCurrentView('list')}
            >
              Список фильмов
            </NavButton>
            <NavButton 
              active={currentView === 'form'} 
              onClick={() => handleAddMovie()}
            >
              Добавить фильм
            </NavButton>
          </Nav>
        </HeaderContent>
      </Header>

      <MainContent>
        {currentView === 'list' ? (
          <MovieList onEditMovie={handleEditMovie} />
        ) : (
          <MovieForm
            movie={editingMovie}
            onSubmit={handleSubmitMovie}
            onCancel={handleCancelForm}
            isEditing={!!editingMovie}
            genres={[
              'Боевик', 'Комедия', 'Драма', 'Ужасы', 'Фантастика', 
              'Триллер', 'Романтика', 'Документальный', 'Анимация', 
              'Криминал', 'Приключения', 'Семейный'
            ]}
            actors={[
              'Том Хэнкс', 'Роберт Дауни мл.', 'Леонардо ДиКаприо', 
              'Морган Фриман', 'Джонни Депп', 'Брэд Питт'
            ]}
          />
        )}
      </MainContent>
    </AppContainer>
  );
};

// Styled Components
const AppContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
`;

const Header = styled.header`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
`;

const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 70px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    height: auto;
    padding: 15px 20px;
    gap: 15px;
  }
`;

const Logo = styled.h1`
  color: #667eea;
  font-size: 24px;
  font-weight: 700;
  margin: 0;
  
  @media (max-width: 768px) {
    font-size: 20px;
  }
`;

const Nav = styled.nav`
  display: flex;
  gap: 10px;
  
  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
  }
`;

const NavButton = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 25px;
  background: ${props => props.active ? '#667eea' : 'transparent'};
  color: ${props => props.active ? 'white' : '#667eea'};
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid #667eea;
  
  &:hover {
    background: ${props => props.active ? '#5a6fd8' : 'rgba(102, 126, 234, 0.1)'};
    transform: translateY(-2px);
  }
  
  @media (max-width: 768px) {
    padding: 8px 16px;
    font-size: 14px;
  }
`;

const MainContent = styled.main`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  
  @media (max-width: 768px) {
    padding: 15px;
  }
`;

export default App;
