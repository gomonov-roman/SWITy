// Конфигурация API
const API_KEY = 'b1325fa0';
const API_URL = 'https://www.omdbapi.com/';

// Маппинг жанров
const GENRE_MAP_EN = {
    'action': 'action',
    'comedy': 'comedy',
    'drama': 'drama',
    'horror': 'horror',
    'sci-fi': 'sci-fi',
    'fantasy': 'fantasy',
    'thriller': 'thriller',
    'romance': 'romance',
    'animation': 'animation',
    'mystery': 'mystery'
};

const GENRE_MAP_RU = {
    'action': 'боевик',
    'comedy': 'комедия',
    'drama': 'драма',
    'horror': 'ужасы',
    'sci-fi': 'фантастика',
    'fantasy': 'фэнтези',
    'thriller': 'триллер',
    'romance': 'романтика',
    'animation': 'мультфильм',
    'mystery': 'детектив'
};

// Популярные запросы для трендов
const TREND_SEARCHES = [
    'avengers', 'batman', 'harry potter', 'star wars', 'marvel',
    'disney', 'pixar', 'spider man', 'jurassic', 'matrix'
];

// ========== ФУНКЦИЯ СОЗДАНИЯ КАРТОЧКИ ==========
function createMovieCard(movie) {
    const card = document.createElement('a');
    card.className = 'movie-card';
    card.href = `movie-details.html?id=${movie.imdbID}`;
    
    const img = document.createElement('img');
    img.className = 'movie-poster';
    img.src = (movie.Poster && movie.Poster !== 'N/A') ? movie.Poster : 'https://via.placeholder.com/300x450?text=No+Poster';
    img.alt = movie.Title;
    img.loading = 'lazy';
    
    const title = document.createElement('h3');
    title.className = 'movie-title';
    title.textContent = movie.Title;
    
    const year = document.createElement('div');
    year.className = 'movie-year';
    year.textContent = movie.Year;
    
    const rating = document.createElement('div');
    rating.className = 'movie-rating';
    rating.innerHTML = `<i class="fas fa-star"></i> ${movie.imdbRating || 'N/A'}`;
    
    // Кнопка избранного
    const favBtn = document.createElement('button');
    favBtn.className = 'card-fav-btn';
    favBtn.innerHTML = '☆';
    favBtn.title = 'Добавить в избранное';
    favBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavoriteMovie(movie.imdbID, movie.Title, favBtn);
    });
    
    // Проверяем избранное
    const favorites = JSON.parse(localStorage.getItem('moviePortal_favorites') || '[]');
    if (favorites.includes(movie.imdbID)) {
        favBtn.innerHTML = '★';
        favBtn.classList.add('active');
    }
    
    const genre = document.createElement('div');
    genre.className = 'movie-genre';
    genre.textContent = movie.Genre?.split(',')[0] || 'Фильм';
    
    card.append(img, favBtn, rating, title, year, genre);
    return card;
}

// Добавление/удаление из избранного
function toggleFavoriteMovie(id, title, btn) {
    let favorites = JSON.parse(localStorage.getItem('moviePortal_favorites') || '[]');
    
    if (favorites.includes(id)) {
        favorites = favorites.filter(favId => favId !== id);
        btn.innerHTML = '☆';
        btn.classList.remove('active');
        showNotification(`"${title}" удалён из избранного`);
    } else {
        favorites.push(id);
        btn.innerHTML = '★';
        btn.classList.add('active');
        showNotification(`"${title}" добавлен в избранное!`);
    }
    
    localStorage.setItem('moviePortal_favorites', JSON.stringify(favorites));
    updateFavoritesCount();
}

// Обновление счётчика избранного
function updateFavoritesCount() {
    const favorites = JSON.parse(localStorage.getItem('moviePortal_favorites') || '[]');
    const favCount = document.getElementById('fav-count');
    if (favCount) favCount.textContent = favorites.length;
}

