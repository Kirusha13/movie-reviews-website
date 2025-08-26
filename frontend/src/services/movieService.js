const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class MovieService {
    constructor() {
        this.baseURL = API_BASE_URL;
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || `HTTP error! status: ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    // Получить все фильмы с фильтрацией и пагинацией
    async getMovies(filters = {}) {
        const queryParams = new URLSearchParams();
        
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== '') {
                queryParams.append(key, value);
            }
        });

        const endpoint = `/movies?${queryParams.toString()}`;
        return this.request(endpoint);
    }

    // Получить все фильмы с рецензиями для списка
    async getMoviesWithReviews(filters = {}) {
        const queryParams = new URLSearchParams();
        
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== '') {
                queryParams.append(key, value);
            }
        });

        const endpoint = `/movies/with-reviews?${queryParams.toString()}`;
        return this.request(endpoint);
    }

    // Получить фильм по ID
    async getMovie(id) {
        return this.request(`/movies/${id}`);
    }

    // Создать новый фильм
    async createMovie(movieData) {
        return this.request('/movies', {
            method: 'POST',
            body: JSON.stringify(movieData),
        });
    }

    // Обновить фильм
    async updateMovie(id, movieData) {
        return this.request(`/movies/${id}`, {
            method: 'PUT',
            body: JSON.stringify(movieData),
        });
    }

    // Удалить фильм
    async deleteMovie(id) {
        return this.request(`/movies/${id}`, {
            method: 'DELETE',
        });
    }

    // Поиск фильмов
    async searchMovies(query, pagination = {}) {
        const queryParams = new URLSearchParams({
            q: query,
            ...pagination,
        });

        return this.request(`/movies/search?${queryParams.toString()}`);
    }

    // Получить список желаемых фильмов
    async getWatchlist(filters = {}) {
        console.log('🔧 movieService: getWatchlist вызван с фильтрами:', filters);
        
        const queryParams = new URLSearchParams();
        
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== '') {
                queryParams.append(key, value);
            }
        });

        const endpoint = `/movies/watchlist?${queryParams.toString()}`;
        console.log('🔧 movieService: Отправляем запрос на:', endpoint);
        
        try {
            const response = await this.request(endpoint);
            console.log('🔧 movieService: Ответ от getWatchlist:', response);
            return response;
        } catch (error) {
            console.error('🔧 movieService: Ошибка в getWatchlist:', error);
            throw error;
        }
    }

    // Добавить фильм в список желаемых
    async addToWatchlist(movieId) {
        console.log('🔧 movieService: addToWatchlist вызван с movieId:', movieId);
        console.log('🔧 movieService: Отправляем запрос на:', `/movies/${movieId}/watchlist`);
        
        try {
            const response = await this.request(`/movies/${movieId}/watchlist`, {
                method: 'POST',
            });
            console.log('🔧 movieService: Ответ от сервера:', response);
            return response;
        } catch (error) {
            console.error('🔧 movieService: Ошибка в addToWatchlist:', error);
            throw error;
        }
    }

    // Убрать фильм из списка желаемых
    async removeFromWatchlist(movieId) {
        return this.request(`/movies/${movieId}/watchlist`, {
            method: 'DELETE',
        });
    }

    // Получить статистику фильмов
    async getMovieStats() {
        return this.request('/movies/stats');
    }

    // Получить все рецензии
    async getReviews(filters = {}) {
        const queryParams = new URLSearchParams();
        
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== '') {
                queryParams.append(key, value);
            }
        });

        const endpoint = `/reviews?${queryParams.toString()}`;
        return this.request(endpoint);
    }

    // Получить рецензии для фильма
    async getMovieReviews(movieId) {
        return this.request(`/reviews/movie/${movieId}`);
    }

    // Создать рецензию
    async createReview(movieId, reviewData) {
        console.log('movieService.createReview:', { movieId, reviewData });
        return this.request(`/reviews/movie/${movieId}`, {
            method: 'POST',
            body: JSON.stringify(reviewData),
        });
    }

    // Обновить рецензию
    async updateReview(reviewId, reviewData) {
        return this.request(`/reviews/${reviewId}`, {
            method: 'PUT',
            body: JSON.stringify(reviewData),
        });
    }

    // Удалить рецензию
    async deleteReview(reviewId) {
        return this.request(`/reviews/${reviewId}`, {
            method: 'DELETE',
        });
    }

    // Получить статистику оценок
    async getRatingStats(movieId = null) {
        const endpoint = movieId 
            ? `/reviews/stats?movieId=${movieId}`
            : '/reviews/stats';
        return this.request(endpoint);
    }

    // Получить топ фильмов по оценкам
    async getTopRatedMovies(limit = 10) {
        return this.request(`/reviews/top-rated?limit=${limit}`);
    }

    // Получить рецензии по рецензенту
    async getReviewsByReviewer(reviewerName, options = {}) {
        const queryParams = new URLSearchParams();
        
        Object.entries(options).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== '') {
                queryParams.append(key, value);
            }
        });

        const endpoint = `/reviews/reviewer/${reviewerName}?${queryParams.toString()}`;
        return this.request(endpoint);
    }

    // Получить отфильтрованные рецензии
    async getFilteredReviews(filters = {}) {
        const queryParams = new URLSearchParams();
        
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== '') {
                queryParams.append(key, value);
            }
        });

        const endpoint = `/reviews/filtered?${queryParams.toString()}`;
        return this.request(endpoint);
    }

    // Загрузка файлов (постеров)
    async uploadPoster(file) {
        const formData = new FormData();
        formData.append('poster', file);

        return this.request('/upload/poster', {
            method: 'POST',
            headers: {
                // Не устанавливаем Content-Type для FormData
            },
            body: formData,
        });
    }

    // Проверка здоровья API
    async healthCheck() {
        return this.request('/health');
    }
}

// Создаем экземпляр сервиса
export const movieService = new MovieService();

// Экспортируем класс для возможности создания новых экземпляров
export default MovieService;
