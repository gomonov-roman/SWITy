// const API_KEY = 'b1325fa0';

// // Новая функция для поиска
// async function searchMovies(query) {
//     const container = document.getElementById('movies-container');
//     container.innerHTML = '<p>Ищем фильмы...</p>';

//     try {
//         // 1. Запрос списка (поиск)
//         const response = await fetch(
//             `https://www.omdbapi.com/?apikey=${API_KEY}&s=${query}`
//         );
//         const data = await response.json();

//         // 2. Проверка
//         if (data.Response === 'False') {
//             container.innerHTML = `<p>Фильмы не найдены: ${data.Error}</p>`;
//             return;
//         }

//         // 3. Очищаем контейнер
//         container.innerHTML = '';

//         // 4. Для каждого фильма создаем карточку
//         data.Search.forEach(movie => {
//             const card = createMovieCard(movie); // Создаем элемент
//             container.appendChild(card);        // Добавляем в контейнер
//         });

//     } catch (error) {
//         container.innerHTML = `<p>Ошибка сети: ${error.message}</p>`;
//     }
// }

// // Функция создания одной карточки через DOM API
// function createMovieCard(movie) {
//     // 5. Создаем элементы "вручную"
//     const card = document.createElement('div');
//     card.className = 'movie-card';

//     // Постер (если есть)
//     const img = document.createElement('img');
//     img.className = 'movie-poster';
//     img.src = (movie.Poster !== 'N/A') ? movie.Poster : 'https://via.placeholder.com/300x450/cccccc/666666?text=No+Poster';
//     img.alt = movie.Title;
//     img.loading = 'lazy'; // Ленивая загрузка для производительности

//     // Заголовок
//     const title = document.createElement('h3');
//     title.textContent = `${movie.Title} (${movie.Year})`;

//     // Кнопка "Детали" (позже добавим функционал)
//     const detailsBtn = document.createElement('button');
//     detailsBtn.textContent = 'Подробнее';
//     detailsBtn.addEventListener('click', () => {
//         alert(`ID фильма: ${movie.imdbID}`);
//     });

//     // 6. Собираем карточку
//     card.append(img, title, detailsBtn);
//     return card;
// }

// // 7. Ищем фильмы при загрузке (например, "matrix")
// searchMovies('matrix');







const API_KEY = 'b1325fa0';
const STORAGE_KEY = 'moviePortal_favorites';

// Функция создания карточки (обновленная для новой структуры)
function createMovieCard(movie) {
    const card = document.createElement('a');
    card.className = 'movie-card';
    card.href = `movie-details.html?id=${movie.imdbID}`;
    
    const img = document.createElement('img');
    img.className = 'movie-poster';
    img.src = (movie.Poster !== 'N/A') ? movie.Poster : 'https://via.placeholder.com/300x450?text=No+Poster';
    img.alt = movie.Title || movie.title;
    img.loading = 'lazy';
    img.onerror = function() {
        this.src = 'https://via.placeholder.com/300x450?text=Poster+Error';
    };
    
    const title = document.createElement('h3');
    title.className = 'movie-title';
    title.textContent = movie.Title || movie.title || 'Без названия';
    
    const year = document.createElement('div');
    year.className = 'movie-year';
    year.textContent = movie.Year || movie.year || 'Год неизвестен';
    
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
        toggleFavorite(movie.imdbID || movie.id, favBtn);
    });
    
    // Проверяем, есть ли уже в избранном
    if (getFavorites().includes(movie.imdbID || movie.id)) {
        favBtn.innerHTML = '★';
        favBtn.classList.add('active');
    }
    
    const genre = document.createElement('div');
    genre.className = 'movie-genre';
    genre.textContent = (movie.Genre || movie.genre || 'Фильм').split(',')[0];
    
    card.append(img, favBtn, rating, title, year, genre);
    return card;
}

// Получить массив избранных ID
function getFavorites() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

// Переключение избранного
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

