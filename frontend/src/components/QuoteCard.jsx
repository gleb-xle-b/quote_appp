// frontend/src/components/QuoteCard.jsx
import React from 'react'; // <--- УБЕДИТЬСЯ, ЧТО React импортирован
import { Card, Button } from 'react-bootstrap';

function QuoteCard({ quote, onEdit, onDelete }) {
    if (!quote) {
        return <p>Цитата не загружена.</p>;
    }

    return (
        <Card className="mb-3">
            <Card.Body>
                <blockquote className="blockquote mb-0">
                    <p>{quote.text}</p>
                    <footer className="blockquote-footer">
                        {quote.author}
                    </footer>
                </blockquote>
            </Card.Body>
            {(onEdit || onDelete) && (
                 <Card.Footer>
                    {onEdit && <Button variant="outline-primary" size="sm" onClick={() => onEdit(quote)} className="me-2">Редактировать</Button>}
                    {onDelete && <Button variant="outline-danger" size="sm" onClick={() => onDelete(quote.id)}>Удалить</Button>}
                </Card.Footer>
            )}
        </Card>
    );
}

export default QuoteCard;