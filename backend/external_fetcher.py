# backend/external_fetcher.py
import requests

QUOTABLE_API_URL = "https://api.quotable.io"

def fetch_quote_from_quotable(author: str = None, query: str = None):
    """
    Ищет цитату на Quotable API.
    Можно искать по автору или по ключевому слову в цитате (query).
    """
    try:
        if author:
            # Поиск случайной цитаты конкретного автора
            # Quotable API позволяет фильтровать по автору при запросе /quotes?author=...
            # или /random?author=...
            response = requests.get(f"{QUOTABLE_API_URL}/random", params={"author": author, "limit": 1})
            response.raise_for_status() # Проверка на HTTP ошибки
            data = response.json()
            if isinstance(data, list) and data: # API может вернуть список, даже если просим одну
                quote_data = data[0]
                return {"text": quote_data.get("content"), "author": quote_data.get("author")}
            elif isinstance(data, dict) and data.get("content"): # Иногда /random возвращает один объект
                 return {"text": data.get("content"), "author": data.get("author")}

        elif query:
            # Поиск по ключевому слову
            response = requests.get(f"{QUOTABLE_API_URL}/search/quotes", params={"query": query, "limit": 1})
            response.raise_for_status()
            data = response.json()
            if data.get("results") and len(data["results"]) > 0:
                quote_data = data["results"][0]
                return {"text": quote_data.get("content"), "author": quote_data.get("author")}
        else:
            # Получить случайную цитату без параметров
            response = requests.get(f"{QUOTABLE_API_URL}/random")
            response.raise_for_status()
            data = response.json()
            return {"text": data.get("content"), "author": data.get("author")}

    except requests.exceptions.RequestException as e:
        print(f"Error fetching from Quotable: {e}")
        return None
    except (KeyError, IndexError, TypeError) as e:
        print(f"Error parsing Quotable API response: {e}")
        return None
    return None


# Пример использования:
if __name__ == "__main__":
    # Перед запуском этого файла напрямую, убедитесь, что requests установлен:
    # pip install requests
    print("Случайная цитата:")
    random_q = fetch_quote_from_quotable()
    if random_q:
        print(f'"{random_q["text"]}" - {random_q["author"]}')

    print("\nЦитата Альберта Эйнштейна:")
    einstein_q = fetch_quote_from_quotable(author="Albert Einstein")
    if einstein_q:
        print(f'"{einstein_q["text"]}" - {einstein_q["author"]}')

    print("\nЦитата со словом 'life':")
    life_q = fetch_quote_from_quotable(query="life")
    if life_q:
        print(f'"{life_q["text"]}" - {life_q["author"]}')