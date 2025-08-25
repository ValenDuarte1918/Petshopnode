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

    // Función para agregar producto al carrito
    function agregarProductoAlCarrito(productoData) {
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
            
            let card = boton.closest('.product-card-featured, .favorite-item');
            
            // Para la página de detalle, los datos están directamente en el botón
            if (boton.classList.contains('btn-add-to-cart')) {
                console.log('🔍 Detectado botón de página de detalle');
                
                // Método 1: Usar data attributes del botón (más confiable)
                let productoData = {
                    id: boton.dataset.id,
                    nombre: boton.dataset.nombre,
                    imagen: boton.dataset.imagen,
                    precio: parseInt(boton.dataset.precio)
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
                        color: document.getElementById('color')?.textContent || ''
                    };
                }
                
                console.log('📊 Datos del producto de detalle:', productoData);
                
                if (productoData.id && productoData.nombre && productoData.precio) {
                    agregarProductoAlCarrito(productoData);
                } else {
                    console.error('❌ Faltan datos del producto:', productoData);
                    mostrarNotificacion('Error: No se pudieron obtener los datos del producto', 'error');
                }
                return;
            }
            
            // Para cards de productos en home y favorites
            if (!card) {
                console.error('❌ No se encontró la tarjeta de producto');
                return;
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
    
    console.log('🚀 Sistema de carrito completamente inicializado');
});
