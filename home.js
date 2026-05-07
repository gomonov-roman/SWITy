const API_KEY = 'b1325fa0';

// Популярные запросы для трендов
const TREND_SEARCHES = [
    'avengers',
    'batman',
    'harry potter',
    'star wars',
    'lord of the rings',
    'marvel',
    'disney',
    'pixar',
    'christmas',
    'horror'
];

// Жанры для поиска
const GENRE_MAP = {
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

// Загружаем трендовые фильмы
async function loadTrendingMovies() {
    const container = document.getElementById('trending-movies');
    container.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Загружаем популярные фильмы...</div>';
    
    try {
        // Берем первые 3 популярных запроса
        const promises = TREND_SEARCHES.slice(0, 3).map(query => 
            fetch(`https://www.omdbapi.com/?apikey=${API_KEY}&s=${query}&type=movie&page=1`)
                .then(res => res.json())
        );
        
        const results = await Promise.all(promises);
        const allMovies = results.flatMap(r => r.Search || []).slice(0, 8);
        
        container.innerHTML = '';
        
        // Получаем детальную информацию для каждого фильма
        const detailedPromises = allMovies.map(movie => 
            fetch(`https://www.omdbapi.com/?apikey=${API_KEY}&i=${movie.imdbID}`)
                .then(res => res.json())
        );
        
        const detailedMovies = await Promise.all(detailedPromises);
        
        detailedMovies.forEach(movie => {
            if (movie.Response === 'True') {
                const card = createMovieCard(movie);
                container.appendChild(card);
            }
        });
        
    } catch (error) {
        container.innerHTML = '<div class="error"><i class="fas fa-exclamation-triangle"></i> Не удалось загрузить тренды</div>';
    }
}

// Загружаем фильмы с высоким рейтингом
async function loadTopRatedMovies() {
    const container = document.getElementById('top-rated-movies');
    
    // Поиск популярных фильмов (у OMDb нет рейтингового API, используем популярные запросы)
    const queries = ['the godfather', 'shawshank', 'pulp fiction', 'forrest gump', 'inception', 'matrix', 'interstellar', 'parasite'];
    
    try {
        const promises = queries.map(query => 
            fetch(`https://www.omdbapi.com/?apikey=${API_KEY}&t=${query}`)
                .then(res => res.json())
        );
        
        const movies = await Promise.all(promises);
        const validMovies = movies.filter(m => m.Response === 'True');
        
        container.innerHTML = '';
        
        validMovies.forEach(movie => {
            const card = createMovieCard(movie);
            container.appendChild(card);
        });
        
    } catch (error) {
        console.error('Ошибка загрузки топовых фильмов:', error);
    }
}

// Загружаем предстоящие фильмы (поиск по годам)
async function loadUpcomingMovies() {
    const container = document.getElementById('upcoming-movies');
    const currentYear = new Date().getFullYear();
    const nextYear = currentYear + 1;
    
    try {
        const response = await fetch(
            `https://www.omdbapi.com/?apikey=${API_KEY}&s=202${nextYear.toString().slice(-1)}&type=movie&y=${nextYear}`
        );
        const data = await response.json();
        
        if (data.Response === 'True') {
            container.innerHTML = '';
            
            // Берем первые 6 фильмов
            const moviesToShow = data.Search.slice(0, 6);
            
            const detailedPromises = moviesToShow.map(movie => 
                fetch(`https://www.omdbapi.com/?apikey=${API_KEY}&i=${movie.imdbID}`)
                    .then(res => res.json())
            );
            
            const detailedMovies = await Promise.all(detailedPromises);
            
            detailedMovies.forEach(movie => {
                if (movie.Response === 'True') {
                    const card = createMovieCard(movie);
                    // Добавляем метку "Скоро"
                    const soonBadge = document.createElement('div');
                    soonBadge.className = 'soon-badge';
                    soonBadge.textContent = 'Скоро';
                    card.appendChild(soonBadge);
                    container.appendChild(card);
                }
            });
        } else {
            container.innerHTML = '<div class="info-message">Информация о предстоящих фильмах скоро появится</div>';
        }
        
    } catch (error) {
        console.error('Ошибка загрузки предстоящих фильмов:', error);
    }
}

// Создаем карточку фильма (общая функция)
function createMovieCard(movie) {
    const card = document.createElement('a');
    card.className = 'movie-card';
    card.href = `movie-details.html?id=${movie.imdbID}`;
    
    const img = document.createElement('img');
    img.className = 'movie-poster';
    img.src = (movie.Poster !== 'N/A') ? movie.Poster : 'https://via.placeholder.com/300x450?text=No+Poster';
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
        const favorites = JSON.parse(localStorage.getItem('moviePortal_favorites') || '[]');
        if (!favorites.includes(movie.imdbID)) {
            favorites.push(movie.imdbID);
            localStorage.setItem('moviePortal_favorites', JSON.stringify(favorites));
            favBtn.innerHTML = '★';
            favBtn.classList.add('active');
            updateFavoritesCount();
            showNotification(`"${movie.Title}" добавлен в избранное!`);
        }
    });
    
    // Проверяем, есть ли уже в избранном
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

