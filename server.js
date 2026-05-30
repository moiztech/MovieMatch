const express = require('express');
const cors = require('cors');
const path = require('path');
const q = require('./database/queries');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// --- HOME ---
app.get('/api/trending', async (req, res) => {
  try {
    res.json(await q.getTrendingMovies());
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/top-rated', async (req, res) => {
  try {
    res.json(await q.getTopRatedMovies());
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/recent', async (req, res) => {
  try {
    res.json(await q.getRecentMovies());
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/genres', async (req, res) => {
  try {
    res.json(await q.getAllGenres());
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// --- SEARCH & FILTER ---
app.get('/api/search', async (req, res) => {
  try {
    const { q: query } = req.query;
    if (!query) return res.json([]);
    res.json(await q.searchMovies(query));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/movies/genre/:name', async (req, res) => {
  try {
    res.json(await q.getMoviesByGenre(req.params.name));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/movies', async (req, res) => {
  try {
    res.json(await q.getAllMovies());
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// --- MOVIE DETAILS ---
app.get('/api/movies/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const movie = await q.getMovieById(id);
    if (!movie) return res.status(404).json({ error: 'Movie not found' });
    await q.addMovieView(id);
    const [cast, genres, reviews, similar] = await Promise.all([
      q.getMovieCast(id),
      q.getMovieGenres(id),
      q.getReviews(id),
      q.getSimilarMovies(id),
    ]);
    res.json({ ...movie, cast, genres, reviews, similar });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// --- REVIEWS & RATINGS ---
app.post('/api/movies/:id/reviews', async (req, res) => {
  try {
    const { userName, comment } = req.body;
    if (!userName || !comment) return res.status(400).json({ error: 'Name and comment required' });
    await q.addReview(req.params.id, userName, comment);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/movies/:id/ratings', async (req, res) => {
  try {
    const { userName, stars } = req.body;
    if (!userName || !stars) return res.status(400).json({ error: 'Name and stars required' });
    await q.addRating(req.params.id, userName, Number(stars));
    const avg = await q.updateAverageRating(req.params.id);
    res.json({ success: true, avgRating: avg });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// --- BATTLE ---
app.get('/api/battle/pair', async (req, res) => {
  try {
    res.json(await q.getBattlePair());
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/battle/vote', async (req, res) => {
  try {
    const { winnerId, loserId } = req.body;
    await q.addBattleVote(winnerId, loserId);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/battle/leaderboard', async (req, res) => {
  try {
    res.json(await q.getBattleLeaderboard());
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// --- ADMIN ---
app.get('/api/admin/directors', async (req, res) => {
  try {
    res.json(await q.getAllDirectors());
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/admin/movies', async (req, res) => {
  try {
    const { title, releaseYear, posterUrl, description, directorName, genres, cast } = req.body;
    if (!title || !releaseYear || !directorName) {
      return res.status(400).json({ error: 'Title, release year, and director are required' });
    }
    if (!genres || !genres.length) {
      return res.status(400).json({ error: 'Select at least one genre' });
    }
    const castList = typeof cast === 'string'
      ? cast.split(',').map((s) => s.trim()).filter(Boolean)
      : (cast || []);
    const movieId = await q.addMovie({
      title,
      releaseYear: Number(releaseYear),
      posterUrl,
      description,
      directorName,
      genres,
      cast: castList,
    });
    res.json({ success: true, movieId });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/admin/analytics', async (req, res) => {
  try {
    const [summary, popularGenre, highestRated, mostReviewed, topActors, avgByGenre] =
      await Promise.all([
        q.getDashboardSummary(),
        q.getMostPopularGenre(),
        q.getHighestRatedMovie(),
        q.getMostReviewedMovie(),
        q.getTopActors(),
        q.getAvgRatingByGenre(),
      ]);
    res.json({
      summary,
      popularGenre,
      highestRated,
      mostReviewed,
      topActors,
      avgByGenre,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(PORT, () => {
  console.log(`MovieMatch running at http://localhost:${PORT}`);
});
