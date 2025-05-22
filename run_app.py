import subprocess
import os
import sys
import time
import signal

# Определяем корневую директорию проекта
PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.join(PROJECT_ROOT, 'backend')
FRONTEND_DIR = os.path.join(PROJECT_ROOT, 'frontend')

# Определяем путь к исполняемому файлу Python внутри виртуального окружения
# Это важно, чтобы использовались установленные зависимости
if sys.platform == "win32":
    VENV_PYTHON = os.path.join(PROJECT_ROOT, '.venv', 'Scripts', 'python.exe')
else:
    VENV_PYTHON = os.path.join(PROJECT_ROOT, '.venv', 'bin', 'python')

backend_process = None
frontend_process = None


def start_backend():
    """Запускает бэкенд-сервер Uvicorn в отдельном процессе."""
    print("Запуск бэкенда...")
    if not os.path.exists(VENV_PYTHON):
        print(f"Ошибка: Исполняемый файл Python виртуального окружения не найден по пути: {VENV_PYTHON}")
        print(
            "Пожалуйста, убедитесь, что ваше виртуальное окружение создано и активировано, или скорректируйте путь в run_app.py.")
        sys.exit(1)

    # Команда для запуска Uvicorn через Python из виртуального окружения
    cmd = [VENV_PYTHON, '-m', 'uvicorn', 'main:app', '--reload']

    # Запускаем процесс бэкенда в его директории, перенаправляя вывод в текущий терминал
    return subprocess.Popen(cmd, cwd=BACKEND_DIR, stdout=sys.stdout, stderr=sys.stderr)


def start_frontend():
    """Запускает фронтенд-сервер Vite (npm run dev) в отдельном процессе."""
    print("Запуск фронтенда...")
    # Команда для запуска npm dev сервера
    # На Windows, npm может быть не в PATH для subprocess напрямую,
    # поэтому используем shell=True, чтобы cmd.exe (или PowerShell) нашел npm.
    cmd = ['npm', 'run', 'dev']

    # Запускаем процесс фронтенда в его директории, перенаправляя вывод в текущий терминал
    # Добавляем shell=True для Windows
    return subprocess.Popen(cmd, cwd=FRONTEND_DIR, stdout=sys.stdout, stderr=sys.stderr, shell=True)


def cleanup_processes(signum, frame):
    """Функция для корректной остановки всех запущенных процессов."""
    print("\nОстановка приложения...")
    if frontend_process:
        print("Завершение процесса фронтенда...")
        frontend_process.terminate()  # Попытка корректного завершения
        try:
            frontend_process.wait(timeout=5)  # Ждем до 5 секунд
        except subprocess.TimeoutExpired:
            print("Фронтенд не завершился, принудительное завершение...")
            frontend_process.kill()  # Принудительное завершение, если не удалось

    if backend_process:
        print("Завершение процесса бэкенда...")
        backend_process.terminate()  # Попытка корректного завершения
        try:
            backend_process.wait(timeout=5)  # Ждем до 5 секунд
        except subprocess.TimeoutExpired:
            print("Бэкенд не завершился, принудительное завершение...")
            backend_process.kill()  # Принудительное завершение, если не удалось

    print("Приложение остановлено.")
    sys.exit(0)  # Выход из главного скрипта


def run_app():
    """Основная функция для запуска всего приложения."""
    global backend_process, frontend_process

    # Регистрируем обработчик сигналов для Ctrl+C (SIGINT) и SIGTERM
    signal.signal(signal.SIGINT, cleanup_processes)
    signal.signal(signal.SIGTERM, cleanup_processes)

    try:
        backend_process = start_backend()
        # Даем бэкенду немного времени на запуск перед стартом фронтенда
        time.sleep(5)
        frontend_process = start_frontend()

        print("\nПриложение запущено. Нажмите Ctrl+C для остановки.")

        # Держим главный скрипт активным, пока запущены дочерние процессы
        # Проверяем, не завершился ли какой-либо из процессов неожиданно
        while True:
            if backend_process.poll() is not None:  # poll() возвращает код завершения, если процесс завершился
                print("Процесс бэкенда неожиданно завершился.")
                break
            if frontend_process.poll() is not None:
                print("Процесс фронтенда неожиданно завершился.")
                break
            time.sleep(1)  # Проверяем каждую секунду

    except Exception as e:
        print(f"Произошла ошибка при запуске приложения: {e}")
    finally:
        # Убедимся, что процессы завершаются при любом выходе
        cleanup_processes(None, None)


if __name__ == "__main__":
    run_app()


