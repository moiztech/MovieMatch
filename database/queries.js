/**
 * =============================================================================
 *  MOVIEMATCH – SQL QUERIES FILE (MEMORIZE FOR VIVA / PRESENTATION)
 * =============================================================================
 *  This file contains EVERY SQL command used in the project.
 *  Each function = one API action. Read the SQL strings below for your viva.
 *
 *  CONCEPTS USED:
 *  - JOIN (INNER, LEFT)
 *  - GROUP BY, HAVING
 *  - Aggregate: COUNT, AVG, MAX, SUM
 *  - WHERE, LIKE, ORDER BY
 *  - INSERT, UPDATE
 *  - Many-to-Many via junction tables (movie_genres, movie_actors)
 * =============================================================================
 */

const pool = require('./db');

// Helper: base movie columns with director name (used in many queries)
const MOVIE_SELECT = `
  SELECT m.movie_id, m.title, m.release_year, m.poster_url, m.description,
         m.avg_rating, m.review_count, m.view_count,
         d.name AS director
  FROM movies m
  LEFT JOIN directors d ON m.director_id = d.director_id
`;

// -----------------------------------------------------------------------------
// 1. HOME PAGE – Trending movies (high rating + reviews + views)
// -----------------------------------------------------------------------------
async function getTrendingMovies(limit = 6) {
  const sql = `
    SELECT m.movie_id, m.title, m.poster_url, m.avg_rating, m.review_count, m.view_count
    FROM movies m
    ORDER BY (m.avg_rating * 2 + m.review_count + m.view_count * 0.1) DESC
    LIMIT ?
  `;
  const [rows] = await pool.query(sql, [limit]);
  return rows;
}

// -----------------------------------------------------------------------------
// 2. HOME PAGE – Top rated movies (ORDER BY avg_rating)
// -----------------------------------------------------------------------------
async function getTopRatedMovies(limit = 6) {
  const sql = `
    SELECT movie_id, title, poster_url, avg_rating, release_year
    FROM movies
    ORDER BY avg_rating DESC, review_count DESC
    LIMIT ?
  `;
  const [rows] = await pool.query(sql, [limit]);
  return rows;
}

// -----------------------------------------------------------------------------
// 3. HOME PAGE – Recently added movies
// -----------------------------------------------------------------------------
async function getRecentMovies(limit = 6) {
  const sql = `
    SELECT movie_id, title, poster_url, release_year, created_at
    FROM movies
    ORDER BY created_at DESC
    LIMIT ?
  `;
  const [rows] = await pool.query(sql, [limit]);
  return rows;
}

// -----------------------------------------------------------------------------
// 4. HOME PAGE – All genres (for category chips)
// -----------------------------------------------------------------------------
async function getAllGenres() {
  const sql = `SELECT genre_id, name FROM genres ORDER BY name`;
  const [rows] = await pool.query(sql);
  return rows;
}

// -----------------------------------------------------------------------------
// 5. SEARCH – by movie name, actor, director, or genre (LIKE + JOINs)
// -----------------------------------------------------------------------------
async function searchMovies(query) {
  const term = `%${query}%`;
  const sql = `
    SELECT DISTINCT m.movie_id, m.title, m.poster_url, m.avg_rating, m.release_year
    FROM movies m
    LEFT JOIN directors d ON m.director_id = d.director_id
    LEFT JOIN movie_actors ma ON m.movie_id = ma.movie_id
    LEFT JOIN actors a ON ma.actor_id = a.actor_id
    LEFT JOIN movie_genres mg ON m.movie_id = mg.movie_id
    LEFT JOIN genres g ON mg.genre_id = g.genre_id
    WHERE m.title LIKE ?
       OR d.name LIKE ?
       OR a.name LIKE ?
       OR g.name LIKE ?
    ORDER BY m.avg_rating DESC
  `;
  const [rows] = await pool.query(sql, [term, term, term, term]);
  return rows;
}

