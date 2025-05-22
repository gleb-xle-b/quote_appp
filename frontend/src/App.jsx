// frontend/src/App.jsx
import React, { useState, useEffect, useCallback } from 'react'; // <--- УБЕДИТЬСЯ, ЧТО React импортирован
import { Container, Row, Col, Button, Navbar, Form, FormControl, Alert, Spinner } from 'react-bootstrap';
import QuoteCard from './components/QuoteCard';
import QuoteForm from './components/QuoteForm';
import * as api from './api';
import './App.css';

function App() {
    const [quotes, setQuotes] = useState([]);
    const [randomQuote, setRandomQuote] = useState(null);
    const [editingQuote, setEditingQuote] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [externalQuoteSuggestion, setExternalQuoteSuggestion] = useState(null);

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
        setRandomQuote(null);
        try {
            const data = await api.getRandomQuote();
            setRandomQuote(data);
        } catch (err) {
            setError('Не удалось загрузить случайную цитату.');
            console.error(err);
            setRandomQuote(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAllQuotes();
        fetchRandomQuote();
    }, [fetchAllQuotes, fetchRandomQuote]);

    const handleSearch = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setQuotes([]);
        setEditingQuote(null);
        setShowForm(false);
        setExternalQuoteSuggestion(null);

        try {
            const data = await api.searchQuotes(searchTerm);
            setQuotes(data);
        } catch (err) {
            setError('Не удалось выполнить поиск цитат.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFormSubmit = async (quoteData) => {
        setIsLoading(true);
        setError('');
        try {
            if (editingQuote) {
                await api.updateQuote(editingQuote.id, quoteData);
                setEditingQuote(null);
            } else {
                await api.addQuote(quoteData);
                setShowForm(false);
            }
            await fetchAllQuotes();
            await fetchRandomQuote();
        } catch (err) {
            setError(err.response?.data?.detail || 'Ошибка при сохранении цитаты.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (quote) => {
        setEditingQuote(quote);
        setShowForm(true);
        setExternalQuoteSuggestion(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setEditingQuote(null);
        setShowForm(false);
        setError('');
    };

    const handleDelete = async (id) => {
        setIsLoading(true);
        setError('');
        try {
            await api.deleteQuote(id);
            await fetchAllQuotes();
            if (randomQuote && randomQuote.id === id) {
                setRandomQuote(null);
                await fetchRandomQuote();
            }
        } catch (err) {
            setError('Не удалось удалить цитату.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddFromExternal = async (quote) => {
        setError('');
        try {
            setExternalQuoteSuggestion(null);
            setEditingQuote(null);
            setShowForm(true);
            await handleFormSubmit(quote);
            alert('Цитата успешно добавлена!');
        } catch (err) {
            setError(err.response?.data?.detail || 'Ошибка при добавлении внешней цитаты.');
            console.error(err);
        }
    };

    const fetchRandomExternalQuote = async () => {
        setIsLoading(true);
        setError('');
        setExternalQuoteSuggestion(null);
        try {
            const data = await api.fetchExternalQuote();
            setExternalQuoteSuggestion(data);
        } catch (err) {
            setError(err.message || 'Не удалось загрузить случайную внешнюю цитату.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
                <Container>
                    <Navbar.Brand href="#">Цитатник</Navbar.Brand>
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
                        </Form>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

            <Container>
                {error && <Alert variant="danger">{error}</Alert>}
                {isLoading && (
                    <div className="text-center my-3">
                        <Spinner animation="border" role="status">
                            <span className="visually-hidden">Загрузка...</span>
                        </Spinner>
                        <p>Загрузка данных...</p>
                    </div>
                )}

                <Row className="mb-4">
                    <Col>
                        <h1>Управление цитатами</h1>
                        <Button variant="primary" onClick={() => {
                            setShowForm(!showForm);
                            setEditingQuote(null);
                            setExternalQuoteSuggestion(null);
                            setError('');
                        }}>
                            {showForm ? 'Скрыть форму' : 'Добавить новую цитату'}
                        </Button>
                        <Button variant="info" className="ms-2" onClick={fetchRandomExternalQuote}>
                            Получить случайную внешнюю цитату
                        </Button>
                    </Col>
                </Row>

                {externalQuoteSuggestion && (
                    <Row className="mb-4">
                        <Col>
                            <Alert variant="info" className="d-flex align-items-center justify-content-between">
                                <div>
                                    <h5 className="mb-1">Предложение из интернета:</h5>
                                    <p className="mb-0">"<i>{externalQuoteSuggestion.text}</i>" - {externalQuoteSuggestion.author}</p>
                                </div>
                                <Button
                                    variant="success"
                                    onClick={() => handleAddFromExternal(externalQuoteSuggestion)}
                                >
                                    Добавить в мою базу
                                </Button>
                            </Alert>
                        </Col>
                    </Row>
                )}


                <Row className="mb-4">
                    <Col>
                        <h2>Случайная цитата</h2>
                        {isLoading && !randomQuote && <p>Загрузка случайной цитаты...</p>}
                        {!isLoading && !randomQuote && <p>Не удалось загрузить случайную цитату. Добавьте цитаты, чтобы получить случайную!</p>}
                        {randomQuote && (
                            <QuoteCard
                                quote={randomQuote}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                            />
                        )}
                        <Button variant="secondary" onClick={fetchRandomQuote} className="mt-2">
                            Обновить случайную цитату
                        </Button>
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