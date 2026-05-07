document.addEventListener('DOMContentLoaded', function() {
    setTimeout(initTrailerSection, 1000);
});

function initTrailerSection() {
    const movieTitle = document.getElementById('movie-title')?.textContent;
    const movieYear = document.getElementById('detail-year')?.textContent?.match(/\d{4}/)?.[0] || '';
    
    if (!movieTitle || movieTitle === 'Загрузка...') {
        setTimeout(initTrailerSection, 500);
        return;
    }
    
    setupTrailerSection(movieTitle, movieYear);
}

function setupTrailerSection(movieTitle, movieYear) {
    const container = document.getElementById('trailer-container');
    if (!container) return;
    
    // Основной поисковый запрос
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
                   class="action-btn primary">
                    <i class="fab fa-youtube"></i> Смотреть официальный трейлер
                </a>
                
                <a href="https://www.youtube.com/results?search_query=${encodeURIComponent(mainQuery)}" 
                   target="_blank" 
                   class="action-btn">
                    <i class="fas fa-search"></i> Искать на YouTube
                </a>
            </div>
        </div>
        
        <div class="video-suggestions">
            <h3><i class="fas fa-lightbulb"></i> Что еще посмотреть</h3>
            <div class="suggestion-grid">
                <a href="https://www.youtube.com/results?search_query=${encodeURIComponent(mainQuery + ' обзор фильма')}" 
                   target="_blank" 
                   class="suggestion-card">
                    <div class="suggestion-icon">
                        <i class="fas fa-star"></i>
                    </div>
                    <h4>Обзоры фильма</h4>
                    <p>Рецензии и мнения кинокритиков</p>
                </a>
                
                <a href="https://www.youtube.com/results?search_query=${encodeURIComponent(mainQuery + ' интервью с актерами')}" 
                   target="_blank" 
                   class="suggestion-card">
                    <div class="suggestion-icon">
                        <i class="fas fa-microphone"></i>
                    </div>
                    <h4>Интервью</h4>
                    <p>Беседы с актерами и режиссером</p>
                </a>
                
                <a href="https://www.youtube.com/results?search_query=${encodeURIComponent(mainQuery + ' за кадром')}" 
                   target="_blank" 
                   class="suggestion-card">
                    <div class="suggestion-icon">
                        <i class="fas fa-video"></i>
                    </div>
                    <h4>За кадром</h4>
                    <p>Как снимался фильм</p>
                </a>
                
                <a href="https://www.youtube.com/results?search_query=${encodeURIComponent(mainQuery + ' анализ фильма')}" 
                   target="_blank" 
                   class="suggestion-card">
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
    
    // Делаем превью кликабельным
    const preview = container.querySelector('.trailer-preview');
    if (preview) {
        preview.addEventListener('click', function() {
            window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(mainQuery + ' официальный трейлер')}`, '_blank');
        });
        preview.style.cursor = 'pointer';
    }
}