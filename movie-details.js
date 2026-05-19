const API_KEY = 'b1325fa0';
const KINOPOISK_API_KEY = '06a71ea8-632e-4664-a88d-3f96da9d05ee';
const POINTS_KEY = 'user_points';
const HIGH_SCORE_KEY = 'user_high_score';
const RESET_HISTORY_KEY = 'reset_history';

// Получаем ID фильма из URL
const urlParams = new URLSearchParams(window.location.search);
const movieId = urlParams.get('id');

// Определяем тип ID (русский или английский)
function isRussianMovie(id) {
    return id && id.startsWith('kp_');
}

function getNumericId(id) {
    return id.replace('kp_', '');
}

// ===== СИСТЕМА ЗВАНИЙ =====
const RANKS = [
    { name: '🍿 Новичок', points: 0 },
    { name: '🎬 Зритель', points: 10 },
    { name: '🎭 Любитель кино', points: 25 },
    { name: '⭐ Знаток', points: 50 },
    { name: '👑 Кинокритик', points: 100 },
    { name: '🎥 Кинолегенда', points: 200 }
];

function getPoints() {
    const points = localStorage.getItem(POINTS_KEY);
    return points ? parseInt(points) : 0;
}

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

function getHighScore() {
    const highScore = localStorage.getItem(HIGH_SCORE_KEY);
    return highScore ? parseInt(highScore) : 0;
}

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

