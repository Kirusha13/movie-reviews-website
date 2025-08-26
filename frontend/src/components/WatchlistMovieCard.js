import React from 'react';
import MovieCard from './MovieCard';

const WatchlistMovieCard = ({ movie, onRemoveFromWatchlist }) => {
    // Используем обычный MovieCard с правильными пропсами
    return (
        <MovieCard
            movie={movie}
            onMovieClick={() => {}} // Пустая функция, так как MovieCard сам обрабатывает клики
            onAddToWatchlist={() => {}} // Пустая функция для watched фильмов
            onRemoveFromWatchlist={onRemoveFromWatchlist}
            onEditMovie={() => {}} // Пустая функция
            onDeleteMovie={() => {}} // Пустая функция
        />
    );
};

export default WatchlistMovieCard;
