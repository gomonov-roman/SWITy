const API_KEY = 'b1325fa0';
const STORAGE_KEY = 'moviePortal_favorites';
const POINTS_KEY = 'user_points';
const HIGH_SCORE_KEY = 'user_high_score';
const RESET_HISTORY_KEY = 'reset_history';

// ===== СИСТЕМА ЗВАНИЙ =====
const RANKS = [
    { name: '🍿 Новичок', points: 0 },
    { name: '🎬 Зритель', points: 10 },
    { name: '🎭 Любитель кино', points: 25 },
    { name: '⭐ Знаток', points: 50 },
    { name: '👑 Кинокритик', points: 100 },
    { name: '🎥 Кинолегенда', points: 200 }
];

// Получить текущие очки
function getPoints() {
    const points = localStorage.getItem(POINTS_KEY);
    return points ? parseInt(points) : 0;
}

// Сохранить очки
function savePoints(points) {
    localStorage.setItem(POINTS_KEY, points);
}

// Получить звание по очкам
function getRankByPoints(points) {
    let currentRank = RANKS[0];
    for (let i = RANKS.length - 1; i >= 0; i--) {
        if (points >= RANKS[i].points) {
            currentRank = RANKS[i];
            break;
        }
    }
    return currentRank;
}

// Получить рекорд
function getHighScore() {
    const highScore = localStorage.getItem(HIGH_SCORE_KEY);
    return highScore ? parseInt(highScore) : 0;
}

// Обновить рекорд
function updateHighScore(currentPoints) {
    const highScore = getHighScore();
    if (currentPoints > highScore) {
        localStorage.setItem(HIGH_SCORE_KEY, currentPoints);
        const highScoreElement = document.getElementById('high-score');
        if (highScoreElement) highScoreElement.textContent = currentPoints;
        showNotification(`🏆 НОВЫЙ РЕКОРД! ${currentPoints} очков! 🏆`);
        return true;
    }
    return false;
}

// Сохранить сброс в историю
function saveResetToHistory(points, rank) {
    const history = JSON.parse(localStorage.getItem(RESET_HISTORY_KEY) || '[]');
    history.unshift({
        points: points,
        rank: rank,
        date: new Date().toLocaleString()
    });
    while (history.length > 10) history.pop();
    localStorage.setItem(RESET_HISTORY_KEY, JSON.stringify(history));
}

// Показать историю сбросов
function showResetHistory() {
    const history = JSON.parse(localStorage.getItem(RESET_HISTORY_KEY) || '[]');
    
    if (history.length === 0) {
        showNotification('История сбросов пуста');
        return;
    }
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="history-modal">
            <h3><i class="fas fa-history"></i> История сбросов</h3>
            <div class="history-list">
                ${history.map(item => `
                    <div class="history-item">
                        <div>
                            <div class="history-points">${item.points} очков</div>
                            <div class="history-rank">${item.rank}</div>
                        </div>
                        <div class="history-date">${item.date}</div>
                    </div>
                `).join('')}
            </div>
            <button class="modal-close">Закрыть</button>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.querySelector('.modal-close').onclick = () => modal.remove();
    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
}

// Сброс очков
function resetPoints() {
    const currentPoints = getPoints();
    const currentRank = getRankByPoints(currentPoints);
    
    if (currentPoints === 0) {
        showNotification('У вас уже 0 очков!');
        return;
    }
    
    if (confirm(`Вы действительно хотите сбросить ${currentPoints} очков?\nЗвание "${currentRank.name}" будет потеряно, но сохранится в истории.`)) {
        saveResetToHistory(currentPoints, currentRank.name);
        localStorage.setItem(POINTS_KEY, '0');
        updatePointsUI();
        showNotification(`Очки сброшены! Вы начинали с ${currentPoints} очков. Набирайте новые!`);
    }
}

// Обновить UI очков и звания
function updatePointsUI() {
    const points = getPoints();
    const rank = getRankByPoints(points);
    
    const pointsElement = document.getElementById('user-points');
    const rankElement = document.getElementById('user-rank');
    const highScoreElement = document.getElementById('high-score');
    
    if (pointsElement) pointsElement.textContent = points;
    if (rankElement) rankElement.textContent = rank.name;
    
    const highScore = getHighScore();
    if (highScoreElement) highScoreElement.textContent = highScore;
    
    updateHighScore(points);
}

