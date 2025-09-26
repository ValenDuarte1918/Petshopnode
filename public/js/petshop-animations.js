// JavaScript para animaciones y efectos del PetShop
document.addEventListener('DOMContentLoaded', function() {
    
    // Animaciones al hacer scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    // Observar elementos que necesitan animación de scroll
    const elementsToAnimate = document.querySelectorAll('.fade-in-on-scroll');
    elementsToAnimate.forEach(element => {
        observer.observe(element);
    });

    // Smooth scrolling para enlaces internos
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Efecto de wiggle en iconos al hacer hover
    const icons = document.querySelectorAll('.fas, .fab');
    icons.forEach(icon => {
        icon.addEventListener('mouseenter', function() {
            this.classList.add('animate-wiggle');
        });
        
        icon.addEventListener('animationend', function() {
            this.classList.remove('animate-wiggle');
        });
    });

    // Efecto parallax suave en hero section
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;
        const heroImage = document.querySelector('.hero-image img');
        
        if (heroImage) {
            heroImage.style.transform = `translateY(${rate}px)`;
        }
    });

    // Animación de contador para precios
    function animateCounters() {
        const counters = document.querySelectorAll('.product-info p');
        counters.forEach(counter => {
            const text = counter.textContent;
            const match = text.match(/\$(\d+)/);
            if (match) {
                const target = parseInt(match[1]);
                let current = 0;
                const increment = target / 50;
                const timer = setInterval(() => {
                    current += increment;
                    if (current >= target) {
                        current = target;
                        clearInterval(timer);
                    }
                    counter.textContent = `$${Math.ceil(current)}`;
                }, 20);
            }
        });
    }

    // Activar contadores cuando sea visible
    const priceObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounters();
                priceObserver.disconnect();
            }
        });
    }, { threshold: 0.5 });

    const productsSection = document.querySelector('#productos');
    if (productsSection) {
        priceObserver.observe(productsSection);
    }

    // Efecto de loading en imágenes
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        img.addEventListener('load', function() {
            this.classList.add('loaded');
        });
        
        // Si la imagen ya está cargada
        if (img.complete) {
            img.classList.add('loaded');
        }
    });

    // Efecto de búsqueda instantánea (si existe un input de búsqueda)
    const searchInput = document.querySelector('#search-input');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const query = this.value.toLowerCase();
            const products = document.querySelectorAll('.product-card');
            
            products.forEach(product => {
                const title = product.querySelector('h2').textContent.toLowerCase();
                if (title.includes(query)) {
                    product.style.display = 'block';
                    product.classList.add('animate-fadeInUp');
                } else {
                    product.style.display = 'none';
                    product.classList.remove('animate-fadeInUp');
                }
            });
        });
    }

    // Efecto de notificación cuando se agrega al carrito
    const addToCartButtons = document.querySelectorAll('.add-to-cart-button');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            // Crear notificación temporal
            const notification = document.createElement('div');
            notification.className = 'cart-notification animate-bounceIn';
            notification.innerHTML = `
                <i class="fas fa-check-circle"></i>
                Producto agregado al carrito
            `;
            notification.style.cssText = `
                position: fixed;
                top: 100px;
                right: 20px;
                background: linear-gradient(135deg, #27AE60, #2ECC71);
                color: white;
                padding: 15px 20px;
                border-radius: 10px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                z-index: 10000;
                display: flex;
                align-items: center;
                gap: 10px;
                font-weight: 600;
            `;
            
            document.body.appendChild(notification);
            
            // Remover después de 3 segundos
            setTimeout(() => {
                notification.classList.add('animate-fadeOut');
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }, 3000);
        });
    });

    // Efecto de loading en botones
    const buttons = document.querySelectorAll('button, .btn-primary, .btn-secondary');
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            // Solo si no es el botón del carrito
            if (!this.classList.contains('add-to-cart-button')) {
                this.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    this.style.transform = '';
                }, 150);
            }
        });
    });

    });

// Agregar estilos para la notificación
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeOut {
        from { opacity: 1; transform: translateX(0); }
        to { opacity: 0; transform: translateX(100%); }
    }
    
    .animate-fadeOut {
        animation: fadeOut 0.3s ease-out forwards;
    }
    
    img {
        opacity: 0;
        transition: opacity 0.3s ease;
    }
    
    img.loaded {
        opacity: 1;
    }
`;
document.head.appendChild(style);
