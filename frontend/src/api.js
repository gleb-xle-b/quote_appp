// frontend/src/api.js
import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000'; // URL вашего FastAPI backend

// Получить все цитаты
export const getQuotes = async () => {
    try {
        const response = await axios.get(`${API_URL}/quotes/`);
        return response.data;
    } catch (error) {
        console.error("Error fetching quotes:", error);
        throw error;
    }
};

// Получить случайную цитату
export const getRandomQuote = async () => {
    try {
        const response = await axios.get(`${API_URL}/quotes/random/`);
        return response.data;
    } catch (error) {
        console.error("Error fetching random quote:", error);
        throw error;
    }
};

// Добавить цитату
export const addQuote = async (quoteData) => {
    try {
        const response = await axios.post(`${API_URL}/quotes/`, quoteData);
        return response.data;
    } catch (error) {
        console.error("Error adding quote:", error);
        throw error;
    }
};

// Обновить цитату
export const updateQuote = async (id, quoteData) => {
    try {
        const response = await axios.put(`${API_URL}/quotes/${id}`, quoteData);
        return response.data;
    } catch (error) {
        console.error("Error updating quote:", error);
        throw error;
    }
};

// Удалить цитату
export const deleteQuote = async (id) => {
    try {
        const response = await axios.delete(`${API_URL}/quotes/${id}`);
        return response.data; // или true, если API возвращает удаленный объект
    } catch (error) {
        console.error("Error deleting quote:", error);
        throw error;
    }
};

// Поиск цитат в БД
export const searchQuotes = async (query) => {
    try {
        const response = await axios.get(`${API_URL}/quotes/search/`, { params: { query } });
        return response.data;
    } catch (error) {
        console.error("Error searching quotes:", error);
        throw error;
    }
};

// Запросить цитату из интернета
// Если автор и запрос не указаны, бэкенд вернет случайную внешнюю цитату
export const fetchExternalQuote = async (author = null, query = null) => {
    try {
        let params = {};
        if (author) params.author = author;
        if (query) params.query = query;

        const response = await axios.get(`${API_URL}/external/fetch/`, { params });
        return response.data;
    } catch (error) {
        console.error("Error fetching external quote:", error);
        // Проверяем, есть ли ответ и статус код, чтобы отличать 404 от других ошибок
        if (error.response && error.response.status === 404) {
            throw new Error("Цитата не найдена во внешнем источнике.");
        }
        throw error;
    }
};