// Добавить очки
function addPoints(amount = 1) {
    let currentPoints = getPoints();
    const oldRank = getRankByPoints(currentPoints);
    
    currentPoints += amount;
    savePoints(currentPoints);
    
    const newRank = getRankByPoints(currentPoints);
    
    const pointsElement = document.getElementById('user-points');
    if (pointsElement) {
        pointsElement.classList.add('points-pop');
        setTimeout(() => pointsElement.classList.remove('points-pop'), 300);
    }
    
    if (newRank.name !== oldRank.name) {
        const rankElement = document.getElementById('user-rank');
        if (rankElement) {
            rankElement.classList.add('rank-up');
            setTimeout(() => rankElement.classList.remove('rank-up'), 500);
        }
        showNotification(`🎉 ПОЗДРАВЛЯЕМ! Новое звание: ${newRank.name} 🎉`);
    }
    
    updatePointsUI();
    showNotification(`+1 очко! Теперь у вас ${currentPoints} очков`);
    return currentPoints;
}

// ===== КЛЮЧ KINOPOISK =====
const KINOPOISK_API_KEY = '06a71ea8-632e-4664-a88d-3f96da9d05ee';

// ===== ФУНКЦИЯ СОЗДАНИЯ КАРТОЧКИ =====
function createMovieCard(movie) {
    const card = document.createElement('a');
    card.className = 'movie-card';
    card.href = `movie-details.html?id=${movie.imdbID}`;
    
    const img = document.createElement('img');
    img.className = 'movie-poster';
    img.src = (movie.Poster && movie.Poster !== 'N/A') ? movie.Poster : 'https://via.placeholder.com/300x450?text=No+Poster';
    img.alt = movie.Title || 'Без названия';
    img.loading = 'lazy';
    img.onerror = function() { this.src = 'https://via.placeholder.com/300x450?text=Poster+Error'; };
    img.style.cursor = 'pointer';
    img.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        addPoints(1);
    });
    
    const title = document.createElement('h3');
    title.className = 'movie-title';
    title.textContent = movie.Title || 'Без названия';
    
    const year = document.createElement('div');
    year.className = 'movie-year';
    year.textContent = movie.Year || 'Год неизвестен';
    
    const rating = document.createElement('div');
    rating.className = 'movie-rating';
    rating.innerHTML = `<i class="fas fa-star"></i> ${movie.imdbRating || 'N/A'}`;
    
    const favBtn = document.createElement('button');
    favBtn.className = 'card-fav-btn';
    favBtn.innerHTML = '☆';
    favBtn.title = 'Добавить в избранное';
    favBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite(movie.imdbID, favBtn);
    });
    
    if (getFavorites().includes(movie.imdbID)) {
        favBtn.innerHTML = '★';
        favBtn.classList.add('active');
    }
    
    const genre = document.createElement('div');
    genre.className = 'movie-genre';
    genre.textContent = (movie.Genre || 'Фильм').split(',')[0];
    
    card.append(img, favBtn, rating, title, year, genre);
    return card;
}

function getFavorites() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

