const API_KEY = 'b1325fa0';

// Получаем ID фильма из URL
const urlParams = new URLSearchParams(window.location.search);
const movieId = urlParams.get('id');

// Функция для обновления заголовка страницы
function updatePageTitle(movieTitle) {
    document.title = `${movieTitle} - Кинопортал`;
}

// Загружаем детали фильма
async function loadMovieDetails() {
    if (!movieId) {
        document.getElementById('movie-title').textContent = 'Фильм не найден';
        return;
    }

    try {
        const response = await fetch(`https://www.omdbapi.com/?apikey=b1325fa0&i=${movieId}&plot=full`);
        const movie = await response.json();

        if (movie.Response === 'True') {
            // Обновляем заголовок страницы - ЭТО РЕШЕНИЕ ПРОБЛЕМЫ!
            updatePageTitle(movie.Title);
            
            // Заполняем все поля на странице
            document.getElementById('movie-title').textContent = movie.Title;
            document.getElementById('detail-poster').src = movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/300x450?text=No+Poster';
            document.getElementById('detail-year').textContent = `Год: ${movie.Year}`;
            document.getElementById('genres').textContent = `Жанр: ${movie.Genre || 'Не указан'}`;
            document.getElementById('runtime').textContent = `Длительность: ${movie.Runtime || 'N/A'}`;
            document.getElementById('detail-overview').textContent = movie.Plot || 'Описание отсутствует';
            document.getElementById('released').textContent = movie.Released || 'N/A';
            document.getElementById('imdb-rating').textContent = `⭐ ${movie.imdbRating || 'N/A'} (${movie.imdbVotes || 0} голосов)`;
            document.getElementById('director').textContent = movie.Director || 'N/A';
            document.getElementById('actors').textContent = movie.Actors || 'N/A';
            document.getElementById('awards').textContent = movie.Awards || 'N/A';
            document.getElementById('country').textContent = movie.Country || 'N/A';
            
            // Обновляем рейтинг в мета-блоке
            document.getElementById('rating').innerHTML = `⭐ ${movie.imdbRating || 'N/A'}`;
            
            // Проверяем, есть ли фильм в избранном
            const favorites = JSON.parse(localStorage.getItem('moviePortal_favorites') || '[]');
            const favBtn = document.getElementById('favorite-btn');
            
            if (favorites.includes(movieId)) {
                favBtn.innerHTML = '★ Удалить из избранного';
                favBtn.classList.add('active');
            } else {
                favBtn.innerHTML = '☆ Добавить в избранное';
                favBtn.classList.remove('active');
            }
            
            // Обработчик кнопки избранного
            favBtn.onclick = () => {
                const favorites = JSON.parse(localStorage.getItem('moviePortal_favorites') || '[]');
                const index = favorites.indexOf(movieId);
                
                if (index === -1) {
                    favorites.push(movieId);
                    favBtn.innerHTML = '★ Удалить из избранного';
                    favBtn.classList.add('active');
                    showNotification(`"${movie.Title}" добавлен в избранное`);
                } else {
                    favorites.splice(index, 1);
                    favBtn.innerHTML = '☆ Добавить в избранное';
                    favBtn.classList.remove('active');
                    showNotification(`"${movie.Title}" удален из избранного`);
                }
                
                localStorage.setItem('moviePortal_favorites', JSON.stringify(favorites));
                
                // Обновляем счетчик на главной, если он есть в localStorage
                if (window.opener) {
                    window.opener.dispatchEvent(new Event('favorites-updated'));
                }
            };
            
            // Инициализируем секцию трейлеров (если нужна)
            if (window.initTrailerSection) {
                setTimeout(() => initTrailerSection(), 500);
            }
            
        } else {
            document.getElementById('movie-title').textContent = 'Фильм не найден';
        }
    } catch (error) {
        console.error('Ошибка загрузки:', error);
        document.getElementById('movie-title').textContent = 'Ошибка загрузки';
    }
}

// Функция для уведомлений
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => notification.classList.add('show'), 10);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Запускаем загрузку при загрузке страницы
document.addEventListener('DOMContentLoaded', loadMovieDetails);