> ⚠️ In development

# Web Bitcoin Client (WBC)

**Web Bitcoin Client** — это веб-приложение с открытым исходным кодом, предназначенное для управления Bitcoin-кошельками.


## 🚀 Возможности

- Генерация и управление Bitcoin-ключами (создание, импорт, экспорт)
- Создание и подпись транзакций
- Просмотр и анализ данных блокчейна
- Интуитивно понятный веб-интерфейс для взаимодействия с кошельком
- Возможность локального развертывания для обеспечения безопасности и конфиденциальности

## ⚙️ Технологии

- **Backend**: [FastAPI](https://fastapi.tiangolo.com/)
- **Frontend**: [React](https://reactjs.org/) с использованием TypeScript
- **Docker**: для контейнеризации и упрощения развертывания
- **Nginx**: связь между фронтом и бэком (пока не реализовано)

## 📦 Установка и запуск вручную

### 1. Клонирование репозитория

```bash
git clone git@github.com:qwerty-w/wbc.git
cd wbc
```

### 2. Запуск приложения

#### Backend

```bash
# Установка python >= 3.12, docker >= 28.0
cd src/fastapi
python -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt
# Запуск PostgreSQL (port 5432), pgAdmin4 (port 8080)
docker compose up -d
alembic upgrade head
mv example.env .env
fastapi dev src/main.py
```

#### Frontend

```bash
# Установка nodejs >= 22.14
cd src/react
npm install
npm start
```

Приложение будет доступно по адресу: [http://localhost:3000](http://localhost:3000)