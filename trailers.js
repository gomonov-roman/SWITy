document.addEventListener('DOMContentLoaded', function() {
    setTimeout(initTrailerSection, 1000);
});

// Система очков для трейлеров
function addPointsForTrailer() {
    let currentPoints = localStorage.getItem('user_points');
    currentPoints = currentPoints ? parseInt(currentPoints) : 0;
    currentPoints++;
    localStorage.setItem('user_points', currentPoints);
    
    // Обновляем UI если есть на странице
    const pointsElement = document.getElementById('user-points');
    if (pointsElement) {
        pointsElement.textContent = currentPoints;
        pointsElement.classList.add('points-pop');
        setTimeout(() => pointsElement.classList.remove('points-pop'), 300);
    }
    
    // Обновляем звание
    updateRankUI(currentPoints);
    
    showPointsNotification(currentPoints);
}

function updateRankUI(points) {
    let rank = '🍿 Новичок';
    if (points >= 200) rank = '🎥 Кинолегенда';
    else if (points >= 100) rank = '👑 Кинокритик';
    else if (points >= 50) rank = '⭐ Знаток';
    else if (points >= 25) rank = '🎭 Любитель кино';
    else if (points >= 10) rank = '🎬 Зритель';
    
    const rankElement = document.getElementById('user-rank');
    if (rankElement) {
        const oldRank = rankElement.textContent;
        rankElement.textContent = rank;
        if (oldRank !== rank) {
            rankElement.classList.add('rank-up');
            setTimeout(() => rankElement.classList.remove('rank-up'), 500);
            showRankUpNotification(rank);
        }
    }
}

