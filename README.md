# Equipment Maintenance API

REST API для учёта заявок на техобслуживание оборудования ветропарка.

Учебный проект в рамках Case Lab «JavaScript» (Гринатом Росатом, сентябрь 2026).
Первый кейс - CRUD на Express с файловым хранилищем. Второй - перенос на PostgreSQL:
та же схема API, но данные уже в реляционной БД, плюс новые сущности и отчёты.

Контракт API из первого кейса сохранён. Все старые эндпоинты продолжают работать
без изменений - это было главным требованием при переносе.

## Стек

- Node.js 18+
- Express 5
- PostgreSQL 16 (в Docker)
- Sequelize (ORM + миграции + сиды)
- Joi (валидация входных данных)
- Postman (тесты API)

## Установка и запуск

Нужен установленный Docker Desktop и Node.js.

```bash
git clone https://github.com/Valya03/equipment-maintenance-api.git
cd equipment-maintenance-api
npm install
cp .env.example .env
docker compose up -d
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all
npm run dev
```

Сервер поднимется на `http://localhost:3000`. Порт и остальные параметры - в `.env`.

Если локальный PostgreSQL уже занимает порт 5432, его надо остановить (служба
`postgresql-x64-NN` в Windows) либо поменять `DB_PORT` в `.env` и `docker-compose.yml`.

## База данных

### Схема

```
sites ───< equipment ───< maintenance_requests ───< request_status_history
              │                    │
              │                    └──< request_assignees >── technicians
              │
              └──── equipment_passports (1:1)
```

Пять таблиц для справочников и заявок, две - для связей и истории.

### Связи

| Связь                                          | Тип | Реализация                                          |
| ---------------------------------------------- | --- | --------------------------------------------------- |
| sites -> equipment                             | 1:N | Внешний ключ `site_id`                              |
| equipment -> equipment_passports               | 1:1 | `equipment_id` с UNIQUE                             |
| equipment -> maintenance_requests              | 1:N | Внешний ключ `equipment_id`                         |
| maintenance_requests -> request_status_history | 1:N | Внешний ключ `request_id`                           |
| maintenance_requests ↔ technicians             | N:M | Через `request_assignees` с полями `role` и `hours` |

Пара `(request_id, technician_id)` в `request_assignees` уникальна - повторно
назначить одного специалиста на ту же заявку нельзя.

### Правила ON DELETE

- `equipment.site_id` -> `RESTRICT` - площадку с оборудованием не удалить.
- `equipment_passports.equipment_id` -> `CASCADE` - паспорт живёт только с оборудованием.
- `maintenance_requests.equipment_id` -> `RESTRICT` - оборудование с заявками не удалить.
- `request_status_history.request_id` -> `RESTRICT` - история не должна пропадать молча.
- `request_assignees.request_id` -> `CASCADE` - назначения уходят вместе с заявкой.
- `request_assignees.technician_id` -> `RESTRICT` - специалиста с назначениями не удалить.

При удалении заявки история и назначения сносятся явно в транзакции - иначе
`RESTRICT` не даст удалить саму заявку.

### Про нормализацию

Схема в 3НФ. Справочные значения (тип оборудования, статус, приоритет, роль)
вынесены в ENUM-типы PostgreSQL. Паспорт - отдельная таблица, чтобы не держать
NULL-колонки у оборудования без паспорта. История статусов и назначения - тоже
отдельные таблицы, никакого дублирования данных в `maintenance_requests`.

### Миграции

Схема создаётся только миграциями, `sync({ force: true })` не используется.

```bash
npx sequelize-cli db:migrate                # применить все
npx sequelize-cli db:migrate:undo:all       # откатить все
npx sequelize-cli db:migrate                # применить снова
```

Цикл «применить -> откатить -> применить» проходит без ошибок. Каждая миграция
содержит рабочий `down()`.

### Сиды

Заполняют БД так, чтобы можно было проверить все связи и оба отчёта:

