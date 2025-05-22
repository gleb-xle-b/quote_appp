import React, { useState, useEffect } from 'react';
import { Form, Button } from 'react-bootstrap'; // Убрал Alert, так как внешних предложений больше нет
import { addQuote, updateQuote } from '../api'; // Убрал fetchExternalQuote

function QuoteForm({ existingQuote, onFormSubmit, onCancelEdit }) {
    const [text, setText] = useState('');
    const [author, setAuthor] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isEditing = !!existingQuote;

    useEffect(() => {
        if (isEditing) {
            setText(existingQuote.text);
            setAuthor(existingQuote.author);
        } else {
            setText('');
            setAuthor('');
        }
        setError(''); // Сбрасываем ошибку при смене режима
    }, [existingQuote, isEditing]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); // Сброс предыдущих ошибок
        setIsSubmitting(true);

        if (!text.trim() || !author.trim()) {
            setError('Пожалуйста, заполните все поля.');
            setIsSubmitting(false);
            return;
        }

        try {
            const quoteData = { text, author };
            let result;
            if (isEditing) {
                result = await updateQuote(existingQuote.id, quoteData);
            } else {
                result = await addQuote(quoteData);
            }
            onFormSubmit(result); // Отправляем новую/обновленную цитату родительскому компоненту
            if (!isEditing) { // Сброс формы только после добавления, не при редактировании
                setText('');
                setAuthor('');
            }
        } catch (err) {
            console.error('Ошибка при отправке формы:', err);
            setError(`Ошибка: ${err.message || 'Неизвестная ошибка'}. Попробуйте еще раз.`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Form onSubmit={handleSubmit} className="mb-4 p-3 border rounded">
            <h3>{isEditing ? 'Редактировать цитату' : 'Добавить новую цитату'}</h3>
            {error && <Alert variant="danger">{error}</Alert>}

            <Form.Group className="mb-3">
                <Form.Label>Текст цитаты</Form.Label>
                <Form.Control
                    as="textarea"
                    rows={3}
                    value={text}
                    onChange={(e) => setText(e.target.value)} // Убрал setExternalSuggestion(null)
                    required
                />
            </Form.Group>
            <Form.Group className="mb-3">
                <Form.Label>Автор</Form.Label>
                <Form.Control
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)} // Убрал setExternalSuggestion(null)
                    required
                />
            </Form.Group>
            <Button variant="primary" type="submit" disabled={isSubmitting}>
                {isSubmitting ? (isEditing ? 'Сохранение...' : 'Добавление...') : (isEditing ? 'Сохранить изменения' : 'Добавить цитату')}
            </Button>
            {isEditing && onCancelEdit && (
                <Button variant="secondary" onClick={onCancelEdit} className="ms-2">
                    Отмена
                </Button>
            )}
        </Form>
    );
}

export default QuoteForm;