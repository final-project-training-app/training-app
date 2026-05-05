# training-app

Det här repot innehåller en enkel Spring Boot-backend i mappen `backend`.

## Backend

Backenden använder:

- Spring Web
- Spring Data JPA
- PostgreSQL

### Enkel struktur

`backend/src/main/java/com/example/trainingapp/`

- `controller` – REST-endpoints
- `service` – affärslogik
- `repository` – JPA repository
- `entity` – JPA entity

### Endpoint

- `GET /api/hi`

Endpointen returnerar bara `Hi`.

Första anropet sparar `Hi` i databasen om det inte redan finns.
Det visar kopplingen `controller -> service -> repository -> database`.

### Starta PostgreSQL med Docker

Kör från `backend`:

```powershell
docker compose up -d
```

### Starta backend

Kör från `backend`:

```powershell
mvn spring-boot:run
```

### Testa endpointen

```powershell
Invoke-RestMethod http://localhost:8080/api/hi
```

### Databasinställningar

Backenden använder:

- databas: `training_app`
- användare: `postgres`
- lösenord: `postgres`

Front end kan ansluta till backenden på `http://localhost:8080`.
Front end is running on http://localhost:5173/.