- 2 площадки
- 6 единиц оборудования (турбины, инвертор, датчик, подстанция)
- 6 паспортов
- 5 специалистов
- 20 заявок в разных статусах и приоритетах
- 20 назначений бригад (по 1 lead и 1 member)
- 35 записей в журнале статусов

```bash
npx sequelize-cli db:seed:all
npx sequelize-cli db:seed:undo:all          # откат
```

### Переменные окружения БД

| Переменная        | По умолчанию            | Описание                          |
| ----------------- | ----------------------- | --------------------------------- |
| `DB_HOST`         | `localhost`             | хост                              |
| `DB_PORT`         | `5432`                  | порт                              |
| `DB_NAME`         | `equipment_maintenance` | база                              |
| `DB_USER`         | `app_user`              | пользователь                      |
| `DB_PASSWORD`     | `app_password`          | пароль                            |
| `DB_POOL_MAX`     | `10`                    | макс. соединений в пуле           |
| `DB_POOL_MIN`     | `0`                     | мин. соединений                   |
| `DB_POOL_ACQUIRE` | `30000`                 | таймаут получения соединения (мс) |
| `DB_POOL_IDLE`    | `10000`                 | таймаут простоя (мс)              |
| `DB_LOGGING`      | `false`                 | логировать SQL                    |

## Эндпоинты

Базовый путь - `/api`. Ниже - сводка. Полное описание с примерами - в Postman-коллекции.

| Метод  | Путь                              | Что делает                            |
| ------ | --------------------------------- | ------------------------------------- |
| GET    | `/health`                         | проверка, что сервис жив              |
| GET    | `/sites/:id/summary`              | сводка по площадке                    |
| GET    | `/equipment`                      | список с фильтрами и пагинацией       |
| POST   | `/equipment`                      | создать оборудование                  |
| GET    | `/equipment/:id`                  | карточка (с паспортом и площадкой)    |
| PATCH  | `/equipment/:id`                  | обновить                              |
| DELETE | `/equipment/:id`                  | удалить (нельзя при открытых заявках) |
| GET    | `/equipment/:id/requests`         | заявки по оборудованию                |
| GET    | `/equipment/:id/weather`          | прогноз погоды по координатам         |
| GET    | `/requests`                       | список заявок                         |
| POST   | `/requests`                       | создать заявку                        |
| GET    | `/requests/:id`                   | карточка заявки                       |
| PATCH  | `/requests/:id`                   | обновить поля                         |
| PATCH  | `/requests/:id/status`            | сменить статус                        |
| GET    | `/requests/:id/history`           | история статусов                      |
| POST   | `/requests/:id/assignees`         | назначить бригаду                     |
| DELETE | `/requests/:id/assignees/:userId` | снять специалиста                     |
| DELETE | `/requests/:id`                   | удалить заявку                        |
| GET    | `/reports/equipment-load`         | нагрузка на оборудование              |

Списочные эндпоинты поддерживают `status`, `priority`, `equipmentId`, `dateFrom`,
`dateTo`, `sortBy`, `sortOrder`, `page`, `limit`. Фильтрация, сортировка и
пагинация выполняются на стороне БД (WHERE / ORDER BY / LIMIT / OFFSET), не в JS.

### Отчёт по нагрузке

`GET /reports/equipment-load` - прямой SQL с JOIN, GROUP BY и HAVING.

Параметры:

- `minRequests` - минимальное число заявок (фильтрация групп через HAVING);
- `dateFrom`, `dateTo` - период создания заявок.

Возвращает по каждой единице оборудования: общее число заявок, число закрытых,
суммарные плановые трудозатраты (часы) и дату последнего обслуживания.

### Сводка по площадке

`GET /sites/:id/summary` возвращает количество заявок по статусам, по приоритетам
и среднее время закрытия в часах (для заявок в статусе `done`).

## Статусы заявки

```
new ──► in_progress ──► done
 │            │
 └──► rejected ◄──┘
```

