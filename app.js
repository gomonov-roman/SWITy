const API_KEY = 'b1325fa0';
const STORAGE_KEY = 'moviePortal_favorites';

// ========== КЛЮЧ KINOPOISK (ЗАМЕНИ НА СВОЙ!) ==========
const KINOPOISK_API_KEY = '06a71ea8-632e-4664-a88d-3f96da9d05ee'; // <--- ВСТАВЬ СВОЙ КЛЮЧ!

// ========== ФУНКЦИЯ СОЗДАНИЯ КАРТОЧКИ ==========
function createMovieCard(movie) {
    const card = document.createElement('a');
    card.className = 'movie-card';
    card.href = `movie-details.html?id=${movie.imdbID}`;
    
    const img = document.createElement('img');
    img.className = 'movie-poster';
    img.src = (movie.Poster !== 'N/A' && movie.Poster) ? movie.Poster : 'https://via.placeholder.com/300x450?text=No+Poster';
    img.alt = movie.Title || 'Без названия';
    img.loading = 'lazy';
    img.onerror = function() { this.src = 'https://via.placeholder.com/300x450?text=Poster+Error'; };
    
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

// ========== ПОИСК НА РУССКОМ ЧЕРЕЗ KINOPOISK ==========
async function searchRussianKinopoisk(query, type) {
    console.log('Поиск на русском:', query, 'Тип:', type);
    
    // Проверяем, есть ли ключ
    if (!KINOPOISK_API_KEY || KINOPOISK_API_KEY === 'ТВОЙ_КЛЮЧ_СЮДА') {
        console.error('❌ API ключ Kinopoisk не установлен!');
        showNotification('⚠️ Сначала установите Kinopoisk API ключ в файле app.js');
        return [];
    }
    
    const url = `https://kinopoiskapiunofficial.tech/api/v2.1/films/search-by-keyword?keyword=${encodeURIComponent(query)}&page=1`;
    
    try {
        console.log('Запрос к Kinopoisk API...');
        const response = await fetch(url, {
            headers: {
                'X-API-KEY': KINOPOISK_API_KEY,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('Статус ответа:', response.status);
        
        if (!response.ok) {
            console.error('Ошибка API:', response.status);
            return [];
        }
        
        const data = await response.json();
        console.log('Ответ Kinopoisk:', data);
        
        if (!data.films || data.films.length === 0) {
            console.log('Фильмы не найдены');
            return [];
        }
        
        // Фильтруем по типу
        let films = data.films;
        if (type === 'movie') {
            films = films.filter(f => f.type === 'FILM');
        } else if (type === 'series') {
            films = films.filter(f => f.type === 'TV_SERIES');
        }
        
        // Конвертируем в формат createMovieCard
        const results = films.slice(0, 20).map(film => ({
            imdbID: `kp_${film.filmId}`,
            Title: film.nameRu || film.nameEn || film.nameOriginal || 'Без названия',
            Year: film.year ? String(film.year) : 'N/A',
            Poster: film.posterUrlPreview || 'https://via.placeholder.com/300x450?text=No+Poster',
            imdbRating: film.ratingKinopoisk ? String(film.ratingKinopoisk) : 'N/A',
            Genre: film.genres?.map(g => g.genre).join(', ') || 'Фильм'
        }));
        
        console.log('Найдено фильмов:', results.length);
        return results;
        
    } catch (error) {
        console.error('Ошибка Kinopoisk API:', error);
        showNotification('Ошибка подключения к Kinopoisk API');
        return [];
    }
}

// ========== ПОИСК НА АНГЛИЙСКОМ ЧЕРЕЗ OMDb ==========
async function searchEnglishOMDb(query, type) {
    console.log('Поиск на английском:', query);
    
    try {
        let url = `https://www.omdbapi.com/?apikey=${API_KEY}&s=${encodeURIComponent(query)}`;
        if (type) url += `&type=${type}`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.Response === 'False') {
            console.log('OMDb ошибка:', data.Error);
            return [];
        }
        
        // Получаем детали для каждого фильма
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

// ========== ГЛАВНАЯ ФУНКЦИЯ ПОИСКА ==========
async function searchMovies(query, type = '', language = 'en') {
    console.log('=== ПОИСК ===');
    console.log('Запрос:', query);
    console.log('Тип:', type);
    console.log('Язык:', language);
    
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
            resultsContainer.innerHTML = `
                <div class="error">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>По запросу "${query}" ничего не найдено</p>
                    <p style="font-size: 14px; margin-top: 10px;">Попробуйте:</p>
                    <ul style="text-align: left; display: inline-block;">
                        <li>Проверить правильность написания</li>
                        <li>Использовать другой язык поиска</li>
                        <li>Ввести более короткий запрос</li>
                    </ul>
                </div>
            `;
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

// ========== ИНИЦИАЛИЗАЦИЯ ==========
document.addEventListener('DOMContentLoaded', () => {
    console.log('Сайт загружен!');
    console.log('Kinopoisk API ключ:', KINOPOISK_API_KEY ? 'Установлен ✓' : 'Не установлен ✗');
    
    updateFavoritesCount();
    
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
            
            console.log('Форма отправлена! Язык:', language);
            
            await searchMovies(query, type, language);
            
            document.getElementById('search-results')?.scrollIntoView({ 
                behavior: 'smooth' 
            });
        });
    }
    
    // Кнопки "Смотреть все"
    document.querySelectorAll('.see-all').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = e.target.closest('.section');
            if (section && searchInput) {
                let searchTerm = '';
                if (section.id === 'trending') searchTerm = 'popular';
                if (section.id === 'top-rated') searchTerm = 'best';
                if (section.id === 'upcoming') searchTerm = '2025';
                
                if (searchTerm) {
                    searchInput.value = searchTerm;
                    searchForm?.dispatchEvent(new Event('submit'));
                }
            }
        });
    });
    
    setInterval(updateFavoritesCount, 5000);
});

window.searchMovies = searchMovies;
window.updateFavoritesCount = updateFavoritesCount;
window.showNotification = showNotification;
window.createMovieCard = createMovieCard;
