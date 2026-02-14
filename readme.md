# 🏨 Hotel Compare API (Amadeus Integration)

API backend simples para busca e comparação de preços de hotéis utilizando a **API oficial da Amadeus**.
Projeto criado para fins acadêmicos com arquitetura limpa, modular e escalável.

---

## 📌 Funcionalidades

* Busca de hotéis por cidade
* Consulta de preços em tempo real
* Integração com API externa (Amadeus)
* Cache em memória
* Deduplicação de hotéis
* Ordenação por menor preço
* Tratamento de erros de rede/API
* Estrutura modular pronta para escalar

---

## 🧠 Arquitetura

```
Controller → Service → Provider → API Amadeus
                       ↓
                    Utils
```

Camadas:

| Camada     | Função             |
| ---------- | ------------------ |
| Routes     | define endpoints   |
| Controller | valida requisição  |
| Service    | regra de negócio   |
| Provider   | integração externa |
| Utils      | funções auxiliares |

---

## 📂 Estrutura do Projeto

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

---

## ⚙️ Instalação

```bash
npm install
```

---

## 🔐 Configuração

Crie um arquivo `.env` na raiz:

```
PORT=3000
AMADEUS_KEY=SEU_CLIENT_ID
AMADEUS_SECRET=SEU_CLIENT_SECRET
AMADEUS_BASE_URL=https://test.api.amadeus.com
```

Obtenha credenciais gratuitas em:
https://developers.amadeus.com

---

## ▶️ Executar projeto

```
npm run dev
```

Servidor inicia em:

```
http://localhost:3000
```

---

## 🔎 Endpoint principal

### Buscar hotéis

```
GET /search
```

### Parâmetros

| Nome     | Tipo   | Obrigatório | Exemplo    |
| -------- | ------ | ----------- | ---------- |
| cityCode | string | sim         | SAO        |
| checkin  | date   | sim         | 2026-02-20 |
| checkout | date   | sim         | 2026-02-2  |
