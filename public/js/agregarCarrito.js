document.addEventListener("DOMContentLoaded", function () {
    console.log('🛒 Carrito JavaScript cargado correctamente!');
    
    // Inicializar carrito si no existe
    if (!localStorage.getItem('carrito')) {
        localStorage.setItem('carrito', JSON.stringify([]));
        console.log('🛒 Carrito inicializado en localStorage');
    }

    // Función para mostrar notificaciones modernas
    function mostrarNotificacion(mensaje, tipo = 'success') {
        // Remover notificación anterior si existe
        const existente = document.querySelector('.notification-toast');
        if (existente) {
            existente.remove();
        }

        // Crear notificación
        const notificacion = document.createElement('div');
        notificacion.className = `notification-toast ${tipo}`;
        
        let icono = '✅';
        if (tipo === 'error') icono = '❌';
        if (tipo === 'warning') icono = '⚠️';
        if (tipo === 'info') icono = 'ℹ️';
        
        notificacion.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${icono}</span>
                <span class="notification-message">${mensaje}</span>
            </div>
            <button class="notification-close">&times;</button>
        `;

        // Estilos en línea para la notificación
        notificacion.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${tipo === 'success' ? '#4CAF50' : tipo === 'error' ? '#f44336' : '#ff9800'};
            color: white;
            padding: 16px 24px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 350px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        `;

        const content = notificacion.querySelector('.notification-content');
        content.style.cssText = `
            display: flex;
            align-items: center;
            gap: 10px;
        `;

        const closeBtn = notificacion.querySelector('.notification-close');
        closeBtn.style.cssText = `
            background: none;
            border: none;
            color: white;
            font-size: 20px;
            cursor: pointer;
            opacity: 0.7;
            margin-left: 10px;
        `;

        // Agregar al DOM
        document.body.appendChild(notificacion);

        // Animar entrada
        setTimeout(() => {
            notificacion.style.transform = 'translateX(0)';
        }, 10);

        // Agregar event listener al botón cerrar
        closeBtn.addEventListener('click', () => {
            cerrarNotificacion(notificacion);
        });

        // Auto-cerrar después de 4 segundos
        setTimeout(() => {
            if (document.body.contains(notificacion)) {
                cerrarNotificacion(notificacion);
            }
        }, 4000);
    }

    function cerrarNotificacion(notificacion) {
        notificacion.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (document.body.contains(notificacion)) {
                notificacion.remove();
            }
        }, 300);
    }

    // Función para actualizar contador del carrito
    function actualizarContadorCarrito() {
        const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
        const contador = carrito.reduce((total, item) => total + item.cantidad, 0);
        
        // Buscar elementos del contador en el header
        const contadores = document.querySelectorAll('.cart-count, .carrito-count, [data-cart-count]');
        contadores.forEach(element => {
            element.textContent = contador;
            element.style.display = contador > 0 ? 'flex' : 'none';
        });
        
        console.log('🔢 Contador actualizado:', contador);
    }

    // Función para verificar si el usuario está logueado
    function verificarUsuarioLogueado() {
        // Verificar si existe la configuración global
        if (typeof window.petshopConfig === 'undefined') {
            console.warn('⚠️ Configuración de usuario no disponible');
            return false;
        }
        
        return window.petshopConfig.isLoggedIn === true;
    }

    // Función para mostrar modal de login
    function mostrarModalLogin() {
        // Remover modal anterior si existe
        const existente = document.querySelector('.login-modal');
        if (existente) {
            existente.remove();
        }

        // Crear modal
        const modal = document.createElement('div');
        modal.className = 'login-modal';
        modal.innerHTML = `
            <div class="modal-overlay">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3><i class="fas fa-user-lock"></i> Iniciar Sesión Requerida</h3>
                        <button class="modal-close">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="login-icon">
                            <i class="fas fa-shopping-cart"></i>
                        </div>
                        <p>Para agregar productos al carrito necesitas estar registrado e iniciar sesión.</p>
                        <div class="benefits">
                            <div class="benefit">✅ Guarda tus productos favoritos</div>
                            <div class="benefit">✅ Historial de compras</div>
                            <div class="benefit">✅ Ofertas exclusivas</div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <a href="/users/login" class="btn btn-primary">
                            <i class="fas fa-sign-in-alt"></i>
                            Iniciar Sesión
                        </a>
                        <a href="/users/registro" class="btn btn-secondary">
                            <i class="fas fa-user-plus"></i>
                            Crear Cuenta
                        </a>
                    </div>
                </div>
            </div>
        `;

        // Estilos del modal
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
        `;

        const overlay = modal.querySelector('.modal-overlay');
        overlay.style.cssText = `
            background: rgba(0, 0, 0, 0.7);
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        `;

        const content = modal.querySelector('.modal-content');
        content.style.cssText = `
            background: white;
            border-radius: 16px;
            max-width: 450px;
            width: 100%;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            animation: modalSlideIn 0.3s ease;
        `;

        // Agregar estilos de animación
        const style = document.createElement('style');
        style.textContent = `
            @keyframes modalSlideIn {
                from { transform: translateY(-50px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            .modal-header {
                padding: 24px 24px 0 24px;
                border-bottom: 1px solid #eee;
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding-bottom: 16px;
                margin-bottom: 24px;
            }
            .modal-header h3 {
                margin: 0;
                color: #2C3E50;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            .modal-close {
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                color: #7F8C8D;
                padding: 4px;
            }
            .modal-body {
                padding: 0 24px 24px 24px;
                text-align: center;
            }
            .login-icon {
                font-size: 3rem;
                color: #4A90E2;
                margin-bottom: 16px;
            }
            .modal-body p {
                color: #7F8C8D;
                margin-bottom: 24px;
                line-height: 1.6;
            }
            .benefits {
                text-align: left;
                margin-bottom: 24px;
            }
            .benefit {
                padding: 8px 0;
                color: #27AE60;
                font-weight: 500;
            }
            .modal-footer {
                padding: 0 24px 24px 24px;
                display: flex;
                gap: 12px;
            }
            .modal-footer .btn {
                flex: 1;
                padding: 12px 16px;
                border-radius: 8px;
                text-decoration: none;
                font-weight: 600;
                text-align: center;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                transition: all 0.3s ease;
            }
            .btn-primary {
                background: #4A90E2;
                color: white;
            }
            .btn-primary:hover {
                background: #357ABD;
            }
            .btn-secondary {
                background: #ECF0F1;
                color: #2C3E50;
            }
            .btn-secondary:hover {
                background: #BDC3C7;
            }
        `;
        document.head.appendChild(style);

        // Agregar al DOM
        document.body.appendChild(modal);

        // Event listeners
        const closeBtn = modal.querySelector('.modal-close');
        closeBtn.addEventListener('click', () => {
            modal.remove();
            style.remove();
        });

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                modal.remove();
                style.remove();
            }
        });

        // Cerrar con Escape
        document.addEventListener('keydown', function escapeHandler(e) {
            if (e.key === 'Escape') {
                modal.remove();
                style.remove();
                document.removeEventListener('keydown', escapeHandler);
            }
        });
    }

    // Función para agregar producto al carrito
    function agregarProductoAlCarrito(productoData) {
        // Verificar si el usuario está logueado ANTES de procesar
        if (!verificarUsuarioLogueado()) {
            console.log('🔒 Usuario no logueado, mostrando modal de login');
            mostrarModalLogin();
            return false;
        }

        console.log('📦 Agregando producto:', productoData);
        
        const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
        
        // Buscar si el producto ya existe en el carrito
        const productoExistente = carrito.find(item => item.id == productoData.id);
        
        if (productoExistente) {
            // Si existe, aumentar cantidad
            productoExistente.cantidad += 1;
            productoExistente.subtotal = productoExistente.cantidad * productoExistente.precio;
            console.log('📈 Cantidad actualizada:', productoExistente);
            mostrarNotificacion(`Cantidad actualizada: ${productoExistente.cantidad}x ${productoData.nombre}`, 'info');
        } else {
            // Si no existe, agregarlo
            const nuevoProducto = {
                id: productoData.id,
                nombre: productoData.nombre,
                imagen: productoData.imagen,
                precio: productoData.precio,
                descripcion: productoData.descripcion || '',
                categoria: productoData.categoria || '',
                color: productoData.color || '',
                cantidad: 1,
                subtotal: productoData.precio
            };
            carrito.push(nuevoProducto);
            console.log('🆕 Nuevo producto agregado:', nuevoProducto);
            mostrarNotificacion(`¡${productoData.nombre} agregado al carrito!`, 'success');
        }
        
        // Guardar carrito actualizado
        localStorage.setItem('carrito', JSON.stringify(carrito));
        console.log('💾 Carrito guardado:', carrito);
        
        // Actualizar contador visual
        actualizarContadorCarrito();
        
        return carrito;
    }

    // Event listeners para botones del home y detail
    document.addEventListener('click', function(event) {
        // Verificar si se hizo clic en un botón de agregar al carrito
        const boton = event.target.closest('.btn-add-cart, .btn-add-to-cart, .btn-quick-add');
        if (boton) {
            event.preventDefault();
            console.log('🖱️ Click detectado en botón agregar al carrito');
            console.log('🔍 Clases del botón:', boton.className);
            console.log('🏠 Página actual:', window.location.pathname);
            
            let card = boton.closest('.product-card-featured, .favorite-item');
            console.log('📦 Card encontrada:', card ? 'SÍ' : 'NO');
            if (card) {
                console.log('📦 Clases de la card:', card.className);
            }
            
            // Para la página de detalle, los datos están directamente en el botón
            if (boton.classList.contains('btn-add-to-cart')) {
                console.log('🔍 Detectado botón de página de detalle');
                
                // Obtener cantidad seleccionada
                const cantidadInput = document.querySelector('.quantity-input');
                const cantidad = cantidadInput ? parseInt(cantidadInput.value) || 1 : 1;
                
                // Método 1: Usar data attributes del botón (más confiable)
                let productoData = {
                    id: boton.dataset.id,
                    nombre: boton.dataset.nombre,
                    imagen: boton.dataset.imagen,
                    precio: parseInt(boton.dataset.precio),
                    cantidad: cantidad
                };
                
                // Método 2: Si no hay data attributes, extraer de la página
                if (!productoData.id) {
                    productoData = {
                        id: document.getElementById('product-id')?.textContent || 
                             document.querySelector('.spec-value')?.textContent,
                        nombre: document.getElementById('nombre')?.textContent || 
                                document.querySelector('.product-title')?.textContent,
                        precio: parseInt(document.getElementById('precio')?.textContent.replace(/[^\d]/g, '') ||
                                       document.querySelector('.price-amount')?.textContent.replace(/[^\d]/g, '')),
                        imagen: document.getElementById('main-product-image')?.src.split('/').pop() ||
                                document.querySelector('.main-product-image')?.src.split('/').pop(),
                        descripcion: document.getElementById('descripcion')?.textContent || '',
                        categoria: document.getElementById('categoria')?.textContent || '',
                        color: document.getElementById('color')?.textContent || '',
                        cantidad: cantidad
                    };
                }
                
                console.log('📊 Datos del producto de detalle:', productoData);
                
                if (productoData.id && productoData.nombre && productoData.precio) {
                    // Agregar múltiples unidades si se especificó cantidad
                    for (let i = 0; i < cantidad; i++) {
                        agregarProductoAlCarrito({...productoData, cantidad: 1});
                    }
                } else {
                    console.error('❌ Faltan datos del producto:', productoData);
                    mostrarNotificacion('Error: No se pudieron obtener los datos del producto', 'error');
                }
                return;
            }
            
            // Para cards de productos en home y favorites (btn-add-cart y btn-quick-add)
            console.log('🏠 Detectado botón de home/favorites');
            
            if (!card) {
                console.error('❌ No se encontró la tarjeta de producto');
                console.log('🔍 Intentando buscar card con otros selectores...');
                
                // Buscar contenedor padre alternativo
                card = boton.closest('.product-item, .card, .producto, .product');
                console.log('🔍 Card alternativa encontrada:', card ? 'SÍ' : 'NO');
                
                if (!card) {
                    mostrarNotificacion('Error: No se pudo identificar el producto', 'error');
                    return;
                }
            }
            
            // Método 1: Usar data attributes del botón (más confiable)
            let productoData = {
                id: boton.dataset.id,
                nombre: boton.dataset.nombre,
                imagen: boton.dataset.imagen,
                precio: parseInt(boton.dataset.precio)
            };
            
            console.log('📊 Data attributes del botón:', {
                id: boton.dataset.id,
                nombre: boton.dataset.nombre,
                imagen: boton.dataset.imagen,
                precio: boton.dataset.precio
            });
            
            // Método 2: Si no hay data attributes, intentar extraer del DOM
            if (!productoData.id || !productoData.nombre) {
                console.log('⚠️ Data attributes faltantes, extrayendo del DOM...');
                
                // Buscar por diferentes selectores posibles
                const nombreElement = card.querySelector('.product-name a, .product-title, h3 a, h4 a');
                const precioElement = card.querySelector('.current-price, .precio, .price');
                const imagenElement = card.querySelector('img');
                
                productoData = {
                    id: card.dataset.id || nombreElement?.href?.split('/').pop() || Date.now(),
                    nombre: nombreElement?.textContent?.trim() || 'Producto sin nombre',
                    precio: precioElement ? parseInt(precioElement.textContent.replace(/[^\d]/g, '')) : 0,
                    imagen: imagenElement ? imagenElement.src.split('/').pop() : 'default.jpg'
                };
                
                console.log('📊 Datos extraídos del DOM:', productoData);
            }
            
            // Validar datos antes de agregar
            if (!productoData.id || !productoData.nombre || !productoData.precio) {
                console.error('❌ Datos del producto incompletos:', productoData);
                mostrarNotificacion('Error: No se pudo agregar el producto', 'error');
                return;
            }
            
            console.log('✅ Producto válido, agregando al carrito:', productoData);
            agregarProductoAlCarrito(productoData);
        }
    });

    // Event listeners para botones de cantidad (+ y -)
    document.addEventListener('click', function(event) {
        const quantityBtn = event.target.closest('.quantity-btn');
        if (quantityBtn) {
            event.preventDefault();
            const quantityInput = document.querySelector('.quantity-input');
            if (!quantityInput) return;
            
            const currentValue = parseInt(quantityInput.value) || 1;
            const isIncrease = quantityBtn.classList.contains('increase');
            const isDecrease = quantityBtn.classList.contains('decrease');
            
            if (isIncrease && currentValue < 10) {
                quantityInput.value = currentValue + 1;
            } else if (isDecrease && currentValue > 1) {
                quantityInput.value = currentValue - 1;
            }
            
            // Trigger change event
            quantityInput.dispatchEvent(new Event('change'));
        }
    });

    // Event listener para validar input de cantidad
    document.addEventListener('change', function(event) {
        if (event.target.classList.contains('quantity-input')) {
            const input = event.target;
            let value = parseInt(input.value) || 1;
            
            // Validar rango
            if (value < 1) value = 1;
            if (value > 10) value = 10;
            
            input.value = value;
        }
    });

    // Event listener específico para elementos con onclick (compatibilidad hacia atrás)
    const botonesConOnclick = document.querySelectorAll('[onclick*="agregarAlCarrito"]');
    botonesConOnclick.forEach(boton => {
        console.log('🔧 Botón con onclick encontrado, agregando event listener moderno');
        boton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // Buscar datos en el elemento padre o elementos cercanos
            const contenedor = boton.closest('.product-detail, .producto-detalle') || document;
            
            const id = contenedor.querySelector('#product-id, [data-product-id]')?.textContent ||
                      contenedor.querySelector('.spec-value')?.textContent ||
                      window.location.pathname.split('/').pop();
            
            const nombre = contenedor.querySelector('#nombre')?.textContent ||
                          contenedor.querySelector('.product-title')?.textContent ||
                          document.title;
            
            const precioText = contenedor.querySelector('#precio')?.textContent ||
                              contenedor.querySelector('.price-amount')?.textContent ||
                              '0';
            const precio = parseInt(precioText.replace(/[^\d]/g, ''));
            
            const imagen = contenedor.querySelector('#main-product-image, .main-product-image')?.src?.split('/').pop() ||
                          contenedor.querySelector('img')?.src?.split('/').pop() ||
                          'default.jpg';
            
            const descripcion = contenedor.querySelector('#descripcion')?.textContent || '';
            const categoria = contenedor.querySelector('#categoria')?.textContent || '';
            const color = contenedor.querySelector('#color')?.textContent || '';
            
            const productoData = {
                id: id,
                nombre: nombre,
                imagen: imagen,
                precio: precio,
                descripcion: descripcion,
                categoria: categoria,
                color: color
            };
            
            console.log('🎯 Producto seleccionado desde onclick:', productoData);
            
            // Validar que tenemos los datos mínimos
            if (!productoData.id || !productoData.nombre || !productoData.precio) {
                console.error('❌ Datos del producto incompletos:', productoData);
                mostrarNotificacion('Error: No se pudo agregar el producto', 'error');
                return;
            }
            
            agregarProductoAlCarrito(productoData);
        });
    });

    // Actualizar contador al cargar la página
    actualizarContadorCarrito();
    
    // Debug: Mostrar estado del usuario
    console.log('👤 Estado del usuario:', {
        isLoggedIn: verificarUsuarioLogueado(),
        userInfo: window.petshopConfig?.userInfo || 'No disponible'
    });
    
    console.log('🚀 Sistema de carrito completamente inicializado');
});
