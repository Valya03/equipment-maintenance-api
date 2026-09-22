# Equipment Maintenance API

REST API для учёта заявок на техническое обслуживание оборудования производственной площадки (ветропарка).

Проект выполнен в рамках **Case Lab «JavaScript»** (сентябрь 2026, Гринатом Росатом), Кейс 2 - REST API на Express.

---

## Описание сервиса

Сервис предоставляет REST API для:

- ведения справочника оборудования (турбины, инверторы, датчики, подстанции);
- ведения заявок на обслуживание оборудования;
- контроля жизненного цикла заявки (переходы статусов);
- получения прогноза погоды по координатам объекта и оценки пригодности окна для наружных работ.

Данные на текущей неделе хранятся в JSON-файлах (`src/data/`). Доступ к данным осуществляется только через слой репозиториев, далее можно будет заменить JSON-хранилище на PostgreSQL без изменения сервисов и контроллеров.

---

## Требования к окружению

- **Node.js** версии 18+ (используется встроенный `fetch`)
- **npm** (идёт в комплекте с Node.js)
- **Postman** (для тестирования, опционально)

---

## Установка и запуск

```bash
# Клонирование репозитория
git clone https://github.com/Valya03/equipment-maintenance-api
cd equipment-maintenance-api

# Установка зависимостей
npm install

# Создание .env на основе шаблона
cp .env.example .env

# Запуск в режиме разработки (с автоперезапуском)
npm run dev

# Запуск в обычном режиме
npm start
```

После запуска сервер будет доступен по адресу `http://localhost:3000`.

Проверка доступности:

```bash
curl http://localhost:3000/api/health
```

---

## Переменные окружения

Все параметры конфигурации задаются через переменные окружения (см. `.env.example`).

| Переменная                  | Описание                                      | Значение по умолчанию                    |
| --------------------------- | --------------------------------------------- | ---------------------------------------- |
| `PORT`                      | Порт, на котором слушает сервер               | `3000`                                   |
| `NODE_ENV`                  | Режим работы (`development` / `production`)   | `development`                            |
| `CORS_ORIGINS`              | Список разрешённых источников через запятую   | `http://localhost:3000`                  |
| `RATE_LIMIT_WINDOW_MS`      | Окно ограничения частоты запросов (мс)        | `900000` (15 мин)                        |
| `RATE_LIMIT_MAX`            | Максимум запросов в окне                      | `100`                                    |
| `WEATHER_API_URL`           | URL внешнего погодного API                    | `https://api.open-meteo.com/v1/forecast` |
| `REQUEST_TIMEOUT_MS`        | Таймаут внешних запросов (мс)                 | `5000`                                   |
| `WEATHER_MAX_WIND_SPEED`    | Порог скорости ветра для наружных работ (м/с) | `10`                                     |
| `WEATHER_MAX_PRECIPITATION` | Порог осадков для наружных работ (мм)         | `0`                                      |

---

## Эндпоинты API

Базовый URL: `http://localhost:3000/api`

### Health

| Метод | Путь      | Назначение                   |
| ----- | --------- | ---------------------------- |
| GET   | `/health` | Проверка доступности сервиса |

### Оборудование (Equipment)

| Метод  | Путь                      | Назначение                                           |
| ------ | ------------------------- | ---------------------------------------------------- |
| GET    | `/equipment`              | Список оборудования (фильтры, сортировка, пагинация) |
| POST   | `/equipment`              | Создание единицы оборудования                        |
| GET    | `/equipment/:id`          | Карточка оборудования                                |
| PATCH  | `/equipment/:id`          | Частичное обновление                                 |
| DELETE | `/equipment/:id`          | Удаление (запрещено при наличии открытых заявок)     |
| GET    | `/equipment/:id/requests` | Заявки по конкретной единице оборудования            |
| GET    | `/equipment/:id/weather`  | Прогноз погоды и пригодность для наружных работ      |

Параметры фильтрации для `GET /equipment`:

- `status` — статус оборудования
- `type` — тип оборудования
- `sortBy` — поле сортировки (например, `name`, `installedAt`)
- `sortOrder` — `asc` или `desc`
- `page`, `limit` — пагинация

### Заявки на обслуживание (Requests)

| Метод  | Путь                   | Назначение                                      |
| ------ | ---------------------- | ----------------------------------------------- |
| GET    | `/requests`            | Список заявок (фильтры, сортировка, пагинация)  |
| POST   | `/requests`            | Создание заявки                                 |
| GET    | `/requests/:id`        | Карточка заявки                                 |
| PATCH  | `/requests/:id`        | Редактирование полей заявки                     |
| PATCH  | `/requests/:id/status` | Смена статуса с проверкой допустимости перехода |
| DELETE | `/requests/:id`        | Удаление заявки                                 |

---

## Модель данных

