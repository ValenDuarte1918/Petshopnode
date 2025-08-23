document.addEventListener("DOMContentLoaded", function () {
    console.log('🛒 Carrito JavaScript cargado correctamente!');
    
    // Inicializar carrito si no existe
    if (!localStorage.getItem('carrito')) {
        localStorage.setItem('carrito', JSON.stringify([]));
        console.log('🛒 Carrito inicializado en localStorage');
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
        }
        
        localStorage.setItem('carrito', JSON.stringify(carrito));
        console.log('💾 Carrito guardado en localStorage:', carrito);
        
        // Mostrar notificación
        mostrarNotificacion(`${productoData.nombre} agregado al carrito`);
        
        // Actualizar contador del carrito si existe
        actualizarContadorCarrito();
    }

    // Función para mostrar notificación
    function mostrarNotificacion(mensaje) {
        console.log('🔔 Mostrando notificación:', mensaje);
        
        // Crear elemento de notificación
        const notificacion = document.createElement('div');
        notificacion.className = 'cart-notification';
        notificacion.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${mensaje}</span>
        `;
        
        // Agregar estilos inline
        notificacion.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #28a745;
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            z-index: 9999;
            display: flex;
            align-items: center;
            gap: 10px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            animation: slideIn 0.3s ease;
            font-weight: 600;
        `;
        
        document.body.appendChild(notificacion);
        console.log('✅ Notificación agregada al DOM');
        
        // Remover después de 3 segundos
        setTimeout(() => {
            if (notificacion.parentNode) {
                notificacion.remove();
                console.log('🗑️ Notificación removida');
            }
        }, 3000);
    }

    // Función para actualizar contador del carrito
    function actualizarContadorCarrito() {
        const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
        const contador = carrito.reduce((total, item) => total + item.cantidad, 0);
        let contadorElement = document.querySelector('.cart-badge');
        
        // Si no existe el elemento contador, crearlo
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
            console.log('🔢 Contador actualizado:', contador);
        } else {
            console.log('⚠️ No se encontró elemento del contador del carrito');
        }
    }

    // Event listeners para botones del home (clase .btn-add-cart)
    document.addEventListener('click', function(event) {
        // Verificar si se hizo clic en un botón de agregar al carrito
        const boton = event.target.closest('.btn-add-cart');
        if (boton) {
            event.preventDefault();
            console.log('🖱️ Click detectado en botón agregar al carrito');
            
            const card = boton.closest('.product-card-featured');
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
            
            // Método 2: Si no hay data attributes, extraer de la tarjeta
            if (!productoData.id || !productoData.nombre || !productoData.precio || isNaN(productoData.precio)) {
                console.log('📄 Extrayendo datos de la tarjeta HTML...');
                
                const nombreElement = card.querySelector('.product-name a');
                const imagenElement = card.querySelector('.product-image img');
                const precioElement = card.querySelector('.current-price');
                
                console.log('🔍 Elementos encontrados:', {
                    nombre: nombreElement?.textContent,
                    imagen: imagenElement?.src,
                    precio: precioElement?.textContent
                });
                
                productoData = {
                    id: boton.dataset.id || Date.now().toString(),
                    nombre: nombreElement ? nombreElement.textContent.trim() : 'Producto sin nombre',
                    imagen: imagenElement ? imagenElement.src.split('/').pop() : 'default.jpg',
                    precio: precioElement ? parseInt(precioElement.textContent.replace(/[^\d]/g, '')) : 0,
                    descripcion: 'Producto de calidad premium para mascotas',
                    categoria: 'General',
                    color: 'Estándar'
                };
            } else {
                // Completar datos faltantes
                productoData.descripcion = 'Producto de calidad premium para mascotas';
                productoData.categoria = 'General';
                productoData.color = 'Estándar';
            }
            
            console.log('🎯 Datos del producto extraídos:', productoData);
            
            // Validar que tenemos los datos mínimos
            if (!productoData.id || !productoData.nombre || !productoData.precio) {
                console.error('❌ Datos del producto incompletos:', productoData);
                mostrarNotificacion('Error: No se pudo agregar el producto');
                return;
            }
            
            agregarProductoAlCarrito(productoData);
        }
    });

    // Event listener para botón del detalle (clase .add-to-cart-button)
    const botonDetalle = document.querySelector('.add-to-cart-button');
    if (botonDetalle) {
        console.log('🔍 Botón de detalle encontrado');
        botonDetalle.addEventListener('click', function(event) {
            event.preventDefault();
            console.log('🖱️ Click en botón de detalle');
            
            // Obtener datos desde elementos de la página
            const idElement = document.querySelector('.id');
            const nombreElement = document.querySelector('#nombre');
            const imagenElement = document.querySelector('#imagen');
            const precioElement = document.querySelector('#precio');
            const descripcionElement = document.querySelector('#descripcion');
            const categoriaElement = document.querySelector('#categoria');
            const colorElement = document.querySelector('#color');
            
            const id = idElement ? idElement.textContent.trim() : (botonDetalle.dataset.id || 'unknown');
            const nombre = nombreElement ? nombreElement.textContent.trim() : (botonDetalle.dataset.nombre || 'Producto sin nombre');
            const imagen = imagenElement ? imagenElement.src.split('/').pop() : (botonDetalle.dataset.imagen || 'default.jpg');
            const precio = precioElement ? parseInt(precioElement.textContent.replace(/[^\d]/g, '')) : (parseInt(botonDetalle.dataset.precio) || 0);
            const descripcion = descripcionElement ? descripcionElement.textContent.trim() : (botonDetalle.dataset.descripcion || '');
            const categoria = categoriaElement ? categoriaElement.textContent.replace('categoria:', '').trim() : (botonDetalle.dataset.categoria || '');
            const color = colorElement ? colorElement.textContent.replace('color disponible:', '').trim() : (botonDetalle.dataset.color || '');
            
            const productoData = {
                id: id,
                nombre: nombre,
                imagen: imagen,
                precio: precio,
                descripcion: descripcion,
                categoria: categoria,
                color: color
            };
            
            console.log('🎯 Producto seleccionado desde el detalle:', productoData);
            
            // Validar que tenemos los datos mínimos
            if (!productoData.id || !productoData.nombre || !productoData.precio) {
                console.error('❌ Datos del producto incompletos:', productoData);
                mostrarNotificacion('Error: No se pudo agregar el producto');
                return;
            }
            
            agregarProductoAlCarrito(productoData);
        });
    }

    // Actualizar contador al cargar la página
    actualizarContadorCarrito();
    
    console.log('🚀 Sistema de carrito completamente inicializado');
});