// Уведомления
function showNotification(message) {
    let notification = document.querySelector('.notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.className = 'notification';
        document.body.appendChild(notification);
    }
    notification.textContent = message;
    setTimeout(() => notification.classList.add('show'), 10);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ========== ЗАГРУЗКА ТРЕНДОВ ==========
async function loadTrendingMovies() {
    const container = document.getElementById('trending-movies');
    if (!container) return;
    
    container.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Загружаем популярные фильмы...</div>';
    
    try {
        const randomQuery = TREND_SEARCHES[Math.floor(Math.random() * TREND_SEARCHES.length)];
        const response = await fetch(`${API_URL}?apikey=${API_KEY}&s=${randomQuery}&type=movie&page=1`);
        const data = await response.json();
        
        if (data.Response === 'True' && data.Search) {
            const movies = data.Search.slice(0, 8);
            container.innerHTML = '';
            
            for (const movie of movies) {
                const detailResponse = await fetch(`${API_URL}?apikey=${API_KEY}&i=${movie.imdbID}`);
                const detail = await detailResponse.json();
                if (detail.Response === 'True') {
                    container.appendChild(createMovieCard(detail));
                }
            }
        } else {
            container.innerHTML = '<div class="error">Не удалось загрузить тренды</div>';
        }
    } catch (error) {
        container.innerHTML = '<div class="error">Ошибка загрузки</div>';
    }
}

// ========== ЗАГРУЗКА ТОПОВЫХ ФИЛЬМОВ ==========
async function loadTopRatedMovies() {
    const container = document.getElementById('top-rated-movies');
    if (!container) return;
    
    const topQueries = ['dark knight', 'inception', 'interstellar', 'gladiator', 'matrix'];
    container.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Загружаем лучшие фильмы...</div>';
    
    try {
        container.innerHTML = '';
        
        for (const query of topQueries) {
            const response = await fetch(`${API_URL}?apikey=${API_KEY}&t=${encodeURIComponent(query)}`);
            const movie = await response.json();
            
            if (movie.Response === 'True') {
                container.appendChild(createMovieCard(movie));
            }
        }
    } catch (error) {
        console.error('Ошибка загрузки топовых фильмов:', error);
    }
}

// ========== ЗАГРУЗКА ПРЕДСТОЯЩИХ ФИЛЬМОВ ==========
async function loadUpcomingMovies() {
    const container = document.getElementById('upcoming-movies');
    if (!container) return;
    
    const nextYear = new Date().getFullYear() + 1;
    container.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Загружаем будущие премьеры...</div>';
    
    try {
        const response = await fetch(`${API_URL}?apikey=${API_KEY}&s=2025&type=movie`);
        const data = await response.json();
        
        if (data.Response === 'True' && data.Search) {
            container.innerHTML = '';
            const movies = data.Search.slice(0, 6);
            
            for (const movie of movies) {
                const detailResponse = await fetch(`${API_URL}?apikey=${API_KEY}&i=${movie.imdbID}`);
                const detail = await detailResponse.json();
                if (detail.Response === 'True') {
                    const card = createMovieCard(detail);
                    const badge = document.createElement('div');
                    badge.className = 'soon-badge';
                    badge.textContent = 'Скоро';
                    card.appendChild(badge);
                    container.appendChild(card);
                }
            }
        } else {
            container.innerHTML = '<div class="info-message">Информация о предстоящих фильмах скоро появится</div>';
        }
    } catch (error) {
        container.innerHTML = '<div class="error">Ошибка загрузки</div>';
    }
}

// ========== ПОИСК ПО ЖАНРАМ (ИСПРАВЛЕННЫЙ) ==========
async function searchByGenre(genre) {
    // Определяем язык
    let language = 'en';
    const langRu = document.querySelector('input[name="lang"][value="ru"]:checked');
    if (langRu) language = 'ru';
    
    const genreName = language === 'ru' ? GENRE_MAP_RU[genre] : GENRE_MAP_EN[genre];
    
    const resultsSection = document.getElementById('search-results');
    const moviesContainer = document.getElementById('movies-container');
    const resultsCount = document.getElementById('results-count');
    
    // Показываем секцию результатов
    resultsSection.style.display = 'block';
    document.querySelectorAll('.section:not(#search-results)').forEach(section => {
        section.style.display = 'none';
    });
    
    moviesContainer.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Поиск фильмов...</div>';
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    
    let movies = [];
    
    if (language === 'ru') {
        // РУССКИЙ ПОИСК через Kinopoisk
        if (typeof KINOPOISK_API_KEY !== 'undefined' && KINOPOISK_API_KEY && KINOPOISK_API_KEY !== 'ТВОЙ_КЛЮЧ_СЮДА') {
            try {
                const url = `https://kinopoiskapiunofficial.tech/api/v2.1/films/search-by-keyword?keyword=${encodeURIComponent(genreName)}&page=1`;
                const response = await fetch(url, {
                    headers: {
                        'X-API-KEY': KINOPOISK_API_KEY,
                        'Content-Type': 'application/json'
                    }
                });
                const data = await response.json();
                
                if (data.films && data.films.length > 0) {
                    movies = data.films.filter(f => f.type === 'FILM').slice(0, 12).map(film => ({
                        imdbID: `kp_${film.filmId}`,
                        Title: film.nameRu || film.nameEn || film.nameOriginal,
                        Year: film.year ? String(film.year) : 'N/A',
                        Poster: film.posterUrlPreview || 'https://via.placeholder.com/300x450?text=No+Poster',
                        imdbRating: film.ratingKinopoisk ? String(film.ratingKinopoisk) : 'N/A',
                        Genre: genreName
                    }));
                }
            } catch (error) {
                console.error('Kinopoisk ошибка:', error);
            }
        }
        
        if (movies.length === 0) {
            moviesContainer.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-tags"></i>
                    <h3>Фильмы в жанре "${genreName}" не найдены</h3>
                    <p>Попробуйте выбрать другой жанр или переключитесь на английский поиск</p>
                </div>
            `;
            if (resultsCount) resultsCount.textContent = 'Найдено: 0';
            return;
        }
    } else {
        // АНГЛИЙСКИЙ ПОИСК через OMDb
        try {
            const response = await fetch(`${API_URL}?apikey=${API_KEY}&s=${encodeURIComponent(genreName)}&type=movie&page=1`);
            const data = await response.json();
            
            if (data.Response === 'True' && data.Search) {
                const moviesList = data.Search.slice(0, 12);
                
                for (const movie of moviesList) {
                    const detailResponse = await fetch(`${API_URL}?apikey=${API_KEY}&i=${movie.imdbID}`);
                    const detail = await detailResponse.json();
                    if (detail.Response === 'True') {
                        movies.push(detail);
                    }
                }
            }
        } catch (error) {
            console.error('OMDb ошибка:', error);
        }
        
        if (movies.length === 0) {
            moviesContainer.innerHTML = `<div class="error">Фильмы в жанре "${genreName}" не найдены</div>`;
            if (resultsCount) resultsCount.textContent = 'Найдено: 0';
            return;
        }
    }
    
    if (resultsCount) resultsCount.textContent = `Найдено: ${movies.length}`;
    moviesContainer.innerHTML = '';
    movies.forEach(movie => moviesContainer.appendChild(createMovieCard(movie)));
}

// ========== КНОПКА ВЕРНУТЬСЯ НА ГЛАВНУЮ ==========
function resetToMain() {
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        section.style.display = '';
    });
    document.getElementById('search-results').style.display = 'none';
    
    // Прокрутка к верху
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ========== НАВИГАЦИЯ ==========
function setupNavigation() {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const href = link.getAttribute('href');
            
            if (href === '#') {
                resetToMain();
            } else {
                resetToMain();
                const targetId = href.substring(1);
                const targetSection = document.getElementById(targetId);
                if (targetSection) {
                    targetSection.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });
}

// ========== КНОПКИ ЖАНРОВ ==========
function setupGenreButtons() {
    document.querySelectorAll('.genre-btn').forEach(btn => {
        btn.removeEventListener('click', btn._listener);
        
        const handler = async () => {
            document.querySelectorAll('.genre-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            await searchByGenre(btn.dataset.genre);
        };
        
        btn._listener = handler;
        btn.addEventListener('click', handler);
    });
}

// ========== ТЕМА ==========
function setupThemeToggle() {
    const themeBtn = document.getElementById('theme-toggle');
    if (!themeBtn) return;
    
    const icon = themeBtn.querySelector('i');
    const savedTheme = localStorage.getItem('kinoportal-theme') || 'dark';
    
    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
        icon.className = 'fas fa-sun';
    }
    
    themeBtn.addEventListener('click', () => {
        document.body.classList.toggle('light-theme');
        if (document.body.classList.contains('light-theme')) {
            localStorage.setItem('kinoportal-theme', 'light');
            icon.className = 'fas fa-sun';
        } else {
            localStorage.setItem('kinoportal-theme', 'dark');
            icon.className = 'fas fa-moon';
        }
    });
}

// ========== ИНИЦИАЛИЗАЦИЯ ==========
document.addEventListener('DOMContentLoaded', () => {
    updateFavoritesCount();
    loadTrendingMovies();
    loadTopRatedMovies();
    loadUpcomingMovies();
    setupGenreButtons();
    setupThemeToggle();
    setupNavigation();
    
    setInterval(updateFavoritesCount, 5000);
    
    // Sticky эффект
    window.addEventListener('scroll', function() {
        const searchSection = document.querySelector('.search-section');
        if (searchSection && window.scrollY > 100) {
            searchSection.classList.add('sticky-scrolled');
        } else if (searchSection) {
            searchSection.classList.remove('sticky-scrolled');
        }
    });
});
