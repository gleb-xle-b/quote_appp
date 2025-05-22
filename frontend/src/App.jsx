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
                    <Navbar.Brand href="#">
                        <img
                            src="http://www.w3.org/2000/svg"
                            width="30"
                            height="30"
                            className="d-inline-block align-top me-2" // me-2 для отступа справа
                            alt="Логотип Цитатника"
                        />
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
