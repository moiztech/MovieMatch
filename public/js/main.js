const API = '';

async function fetchJSON(url) {
  const res = await fetch(API + url);
  if (!res.ok) throw new Error('Request failed');
  return res.json();
}

async function postJSON(url, body) {
  const res = await fetch(API + url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('Request failed');
  return res.json();
}

function movieCard(m) {
  const rating = m.avg_rating ? Number(m.avg_rating).toFixed(1) : '—';
  const poster = m.poster_url || 'https://via.placeholder.com/300x450?text=No+Poster';
  return `
    <a class="movie-card" href="movie.html?id=${m.movie_id}">
      <img src="${poster}" alt="${m.title}" loading="lazy" onerror="this.src='https://via.placeholder.com/300x450?text=Movie'">
      <div class="info">
        <h3>${m.title}</h3>
        <div class="meta">
          <span class="rating-badge">${rating}</span>
          ${m.release_year ? ` · ${m.release_year}` : ''}
        </div>
      </div>
    </a>`;
}

function renderGrid(el, movies) {
  if (!el) return;
  if (!movies || movies.length === 0) {
    el.innerHTML = '<p class="empty">No movies found.</p>';
    return;
  }
  el.innerHTML = movies.map(movieCard).join('');
}

function setActiveNav(page) {
  document.querySelectorAll('.nav-links a').forEach((a) => {
    a.classList.toggle('active', a.dataset.page === page);
  });
}
