# Hotel & Flight Compare API

Professional backend service for searching and comparing **hotel and flight prices** using the official **Amadeus Self‑Service API**.
Designed as a portfolio‑grade project demonstrating production‑level architecture, clean code practices, and real integration patterns.

---

## Project Highlights

* Real external API integration (OAuth2 flow)
* Layered architecture (Controller → Service → Provider)
* Modular and scalable structure
* Request validation layer
* Error‑resilient HTTP client
* In‑memory caching strategy
* Data normalization pipeline
* Ready for multi‑provider expansion

This project mirrors real travel aggregator backend systems and showcases backend engineering best practices.

---

## Architecture Overview

```
Routes → Controllers → Services → Providers → External APIs
                              ↓
                            Utils
```

### Responsibility Breakdown

| Layer       | Responsibility                            |
| ----------- | ----------------------------------------- |
| Routes      | Endpoint definitions and routing          |
| Controllers | Input validation and response shaping     |
| Services    | Business logic orchestration              |
| Providers   | Third‑party API communication             |
| Utils       | Shared helpers (cache, normalize, dedupe) |

---

## Project Structure

```
src/
 ├── app.js
 ├── server.js
 ├── routes/
 ├── controllers/
 ├── services/
 ├── providers/
 └── utils/
```

The structure is intentionally separated to maintain maintainability, scalability, and testability.

---

## Features

### Hotel Search Engine

* Search hotels by city
* Real‑time price offers
* Cheapest price sorting
* Deduplication logic
* Batched API requests
* Timeout‑safe provider calls

### Flight Search Engine

* Search flights by route
* One‑way and round‑trip
* Live fare retrieval
* Currency conversion
* Fault‑tolerant requests

### System Infrastructure

* Structured error handling
* External API abstraction layer
* Environment‑based configuration
* Extensible provider pattern

---

## Installation

```bash
npm install
```

---

## Environment Configuration

Create a `.env` file in the root directory:

```
PORT=3000
AMADEUS_KEY=YOUR_API_KEY
AMADEUS_SECRET=YOUR_API_SECRET
AMADEUS_BASE_URL=https://test.api.amadeus.com
```

Get credentials:
[https://developers.amadeus.com](https://developers.amadeus.com)

---

## Running Locally

```bash
npm run dev
```

Server starts at:

```
http://localhost:3000
```

---

## API Reference

### Hotel Search

```
GET /search/hotels
```

| Parameter | Type   | Required | Example    |
| --------- | ------ | -------- | ---------- |
| cityCode  | string | yes      | SAO        |
| checkin   | date   | yes      | 2026-02-20 |
| checkout  | date   | yes      | 2026-02-22 |
| guests    | number | no       | 2          |

---

### Flight Search

```
GET /search/flights
```

| Parameter               | Type   | Required | Example    |
| ----------------------- | ------ | -------- | ---------- |
| originLocationCode      | string | yes      | GRU        |
| destinationLocationCode | string | yes      | GIG        |
| departureDate           | date   | yes      | 2026-03-10 |
| returnDate              | date   | no       | 2026-03-15 |
| adults                  | number | no       | 1          |

---

## Example Requests

Hotels

```
/search/hotels?cityCode=SAO&checkin=2026-02-20&checkout=2026-02-22&guests=2
```

Flights

```
/search/flights?originLocationCode=GRU&destinationLocationCode=GIG&departureDate=2026-03-10
```

---

## Example Response

```json
{
  "count": 2,
  "results": []
}
```

---

## Tech Stack

* Node.js
* Express
* Axios
* Zod
* Dotenv

---

## Engineering Goals

This project was built to demonstrate:

* Real API consumption
* Backend architecture design
* Separation of concerns
* Fault‑tolerant integrations
* Scalable code structure

---

## Roadmap

Planned improvements:

* Multiple provider aggregation
* Redis caching layer
* Request rate limiting
* Structured logging system
* Automated tests
* CI pipeline

---

## Author

**Kauã Ribeiro**
Backend Developer
API Integration Specialist
Software Engineering Student

---

## License

This project is for academic and portfolio purposes only.
