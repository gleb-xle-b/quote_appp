import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Button, Navbar, Form, FormControl, Alert } from 'react-bootstrap';
import QuoteCard from './components/QuoteCard';
import QuoteForm from './components/QuoteForm';
import * as api from './api';

function App() {
    const [quotes, setQuotes] = useState([]);
    const [randomQuote, setRandomQuote] = useState(null);
    const [editingQuote, setEditingQuote] = useState(null); // Для редактирования
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false); // Показать/скрыть форму добавления

    const fetchAllQuotes = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
            const data = await api.getQuotes();
            setQuotes(data);
        } catch (err) {
            setError('Не удалось загрузить список цитат.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchRandomQuote = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
            const data = await api.getRandomQuote();
            setRandomQuote(data);
        } catch (err) {
            setError('Не удалось загрузить случайную цитату.');
            console.error(err);
            setRandomQuote(null); // Сброс, если не удалось загрузить
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAllQuotes();
        fetchRandomQuote(); // Загружаем случайную цитату при первом рендере
    }, [fetchAllQuotes, fetchRandomQuote]);

    const handleFormSubmit = (newQuote) => {
        // Если цитата была отредактирована, обновим ее в списке
        if (editingQuote) {
            setQuotes(prevQuotes => prevQuotes.map(q => q.id === newQuote.id ? newQuote : q));
        } else {
            // Иначе, это новая цитата, добавляем ее в начало списка
            setQuotes(prevQuotes => [newQuote, ...prevQuotes]);
        }
        setShowForm(false); // Скрыть форму после добавления/редактирования
        setEditingQuote(null); // Сбросить редактируемую цитату
        fetchRandomQuote(); // Обновить случайную цитату
    };

    const handleEdit = (quote) => {
        setEditingQuote(quote);
        setShowForm(true); // Показать форму для редактирования
    };

    const handleCancelEdit = () => {
        setEditingQuote(null);
        setShowForm(false);
    };

    const handleDelete = async (id) => {
        setError('');
        try {
            await api.deleteQuote(id);
            setQuotes(prevQuotes => prevQuotes.filter(quote => quote.id !== id));
            fetchRandomQuote(); // Обновить случайную цитату
        } catch (err) {
            setError('Не удалось удалить цитату.');
            console.error(err);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        setRandomQuote(null); // Сбросить случайную цитату при поиске
        try {
            const data = await api.searchQuotes(searchTerm);
            setQuotes(data);
        } catch (err) {
            setError(`Не удалось найти цитаты: ${err.response?.data?.detail || 'Неизвестная ошибка'}`);
            setQuotes([]); // Очистить список при ошибке поиска
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClearSearch = () => {
        setSearchTerm('');
        fetchAllQuotes(); // Загрузить все цитаты снова
    };

    return (
        <>
            <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
                <Container fluid>
                    <Navbar.Brand href="#" className="d-flex align-items-center"> {/* Добавлен d-flex и align-items-center для выравнивания иконки и текста */}
                        {/* Вставляем новый SVG-код напрямую */}
                        <svg width="30px" height="30px" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="me-2">
                            <path d="M13 9H27V5H13V9ZM27 1V5H13H7V9C7 9 3 9 3 5C3 1 7 1 7 1H27Z" fill="#668077"/>
                            <path d="M13 9V17L10 15L7 17V9V5H13V9Z" fill="#FFE6EA"/>
                            <path fillRule="evenodd" clipRule="evenodd" d="M29 10V30C29 30 29 31 28 31H4C4 31 3 31 3 30V5C3 9 7 9 7 9V17L10 15L13 17V9H27H28C28 9 29 9 29 10Z" fill="#FFC44D"/>
                            <path d="M13 9H28C28 9 29 9 29 10V30C29 30 29 31 28 31H4C4 31 3 31 3 30V5M3 5C3 1 7 1 7 1H29M3 5C3 9 7 9 7 9M7 5V17L10 15L13 17V5H27" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Менеджер Цитат
                    </Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Form className="d-flex ms-auto" onSubmit={handleSearch}>
                            <FormControl
                                type="search"
                                placeholder="Поиск по цитатам/авторам"
                                className="me-2"
                                aria-label="Search"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <Button variant="outline-success" type="submit">Поиск</Button>
                            {searchTerm && (
                                <Button variant="outline-secondary" onClick={handleClearSearch} className="ms-2">
                                    Очистить
                                </Button>
                            )}
                        </Form>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

            <Container>
                {error && (
                    <Row className="mb-4">
                        <Col>
                            <Alert variant="danger">{error}</Alert>
                        </Col>
                    </Row>
                )}

                {/* Новый блок для кнопок "Добавить" и "Обновить случайную" */}
                <Row className="mb-4 d-flex justify-content-center">
                    <Col xs={12} md={6} lg={4} className="d-flex justify-content-around">
                        <Button
                            onClick={() => setShowForm(!showForm)}
                            className="me-2"
                            variant="primary"
                            size="sm"
                        >
                            {showForm ? 'Скрыть форму' : 'Добавить новую цитату'}
                        </Button>
                        <Button
                            onClick={fetchRandomQuote}
                            variant="primary"
                            size="sm"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Обновление...' : 'Обновить случайную цитату'}
                        </Button>
                    </Col>
                </Row>


                {/* Блок со случайной цитатой из вашей БД */}
                <Row className="mb-4">
                    <Col>
                        <h2>Случайная цитата из вашей базы</h2>
                        {isLoading && !randomQuote && <p>Загрузка случайной цитаты...</p>}
                        {randomQuote ? (
                            <QuoteCard
                                quote={randomQuote}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                            />
                        ) : (
                            !isLoading && <p>Не удалось загрузить случайную цитату. Попробуйте еще раз.</p>
                        )}
                    </Col>
                </Row>


                {(showForm || editingQuote) && (
                     <Row className="mb-4">
                        <Col>
                            <QuoteForm
                                existingQuote={editingQuote}
                                onFormSubmit={handleFormSubmit}
                                onCancelEdit={handleCancelEdit}
                            />
                        </Col>
                    </Row>
                )}


                <Row>
                    <Col>
                        <h2>{searchTerm ? `Результаты поиска по "${searchTerm}"` : "Все цитаты"}</h2>
                        {isLoading && quotes.length === 0 && <p>Загрузка цитат...</p>}
                        {!isLoading && quotes.length === 0 && !error && <p>Цитаты не найдены. Вы можете добавить первую!</p>}
                        {quotes.map(quote => (
                            <QuoteCard
                                key={quote.id}
                                quote={quote}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                            />
                        ))}
                    </Col>
                </Row>
            </Container>
        </>
    );
}

export default App;