// -----------------------------------------------------------------------------
// 6. GENRE FILTER – movies in one genre (INNER JOIN junction table)
// -----------------------------------------------------------------------------
async function getMoviesByGenre(genreName) {
  const sql = `
    SELECT m.movie_id, m.title, m.poster_url, m.avg_rating, m.release_year
    FROM movies m
    INNER JOIN movie_genres mg ON m.movie_id = mg.movie_id
    INNER JOIN genres g ON mg.genre_id = g.genre_id
    WHERE g.name = ?
    ORDER BY m.avg_rating DESC
  `;
  const [rows] = await pool.query(sql, [genreName]);
  return rows;
}

// -----------------------------------------------------------------------------
// 7. MOVIE DETAILS – single movie with director
// -----------------------------------------------------------------------------
async function getMovieById(movieId) {
  const sql = `${MOVIE_SELECT} WHERE m.movie_id = ?`;
  const [rows] = await pool.query(sql, [movieId]);
  return rows[0] || null;
}

// -----------------------------------------------------------------------------
// 8. MOVIE DETAILS – cast list (Many-to-Many JOIN)
// -----------------------------------------------------------------------------
async function getMovieCast(movieId) {
  const sql = `
    SELECT a.name
    FROM actors a
    INNER JOIN movie_actors ma ON a.actor_id = ma.actor_id
    WHERE ma.movie_id = ?
    ORDER BY a.name
  `;
  const [rows] = await pool.query(sql, [movieId]);
  return rows.map((r) => r.name);
}

// -----------------------------------------------------------------------------
// 9. MOVIE DETAILS – genres for one movie
// -----------------------------------------------------------------------------
async function getMovieGenres(movieId) {
  const sql = `
    SELECT g.name
    FROM genres g
    INNER JOIN movie_genres mg ON g.genre_id = mg.genre_id
    WHERE mg.movie_id = ?
  `;
  const [rows] = await pool.query(sql, [movieId]);
  return rows.map((r) => r.name);
}

// -----------------------------------------------------------------------------
// 10. MOVIE DETAILS – record a view (INSERT + UPDATE counter)
// -----------------------------------------------------------------------------
async function addMovieView(movieId) {
  const insertSql = `INSERT INTO movie_views (movie_id) VALUES (?)`;
  const updateSql = `UPDATE movies SET view_count = view_count + 1 WHERE movie_id = ?`;
  await pool.query(insertSql, [movieId]);
  await pool.query(updateSql, [movieId]);
}

// -----------------------------------------------------------------------------
// 11. REVIEWS – get all reviews for a movie
// -----------------------------------------------------------------------------
async function getReviews(movieId) {
  const sql = `
    SELECT review_id, user_name, comment, created_at
    FROM reviews
    WHERE movie_id = ?
    ORDER BY created_at DESC
  `;
  const [rows] = await pool.query(sql, [movieId]);
  return rows;
}

// -----------------------------------------------------------------------------
// 12. REVIEWS – add review (INSERT) + update review_count on movie
// -----------------------------------------------------------------------------
async function addReview(movieId, userName, comment) {
  const insertSql = `
    INSERT INTO reviews (movie_id, user_name, comment) VALUES (?, ?, ?)
  `;
  const updateSql = `
    UPDATE movies SET review_count = review_count + 1 WHERE movie_id = ?
  `;
  await pool.query(insertSql, [movieId, userName, comment]);
  await pool.query(updateSql, [movieId]);
}

// -----------------------------------------------------------------------------
// 13. RATINGS – add rating (INSERT)
// -----------------------------------------------------------------------------
async function addRating(movieId, userName, stars) {
  const sql = `
    INSERT INTO ratings (movie_id, user_name, stars) VALUES (?, ?, ?)
  `;
  await pool.query(sql, [movieId, userName, stars]);
}

// -----------------------------------------------------------------------------
// 14. RATINGS – recalculate average (AVG aggregate) and save to movies
// -----------------------------------------------------------------------------
async function updateAverageRating(movieId) {
  const avgSql = `
    SELECT AVG(stars) AS avg_stars FROM ratings WHERE movie_id = ?
  `;
  const [result] = await pool.query(avgSql, [movieId]);
  const avg = result[0].avg_stars ? Number(result[0].avg_stars).toFixed(2) : 0;
  const updateSql = `UPDATE movies SET avg_rating = ? WHERE movie_id = ?`;
  await pool.query(updateSql, [avg, movieId]);
  return avg;
}

