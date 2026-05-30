USE moviematch;

INSERT INTO directors (name) VALUES
('Christopher Nolan'), ('Denis Villeneuve'), ('Steven Spielberg'),
('James Cameron'), ('Quentin Tarantino'), ('Ridley Scott');

INSERT INTO genres (name) VALUES
('Action'), ('Horror'), ('Comedy'), ('Sci-Fi'), ('Drama'), ('Thriller');

INSERT INTO actors (name) VALUES
('Matthew McConaughey'), ('Anne Hathaway'), ('Leonardo DiCaprio'),
('Tom Hardy'), ('Ryan Gosling'), ('Emily Blunt'), ('Samuel L. Jackson'),
('Brad Pitt'), ('Sigourney Weaver'), ('Tom Hanks');

INSERT INTO movies (title, release_year, poster_url, description, director_id, avg_rating, review_count, view_count) VALUES
('Interstellar', 2014, 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
 'A team explores space through a wormhole to save humanity.', 1, 4.8, 12, 150),
('Inception', 2010, 'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',
 'A thief enters dreams to plant an idea in a target mind.', 1, 4.7, 10, 140),
('The Dark Knight', 2008, 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
 'Batman faces the Joker in Gotham City.', 1, 4.9, 15, 200),
('Blade Runner 2049', 2017, 'https://upload.wikimedia.org/wikipedia/en/9/9b/Blade_Runner_2049_poster.png',
 'A young blade runner discovers a secret that could end society.', 2, 4.5, 8, 90),
('Arrival', 2016, 'https://upload.wikimedia.org/wikipedia/en/d/df/Arrival%2C_Movie_Poster.jpg',
 'A linguist communicates with aliens who arrive on Earth.', 2, 4.6, 9, 85),
('Jurassic Park', 1993, 'https://upload.wikimedia.org/wikipedia/en/e/e7/Jurassic_Park_poster.jpg',
 'Scientists clone dinosaurs for a theme park.', 3, 4.4, 7, 110),
('Titanic', 1997, 'https://image.tmdb.org/t/p/w500/9xjZS2rlVxm8SFx8kPC3aIGCOYQ.jpg',
 'A romance aboard the doomed RMS Titanic.', 4, 4.3, 11, 180),
('Pulp Fiction', 1994, 'https://upload.wikimedia.org/wikipedia/en/3/3b/Pulp_Fiction_%281994%29_poster.jpg',
 'Interwoven stories of crime in Los Angeles.', 5, 4.7, 10, 95),
('Alien', 1979, 'https://upload.wikimedia.org/wikipedia/en/c/c3/Alien_movie_poster.jpg',
 'Crew of a spaceship fights a deadly alien organism.', 6, 4.6, 8, 75),
('The Shawshank Redemption', 1994, 'https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg',
 'Two inmates bond over years in prison.', 3, 4.9, 14, 160);

-- Movie-Genre links
INSERT INTO movie_genres (movie_id, genre_id) VALUES
(1,4),(1,5),(2,4),(2,6),(3,1),(3,6),(4,4),(4,5),
(5,4),(5,5),(6,4),(6,1),(7,5),(7,4),(8,6),(8,2),
(9,4),(9,2),(10,5),(10,6);

-- Movie-Actor links
INSERT INTO movie_actors (movie_id, actor_id) VALUES
(1,1),(1,2),(2,3),(2,4),(3,3),(3,4),(4,5),(4,6),
(5,6),(6,10),(7,8),(8,7),(9,9),(10,10);
