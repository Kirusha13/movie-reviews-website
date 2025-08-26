const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class ActorService {
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

    // Получить всех актеров
    async getAllActors(options = {}) {
        const queryParams = new URLSearchParams();
        
        Object.entries(options).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== '') {
                queryParams.append(key, value);
            }
        });

        const endpoint = `/actors?${queryParams.toString()}`;
        const response = await this.request(endpoint);
        return response.data || response;
    }

    // Получить актера по ID
    async getActor(id) {
        const response = await this.request(`/actors/${id}`);
        return response.data || response;
    }

    // Создать нового актера
    async createActor(actorData) {
        const response = await this.request('/actors', {
            method: 'POST',
            body: JSON.stringify(actorData),
        });
        return response;
    }

    // Обновить актера
    async updateActor(id, actorData) {
        const response = await this.request(`/actors/${id}`, {
            method: 'PUT',
            body: JSON.stringify(actorData),
        });
        return response;
    }

    // Удалить актера
    async deleteActor(id) {
        const response = await this.request(`/actors/${id}`, {
            method: 'DELETE',
        });
        return response;
    }

    // Получить фильмы актера
    async getActorMovies(id) {
        const response = await this.request(`/actors/${id}/movies`);
        return response.data || response;
    }

    // Поиск актеров
    async searchActors(query) {
        const queryParams = new URLSearchParams({ q: query });
        const response = await this.request(`/actors/search?${queryParams.toString()}`);
        return response.data || response;
    }

    // Получить статистику по актерам
    async getActorStats() {
        const response = await this.request('/actors/stats');
        return response.data || response;
    }
}

export const actorService = new ActorService();