// -----------------------------------------------------------------------------
// 15. SIMILAR MOVIES – same genre, director, or shared actor (UNION)
// -----------------------------------------------------------------------------
async function getSimilarMovies(movieId, limit = 4) {
  const sql = `
    SELECT DISTINCT m.movie_id, m.title, m.poster_url, m.avg_rating
    FROM movies m
    WHERE m.movie_id != ?
      AND m.movie_id IN (
        SELECT mg2.movie_id FROM movie_genres mg1
        INNER JOIN movie_genres mg2 ON mg1.genre_id = mg2.genre_id
        WHERE mg1.movie_id = ? AND mg2.movie_id != ?
        UNION
        SELECT movie_id FROM movies
        WHERE director_id = (SELECT director_id FROM movies WHERE movie_id = ?)
          AND movie_id != ?
        UNION
        SELECT ma2.movie_id FROM movie_actors ma1
        INNER JOIN movie_actors ma2 ON ma1.actor_id = ma2.actor_id
        WHERE ma1.movie_id = ? AND ma2.movie_id != ?
      )
    ORDER BY m.avg_rating DESC
    LIMIT ?
  `;
  const [rows] = await pool.query(sql, [
    movieId, movieId, movieId, movieId, movieId, movieId, movieId, limit,
  ]);
  return rows;
}

// -----------------------------------------------------------------------------
// 16. MOVIE BATTLE – two random movies (ORDER BY RAND)
// -----------------------------------------------------------------------------
async function getBattlePair() {
  const sql = `
    SELECT movie_id, title, poster_url, avg_rating
    FROM movies
    ORDER BY RAND()
    LIMIT 2
  `;
  const [rows] = await pool.query(sql);
  return rows;
}

// -----------------------------------------------------------------------------
// 17. MOVIE BATTLE – save vote (INSERT into battle table)
// -----------------------------------------------------------------------------
async function addBattleVote(winnerId, loserId) {
  const sql = `
    INSERT INTO movie_battle_votes (winner_movie_id, loser_movie_id)
    VALUES (?, ?)
  `;
  await pool.query(sql, [winnerId, loserId]);
}

// -----------------------------------------------------------------------------
// 18. MOVIE BATTLE – leaderboard (COUNT wins, GROUP BY)
// -----------------------------------------------------------------------------
async function getBattleLeaderboard(limit = 10) {
  const sql = `
    SELECT m.movie_id, m.title, m.poster_url, COUNT(bv.vote_id) AS wins
    FROM movie_battle_votes bv
    INNER JOIN movies m ON bv.winner_movie_id = m.movie_id
    GROUP BY m.movie_id, m.title, m.poster_url
    ORDER BY wins DESC
    LIMIT ?
  `;
  const [rows] = await pool.query(sql, [limit]);
  return rows;
}

// =============================================================================
// ADMIN / ANALYTICS DASHBOARD QUERIES (MAIN FOR VIVA)
// =============================================================================

// -----------------------------------------------------------------------------
// 19. ANALYTICS – Most popular genre (COUNT + GROUP BY)
// -----------------------------------------------------------------------------
async function getMostPopularGenre() {
  const sql = `
    SELECT g.name AS genre, COUNT(mg.movie_id) AS movie_count
    FROM genres g
    INNER JOIN movie_genres mg ON g.genre_id = mg.genre_id
    GROUP BY g.genre_id, g.name
    ORDER BY movie_count DESC
    LIMIT 1
  `;
  const [rows] = await pool.query(sql);
  return rows[0] || null;
}

// -----------------------------------------------------------------------------
// 20. ANALYTICS – Highest rated movie (MAX + ORDER BY)
// -----------------------------------------------------------------------------
async function getHighestRatedMovie() {
  const sql = `
    SELECT movie_id, title, avg_rating, poster_url
    FROM movies
    ORDER BY avg_rating DESC
    LIMIT 1
  `;
  const [rows] = await pool.query(sql);
  return rows[0] || null;
}

