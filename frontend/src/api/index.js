// frontend/src/api/index.js
const API_BASE_URL = 'http://localhost:8000'; // Или адрес твоего backend, если отличается

export async function getQuotes() {
    const response = await fetch(`${API_BASE_URL}/quotes`);
    if (!response.ok) throw new Error('Ошибка при загрузке цитат');
    return await response.json();
}

export async function getRandomQuote() {
    const response = await fetch(`${API_BASE_URL}/quotes/random`);
    if (!response.ok) throw new Error('Ошибка при загрузке случайной цитаты');
    return await response.json();
}

export async function addQuote(quote) {
    const response = await fetch(`${API_BASE_URL}/quotes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quote),
    });
    if (!response.ok) throw new Error('Ошибка при добавлении цитаты');
    return await response.json();
}

export async function updateQuote(id, quote) {
    const response = await fetch(`${API_BASE_URL}/quotes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quote),
    });
    if (!response.ok) throw new Error('Ошибка при обновлении цитаты');
    return await response.json();
}

export async function deleteQuote(id) {
    const response = await fetch(`${API_BASE_URL}/quotes/${id}`, {
        method: 'DELETE',
    });
    if (!response.ok) throw new Error('Ошибка при удалении цитаты');
    return await response.json();
}

export async function searchQuotes(term) {
    const response = await fetch(`${API_BASE_URL}/quotes/search?query=${encodeURIComponent(term)}`);
    if (!response.ok) throw new Error('Ошибка при поиске цитат');
    return await response.json();
}

export async function fetchExternalQuote(author = null, term = null) {
    let url = `${API_BASE_URL}/quotes/external`;
    if (author) url += `?author=${encodeURIComponent(author)}`;
    else if (term) url += `?term=${encodeURIComponent(term)}`;

    const response = await fetch(url);
    if (!response.ok) throw new Error('Ошибка при поиске во внешнем источнике');
    return await response.json();
}
