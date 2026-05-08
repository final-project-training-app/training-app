# training-app

Det här repot innehåller en React-frontend och en Spring Boot-backend.

## Projektstruktur

- `backend` - Spring Boot API + PostgreSQL via JPA
- `frontend` - React + Vite

## Backend (aktuell status)

Backenden använder:

- Spring Web
- Spring Data JPA
- PostgreSQL

Kodstruktur i `backend/src/main/java/com/example/trainingapp/`:

- `controller` - REST-endpoints
- `service` - affarslogik
- `repository` - JPA repository
- `entity` - JPA entities

## API Endpoints

### Hi / Greeting

- `GET /api/hi`
  - Returnerar `GreetingMessage` (id + message)

### Users

- `POST /api/users`
  - Skapar user
- `GET /api/users/{id}`
  - Hamtar usern
- `PUT /api/users/{id}`
  - Uppdaterar `intensityLevel` + `context`

### Workouts

- `GET /api/workouts`
  - Hamtar alla workouts
- `GET /api/workouts/{id}`
  - Hamtar workout by id
- `GET /api/workouts/{id}/audio`
  - Hamtar endast workout audio-url (string)
- `POST /api/workouts/{id}/start?userId={userId}`
  - Startar workout och returnerar workout-data
  - Om `userId` skickas skapas en enkel `STARTED` logg

### Activity Logs

- `POST /api/activity-logs`
  - Sparar workout-resultat/logg
  - Service satter `completedAt` automatiskt

Exempel body:

```json
{
  "userId": 1,
  "workoutId": 1,
  "durationSeconds": 180,
  "status": "COMPLETED"
}
```

## Enkla MVP-floden

- Start workout:
  - `Frontend -> POST /api/workouts/{id}/start -> Workout returneras`
- Complete workout:
  - `Frontend -> POST /api/activity-logs -> logg sparas (timestamp satts i service)`

## Konfiguration

`backend/src/main/resources/application.properties` anvander miljovariabler:

- `SPRING_DATASOURCE_URL`
- `SPRING_DATASOURCE_USERNAME`
- `SPRING_DATASOURCE_PASSWORD`
- `PORT` (optional, default `8080`)
- `SUPABASE_URL` (optional)
- `SUPABASE_API_KEY` (optional)
- `SUPABASE_BUCKET_NAME` (optional)

## Starta lokalt

### 1) Starta PostgreSQL med Docker (om du kor lokalt DB)

Kor fran `backend`:

```powershell
docker compose up -d
```

### 2) Starta backend

Kor fran `backend`:

```powershell
mvn spring-boot:run
```

Om du anvander `.env` i `backend`, ladda variabler i PowerShell innan start:

```powershell
Get-Content .env | ForEach-Object {
  $k, $v = $_ -split '=', 2
  [System.Environment]::SetEnvironmentVariable($k, $v)
}
mvn spring-boot:run
```

### 3) Starta frontend

Kor fran `frontend`:

```powershell
npm install
npm run dev
```

## Snabbtest med Postman

- `GET http://localhost:8080/api/workouts`
- `POST http://localhost:8080/api/workouts/1/start?userId=1`
- `POST http://localhost:8080/api/activity-logs`

Frontend kor normalt pa `http://localhost:5173`.