// -----------------------------------------------------------------------------
// 21. ANALYTICS – Most reviewed movie (ORDER BY review_count)
// -----------------------------------------------------------------------------
async function getMostReviewedMovie() {
  const sql = `
    SELECT movie_id, title, review_count, poster_url
    FROM movies
    ORDER BY review_count DESC
    LIMIT 1
  `;
  const [rows] = await pool.query(sql);
  return rows[0] || null;
}

// -----------------------------------------------------------------------------
// 22. ANALYTICS – Top actors (COUNT movies per actor, GROUP BY)
// -----------------------------------------------------------------------------
async function getTopActors(limit = 5) {
  const sql = `
    SELECT a.name AS actor, COUNT(ma.movie_id) AS movie_count
    FROM actors a
    INNER JOIN movie_actors ma ON a.actor_id = ma.actor_id
    GROUP BY a.actor_id, a.name
    ORDER BY movie_count DESC
    LIMIT ?
  `;
  const [rows] = await pool.query(sql, [limit]);
  return rows;
}

// -----------------------------------------------------------------------------
// 23. ANALYTICS – Average rating by genre (AVG + JOIN + GROUP BY)
// -----------------------------------------------------------------------------
async function getAvgRatingByGenre() {
  const sql = `
    SELECT g.name AS genre, ROUND(AVG(m.avg_rating), 2) AS avg_rating,
           COUNT(m.movie_id) AS movie_count
    FROM genres g
    INNER JOIN movie_genres mg ON g.genre_id = mg.genre_id
    INNER JOIN movies m ON mg.movie_id = m.movie_id
    GROUP BY g.genre_id, g.name
    ORDER BY avg_rating DESC
  `;
  const [rows] = await pool.query(sql);
  return rows;
}

// -----------------------------------------------------------------------------
// 24. ANALYTICS – Total counts summary (aggregate overview)
// -----------------------------------------------------------------------------
async function getDashboardSummary() {
  const sql = `
    SELECT
      (SELECT COUNT(*) FROM movies) AS total_movies,
      (SELECT COUNT(*) FROM reviews) AS total_reviews,
      (SELECT COUNT(*) FROM ratings) AS total_ratings,
      (SELECT COUNT(*) FROM movie_battle_votes) AS total_battle_votes,
      (SELECT ROUND(AVG(avg_rating), 2) FROM movies) AS overall_avg_rating
  `;
  const [rows] = await pool.query(sql);
  return rows[0];
}

// -----------------------------------------------------------------------------
// 25. ALL MOVIES – browse page
// -----------------------------------------------------------------------------
async function getAllMovies() {
  const sql = `
    SELECT m.movie_id, m.title, m.poster_url, m.avg_rating, m.release_year,
           GROUP_CONCAT(DISTINCT g.name ORDER BY g.name SEPARATOR ', ') AS genres
    FROM movies m
    LEFT JOIN movie_genres mg ON m.movie_id = mg.movie_id
    LEFT JOIN genres g ON mg.genre_id = g.genre_id
    GROUP BY m.movie_id, m.title, m.poster_url, m.avg_rating, m.release_year
    ORDER BY m.title
  `;
  const [rows] = await pool.query(sql);
  return rows;
}

module.exports = {
  getTrendingMovies,
  getTopRatedMovies,
  getRecentMovies,
  getAllGenres,
  searchMovies,
  getMoviesByGenre,
  getMovieById,
  getMovieCast,
  getMovieGenres,
  addMovieView,
  getReviews,
  addReview,
  addRating,
  updateAverageRating,
  getSimilarMovies,
  getBattlePair,
  addBattleVote,
  getBattleLeaderboard,
  getMostPopularGenre,
  getHighestRatedMovie,
  getMostReviewedMovie,
  getTopActors,
  getAvgRatingByGenre,
  getDashboardSummary,
  getAllMovies,
};
