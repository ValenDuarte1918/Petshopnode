/**
 * 🔍 SISTEMA DE BÚSQUEDA AVANZADO
 * Sistema de búsqueda instantánea para PetShop Innovador
 */

class PetShopSearch {
    constructor() {
        this.searchTimeout = null;
        this.cache = new Map();
        this.isLoading = false;
        
        this.initializeSearch();
    }

    initializeSearch() {
        // Buscador desktop
        const desktopSearch = document.getElementById('header-search');
        const desktopResults = document.getElementById('search-results');
        const desktopBtn = document.getElementById('search-btn');

        // Buscador móvil
        const mobileSearch = document.getElementById('mobile-search');
        const mobileResults = document.getElementById('mobile-search-results');
        const mobileBtn = document.getElementById('mobile-search-btn');

        // Configurar buscadores
        if (desktopSearch) {
            this.setupSearchInput(desktopSearch, desktopResults, desktopBtn);
        }
        
        if (mobileSearch) {
            this.setupSearchInput(mobileSearch, mobileResults, mobileBtn);
        }

        // Cerrar resultados al hacer click fuera
        this.setupOutsideClick();
    }

    setupSearchInput(input, resultsContainer, button) {
        // Búsqueda mientras escribe
        input.addEventListener('input', (e) => {
            this.handleSearch(e.target.value.trim(), resultsContainer);
        });

        // Búsqueda con Enter
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const query = e.target.value.trim();
                if (query) {
                    this.navigateToSearch(query);
                }
            }
        });

        // Búsqueda con botón
        if (button) {
            button.addEventListener('click', () => {
                const query = input.value.trim();
                if (query) {
                    this.navigateToSearch(query);
                }
            });
        }

        // Focus y blur events
        input.addEventListener('focus', () => {
            if (input.value.trim()) {
                this.handleSearch(input.value.trim(), resultsContainer);
            }
        });

        input.addEventListener('blur', () => {
            // Delay para permitir clicks en resultados
            setTimeout(() => {
                this.hideResults(resultsContainer);
            }, 200);
        });
    }

    async handleSearch(query, resultsContainer) {
        if (!query || query.length < 2) {
            this.hideResults(resultsContainer);
            return;
        }

        // Cancelar búsqueda anterior
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }

        // Debounce - esperar 300ms antes de buscar
        this.searchTimeout = setTimeout(async () => {
            await this.performSearch(query, resultsContainer);
        }, 300);
    }

    async performSearch(query, resultsContainer) {
        try {
            console.log(`🔍 Iniciando búsqueda para: "${query}"`);
            
            // Verificar cache
            const cacheKey = query.toLowerCase();
            if (this.cache.has(cacheKey)) {
                console.log('📋 Usando resultado desde cache');
                this.displayResults(this.cache.get(cacheKey), resultsContainer, query);
                return;
            }

            this.isLoading = true;
            this.showLoading(resultsContainer);

            // Realizar búsqueda en la API
            const apiUrl = `/api/search?q=${encodeURIComponent(query)}&limit=8`;
            console.log(`🌐 Llamando API: ${apiUrl}`);
            
            const response = await fetch(apiUrl);
            console.log(`📡 Respuesta HTTP: ${response.status} ${response.statusText}`);
            
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }

            const data = await response.json();
            console.log('📦 Datos recibidos:', data);
            
            // Verificar estructura de respuesta
            let productos = [];
            if (data.success && data.data) {
                // Nuevo formato con ResponseFactory
                productos = data.data.items || data.data.productos || [];
            } else if (data.productos) {
                // Formato legacy
                productos = data.productos;
            }
            console.log(`🎯 Productos encontrados: ${productos.length}`);
            
            // Guardar en cache
            this.cache.set(cacheKey, productos);
            
            // Mostrar resultados
            this.displayResults(productos, resultsContainer, query);
            
        } catch (error) {
            console.error('❌ Error en búsqueda:', error);
            console.error('📍 Detalles del error:', {
                message: error.message,
                stack: error.stack,
                query: query,
                timestamp: new Date().toISOString()
            });
            this.showError(resultsContainer);
        } finally {
            this.isLoading = false;
        }
    }

    displayResults(productos, container, query) {
        console.log(`🎨 Renderizando resultados para "${query}": ${productos?.length || 0} productos`);
        
        if (!productos || productos.length === 0) {
            console.log('📭 Sin resultados, mostrando mensaje de "no encontrado"');
            container.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-search"></i>
                    <p>No se encontraron productos para "${query}"</p>
                    <small>Intenta con otro término de búsqueda</small>
                </div>
            `;
            this.showResults(container);
            return;
        }
        
        console.log('📋 Productos a renderizar:', productos.map(p => ({ id: p.id, nombre: p.nombre, precio: p.precio })));

        const resultsHTML = productos.map(producto => `
            <a href="/productos/${producto.id}" class="search-result-item">
                <img src="/images/products/${producto.img}" 
                     alt="${producto.nombre}" 
                     class="search-result-img"
                     onerror="this.src='/images/logo_petshop.jpeg'">
                <div class="search-result-info">
                    <h4>${this.highlightText(producto.nombre, query)}</h4>
                    <p>${producto.categoria} • ${producto.brand || 'Marca genérica'}</p>
                </div>
                <div class="search-result-price">
                    $${this.formatPrice(producto.precio)}
                </div>
            </a>
        `).join('');

        // Agregar opción "Ver todos los resultados"
        const viewAllHTML = `
            <a href="/productos?search=${encodeURIComponent(query)}" class="search-result-item view-all">
                <div class="search-result-info">
                    <h4>Ver todos los resultados para "${query}"</h4>
                    <p>Buscar en todos los productos</p>
                </div>
                <i class="fas fa-arrow-right"></i>
            </a>
        `;

        container.innerHTML = resultsHTML + viewAllHTML;
        this.showResults(container);
    }

    showLoading(container) {
        container.innerHTML = `
            <div class="search-loading">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Buscando productos...</p>
            </div>
        `;
        this.showResults(container);
    }

    showError(container) {
        container.innerHTML = `
            <div class="search-error">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Error al buscar productos</p>
                <small>Intenta nuevamente</small>
            </div>
        `;
        this.showResults(container);
    }

    showResults(container) {
        container.classList.add('active');
    }

    hideResults(container) {
        container.classList.remove('active');
    }

    highlightText(text, query) {
        if (!query) return text;
        
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }

    formatPrice(price) {
        return new Intl.NumberFormat('es-AR', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }).format(price);
    }

    navigateToSearch(query) {
        window.location.href = `/productos?search=${encodeURIComponent(query)}`;
    }

    setupOutsideClick() {
        document.addEventListener('click', (e) => {
            const searchContainers = document.querySelectorAll('.search-container');
            
            searchContainers.forEach(container => {
                if (!container.contains(e.target)) {
                    const results = container.querySelector('.search-results');
                    if (results) {
                        this.hideResults(results);
                    }
                }
            });
        });
    }
}

// CSS adicional para los estilos de búsqueda
const searchStyles = `
    <style>
    .search-loading, .search-error, .no-results {
        padding: 20px;
        text-align: center;
        color: var(--text-light);
    }
    
    .search-loading i, .search-error i {
        font-size: 1.5rem;
        margin-bottom: 10px;
        display: block;
    }
    
    .search-loading i {
        color: var(--primary-color);
    }
    
    .search-error i {
        color: var(--accent-color);
    }
    
    .no-results i {
        font-size: 2rem;
        margin-bottom: 10px;
        display: block;
        opacity: 0.5;
    }
    
    .view-all {
        background: #f8f9fa;
        border-top: 2px solid #e9ecef;
        font-weight: 600;
    }
    
    .view-all:hover {
        background: #e9ecef;
    }
    
    .search-result-info mark {
        background: #fff3cd;
        color: #856404;
        padding: 2px 4px;
        border-radius: 3px;
        font-weight: 600;
    }
    
    /* Animaciones */
    .search-results {
        animation: fadeInDown 0.3s ease-out;
    }
    
    @keyframes fadeInDown {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .search-result-item {
        animation: slideInRight 0.2s ease-out;
        animation-fill-mode: both;
    }
    
    .search-result-item:nth-child(1) { animation-delay: 0.1s; }
    .search-result-item:nth-child(2) { animation-delay: 0.15s; }
    .search-result-item:nth-child(3) { animation-delay: 0.2s; }
    .search-result-item:nth-child(4) { animation-delay: 0.25s; }
    
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(-20px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    </style>
`;

// Inyectar estilos
document.head.insertAdjacentHTML('beforeend', searchStyles);

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new PetShopSearch();
});

// Exportar para uso en otros scripts si es necesario
window.PetShopSearch = PetShopSearch;