function toggleFavorite(movieId, button) {
    const favorites = getFavorites();
    const index = favorites.indexOf(movieId);
    
    if (index === -1) {
        favorites.push(movieId);
        button.innerHTML = '★';
        button.classList.add('active');
        showNotification('Фильм добавлен в избранное!');
    } else {
        favorites.splice(index, 1);
        button.innerHTML = '☆';
        button.classList.remove('active');
        showNotification('Фильм удален из избранного');
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    updateFavoritesCount();
}

// ===== ПОИСК НА РУССКОМ =====
async function searchRussianKinopoisk(query, type) {
    if (!KINOPOISK_API_KEY || KINOPOISK_API_KEY === 'ТВОЙ_КЛЮЧ_СЮДА') {
        console.error('❌ API ключ Kinopoisk не установлен!');
        return [];
    }
    
    const url = `https://kinopoiskapiunofficial.tech/api/v2.1/films/search-by-keyword?keyword=${encodeURIComponent(query)}&page=1`;
    
    try {
        const response = await fetch(url, {
            headers: {
                'X-API-KEY': KINOPOISK_API_KEY,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) return [];
        
        const data = await response.json();
        if (!data.films || data.films.length === 0) return [];
        
        let films = data.films;
        if (type === 'movie') films = films.filter(f => f.type === 'FILM');
        else if (type === 'series') films = films.filter(f => f.type === 'TV_SERIES');
        
        return films.slice(0, 20).map(film => ({
            imdbID: `kp_${film.filmId}`,
            Title: film.nameRu || film.nameEn || film.nameOriginal || 'Без названия',
            Year: film.year ? String(film.year) : 'N/A',
            Poster: film.posterUrlPreview || 'https://via.placeholder.com/300x450?text=No+Poster',
            imdbRating: film.ratingKinopoisk ? String(film.ratingKinopoisk) : 'N/A',
            Genre: film.genres?.map(g => g.genre).join(', ') || 'Фильм'
        }));
        
    } catch (error) {
        console.error('Ошибка Kinopoisk API:', error);
        return [];
    }
}

// ===== ПОИСК НА АНГЛИЙСКОМ =====
async function searchEnglishOMDb(query, type) {
    try {
        let url = `https://www.omdbapi.com/?apikey=${API_KEY}&s=${encodeURIComponent(query)}`;
        if (type) url += `&type=${type}`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.Response === 'False') return [];
        
        const detailedMovies = [];
        for (const movie of data.Search.slice(0, 12)) {
            const detailResponse = await fetch(`https://www.omdbapi.com/?apikey=${API_KEY}&i=${movie.imdbID}`);
            const detail = await detailResponse.json();
            if (detail.Response === 'True') {
                detailedMovies.push(detail);
            }
        }
        return detailedMovies;
        
    } catch (error) {
        console.error('Ошибка OMDb API:', error);
        return [];
    }
}

// ===== ЗАГРУЗКА ТРЕНДОВ =====
async function loadTrendingMovies() {
    const container = document.getElementById('trending-movies');
    if (!container) return;
    
    container.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Загружаем популярные фильмы...</div>';
    
    try {
        const response = await fetch(`https://www.omdbapi.com/?apikey=${API_KEY}&s=marvel&type=movie&page=1`);
        const data = await response.json();
        
        if (data.Response === 'True' && data.Search) {
            const movies = data.Search.slice(0, 8);
            container.innerHTML = '';
            
            for (const movie of movies) {
                const detailResponse = await fetch(`https://www.omdbapi.com/?apikey=${API_KEY}&i=${movie.imdbID}`);
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

// ===== ЗАГРУЗКА ТОПОВЫХ ФИЛЬМОВ =====
async function loadTopRatedMovies() {
    const container = document.getElementById('top-rated-movies');
    if (!container) return;
    
    const topQueries = ['dark knight', 'inception', 'interstellar', 'gladiator', 'matrix'];
    container.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Загружаем лучшие фильмы...</div>';
    
    try {
        container.innerHTML = '';
        
        for (const query of topQueries) {
            const response = await fetch(`https://www.omdbapi.com/?apikey=${API_KEY}&t=${encodeURIComponent(query)}`);
            const movie = await response.json();
            
            if (movie.Response === 'True') {
                container.appendChild(createMovieCard(movie));
            }
        }
    } catch (error) {
        console.error('Ошибка загрузки топовых фильмов:', error);
    }
}

// ===== ЗАГРУЗКА ПРЕДСТОЯЩИХ ФИЛЬМОВ =====
async function loadUpcomingMovies() {
    const container = document.getElementById('upcoming-movies');
    if (!container) return;
    
    container.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Загружаем будущие премьеры...</div>';
    
    try {
        const response = await fetch(`https://www.omdbapi.com/?apikey=${API_KEY}&s=2025&type=movie`);
        const data = await response.json();
        
        if (data.Response === 'True' && data.Search) {
            container.innerHTML = '';
            const movies = data.Search.slice(0, 6);
            
            for (const movie of movies) {
                const detailResponse = await fetch(`https://www.omdbapi.com/?apikey=${API_KEY}&i=${movie.imdbID}`);
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

// ===== ПОИСК ПО ЖАНРАМ =====
async function searchByGenre(genre) {
    let language = 'en';
    const langRu = document.querySelector('input[name="lang"][value="ru"]:checked');
    if (langRu) language = 'ru';
    
    const genreMap = {
        'action': language === 'ru' ? 'боевик' : 'action',
        'comedy': language === 'ru' ? 'комедия' : 'comedy',
        'drama': language === 'ru' ? 'драма' : 'drama',
        'horror': language === 'ru' ? 'ужасы' : 'horror',
        'sci-fi': language === 'ru' ? 'фантастика' : 'sci-fi',
        'fantasy': language === 'ru' ? 'фэнтези' : 'fantasy',
        'thriller': language === 'ru' ? 'триллер' : 'thriller',
        'romance': language === 'ru' ? 'романтика' : 'romance',
        'animation': language === 'ru' ? 'мультфильм' : 'animation',
        'mystery': language === 'ru' ? 'детектив' : 'mystery'
    };
    
    const genreName = genreMap[genre] || genre;
    
    const resultsSection = document.getElementById('search-results');
    const moviesContainer = document.getElementById('movies-container');
    const resultsCount = document.getElementById('results-count');
    
    resultsSection.style.display = 'block';
    document.querySelectorAll('.section:not(#search-results)').forEach(section => {
        section.style.display = 'none';
    });
    
    moviesContainer.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Поиск фильмов...</div>';
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    
    let movies = [];
    
    if (language === 'ru') {
        movies = await searchRussianKinopoisk(genreName, 'movie');
    } else {
        const response = await fetch(`https://www.omdbapi.com/?apikey=${API_KEY}&s=${encodeURIComponent(genreName)}&type=movie&page=1`);
        const data = await response.json();
        
        if (data.Response === 'True' && data.Search) {
            for (const movie of data.Search.slice(0, 12)) {
                const detailResponse = await fetch(`https://www.omdbapi.com/?apikey=${API_KEY}&i=${movie.imdbID}`);
                const detail = await detailResponse.json();
                if (detail.Response === 'True') {
                    movies.push(detail);
                }
            }
        }
    }
    
    if (movies.length === 0) {
        moviesContainer.innerHTML = `<div class="error">Фильмы в жанре "${genreName}" не найдены</div>`;
        if (resultsCount) resultsCount.textContent = 'Найдено: 0';
        return;
    }
    
    if (resultsCount) resultsCount.textContent = `Найдено: ${movies.length}`;
    moviesContainer.innerHTML = '';
    movies.forEach(movie => moviesContainer.appendChild(createMovieCard(movie)));
}

// ===== ПОИСК АКТЕРОВ =====
async function searchByActor(actorName, language = 'en') {
    const resultsSection = document.getElementById('search-results');
    const resultsContainer = document.getElementById('movies-container');
    const resultsCount = document.getElementById('results-count');
    
    if (resultsSection) {
        resultsSection.style.display = 'block';
        document.querySelectorAll('.section:not(#search-results)').forEach(section => {
            section.style.display = 'none';
        });
    }
    
    if (resultsContainer) {
        resultsContainer.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Поиск фильмов с участием актера...</div>';
    }
    
    try {
        const url = `https://www.omdbapi.com/?apikey=${API_KEY}&s=${encodeURIComponent(actorName)}&type=movie&page=1`;
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.Response === 'False') {
            if (resultsContainer) {
                resultsContainer.innerHTML = `<div class="error">По запросу "${actorName}" ничего не найдено</div>`;
            }
            if (resultsCount) resultsCount.textContent = 'Найдено: 0';
            return;
        }
        
        const moviesWithActor = [];
        
        for (const movie of data.Search.slice(0, 15)) {
            const detailResponse = await fetch(`https://www.omdbapi.com/?apikey=${API_KEY}&i=${movie.imdbID}`);
            const detail = await detailResponse.json();
            
            if (detail.Response === 'True' && detail.Actors) {
                const actorsLower = detail.Actors.toLowerCase();
                const actorLower = actorName.toLowerCase();
                
                if (actorsLower.includes(actorLower)) {
                    moviesWithActor.push(detail);
                }
            }
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        if (moviesWithActor.length === 0) {
            if (resultsContainer) {
                resultsContainer.innerHTML = `<div class="error">Фильмы с участием "${actorName}" не найдены</div>`;
            }
            if (resultsCount) resultsCount.textContent = 'Найдено: 0';
            return;
        }
        
        if (resultsCount) resultsCount.textContent = `Найдено фильмов: ${moviesWithActor.length}`;
        if (resultsContainer) {
            resultsContainer.innerHTML = '';
            moviesWithActor.forEach(movie => {
                resultsContainer.appendChild(createMovieCard(movie));
            });
        }
        
    } catch (error) {
        console.error('Ошибка поиска актера:', error);
        if (resultsContainer) {
            resultsContainer.innerHTML = `<div class="error">Ошибка сети: ${error.message}</div>`;
        }
    }
}

// ===== ГЛАВНАЯ ФУНКЦИЯ ПОИСКА =====
async function searchMovies(query, type = '', language = 'en') {
    const resultsSection = document.getElementById('search-results');
    const resultsContainer = document.getElementById('movies-container');
    const resultsCount = document.getElementById('results-count');
    
    if (resultsSection) {
        resultsSection.style.display = 'block';
        document.querySelectorAll('.section:not(#search-results)').forEach(section => {
            section.style.display = 'none';
        });
    }
    
    if (resultsContainer) {
        resultsContainer.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Ищем фильмы...</div>';
    }
    
    let movies = [];
    
    if (language === 'ru') {
        movies = await searchRussianKinopoisk(query, type);
    } else {
        movies = await searchEnglishOMDb(query, type);
    }
    
    if (movies.length === 0) {
        if (resultsContainer) {
            resultsContainer.innerHTML = `<div class="error">По запросу "${query}" ничего не найдено</div>`;
        }
        if (resultsCount) resultsCount.textContent = 'Найдено: 0';
        return;
    }
    
    if (resultsCount) resultsCount.textContent = `Найдено: ${movies.length}`;
    if (resultsContainer) {
        resultsContainer.innerHTML = '';
        movies.forEach(movie => {
            resultsContainer.appendChild(createMovieCard(movie));
        });
    }
}

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
        setTimeout(() => {
            if (notification.parentNode) notification.remove();
        }, 300);
    }, 3000);
}

function updateFavoritesCount() {
    const favorites = getFavorites();
    const favCountElement = document.getElementById('fav-count');
    if (favCountElement) {
        favCountElement.textContent = favorites.length;
    }
}

// ===== ТЕМА =====
function setupThemeToggle() {
    const themeBtn = document.getElementById('theme-toggle');
    if (!themeBtn) return;
    
    const icon = themeBtn.querySelector('i');
    const savedTheme = localStorage.getItem('kinoportal-theme') || 'dark';
    
    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
        if (icon) icon.className = 'fas fa-sun';
    }
    
    themeBtn.addEventListener('click', () => {
        document.body.classList.toggle('light-theme');
        if (document.body.classList.contains('light-theme')) {
            localStorage.setItem('kinoportal-theme', 'light');
            if (icon) icon.className = 'fas fa-sun';
        } else {
            localStorage.setItem('kinoportal-theme', 'dark');
            if (icon) icon.className = 'fas fa-moon';
        }
    });
}

// ===== ИНИЦИАЛИЗАЦИЯ =====
document.addEventListener('DOMContentLoaded', () => {
    console.log('Сайт загружен!');
    
    updatePointsUI();
    updateFavoritesCount();
    loadTrendingMovies();
    loadTopRatedMovies();
    loadUpcomingMovies();
    setupThemeToggle();
    
    // Кнопка сброса очков
    const resetBtn = document.getElementById('reset-points-btn');
    if (resetBtn) {
        resetBtn.addEventListener('click', resetPoints);
        resetBtn.addEventListener('dblclick', (e) => {
            e.stopPropagation();
            showResetHistory();
        });
    }
    
    // Кнопки жанров
    document.querySelectorAll('.genre-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            document.querySelectorAll('.genre-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            await searchByGenre(btn.dataset.genre);
        });
    });
    
    // Навигация
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const href = link.getAttribute('href');
            if (href === '#') {
                location.reload();
            } else {
                const targetId = href.substring(1);
                const targetSection = document.getElementById(targetId);
                if (targetSection) {
                    targetSection.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });
    
    // Форма поиска
    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('search-input');
    
    if (searchForm && searchInput) {
        searchForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const query = searchInput.value.trim();
            if (!query) return;
            
            const type = document.querySelector('input[name="type"]:checked')?.value || '';
            let language = 'en';
            const langRu = document.querySelector('input[name="lang"][value="ru"]:checked');
            if (langRu) language = 'ru';
            
            const searchType = document.querySelector('input[name="search_type"]:checked')?.value || 'movie';
            
            if (searchType === 'actor') {
                await searchByActor(query, language);
            } else {
                await searchMovies(query, type, language);
            }
            
            document.getElementById('search-results')?.scrollIntoView({ behavior: 'smooth' });
        });
    }
    
    setInterval(updateFavoritesCount, 5000);
});

window.searchMovies = searchMovies;
window.updateFavoritesCount = updateFavoritesCount;
window.showNotification = showNotification;
window.createMovieCard = createMovieCard;
window.addPoints = addPoints;
