document.addEventListener("DOMContentLoaded", function () {
    console.log('🛒 Carrito page JavaScript cargado');
    
    // Verificar si hay productos del backend o si debemos cargar desde localStorage
    const carritoExistente = document.querySelector('.carrito-items .carrito-item');
    const carritoVacio = document.querySelector('.carrito-empty');
    
    console.log('🔍 Estado inicial:', {
        carritoExistente: !!carritoExistente,
        carritoVacio: !!carritoVacio
    });
    
    // Si no hay productos del backend y no está marcado como vacío, cargar desde localStorage
    if (!carritoExistente && !carritoVacio) {
        cargarCarritoDesdeLocalStorage();
    } else if (carritoVacio) {
        // Si está marcado como vacío pero hay productos en localStorage, cargar desde localStorage
        const carritoLS = JSON.parse(localStorage.getItem('carrito')) || [];
        if (carritoLS.length > 0) {
            console.log('📦 Productos encontrados en localStorage, sobrescribiendo vista vacía');
            cargarCarritoDesdeLocalStorage();
        }
    }
    
    // Siempre actualizar el contador
    actualizarContadorCarrito();
    
    // Función para cargar productos desde localStorage y mostrarlos
    function cargarCarritoDesdeLocalStorage() {
        const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
        console.log('📦 Carrito desde localStorage:', carrito);
        
        if (carrito.length === 0) {
            mostrarCarritoVacio();
            return;
        }
        
        // Verificar si existe la estructura básica, si no, crearla
        const carritoContent = document.querySelector('.carrito-content');
        if (!carritoContent) {
            crearEstructuraCarrito(carrito);
        } else {
            mostrarProductosCarrito(carrito);
            calcularTotal(carrito);
        }
    }
    
    // Función para mostrar carrito vacío
    function mostrarCarritoVacio() {
        const main = document.querySelector('main.carrito-container');
        if (main) {
            main.innerHTML = `
                <div class="carrito-header animate-fadeInUp">
                    <div class="back-button">
                        <a href="/" class="btn-back">
                            <i class="fas fa-arrow-left"></i>
                            Seguir Comprando
                        </a>
                    </div>
                    <h1><i class="fas fa-shopping-cart"></i> Mi Carrito de Compras</h1>
                </div>
                <div class="carrito-empty animate-bounceIn">
                    <div class="empty-state">
                        <i class="fas fa-shopping-cart empty-icon"></i>
                        <h2>Tu carrito está vacío</h2>
                        <p>¡Descubre nuestros increíbles productos para tu mascota!</p>
                        <a href="/" class="btn-shop">
                            <i class="fas fa-paw"></i>
                            Comenzar a Comprar
                        </a>
                    </div>
                </div>
            `;
        }
    }
    
    // Función para mostrar productos del carrito
    function mostrarProductosCarrito(carrito) {
        const carritoItemsContainer = document.querySelector('.carrito-items');
        if (!carritoItemsContainer) {
            // Si no existe el contenedor, crear toda la estructura
            crearEstructuraCarrito(carrito);
            return;
        }
        
        // Limpiar contenedor existente
        carritoItemsContainer.innerHTML = '';
        
        carrito.forEach((item, index) => {
            const itemElement = document.createElement('div');
            itemElement.className = `carrito-item animate-fadeInLeft delay-${(index % 3) + 1}`;
            itemElement.innerHTML = `
                <div class="item-image">
                    <img src="/images/products/${item.imagen}" alt="${item.nombre}" onerror="this.src='/images/logo_petshop.jpeg'" />
                </div>
                <div class="item-details">
                    <h3>${item.nombre}</h3>
                    <p class="item-price">$${parseInt(item.precio).toLocaleString('es-AR')}</p>
                    <p class="item-description">${item.descripcion || ''}</p>
                </div>
                <div class="item-quantity">
                    <label for="cantidad-${item.id}">Cantidad:</label>
                    <div class="quantity-controls">
                        <button type="button" class="qty-btn" onclick="cambiarCantidad('${item.id}', -1)">
                            <i class="fas fa-minus"></i>
                        </button>
                        <input type="number" 
                               id="cantidad-${item.id}" 
                               value="${item.cantidad}" 
                               min="1" 
                               max="10"
                               onchange="actualizarCantidad('${item.id}', this.value)"
                               readonly>
                        <button type="button" class="qty-btn" onclick="cambiarCantidad('${item.id}', 1)">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                </div>
                <div class="item-total">
                    <p class="subtotal">$${(parseInt(item.precio) * item.cantidad).toLocaleString('es-AR')}</p>
                </div>
                <div class="item-actions">
                    <button type="button" class="btn-remove" onclick="eliminarProducto('${item.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            carritoItemsContainer.appendChild(itemElement);
        });
    }
    
    // Función para crear toda la estructura del carrito
    function crearEstructuraCarrito(carrito) {
        const main = document.querySelector('main.carrito-container');
        if (!main) return;
        
        const total = carrito.reduce((sum, item) => sum + (parseInt(item.precio) * item.cantidad), 0);
        
        main.innerHTML = `
            <div class="carrito-header animate-fadeInUp">
                <div class="back-button">
                    <a href="/" class="btn-back">
                        <i class="fas fa-arrow-left"></i>
                        Seguir Comprando
                    </a>
                </div>
                <h1><i class="fas fa-shopping-cart"></i> Mi Carrito de Compras</h1>
            </div>
            
            <div class="carrito-content animate-fadeInUp delay-1">
                <div class="carrito-items">
                    <!-- Los productos se insertan aquí -->
                </div>
                
                <div class="carrito-summary animate-fadeInRight delay-2">
                    <div class="summary-card">
                        <h3><i class="fas fa-calculator"></i> Resumen del Pedido</h3>
                        <div class="summary-row">
                            <span>Subtotal:</span>
                            <span id="subtotal-amount">$${total.toLocaleString('es-AR')}</span>
                        </div>
                        <div class="summary-row">
                            <span>Envío:</span>
                            <span class="free-shipping">GRATIS</span>
                        </div>
                        <div class="summary-row total-row">
                            <span>Total:</span>
                            <span class="total-amount" id="total-amount">$${total.toLocaleString('es-AR')}</span>
                        </div>
                        
                        <div class="checkout-actions">
                            <button class="btn-checkout" onclick="procederAlPago()">
                                <i class="fas fa-credit-card"></i>
                                Proceder al Pago
                            </button>
                            
                            <button type="button" class="btn-clear" onclick="vaciarCarrito()">
                                <i class="fas fa-trash-alt"></i>
                                Vaciar Carrito
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Ahora insertar los productos
        mostrarProductosCarrito(carrito);
    }
    
    // Función para calcular y actualizar el total
    function calcularTotal(carrito) {
        const total = carrito.reduce((sum, item) => sum + (parseInt(item.precio) * item.cantidad), 0);
        
        const subtotalElement = document.getElementById('subtotal-amount');
        const totalElement = document.getElementById('total-amount');
        
        if (subtotalElement) {
            subtotalElement.textContent = `$${total.toLocaleString('es-AR')}`;
        }
        if (totalElement) {
            totalElement.textContent = `$${total.toLocaleString('es-AR')}`;
        }
    }
    
    // Función para cambiar cantidad
    window.cambiarCantidad = function(productId, cambio) {
        const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
        const producto = carrito.find(item => item.id == productId);
        
        if (producto) {
            producto.cantidad += cambio;
            if (producto.cantidad <= 0) {
                eliminarProducto(productId);
                return;
            }
            
            localStorage.setItem('carrito', JSON.stringify(carrito));
            
            // Actualizar la vista
            const cantidadInput = document.getElementById(`cantidad-${productId}`);
            if (cantidadInput) {
                cantidadInput.value = producto.cantidad;
            }
            
            // Actualizar subtotal del producto
            const itemTotal = cantidadInput.closest('.carrito-item').querySelector('.subtotal');
            if (itemTotal) {
                itemTotal.textContent = `$${(parseInt(producto.precio) * producto.cantidad).toLocaleString('es-AR')}`;
            }
            
            calcularTotal(carrito);
            actualizarContadorCarrito();
        }
    };
    
    // Función para actualizar cantidad directamente
    window.actualizarCantidad = function(productId, nuevaCantidad) {
        const cantidad = parseInt(nuevaCantidad);
        if (cantidad <= 0) {
            eliminarProducto(productId);
            return;
        }
        
        const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
        const producto = carrito.find(item => item.id == productId);
        
        if (producto) {
            producto.cantidad = cantidad;
            localStorage.setItem('carrito', JSON.stringify(carrito));
            
            // Actualizar subtotal del producto
            const cantidadInput = document.getElementById(`cantidad-${productId}`);
            const itemTotal = cantidadInput.closest('.carrito-item').querySelector('.subtotal');
            if (itemTotal) {
                itemTotal.textContent = `$${(parseInt(producto.precio) * producto.cantidad).toLocaleString('es-AR')}`;
            }
            
            calcularTotal(carrito);
            actualizarContadorCarrito();
        }
    };
    
    // Función para eliminar producto
    window.eliminarProducto = function(productId) {
        if (!confirm('¿Estás seguro de eliminar este producto?')) {
            return;
        }
        
        let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
        carrito = carrito.filter(item => item.id != productId);
        localStorage.setItem('carrito', JSON.stringify(carrito));
        
        if (carrito.length === 0) {
            mostrarCarritoVacio();
        } else {
            mostrarProductosCarrito(carrito);
            calcularTotal(carrito);
        }
        
        actualizarContadorCarrito();
    };
    
    // Función para vaciar carrito
    window.vaciarCarrito = function() {
        if (!confirm('¿Estás seguro de vaciar el carrito?')) {
            return;
        }
        
        localStorage.removeItem('carrito');
        mostrarCarritoVacio();
        actualizarContadorCarrito();
    };
    
    // Función para proceder al pago
    window.procederAlPago = function() {
        const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
        if (carrito.length === 0) {
            alert('Tu carrito está vacío');
            return;
        }
        
        // Aquí podrías redirigir a una página de checkout o procesar el pago
        alert('Funcionalidad de pago en desarrollo');
    };
    
    // Función para actualizar contador del carrito en el header
    function actualizarContadorCarrito() {
        const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
        const contador = carrito.reduce((total, item) => total + item.cantidad, 0);
        let contadorElement = document.querySelector('.cart-badge');
        
        if (!contadorElement && contador > 0) {
            const cartIcon = document.querySelector('.cart-icon');
            if (cartIcon) {
                contadorElement = document.createElement('span');
                contadorElement.className = 'cart-badge';
                cartIcon.appendChild(contadorElement);
            }
        }
        
        if (contadorElement) {
            if (contador > 0) {
                contadorElement.textContent = contador;
                contadorElement.style.display = 'inline';
            } else {
                contadorElement.style.display = 'none';
            }
        }
    }
    
    console.log('🚀 Sistema de carrito localStorage iniciado');
});