function addPoints(amount = 1) {
    let currentPoints = getPoints();
    const oldRank = getRankByPoints(currentPoints);
    
    currentPoints += amount;
    localStorage.setItem(POINTS_KEY, currentPoints);
    
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

// ===== ЗАГРУЗКА РУССКОГО ФИЛЬМА ЧЕРЕЗ KINOPOISK (ИСПРАВЛЕНА) =====
async function loadRussianMovieDetails(kpId) {
    const numericId = getNumericId(kpId);
    
    try {
        // Используем другой эндпоинт API
        const url = `https://kinopoiskapiunofficial.tech/api/v2.2/films/${numericId}`;
        const response = await fetch(url, {
            headers: {
                'X-API-KEY': KINOPOISK_API_KEY,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error('Kinopoisk API error');
        }
        
        const movie = await response.json();
        console.log('Kinopoisk данные:', movie);
        
        // Название фильма
        const movieTitle = movie.nameRu || movie.nameEn || movie.nameOriginal || 'Без названия';
        document.title = `${movieTitle} - Кинопортал`;
        document.getElementById('movie-title').textContent = movieTitle;
        
        // Постер
        const poster = document.getElementById('detail-poster');
        poster.src = movie.posterUrl || movie.posterUrlPreview || 'https://via.placeholder.com/300x450?text=No+Poster';
        
        poster.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            addPoints(1);
        });
        
        // Год
        const year = movie.year || movie.yearStart || 'N/A';
        document.getElementById('detail-year').textContent = `Год: ${year}`;
        
        // Жанры
        let genres = 'Не указан';
        if (movie.genres && movie.genres.length > 0) {
            genres = movie.genres.map(g => g.genre).join(', ');
        }
        document.getElementById('genres').textContent = `Жанр: ${genres}`;
        
        // Длительность
        let runtime = 'N/A';
        if (movie.filmLength) runtime = `${movie.filmLength} мин`;
        else if (movie.runtime) runtime = `${movie.runtime} мин`;
        document.getElementById('runtime').textContent = `Длительность: ${runtime}`;
        
        // Описание
        const description = movie.description || movie.shortDescription || movie.slogan || 'Описание отсутствует';
        document.getElementById('detail-overview').textContent = description;
        
        // Дата выхода
        document.getElementById('released').textContent = year;
        
        // Рейтинг
        const rating = movie.ratingKinopoisk || movie.ratingImdb || 'N/A';
        document.getElementById('imdb-rating').textContent = `⭐ ${rating} (Кинопоиск)`;
        document.getElementById('rating').innerHTML = `⭐ ${rating}`;
        
        // Страна
        let countries = 'N/A';
        if (movie.countries && movie.countries.length > 0) {
            countries = movie.countries.map(c => c.country).join(', ');
        }
        document.getElementById('country').textContent = countries;
        
        // Режиссёр
        let director = 'N/A';
        if (movie.producers && movie.producers.length > 0) {
            director = movie.producers[0];
        } else if (movie.directors && movie.directors.length > 0) {
            director = movie.directors[0];
        }
        document.getElementById('director').textContent = director;
        
        // Актёры
        let actors = 'N/A';
        if (movie.persons && movie.persons.length > 0) {
            const actorsList = movie.persons
                .filter(p => p.profession === 'ACTOR' || p.professionKey === 'ACTOR')
                .slice(0, 5)
                .map(p => p.nameRu || p.nameEn)
                .join(', ');
            if (actorsList) actors = actorsList;
        }
        document.getElementById('actors').textContent = actors;
        
        document.getElementById('awards').textContent = movie.awards || 'Информация о наградах отсутствует';
        
        // Избранное
        const favorites = JSON.parse(localStorage.getItem('moviePortal_favorites') || '[]');
        const favBtn = document.getElementById('favorite-btn');
        const filmId = `kp_${numericId}`;
        
        if (favorites.includes(filmId)) {
            favBtn.innerHTML = '★ Удалить из избранного';
            favBtn.classList.add('active');
        } else {
            favBtn.innerHTML = '☆ Добавить в избранное';
            favBtn.classList.remove('active');
        }
        
        favBtn.onclick = () => {
            const favoritesNow = JSON.parse(localStorage.getItem('moviePortal_favorites') || '[]');
            const index = favoritesNow.indexOf(filmId);
            
            if (index === -1) {
                favoritesNow.push(filmId);
                favBtn.innerHTML = '★ Удалить из избранного';
                favBtn.classList.add('active');
                showNotification(`"${movieTitle}" добавлен в избранное`);
            } else {
                favoritesNow.splice(index, 1);
                favBtn.innerHTML = '☆ Добавить в избранное';
                favBtn.classList.remove('active');
                showNotification(`"${movieTitle}" удален из избранного`);
            }
            
            localStorage.setItem('moviePortal_favorites', JSON.stringify(favoritesNow));
        };
        
        // Трейлеры
        if (window.initTrailerSection) {
            setTimeout(() => window.initTrailerSection(movieTitle), 500);
        }
        
    } catch (error) {
        console.error('Ошибка загрузки русского фильма:', error);
        document.getElementById('movie-title').textContent = 'Ошибка загрузки';
        document.getElementById('detail-overview').textContent = 'Не удалось загрузить данные. Возможно, фильм не найден в базе Кинопоиска.';
        showNotification('Ошибка загрузки русского фильма. Проверьте API ключ.');
    }
}

// ===== ЗАГРУЗКА АНГЛИЙСКОГО ФИЛЬМА =====
async function loadEnglishMovieDetails(imdbId) {
    try {
        const response = await fetch(`https://www.omdbapi.com/?apikey=${API_KEY}&i=${imdbId}&plot=full`);
        const movie = await response.json();

        if (movie.Response === 'True') {
            document.title = `${movie.Title} - Кинопортал`;
            document.getElementById('movie-title').textContent = movie.Title;
            
            const poster = document.getElementById('detail-poster');
            poster.src = movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/300x450?text=No+Poster';
            
            poster.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                addPoints(1);
            });
            
            document.getElementById('detail-year').textContent = `Год: ${movie.Year || 'N/A'}`;
            document.getElementById('genres').textContent = `Жанр: ${movie.Genre || 'Не указан'}`;
            document.getElementById('runtime').textContent = `Длительность: ${movie.Runtime || 'N/A'}`;
            document.getElementById('detail-overview').textContent = movie.Plot || 'Описание отсутствует';
            document.getElementById('released').textContent = movie.Released || 'N/A';
            document.getElementById('imdb-rating').textContent = `⭐ ${movie.imdbRating || 'N/A'} (${movie.imdbVotes || 0} голосов)`;
            document.getElementById('director').textContent = movie.Director || 'N/A';
            document.getElementById('actors').textContent = movie.Actors || 'N/A';
            document.getElementById('awards').textContent = movie.Awards || 'N/A';
            document.getElementById('country').textContent = movie.Country || 'N/A';
            document.getElementById('rating').innerHTML = `⭐ ${movie.imdbRating || 'N/A'}`;
            
            const favorites = JSON.parse(localStorage.getItem('moviePortal_favorites') || '[]');
            const favBtn = document.getElementById('favorite-btn');
            
            if (favorites.includes(imdbId)) {
                favBtn.innerHTML = '★ Удалить из избранного';
                favBtn.classList.add('active');
            } else {
                favBtn.innerHTML = '☆ Добавить в избранное';
                favBtn.classList.remove('active');
            }
            
            favBtn.onclick = () => {
                const favoritesNow = JSON.parse(localStorage.getItem('moviePortal_favorites') || '[]');
                const index = favoritesNow.indexOf(imdbId);
                
                if (index === -1) {
                    favoritesNow.push(imdbId);
                    favBtn.innerHTML = '★ Удалить из избранного';
                    favBtn.classList.add('active');
                    showNotification(`"${movie.Title}" добавлен в избранное`);
                } else {
                    favoritesNow.splice(index, 1);
                    favBtn.innerHTML = '☆ Добавить в избранное';
                    favBtn.classList.remove('active');
                    showNotification(`"${movie.Title}" удален из избранного`);
                }
                
                localStorage.setItem('moviePortal_favorites', JSON.stringify(favoritesNow));
            };
            
            if (window.initTrailerSection) {
                setTimeout(() => window.initTrailerSection(movie.Title), 500);
            }
            
        } else {
            document.getElementById('movie-title').textContent = 'Фильм не найден';
            document.getElementById('detail-overview').textContent = movie.Error || 'Фильм не найден в базе';
        }
    } catch (error) {
        console.error('Ошибка загрузки:', error);
        document.getElementById('movie-title').textContent = 'Ошибка загрузки';
        document.getElementById('detail-overview').textContent = 'Проверьте подключение к интернету';
    }
}

// ===== ГЛАВНАЯ ФУНКЦИЯ =====
async function loadMovieDetails() {
    if (!movieId) {
        document.getElementById('movie-title').textContent = 'ID фильма не указан';
        return;
    }
    
    console.log('Загрузка фильма с ID:', movieId);
    
    if (isRussianMovie(movieId)) {
        await loadRussianMovieDetails(movieId);
    } else {
        await loadEnglishMovieDetails(movieId);
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

// ===== ЗАПУСК =====
document.addEventListener('DOMContentLoaded', () => {
    console.log('Страница деталей загружена');
    updatePointsUI();
    setupThemeToggle();
    loadMovieDetails();
    
    const resetBtn = document.getElementById('reset-points-btn');
    if (resetBtn) {
        resetBtn.addEventListener('click', resetPoints);
        resetBtn.addEventListener('dblclick', (e) => {
            e.stopPropagation();
            showResetHistory();
        });
    }
    
    window.addEventListener('focus', updatePointsUI);
});
