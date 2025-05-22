// frontend/src/components/QuoteForm.jsx
import React, { useState, useEffect } from 'react'; // <--- УБЕДИТЬСЯ, ЧТО React импортирован
import { Form, Button, Alert, Spinner } from 'react-bootstrap';
import { addQuote, updateQuote, fetchExternalQuote } from '../api';

function QuoteForm({ existingQuote, onFormSubmit, onCancelEdit }) {
    const [text, setText] = useState('');
    const [author, setAuthor] = useState('');
    const [error, setError] = useState('');
    const [externalSuggestion, setExternalSuggestion] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isFetchingExternal, setIsFetchingExternal] = useState(false);

    const isEditing = !!existingQuote;

    useEffect(() => {
        if (isEditing) {
            setText(existingQuote.text);
            setAuthor(existingQuote.author);
        } else {
            setText('');
            setAuthor('');
        }
        setExternalSuggestion(null);
        setError('');
    }, [existingQuote, isEditing]);

    const handleAuthorBlur = async () => {
        if (!isEditing && author && !text) {
            setIsFetchingExternal(true);
            setError('');
            setExternalSuggestion(null);
            try {
                const suggestion = await fetchExternalQuote(author, null);
                if (suggestion && suggestion.text && suggestion.author) {
                    setExternalSuggestion(suggestion);
                } else {
                    setError('Не удалось найти цитату этого автора во внешнем источнике.');
                }
            } catch (err) {
                console.error("Error fetching external quote on blur:", err);
                if (err.message.includes("Цитата не найдена")) {
                    setError('Не удалось найти цитату этого автора во внешнем источнике.');
                } else {
                    setError('Ошибка при поиске цитаты во внешнем источнике.');
                }
            } finally {
                setIsFetchingExternal(false);
            }
        }
    };

    const handleTextBlur = async () => {
        if (!isEditing && text && !author) {
            setIsFetchingExternal(true);
            setError('');
            setExternalSuggestion(null);
            try {
                const suggestion = await fetchExternalQuote(null, text);
                if (suggestion && suggestion.text && suggestion.author) {
                    setExternalSuggestion(suggestion);
                } else {
                    setError('Не удалось найти цитату с таким текстом во внешнем источнике.');
                }
            } catch (err) {
                console.error("Error fetching external quote on text blur:", err);
                if (err.message.includes("Цитата не найдена")) {
                    setError('Не удалось найти цитату с таким текстом во внешнем источнике.');
                } else {
                    setError('Ошибка при поиске цитаты во внешнем источнике.');
                }
            } finally {
                setIsFetchingExternal(false);
            }
        }
    };

    const useSuggestion = () => {
        if (externalSuggestion) {
            setText(externalSuggestion.text);
            setAuthor(externalSuggestion.author);
            setExternalSuggestion(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        if (!text.trim() || !author.trim()) {
            setError('Пожалуйста, заполните оба поля: "Текст цитаты" и "Автор".');
            setIsSubmitting(false);
            return;
        }

        try {
            const quoteData = { text, author };
            await onFormSubmit(quoteData);
        } catch (err) {
            setError(err.message || 'Произошла ошибка при сохранении цитаты.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Form onSubmit={handleSubmit} className="p-3 border rounded shadow-sm">
            <h3 className="mb-3">{isEditing ? 'Редактировать цитату' : 'Добавить новую цитату'}</h3>
            {error && <Alert variant="danger">{error}</Alert>}

            {isFetchingExternal && (
                <div className="text-center my-3">
                    <Spinner animation="border" size="sm" role="status" className="me-2" />
                    <span>Поиск во внешних источниках...</span>
                </div>
            )}

            {externalSuggestion && (
                <Alert variant="info" className="mb-3">
                    <p className="mb-1">Возможно, это ищете?</p>
                    <p className="mb-0">"<i>{externalSuggestion.text}</i>" - {externalSuggestion.author}</p>
                    <Button variant="link" size="sm" onClick={useSuggestion}>Использовать эту цитату</Button>
                </Alert>
            )}

            <Form.Group className="mb-3">
                <Form.Label>Текст цитаты</Form.Label>
                <Form.Control
                    as="textarea"
                    rows={3}
                    value={text}
                    onChange={(e) => { setText(e.target.value); setExternalSuggestion(null); setError(''); }}
                    onBlur={handleTextBlur}
                    required
                />
            </Form.Group>
            <Form.Group className="mb-3">
                <Form.Label>Автор</Form.Label>
                <Form.Control
                    type="text"
                    value={author}
                    onChange={(e) => { setAuthor(e.target.value); setExternalSuggestion(null); setError(''); }}
                    onBlur={handleAuthorBlur}
                    required
                />
            </Form.Group>
            <Button variant="primary" type="submit" disabled={isSubmitting || isFetchingExternal}>
                {isSubmitting ? (isEditing ? 'Сохранение...' : 'Добавление...') : (isEditing ? 'Сохранить изменения' : 'Добавить цитату')}
            </Button>
            {isEditing && onCancelEdit && (
                <Button variant="secondary" onClick={onCancelEdit} className="ms-2" disabled={isSubmitting}>
                    Отмена
                </Button>
            )}
        </Form>
    );
}

export default QuoteForm;