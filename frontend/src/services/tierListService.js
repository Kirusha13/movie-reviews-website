const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

class TierListService {
    async getAllTierLists() {
        try {
            const response = await fetch(`${API_BASE_URL}/tier-lists`);
            if (!response.ok) {
                throw new Error('Ошибка получения tier-листов');
            }
            return await response.json();
        } catch (error) {
            throw new Error(`Ошибка получения tier-листов: ${error.message}`);
        }
    }

    async getTierListById(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/tier-lists/${id}`);
            if (!response.ok) {
                throw new Error('Ошибка получения tier-листа');
            }
            return await response.json();
        } catch (error) {
            throw new Error(`Ошибка получения tier-листа: ${error.message}`);
        }
    }

    async createTierList(name, movieIds = []) {
        try {
            const response = await fetch(`${API_BASE_URL}/tier-lists`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, movieIds }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Ошибка создания tier-листа');
            }

            return await response.json();
        } catch (error) {
            throw new Error(`Ошибка создания tier-листа: ${error.message}`);
        }
    }

    async updateTierList(id, name) {
        try {
            const response = await fetch(`${API_BASE_URL}/tier-lists/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Ошибка обновления tier-листа');
            }

            return await response.json();
        } catch (error) {
            throw new Error(`Ошибка обновления tier-листа: ${error.message}`);
        }
    }

    async deleteTierList(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/tier-lists/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Ошибка удаления tier-листа');
            }

            return await response.json();
        } catch (error) {
            throw new Error(`Ошибка удаления tier-листа: ${error.message}`);
        }
    }

    async addMovieToTier(tierListId, movieId, tier, position = 0) {
        try {
            const response = await fetch(`${API_BASE_URL}/tier-lists/${tierListId}/movies`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ movieId, tier, position }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Ошибка добавления фильма в tier');
            }

            return await response.json();
        } catch (error) {
            throw new Error(`Ошибка добавления фильма в tier: ${error.message}`);
        }
    }

    async updateMoviePosition(tierListId, movieId, tier, position) {
        try {
            const response = await fetch(`${API_BASE_URL}/tier-lists/${tierListId}/movies/${movieId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ tier, position }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Ошибка обновления позиции фильма');
            }

            return await response.json();
        } catch (error) {
            throw new Error(`Ошибка обновления позиции фильма: ${error.message}`);
        }
    }

    async removeMovieFromTier(tierListId, movieId) {
        try {
            const response = await fetch(`${API_BASE_URL}/tier-lists/${tierListId}/movies/${movieId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Ошибка удаления фильма из tier');
            }

            return await response.json();
        } catch (error) {
            throw new Error(`Ошибка удаления фильма из tier: ${error.message}`);
        }
    }
}

export default new TierListService();