// Функция поиска (обновленная для новой структуры)
async function searchMovies(query, type = '') {
    // Показываем секцию результатов
    const resultsSection = document.getElementById('search-results');
    const resultsContainer = document.getElementById('movies-container');
    const resultsCount = document.getElementById('results-count');
    
    if (resultsSection) {
        resultsSection.style.display = 'block';
        // Скрываем другие секции
        document.querySelectorAll('.section:not(#search-results)').forEach(section => {
            section.style.display = 'none';
        });
    }
    
    if (resultsContainer) {
        resultsContainer.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Ищем фильмы...</div>';
    }
    
    try {
        // Формируем URL для поиска
        let url = `https://www.omdbapi.com/?apikey=${API_KEY}&s=${encodeURIComponent(query)}`;
        if (type) {
            url += `&type=${type}`;
        }
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.Response === 'False') {
            if (resultsContainer) {
                resultsContainer.innerHTML = `<div class="error"><i class="fas fa-exclamation-triangle"></i> ${data.Error}. Попробуйте другой запрос.</div>`;
            }
            if (resultsCount) {
                resultsCount.textContent = 'Найдено: 0';
            }
            return;
        }
        
        // Обновляем счетчик результатов
        if (resultsCount) {
            resultsCount.textContent = `Найдено: ${data.Search.length}`;
        }
        
        if (resultsContainer) {
            resultsContainer.innerHTML = '';
            
            // Получаем детальную информацию для каждого фильма
            const detailedPromises = data.Search.slice(0, 20).map(movie => 
                fetch(`https://www.omdbapi.com/?apikey=${API_KEY}&i=${movie.imdbID}`)
                    .then(res => res.json())
            );
            
            const detailedMovies = await Promise.all(detailedPromises);
            
            detailedMovies.forEach(movie => {
                if (movie.Response === 'True') {
                    const card = createMovieCard(movie);
                    resultsContainer.appendChild(card);
                }
            });
        }
        
    } catch (error) {
        console.error('Ошибка поиска:', error);
        if (resultsContainer) {
            resultsContainer.innerHTML = `<div class="error"><i class="fas fa-exclamation-triangle"></i> Ошибка сети: ${error.message}</p>`;
        }
    }
}

// Уведомления
function showNotification(message) {
    // Проверяем, есть ли уже уведомление
    let notification = document.querySelector('.notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.className = 'notification';
        document.body.appendChild(notification);
    }
    
    notification.textContent = message;
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 3000);
}

// Обновляем счетчик избранного
function updateFavoritesCount() {
    const favorites = getFavorites();
    const favCountElement = document.getElementById('fav-count');
    if (favCountElement) {
        favCountElement.textContent = favorites.length;
    }
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
    updateFavoritesCount();
    
    // Ищем форму поиска (она может быть в двух местах)
    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('search-input');
    
    if (searchForm && searchInput) {
        // Обработчик формы поиска
        searchForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const query = searchInput.value.trim();
            if (!query) return;
            
            // Получаем выбранный тип фильма
            const type = document.querySelector('input[name="type"]:checked')?.value || '';
            
            await searchMovies(query, type);
            
            // Прокручиваем к результатам
            document.getElementById('search-results')?.scrollIntoView({ 
                behavior: 'smooth' 
            });
        });
    }



    
    
    // Если есть кнопка "Смотреть все" в трендах, делаем поиск по слову "popular"
    document.querySelectorAll('.see-all').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = e.target.closest('.section');
            if (section) {
                let searchTerm = '';
                if (section.id === 'trending') searchTerm = 'popular';
                if (section.id === 'top-rated') searchTerm = 'best';
                if (section.id === 'upcoming') searchTerm = '2024';
                
                if (searchTerm && searchInput) {
                    searchInput.value = searchTerm;
                    searchForm?.dispatchEvent(new Event('submit'));
                }
            }
        });
    });
    
    // Обновляем избранное каждые 5 секунд (на случай изменения в другой вкладке)
    setInterval(updateFavoritesCount, 5000);
});

// Экспортируем функции для использования в home.js
window.searchMovies = searchMovies;
window.updateFavoritesCount = updateFavoritesCount;
window.showNotification = showNotification;