const API_KEY = 'b1325fa0';
const STORAGE_KEY = 'moviePortal_favorites';

// Получаем избранные ID из localStorage
function getFavorites() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

// Удаляем фильм из избранного
function removeFavorite(movieId) {
    const favorites = getFavorites();
    const index = favorites.indexOf(movieId);
    
    if (index !== -1) {
        favorites.splice(index, 1);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
        updateFavoritesCount();
        return true;
    }
    return false;
}

// Получаем детальную информацию о фильме
async function fetchMovieDetails(movieId) {
    try {
        const response = await fetch(
            `https://www.omdbapi.com/?apikey=${API_KEY}&i=${movieId}&plot=short`
        );
        const data = await response.json();
        return data.Response === 'True' ? data : null;
    } catch (error) {
        console.error('Ошибка загрузки фильма:', error);
        return null;
    }
}

// Создаем карточку для избранного
function createFavoriteCard(movie, addedDate = null) {
    const card = document.createElement('a');
    card.className = 'movie-card favorite-card';
    card.href = `movie-details.html?id=${movie.imdbID}`;
    
    const img = document.createElement('img');
    img.className = 'movie-poster';
    img.src = (movie.Poster !== 'N/A') ? movie.Poster : 'https://via.placeholder.com/300x450?text=No+Poster';
    img.alt = movie.Title;
    img.loading = 'lazy';
    
    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-favorite';
    removeBtn.innerHTML = '×';
    removeBtn.title = 'Удалить из избранного';
    removeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (confirm(`Удалить "${movie.Title}" из избранного?`)) {
            if (removeFavorite(movie.imdbID)) {
                card.remove();
                updateDisplay();
            }
        }
    });
    
    const title = document.createElement('h3');
    title.className = 'movie-title';
    title.textContent = movie.Title;
    
    const year = document.createElement('div');
    year.className = 'movie-year';
    year.textContent = movie.Year;
    
    const rating = document.createElement('div');
    rating.className = 'movie-rating';
    rating.textContent = `⭐ ${movie.imdbRating || 'N/A'}`;
    
    const addedInfo = document.createElement('div');
    addedInfo.className = 'added-date';
    if (addedDate) {
        addedInfo.textContent = `Добавлен: ${new Date(addedDate).toLocaleDateString('ru-RU')}`;
        addedInfo.style.color = '#888';
        addedInfo.style.fontSize = '0.9rem';
        addedInfo.style.marginTop = '10px';
    }
    
    card.append(removeBtn, img, title, year, rating, addedInfo);
    return card;
}

// Обновляем отображение страницы
async function updateDisplay() {
    const container = document.getElementById('favorites-container');
    const emptyState = document.getElementById('empty-favorites');
    const countElement = document.querySelector('.favorites-count');
    
    const favorites = getFavorites();
    const favoriteIds = favorites.map(fav => typeof fav === 'object' ? fav.id : fav);
    const addedDates = favorites.map(fav => typeof fav === 'object' ? fav.addedDate : null);
    
    countElement.textContent = `Найдено фильмов: ${favoriteIds.length}`;
    
    if (favoriteIds.length === 0) {
        container.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }
    
    container.style.display = 'grid';
    emptyState.style.display = 'none';
    container.innerHTML = '<div class="loading">📥 Загружаем избранное...</div>';
    
    try {
        // Загружаем информацию о каждом фильме
        const moviePromises = favoriteIds.map((id, index) => 
            fetchMovieDetails(id).then(movie => ({
                movie,
                addedDate: addedDates[index]
            }))
        );
        
        const results = await Promise.all(moviePromises);
        const validMovies = results.filter(r => r.movie !== null);
        
        container.innerHTML = '';
        
        validMovies.forEach(({ movie, addedDate }) => {
            const card = createFavoriteCard(movie, addedDate);
            container.appendChild(card);
        });
        
    } catch (error) {
        container.innerHTML = `<p class="error">⚠️ Ошибка загрузки избранного: ${error.message}</p>`;
    }
}

// Очистка всего избранного
function clearAllFavorites() {
    if (confirm('Вы уверены, что хотите удалить все фильмы из избранного?')) {
        localStorage.removeItem(STORAGE_KEY);
        updateDisplay();
        updateFavoritesCount(); // Обновляем счетчик на главной
    }
}

// Сортировка избранного
function sortFavorites(type) {
    const container = document.getElementById('favorites-container');
    const cards = Array.from(container.querySelectorAll('.movie-card'));
    
    cards.sort((a, b) => {
        const titleA = a.querySelector('.movie-title').textContent.toLowerCase();
        const titleB = b.querySelector('.movie-title').textContent.toLowerCase();
        const ratingA = parseFloat(a.querySelector('.movie-rating')?.textContent.replace('⭐ ', '') || 0);
        const ratingB = parseFloat(b.querySelector('.movie-rating')?.textContent.replace('⭐ ', '') || 0);
        
        switch(type) {
            case 'title':
                return titleA.localeCompare(titleB);
            case 'rating':
                return ratingB - ratingA;
            case 'date':
            default:
                return 0; // По умолчанию - порядок добавления
        }
    });
    
    // Переставляем карточки
    cards.forEach(card => container.appendChild(card));
}

// Обновляем счетчик на главной странице
function updateFavoritesCount() {
    const favorites = getFavorites();
    const count = favorites.length;
    
    // Обновляем счетчик на главной странице
    const favCountElement = document.getElementById('fav-count');
    if (favCountElement) {
        favCountElement.textContent = count;
        favCountElement.classList.add('fav-count-update');
        setTimeout(() => {
            favCountElement.classList.remove('fav-count-update');
        }, 500);
    }
    
    return count;
}

// Инициализация страницы
document.addEventListener('DOMContentLoaded', () => {
    // Загружаем избранное
    updateDisplay();
    updateFavoritesCount();
    
    // Кнопка очистки
    document.getElementById('clear-all').addEventListener('click', clearAllFavorites);
    
    // Кнопки сортировки
    document.getElementById('sort-by-title').addEventListener('click', () => sortFavorites('title'));
    document.getElementById('sort-by-rating').addEventListener('click', () => sortFavorites('rating'));
    document.getElementById('sort-by-date').addEventListener('click', () => sortFavorites('date'));
});