### Equipment (Оборудование)

| Поле           | Тип           | Ограничения                                                   |
| -------------- | ------------- | ------------------------------------------------------------- |
| `id`           | string (uuid) | Генерируется сервером                                         |
| `name`         | string        | 3–100 символов, обязательное                                  |
| `type`         | string        | `turbine` \| `inverter` \| `sensor` \| `substation`           |
| `serialNumber` | string        | Уникальный в пределах системы                                 |
| `location`     | object        | `{ lat: number, lon: number }`                                |
| `status`       | string        | `operational` \| `maintenance` \| `fault` \| `decommissioned` |
| `installedAt`  | ISO-date      | Не в будущем                                                  |
| `createdAt`    | ISO-date      | Проставляется сервером                                        |
| `updatedAt`    | ISO-date      | Проставляется сервером                                        |

### Request (Заявка на обслуживание)

| Поле          | Тип           | Ограничения                                                         |
| ------------- | ------------- | ------------------------------------------------------------------- |
| `id`          | string (uuid) | Генерируется сервером                                               |
| `equipmentId` | string (uuid) | Ссылка на существующее оборудование                                 |
| `title`       | string        | 5–120 символов, обязательное                                        |
| `description` | string        | До 2000 символов                                                    |
| `priority`    | string        | `low` \| `medium` \| `high` \| `critical`                           |
| `status`      | string        | `new` \| `in_progress` \| `done` \| `rejected` (по умолчанию `new`) |
| `plannedAt`   | ISO-datetime  | Необязательное                                                      |
| `createdAt`   | ISO-datetime  | Проставляется сервером                                              |
| `updatedAt`   | ISO-datetime  | Проставляется сервером                                              |

---

## Переходы статусов заявки

Допустимые переходы:

- `new -> in_progress`
- `new -> rejected`
- `in_progress -> done`
- `in_progress -> rejected`

Недопустимый переход возвращает `409 Conflict`.

Схема переходов:

```
       ┌──────────────────┐
       │       new        │
       └────────┬─────────┘
                │
        ┌───────┴────────┐
        ▼                ▼
┌───────────────┐   ┌──────────┐
│  in_progress  │   │ rejected │
└───────┬───────┘   └──────────┘
        │                ▲
        │                │
        ▼                │
   ┌────────┐            │
   │  done  │            │
   └────────┘            │
                         │
        ┌────────────────┘
        │ (in_progress -> rejected)
```

---

## Формат ответа об ошибке

Все ошибки возвращаются в едином формате:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Некорректные данные запроса",
    "details": [{ "field": "priority", "message": "Недопустимое значение" }],
    "requestId": "b1f2c3d4"
  }
}
```

**Коды ошибок:**

- `VALIDATION_ERROR` - 400 (некорректные данные)
- `NOT_FOUND` - 404 (ресурс не найден)
- `CONFLICT` - 409 (конфликт: дубликат серийного номера, недопустимый переход статуса, наличие открытых заявок)
- `TOO_MANY_REQUESTS` - 429 (превышен лимит запросов)
- `INTERNAL_ERROR` - 500 (непредвиденная ошибка)

---

## Примеры запросов и ответов

### Успешное создание оборудования (POST /api/equipment)

**Запрос:**

```json
{
  "name": "Wind Turbine Alpha",
  "type": "turbine",
  "serialNumber": "WT-001",
  "location": { "lat": 55.75, "lon": 37.62 },
  "status": "operational",
  "installedAt": "2023-01-15T00:00:00.000Z"
}
```

**Ответ (201 Created):**

Заголовок `Location: /api/equipment/7f63e879-44ab-4867-9281-2c283efa632e`

```json
{
  "data": {
    "id": "7f63e879-44ab-4867-9281-2c283efa632e",
    "name": "Wind Turbine Alpha",
    "type": "turbine",
    "serialNumber": "WT-001",
    "location": { "lat": 55.75, "lon": 37.62 },
    "status": "operational",
    "installedAt": "2023-01-15T00:00:00.000Z",
    "createdAt": "2026-09-22T04:27:25.164Z",
    "updatedAt": "2026-09-22T04:27:25.164Z"
  }
}
```

### Список оборудования с пагинацией (GET /api/equipment)

**Запрос:** `GET /api/equipment?page=1&limit=10&status=operational`

**Ответ (200 OK):**

```json
{
  "data": [],
  "meta": { "total": 0, "page": 1, "limit": 10 }
}
```

### Ошибка валидации (POST /api/equipment с пустым телом)

**Ответ (400 Bad Request):**

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Некорректные данные запроса",
    "details": [
      { "field": "name", "message": "\"name\" is required" },
      { "field": "type", "message": "\"type\" is required" }
    ],
    "requestId": "c494044d"
  }
}
```

### Конфликт при дубликате serialNumber (POST /api/equipment)