function showPointsNotification(points) {
    let notification = document.querySelector('.notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.className = 'notification';
        document.body.appendChild(notification);
    }
    notification.textContent = `🎬 +1 очко за просмотр трейлера! Теперь у вас ${points} очков`;
    setTimeout(() => notification.classList.add('show'), 10);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function showRankUpNotification(rank) {
    let notification = document.querySelector('.notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.className = 'notification';
        document.body.appendChild(notification);
    }
    notification.textContent = `🎉 ПОЗДРАВЛЯЕМ! Новое звание: ${rank} 🎉`;
    setTimeout(() => notification.classList.add('show'), 10);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function initTrailerSection() {
    const movieTitle = document.getElementById('movie-title')?.textContent;
    const movieYear = document.getElementById('detail-year')?.textContent?.match(/\d{4}/)?.[0] || '';
    
    if (!movieTitle || movieTitle === 'Загрузка...' || movieTitle === 'Фильм не найден') {
        setTimeout(initTrailerSection, 500);
        return;
    }
    
    setupTrailerSection(movieTitle, movieYear);
}

function setupTrailerSection(movieTitle, movieYear) {
    const container = document.getElementById('trailer-container');
    if (!container) return;
    
    const mainQuery = `${movieTitle} ${movieYear}`;
    
    container.innerHTML = `
        <div class="trailer-main">
            <div class="trailer-preview">
                <div class="preview-image">
                    <div class="play-button-overlay">
                        <i class="fas fa-play"></i>
                    </div>
                    <img src="https://png.pngtree.com/thumb_back/fh260/background/20210916/pngtree-movie-film-white-light-effect-spot-background-image_901108.jpg" 
                         alt="Превью трейлера" 
                         class="youtube-thumbnail"
                         onerror="this.src='https://via.placeholder.com/640x360/ff0000/ffffff?text=Трейлер'">
                </div>
                <div class="preview-info">
                    <h3>${movieTitle} (${movieYear})</h3>
                    <p>Нажмите для просмотра трейлера на YouTube</p>
                    <div class="video-stats">
                        <span><i class="fas fa-eye"></i> Посмотреть трейлер</span>
                        <span><i class="fas fa-clock"></i> ~2-3 мин</span>
                    </div>
                </div>
            </div>
            
            <div class="trailer-actions">
                <a href="https://www.youtube.com/results?search_query=${encodeURIComponent(mainQuery + ' официальный трейлер')}" 
                   target="_blank" 
                   class="action-btn primary"
                   data-trailer-click="official">
                    <i class="fab fa-youtube"></i> Смотреть официальный трейлер
                </a>
                
                <a href="https://www.youtube.com/results?search_query=${encodeURIComponent(mainQuery)}" 
                   target="_blank" 
                   class="action-btn"
                   data-trailer-click="search">
                    <i class="fas fa-search"></i> Искать на YouTube
                </a>
            </div>
        </div>
        
        <div class="video-suggestions">
            <h3><i class="fas fa-lightbulb"></i> Что еще посмотреть</h3>
            <div class="suggestion-grid">
                <a href="https://www.youtube.com/results?search_query=${encodeURIComponent(mainQuery + ' обзор фильма')}" 
                   target="_blank" 
                   class="suggestion-card"
                   data-trailer-click="review">
                    <div class="suggestion-icon">
                        <i class="fas fa-star"></i>
                    </div>
                    <h4>Обзоры фильма</h4>
                    <p>Рецензии и мнения кинокритиков</p>
                </a>
                
                <a href="https://www.youtube.com/results?search_query=${encodeURIComponent(mainQuery + ' интервью с актерами')}" 
                   target="_blank" 
                   class="suggestion-card"
                   data-trailer-click="interview">
                    <div class="suggestion-icon">
                        <i class="fas fa-microphone"></i>
                    </div>
                    <h4>Интервью</h4>
                    <p>Беседы с актерами и режиссером</p>
                </a>
                
                <a href="https://www.youtube.com/results?search_query=${encodeURIComponent(mainQuery + ' за кадром')}" 
                   target="_blank" 
                   class="suggestion-card"
                   data-trailer-click="behind">
                    <div class="suggestion-icon">
                        <i class="fas fa-video"></i>
                    </div>
                    <h4>За кадром</h4>
                    <p>Как снимался фильм</p>
                </a>
                
                <a href="https://www.youtube.com/results?search_query=${encodeURIComponent(mainQuery + ' анализ фильма')}" 
                   target="_blank" 
                   class="suggestion-card"
                   data-trailer-click="analysis">
                    <div class="suggestion-icon">
                        <i class="fas fa-chart-bar"></i>
                    </div>
                    <h4>Анализ</h4>
                    <p>Разбор сцен и скрытых деталей</p>
                </a>
            </div>
        </div>
        
        <div class="youtube-tips">
            <h3><i class="fas fa-info-circle"></i> Как найти трейлер</h3>
            <div class="tips-list">
                <div class="tip">
                    <span class="tip-number">1</span>
                    <p>Нажмите на любую кнопку выше</p>
                </div>
                <div class="tip">
                    <span class="tip-number">2</span>
                    <p>На YouTube откроется страница с результатами поиска</p>
                </div>
                <div class="tip">
                    <span class="tip-number">3</span>
                    <p>Выберите видео с пометкой "Official Trailer" или от официального канала</p>
                </div>
                <div class="tip">
                    <span class="tip-number">4</span>
                    <p>Наслаждайтесь просмотром!</p>
                </div>
            </div>
        </div>
    `;
    
    // Делаем превью кликабельным с начислением очков
    const preview = container.querySelector('.trailer-preview');
    if (preview) {
        preview.addEventListener('click', function(e) {
            e.preventDefault();
            addPointsForTrailer();
            window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(mainQuery + ' официальный трейлер')}`, '_blank');
        });
        preview.style.cursor = 'pointer';
    }
    
    // Добавляем начисление очков на все ссылки трейлеров
    const allTrailerLinks = container.querySelectorAll('a[data-trailer-click]');
    allTrailerLinks.forEach(link => {
        const originalUrl = link.href;
        link.removeAttribute('href');
        link.style.cursor = 'pointer';
        link.addEventListener('click', (e) => {
            e.preventDefault();
            addPointsForTrailer();
            window.open(originalUrl, '_blank');
        });
    });
}
