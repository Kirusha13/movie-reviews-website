import React from 'react';
import styled from 'styled-components';
import MovieList from './pages/MovieList';
import './App.css';

const App = () => {
  return (
    <AppContainer>
      <MovieList />
    </AppContainer>
  );
};

// Styled Components
const AppContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px 0;
`;

export default App;
