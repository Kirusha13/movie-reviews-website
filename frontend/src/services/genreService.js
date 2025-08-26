const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class GenreService {
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

    // Получить все жанры
    async getAllGenres() {
        const response = await this.request('/genres');
        return response.data || response;
    }

    // Получить жанр по ID
    async getGenre(id) {
        const response = await this.request(`/genres/${id}`);
        return response.data || response;
    }

    // Создать новый жанр
    async createGenre(genreData) {
        const response = await this.request('/genres', {
            method: 'POST',
            body: JSON.stringify(genreData),
        });
        return response;
    }

    // Обновить жанр
    async updateGenre(id, genreData) {
        const response = await this.request(`/genres/${id}`, {
            method: 'PUT',
            body: JSON.stringify(genreData),
        });
        return response;
    }

    // Удалить жанр
    async deleteGenre(id) {
        const response = await this.request(`/genres/${id}`, {
            method: 'DELETE',
        });
        return response;
    }

    // Поиск жанров
    async searchGenres(query) {
        const queryParams = new URLSearchParams({ q: query });
        const response = await this.request(`/genres/search?${queryParams.toString()}`);
        return response.data || response;
    }

    // Получить статистику по жанрам
    async getGenreStats() {
        const response = await this.request('/genres/stats');
        return response.data || response;
    }
}

export const genreService = new GenreService();
