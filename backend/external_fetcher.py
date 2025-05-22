# backend/external_fetcher.py
import requests
import random

# Новый API для программистских цитат
PROGRAMMING_QUOTES_API_URL = "https://programming-quotesapi.vercel.app/api"

def fetch_quote_from_programming_quotes_api(author: str = None, query: str = None):
    """
    Ищет цитату на Programming Quotes API.
    Этот API не поддерживает прямой поиск по автору или тексту через параметры.
    Придется загрузить все цитаты и отфильтровать их на нашей стороне.
    """
    print(f"DEBUG: Вызов fetch_quote_from_programming_quotes_api с author='{author}', query='{query}'")
    try:
        # Получаем все цитаты с API
        response = requests.get(f"{PROGRAMMING_QUOTES_API_URL}/quotes")
        print(f"DEBUG: Запрос к Programming Quotes API: {response.url}")
        response.raise_for_status() # Проверка на HTTP ошибки (4xx или 5xx)

        all_quotes = response.json()
        print(f"DEBUG: Получено {len(all_quotes)} цитат от Programming Quotes API.")

        found_quotes = []

        if author:
            # Фильтруем по автору
            search_author_lower = author.lower()
            for quote_data in all_quotes:
                if 'author' in quote_data and quote_data['author'].lower() == search_author_lower:
                    found_quotes.append({"text": quote_data.get("quote"), "author": quote_data.get("author")})
        elif query:
            # Фильтруем по тексту цитаты
            search_query_lower = query.lower()
            for quote_data in all_quotes:
                if 'quote' in quote_data and search_query_lower in quote_data['quote'].lower():
                    found_quotes.append({"text": quote_data.get("quote"), "author": quote_data.get("author")})
        else:
            # Если нет ни автора, ни запроса, возвращаем случайную из всех
            if all_quotes:
                random_quote_data = random.choice(all_quotes)
                return {"text": random_quote_data.get("quote"), "author": random_quote_data.get("author")}
            else:
                print("DEBUG: API вернул пустой список цитат.")
                return None

        if found_quotes:
            # Если найдены цитаты, возвращаем случайную из них
            selected_quote = random.choice(found_quotes)
            print(f"DEBUG: Найдена и выбрана цитата: '{selected_quote.get('text', '')[:50]}...' - {selected_quote.get('author')}")
            return selected_quote
        else:
            print(f"DEBUG: Цитаты по запросу author='{author}' или query='{query}' не найдены.")
            return None

    except requests.exceptions.RequestException as e:
        print(f"ERROR: Ошибка запроса к Programming Quotes API: {e}")
        return None
    except (KeyError, IndexError, TypeError) as e:
        print(f"ERROR: Ошибка парсинга ответа Programming Quotes API: {e}")
        return None
    except Exception as e:
        print(f"ERROR: Неизвестная ошибка в fetch_quote_from_programming_quotes_api: {e}")
        return None

# Пример использования (для тестирования самого файла)
if __name__ == "__main__":
    print("--- Тестирование Programming Quotes API ---")

    print("\nСлучайная цитата (без параметров):")
    random_q = fetch_quote_from_programming_quotes_api()
    if random_q:
        print(f'"{random_q["text"]}" - {random_q["author"]}')
    else:
        print("Цитата не найдена.")

    print("\nЦитата по автору 'Linus Torvalds':")
    linus_q = fetch_quote_from_programming_quotes_api(author="Linus Torvalds")
    if linus_q:
        print(f'"{linus_q["text"]}" - {linus_q["author"]}')
    else:
        print("Цитата по автору не найдена.")

    print("\nЦитата по запросу 'code':")
    code_q = fetch_quote_from_programming_quotes_api(query="code")
    if code_q:
        print(f'"{code_q["text"]}" - {code_q["author"]}')
    else:
        print("Цитата по запросу не найдена.")

    print("\nЦитата по автору 'NonExistent Author':")
    no_author_q = fetch_quote_from_programming_quotes_api(author="NonExistent Author")
    if no_author_q:
        print(f'"{no_author_q["text"]}" - {no_author_q["author"]}')
    else:
        print("Цитата по несуществующему автору не найдена (ожидаемо).")