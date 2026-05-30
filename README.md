# MovieMatch – Movie Recommendation & Review System

University database semester project. Dark Netflix-style UI with MySQL backend.

## Quick Start

1. **Install MySQL** and make sure it is running.

2. **Copy environment file** and set your MySQL password:
   ```
   copy .env.example .env
   ```
   Edit `.env` and set `DB_PASSWORD`.

3. **Install dependencies:**
   ```
   npm install
   ```

4. **Create database and sample data:**
   ```
   npm run setup-db
   ```

5. **Start server:**
   ```
   npm start
   ```

6. Open **http://localhost:3000**

## Pages

| Page | URL | Purpose |
|------|-----|---------|
| Home | `/` | Trending, top rated, search, genre filter |
| Movie Details | `/movie.html?id=1` | Reviews, ratings, similar movies |
| Movie Battle | `/battle.html` | Vote between 2 random movies |
| Analytics | `/admin.html` | Dashboard for viva presentation |

## For Viva / Presentation (IMPORTANT)

**All SQL commands are in one file:**

```
database/queries.js
```

Each function has:
- A comment explaining what it does
- The raw SQL string used
- Which database concept it demonstrates (JOIN, GROUP BY, AVG, etc.)

The **admin page** (`admin.html`) shows analytics and maps each feature to its function name in `queries.js`.

### File Structure (minimal)

```
MovieMatch/
├── server.js              ← API routes (calls queries.js)
├── setup-db.js            ← Runs schema + seed
├── database/
│   ├── schema.sql         ← CREATE TABLE statements
│   ├── seed.sql           ← Sample movies data
│   ├── db.js              ← MySQL connection
│   └── queries.js         ← ★ ALL SQL FOR VIVA ★
└── public/
    ├── index.html
    ├── movie.html
    ├── battle.html
    ├── admin.html
    ├── css/style.css
    └── js/main.js
```

## Database Tables

- `movies`, `directors`, `actors`, `genres`
- `reviews`, `ratings`
- `movie_genres`, `movie_actors` (many-to-many)
- `movie_views`, `movie_battle_votes`