**Ответ (409 Conflict):**

```json
{
  "error": {
    "code": "CONFLICT",
    "message": "Оборудование с серийным номером WT-001 уже существует",
    "requestId": "e1f2a3b4"
  }
}
```

### Недопустимый переход статуса (PATCH /api/requests/:id/status)

**Ответ (409 Conflict):**

```json
{
  "error": {
    "code": "CONFLICT",
    "message": "Недопустимый переход статуса: in_progress -> new",
    "requestId": "a9b8c7d6"
  }
}
```

### Запрет удаления оборудования с открытыми заявками (DELETE /api/equipment/:id)

**Ответ (409 Conflict):**

```json
{
  "error": {
    "code": "CONFLICT",
    "message": "Невозможно удалить оборудование: по нему есть 1 открытых заявок",
    "requestId": "6e1d7de5"
  }
}
```

---

## Правила безопасности

### CORS

Разрешённые источники задаются через переменную `CORS_ORIGINS` (по умолчанию `http://localhost:3000`). Использование `*` запрещено. Список источников явный, потому что API будет вызываться со своего фронтенда, а не со сторонних сайтов.

### Rate limiting

На все маршруты `/api` установлено ограничение: 100 запросов за 15 минут (настраивается через `RATE_LIMIT_WINDOW_MS` и `RATE_LIMIT_MAX`). При превышении возвращается `429 Too Many Requests` с заголовками `RateLimit-*`.

### Защитные HTTP-заголовки

Используется библиотека `helmet` - устанавливает заголовки `X-Content-Type-Options`, `X-Frame-Options`, `Strict-Transport-Security` и другие.

### Ограничение размера тела запроса

Тело запроса ограничено 1 МБ (`express.json({ limit: '1mb' })`).

### Cookie

В текущей реализации cookie не используются. При необходимости для аутентификации на Неделе 3 флаги будут установлены так: `HttpOnly`, `Secure`, `SameSite=Strict` (защита от CSRF и XSS).

### Отсутствие секретов в репозитории

Все секреты и параметры окружения хранятся только в `.env` (который добавлен в `.gitignore`). В репозитории есть только `.env.example`. В production в ответе об ошибке не возвращаются стек-трейсы (проверяется по `NODE_ENV`).

---

## Структура проекта

```
equipment-maintenance-api/
├── docs/
│   └── postman/
│       ├── Equipment-Maintenance-API.postman_collection.json
│       └── Local.postman_environment.json
├── src/
│   ├── app.js                  # Сборка приложения (экспортируется для тестов)
│   ├── server.js               # Запуск сервера
│   ├── config/
│   │   └── index.js            # Централизованная конфигурация
│   ├── routes/                 # Маршруты (роутеры Express)
│   ├── controllers/            # Тонкие контроллеры
│   ├── services/               # Бизнес-логика
│   ├── repositories/           # Доступ к данным (JSON-файлы)
│   ├── middlewares/            # Middleware: requestId, logger, validate, errorHandler, notFound, asyncHandler
│   ├── validators/             # Схемы Joi
│   ├── errors/                 # Классы ошибок (AppError, NotFoundError, ConflictError, ValidationError)
│   └── data/                   # JSON-хранилище (equipment.json, requests.json)
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

### Архитектура

Проект построен по слоистой архитектуре:

```
Routes -> Controllers -> Services -> Repositories
```

- **Routes** - определяют URL и HTTP-методы, подключают валидацию.
- **Controllers** - принимают запрос, вызывают сервис, формируют ответ.
- **Services** - содержат бизнес-логику (проверки, переходы статусов).
- **Repositories** - единственное место работы с данными. Изолированы за интерфейсом, чтобы на Неделе 3 заменить JSON на PostgreSQL.

Сборка приложения (`app.js`) отделена от запуска сервера (`server.js`) - это позволяет подключать приложение в тестах (Jest + Supertest) без открытия порта.

---

## Тестирование в Postman

Коллекция покрывает все эндпоинты, сгруппирована по ресурсам (`Health`, `Equipment`, `Requests`, `Negative tests`), использует переменные окружения `{{baseUrl}}`, `{{equipmentId}}`, `{{requestId}}`.

В запросах написаны автотесты `pm.test` на код ответа и структуру тела, а также сохранены негативные сценарии:

- `400` - некорректное тело запроса
- `404` - несуществующий идентификатор
- `409` - дубликат серийного номера, недопустимый переход статуса, наличие открытых заявок
- `429` - превышение лимита частоты запросов

Импорт коллекции: **Postman -> Import -> выберите файлы из `docs/postman/`**.

---

## Автор

**Валентина Пятерева** - [GitHub @Valya03](https://github.com/Valya03)

Case Lab «JavaScript», сентябрь 2026, Гринатом Росатом.