// Обновляем счетчик избранного
function updateFavoritesCount() {
    const favorites = JSON.parse(localStorage.getItem('moviePortal_favorites') || '[]');
    const favCountElement = document.getElementById('fav-count');
    if (favCountElement) {
        favCountElement.textContent = favorites.length;
    }
}

// Уведомления
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Поиск по жанрам
function setupGenreButtons() {
    document.querySelectorAll('.genre-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const genre = btn.dataset.genre;
            const genreName = GENRE_MAP[genre];
            
            // Показываем секцию результатов поиска
            document.getElementById('search-results').style.display = 'block';
            document.getElementById('trending').style.display = 'none';
            document.getElementById('top-rated').style.display = 'none';
            document.getElementById('upcoming').style.display = 'none';
            document.getElementById('genres').style.display = 'none';
            
            const container = document.getElementById('movies-container');
            container.innerHTML = `<div class="loading">Ищем ${genreName}...</div>`;
            
            try {
                const response = await fetch(
                    `https://www.omdbapi.com/?apikey=${API_KEY}&s=${genreName}&type=movie`
                );
                const data = await response.json();
                
                if (data.Response === 'True') {
                    container.innerHTML = '';
                    
                    const promises = data.Search.slice(0, 12).map(movie => 
                        fetch(`https://www.omdbapi.com/?apikey=${API_KEY}&i=${movie.imdbID}`)
                            .then(res => res.json())
                    );
                    
                    const detailedMovies = await Promise.all(promises);
                    
                    detailedMovies.forEach(movie => {
                        if (movie.Response === 'True') {
                            const card = createMovieCard(movie);
                            container.appendChild(card);
                        }
                    });
                    
                    document.getElementById('results-count').textContent = `Найдено: ${data.Search.length}`;
                } else {
                    container.innerHTML = `<div class="error">Фильмы в жанре "${genreName}" не найдены</div>`;
                }
            } catch (error) {
                container.innerHTML = '<div class="error">Ошибка поиска</div>';
            }
        });
    });
}

// Переключение темы
function setupThemeToggle() {
    const themeBtn = document.getElementById('theme-toggle');
    const icon = themeBtn.querySelector('i');
    
    // Проверяем сохраненную тему
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

// Навигация по странице
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Убираем активный класс у всех
            navLinks.forEach(l => l.classList.remove('active'));
            // Добавляем активный класс текущему
            link.classList.add('active');
            
            // Показываем нужную секцию
            const targetId = link.getAttribute('href').substring(1);
            const sections = document.querySelectorAll('.section');
            
            sections.forEach(section => {
                section.style.display = 'none';
            });
            
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.style.display = 'block';
            }
            
            // Скролл к секции
            targetSection?.scrollIntoView({ behavior: 'smooth' });
        });
    });
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    updateFavoritesCount();
    loadTrendingMovies();
    loadTopRatedMovies();
    loadUpcomingMovies();
    setupGenreButtons();
    setupThemeToggle();
    setupNavigation();
    
    // Обновляем избранное каждые 5 секунд (на случай, если изменилось в другой вкладке)
    setInterval(updateFavoritesCount, 5000);

    // Добавь в конец app.js или home.js
window.addEventListener('scroll', function() {
    const searchSection = document.querySelector('.search-section');
    if (window.scrollY > 100) {
        searchSection.classList.add('sticky-scrolled');
    } else {
        searchSection.classList.remove('sticky-scrolled');
    }
});

});