Разрешённые переходы: `new -> in_progress`, `new -> rejected`,
`in_progress -> done`, `in_progress -> rejected`.

Смена статуса выполняется в одной транзакции: обновление заявки + запись в
`request_status_history`. Если что-то падает - обе операции откатываются.

Перевод в `in_progress` без назначенной бригады запрещён - сервер вернёт 409.

## Ошибки

Все ошибки в одном формате:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Некорректные данные запроса",
    "details": [
      { "field": "minRequests", "message": "\"minRequests\" must be a number" }
    ],
    "requestId": "f324a9c4"
  }
}
```

Коды:

| Код                   | HTTP | Когда                                                                       |
| --------------------- | ---- | --------------------------------------------------------------------------- |
| `VALIDATION_ERROR`    | 400  | невалидные body/params/query                                                |
| `NOT_FOUND`           | 404  | ресурс или связанная сущность не найдена                                    |
| `CONFLICT`            | 409  | дубль serialNumber, недопустимый переход, открытые заявки, нет исполнителей |
| `WEATHER_UNAVAILABLE` | 503  | внешний погодный API недоступен или таймаут                                 |
| `TOO_MANY_REQUESTS`   | 429  | превышен rate limit                                                         |
| `INTERNAL_ERROR`      | 500  | непредвиденная ошибка                                                       |

`requestId` пишется в лог и в заголовок `X-Request-Id`, по нему можно найти
конкретный запрос в консоли сервера.

## Что под капотом

- CORS с явным списком источников из `CORS_ORIGINS`, `*` не используется.
- Rate limit: 100 запросов за 15 минут на все `/api`. При превышении - 429.
- Helmet - защитные HTTP-заголовки, ограничение размера тела - 1 МБ.
- SQL - только параметризованные запросы (bind / replacements), конкатенации
  пользовательского ввода нет.
- Сортировка - только по белому списку полей, значение `sortBy` из запроса
  напрямую в ORDER BY не подставляется.
- `limit` и `offset` ограничены сверху, значения вне диапазона -> 400.
- Секреты только в `.env`, в репозитории лежит `.env.example`.

## Структура

```
src/
├── app.js                 сборка Express-приложения
├── server.js              запуск + подключение к БД
├── config/                конфиг (env, Sequelize-инстанс, sequelize-cli)
├── migrations/            миграции схемы
├── seeders/               сиды с демо-данными
├── models/                модели Sequelize + ассоциации
├── repositories/          доступ к данным
├── services/              бизнес-логика и транзакции
├── controllers/           обработчики HTTP
├── routes/                маршруты
├── middlewares/           requestId, logger, validate, errorHandler
├── validators/            схемы Joi
├── errors/                классы ошибок
└── data/                  (пусто, файловое хранилище удалено после переноса)

docs/postman/              коллекция и окружение Postman
docker-compose.yml         PostgreSQL
.sequelizerc               пути для sequelize-cli
.env.example
```

Слои идут строго по цепочке `Routes -> Controllers -> Services -> Repositories`.
Работа с БД - только в репозиториях, бизнес-логика - в сервисах, контроллеры
только принимают запрос и отдают ответ.

## Откат и пересоздание окружения

```bash
# Откатить миграции
npx sequelize-cli db:migrate:undo:all

# Применить заново
npx sequelize-cli db:migrate

# Пересоздать данные
npx sequelize-cli db:seed:all
```

Полный сброс (удаляет контейнер и том с данными):

```bash
docker compose down -v
docker compose up -d
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all
```

## Тесты

В Postman лежит готовая коллекция: `docs/postman/Equipment-Maintenance-API.postman_collection.json`
и окружение `docs/postman/Local.postman_environment.json`.

47 запросов, сгруппированы по ресурсам (Health, Equipment, Requests, Sites,
Reports, Negative tests, Cleanup). Каждый запрос содержит pm.test на код ответа
и структуру тела. Негативные сценарии покрывают 400, 404, 409, 429 и 503.

```

```
