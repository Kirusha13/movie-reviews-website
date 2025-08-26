import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import MovieList from './pages/MovieList';
import MovieForm from './components/MovieForm';
import MovieDetail from './pages/MovieDetail';
import ToastContainer from './components/ToastContainer';
import useToast from './hooks/useToast';

import { movieService } from './services/movieService';
import { genreService } from './services/genreService';
import { actorService } from './services/actorService';
import './App.css';

const AppContent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [editingMovie, setEditingMovie] = useState(null);
  const [genres, setGenres] = useState([]);
  const [actors, setActors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toasts, showSuccess, showError, hideToast } = useToast();

  const handleAddMovie = () => {
    setEditingMovie(null);
    navigate('/add-movie');
  };

  const handleEditMovie = (movie) => {
    setEditingMovie(movie);
    navigate('/edit-movie');
  };

  const handleCancelForm = () => {
    navigate('/');
  };

  // Загружаем жанры и актеры при монтировании компонента
  useEffect(() => {
    const loadGenresAndActors = async () => {
      try {
        setIsLoading(true);
        const [genresData, actorsData] = await Promise.all([
          genreService.getAllGenres(),
          actorService.getAllActors()
        ]);
        
        console.log('Загруженные жанры:', genresData);
        console.log('Загруженные актеры:', actorsData);
        
        // Проверяем, что данные являются массивами
        if (Array.isArray(genresData)) {
          setGenres(genresData);
        } else {
          console.error('Жанры не являются массивом:', genresData);
          setGenres([]);
        }
        
        if (Array.isArray(actorsData)) {
          setActors(actorsData);
        } else {
          console.error('Актеры не являются массивом:', actorsData);
          setActors([]);
        }
      } catch (error) {
        console.error('Ошибка загрузки жанров и актеров:', error);
        setGenres([]);
        setActors([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadGenresAndActors();
  }, []);

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
        navigate('/');
        setEditingMovie(null);
        
        // Уведомление об успехе
        showSuccess(editingMovie ? 'Фильм успешно обновлен!' : 'Фильм успешно добавлен!');
        
        // Обновляем список фильмов
        // TODO: Добавить функцию обновления списка без перезагрузки страницы
      } else {
        throw new Error(response.message || 'Ошибка при сохранении фильма');
      }
    } catch (error) {
      console.error('Ошибка при сохранении фильма:', error);
      showError(`Произошла ошибка при сохранении фильма: ${error.message}`);
    }
  };

  const refreshGenresAndActors = async () => {
    try {
      const [genresData, actorsData] = await Promise.all([
        genreService.getAllGenres(),
        actorService.getAllActors()
      ]);
      
      console.log('Обновленные жанры:', genresData);
      console.log('Обновленные актеры:', actorsData);
      
      // Проверяем, что данные являются массивами
      if (Array.isArray(genresData)) {
        setGenres(genresData);
      } else {
        console.error('Жанры не являются массивом:', genresData);
        setGenres([]);
      }
      
      if (Array.isArray(actorsData)) {
        setActors(actorsData);
      } else {
        console.error('Актеры не являются массивом:', actorsData);
        setActors([]);
      }
    } catch (error) {
      console.error('Ошибка обновления жанров и актеров:', error);
      setGenres([]);
      setActors([]);
    }
  };

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  return (
    <AppContainer>
      <Header>
        <HeaderContent>
          <Logo>🎬 Movie Reviews</Logo>
                      <Nav>
              <NavButton 
                active={isActiveRoute('/')} 
                onClick={() => navigate('/')}
              >
                Список фильмов
              </NavButton>
              <NavButton 
                active={isActiveRoute('/add-movie')} 
                onClick={() => handleAddMovie()}
              >
                Добавить фильм
              </NavButton>

            </Nav>
        </HeaderContent>
      </Header>

      <MainContent>
        <Routes>
          <Route path="/" element={<MovieList onEditMovie={handleEditMovie} />} />
          <Route path="/movie/:id" element={<MovieDetail />} />
          <Route path="/add-movie" element={
            <MovieForm
              movie={null}
              onSubmit={handleSubmitMovie}
              onCancel={handleCancelForm}
              isEditing={false}
              genres={genres}
              actors={actors}
              isLoading={isLoading}
              onRefreshGenresAndActors={refreshGenresAndActors}
            />
          } />
          <Route path="/edit-movie" element={
            <MovieForm
              movie={editingMovie}
              onSubmit={handleSubmitMovie}
              onCancel={handleCancelForm}
              isEditing={true}
              genres={genres}
              actors={actors}
              isLoading={isLoading}
              onRefreshGenresAndActors={refreshGenresAndActors}
            />
          } />

        </Routes>
      </MainContent>
      
      {/* Toast уведомления */}
      <ToastContainer toasts={toasts} onHideToast={hideToast} />
    </AppContainer>
  );
};

const App = () => {
  return (
    <Router>
      <AppContent />
    </Router>
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
