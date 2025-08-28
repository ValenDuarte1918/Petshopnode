// Funciones para manejar el carrito

// Función para recalcular el total localmente
function recalcularTotal() {
    let total = 0;
    const items = document.querySelectorAll('.carrito-item');
    
    items.forEach(item => {
        const cantidadInput = item.querySelector('input[type="number"]');
        const precio = parseFloat(cantidadInput.dataset.precio || 0);
        const cantidad = parseInt(cantidadInput.value || 0);
        total += precio * cantidad;
    });
    
    // Actualizar total principal
    const totalElement = document.querySelector('.total-amount');
    if (totalElement) {
        totalElement.textContent = `$${total.toFixed(2)}`;
    }
    
    // También actualizar el subtotal en el resumen
    const subtotalSummary = document.querySelector('.summary-row:first-child span:last-child');
    if (subtotalSummary) {
        subtotalSummary.textContent = `$${total.toFixed(2)}`;
    }
    
    return total;
}

function updateQuantity(productId) {
    const input = document.getElementById(`cantidad-${productId}`);
    const quantity = parseInt(input.value);
    
    if (quantity < 1) {
        input.value = 1;
        return;
    }
    
    fetch(`/carrito/update/${productId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-HTTP-Method-Override': 'PUT',
            'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({ cantidad: quantity })
    })
    .then(response => response.json())
    .then(data => {
        console.log('📥 Respuesta del servidor:', data);
        if (data.success) {
            // Actualizar total principal
            const totalElement = document.querySelector('.total-amount');
            if (totalElement) {
                totalElement.textContent = `$${data.total}`;
            }
            
            // También actualizar el subtotal en el resumen (que es igual al total)
            const subtotalSummary = document.querySelector('.summary-row:first-child span:last-child');
            if (subtotalSummary) {
                subtotalSummary.textContent = `$${data.total}`;
            }
            
            // Actualizar subtotal del producto
            const subtotalElement = document.querySelector(`#subtotal-${productId}`);
            if (subtotalElement) {
                const precio = parseFloat(input.dataset.precio || 0);
                subtotalElement.textContent = `$${(precio * quantity).toFixed(2)}`;
            }
            
            // Recalcular total localmente para actualización inmediata
            recalcularTotal();
            
            // Actualizar contador del header
            if (typeof actualizarContadorDesdeServidor === 'function' && data.cartCount !== undefined) {
                actualizarContadorDesdeServidor(data.cartCount);
            }
            
            showNotification('Cantidad actualizada', 'success');
        } else {
            showNotification(data.message || 'Error al actualizar', 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('Error de conexión', 'error');
    });
}

function increaseQuantity(productId) {
    const input = document.getElementById(`cantidad-${productId}`);
    const currentValue = parseInt(input.value) || 1;
    const maxValue = parseInt(input.max) || 10;
    
    if (currentValue < maxValue) {
        input.value = currentValue + 1;
        
        // Actualizar subtotal inmediatamente para mejor UX
        const precio = parseFloat(input.dataset.precio || 0);
        const subtotalElement = document.querySelector(`#subtotal-${productId}`);
        if (subtotalElement) {
            subtotalElement.textContent = `$${(precio * (currentValue + 1)).toFixed(2)}`;
        }
        
        // Recalcular total inmediatamente
        recalcularTotal();
        
        // Enviar actualización al servidor
        updateQuantity(productId);
    }
}

function decreaseQuantity(productId) {
    const input = document.getElementById(`cantidad-${productId}`);
    const currentValue = parseInt(input.value) || 1;
    
    if (currentValue > 1) {
        input.value = currentValue - 1;
        
        // Actualizar subtotal inmediatamente para mejor UX
        const precio = parseFloat(input.dataset.precio || 0);
        const subtotalElement = document.querySelector(`#subtotal-${productId}`);
        if (subtotalElement) {
            subtotalElement.textContent = `$${(precio * (currentValue - 1)).toFixed(2)}`;
        }
        
        // Recalcular total inmediatamente
        recalcularTotal();
        
        // Enviar actualización al servidor
        updateQuantity(productId);
    }
}

function removeFromCart(productId) {
    if (!confirm('¿Estás seguro de eliminar este producto del carrito?')) {
        return;
    }
    
    fetch(`/carrito/remove/${productId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-HTTP-Method-Override': 'DELETE',
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Remover el elemento del DOM
            const itemElement = document.querySelector(`[data-product-id="${productId}"]`);
            if (itemElement) {
                itemElement.remove();
            }
            
            // Actualizar total principal
            const totalElement = document.querySelector('.total-amount');
            if (totalElement) {
                totalElement.textContent = `$${data.total}`;
            }
            
            // También actualizar el subtotal en el resumen
            const subtotalSummary = document.querySelector('.summary-row:first-child span:last-child');
            if (subtotalSummary) {
                subtotalSummary.textContent = `$${data.total}`;
            }
            
            // Si no hay más productos, mostrar carrito vacío
            if (data.cartCount === 0) {
                location.reload();
            }
            
            showNotification('Producto eliminado del carrito', 'success');
        } else {
            showNotification(data.message || 'Error al eliminar', 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('Error de conexión', 'error');
    });
}

function clearCart() {
    if (!confirm('¿Estás seguro de vaciar todo el carrito?')) {
        return;
    }
    
    fetch('/carrito/clear', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            location.reload();
        } else {
            showNotification(data.message || 'Error al vaciar carrito', 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('Error de conexión', 'error');
    });
}

function showNotification(message, type = 'info') {
    // Remover notificación anterior si existe
    const existente = document.querySelector('.notification-toast');
    if (existente) {
        existente.remove();
    }

    // Crear notificación
    const notificacion = document.createElement('div');
    notificacion.className = `notification-toast ${type}`;
    
    let icono = 'ℹ️';
    if (type === 'success') icono = '✅';
    if (type === 'error') icono = '❌';
    if (type === 'warning') icono = '⚠️';
    
    notificacion.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">${icono}</span>
            <span class="notification-message">${message}</span>
        </div>
    `;

    // Estilos
    notificacion.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 350px;
    `;

    document.body.appendChild(notificacion);
    
    // Animar entrada
    setTimeout(() => {
        notificacion.style.transform = 'translateX(0)';
    }, 100);

    // Auto-remover después de 3 segundos
    setTimeout(() => {
        notificacion.style.transform = 'translateX(100%)';
        setTimeout(() => notificacion.remove(), 300);
    }, 3000);
}

// Event listeners cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    console.log('🛒 Script del carrito cargado');
    
    // Manejar formularios de cantidad
    document.querySelectorAll('.quantity-form').forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const productId = this.action.split('/').pop().split('?')[0];
            updateQuantity(productId);
        });
    });
    
    // Manejar formularios de eliminación
    document.querySelectorAll('.remove-form').forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (!confirm('¿Estás seguro de eliminar este producto del carrito?')) {
                return;
            }
            
            const productId = this.action.split('/').pop().split('?')[0];
            
            // Hacer petición AJAX
            fetch(`/carrito/remove/${productId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showNotification('Producto eliminado del carrito', 'success');
                    
                    // Actualizar contador del header
                    if (typeof actualizarContadorDesdeServidor === 'function' && data.cartCount !== undefined) {
                        actualizarContadorDesdeServidor(data.cartCount);
                    }
                    
                    // Si no hay más productos, recargar para mostrar carrito vacío
                    if (data.cartCount === 0) {
                        setTimeout(() => location.reload(), 1000);
                    } else {
                        // Remover el elemento del DOM y actualizar total
                        const itemElement = this.closest('.carrito-item');
                        if (itemElement) {
                            itemElement.remove();
                        }
                        
                        // Actualizar total
                        const totalElement = document.querySelector('.summary-total .total-amount');
                        if (totalElement) {
                            totalElement.textContent = `$${data.total.toFixed(2)}`;
                        }
                    }
                } else {
                    showNotification(data.message || 'Error al eliminar', 'error');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showNotification('Error de conexión', 'error');
            });
        });
    });
    
    // Manejar formulario de vaciar carrito
    document.querySelectorAll('.clear-cart-form').forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (!confirm('¿Estás seguro de vaciar todo el carrito?')) {
                return;
            }
            
            // Hacer petición AJAX en lugar de envío normal del formulario
            fetch('/carrito/clear', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showNotification('Carrito vaciado exitosamente', 'success');
                    
                    // Actualizar contador del header
                    if (typeof actualizarContadorDesdeServidor === 'function') {
                        actualizarContadorDesdeServidor(0);
                    }
                    
                    // Recargar la página después de un breve delay
                    setTimeout(() => {
                        location.reload();
                    }, 1000);
                } else {
                    showNotification(data.message || 'Error al vaciar carrito', 'error');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showNotification('Error de conexión', 'error');
            });
        });
    });
    
    // Manejar cambios manuales en los inputs de cantidad
    document.querySelectorAll('input[type="number"][id^="cantidad-"]').forEach(input => {
        input.addEventListener('change', function() {
            const productId = this.id.replace('cantidad-', '');
            const newValue = parseInt(this.value) || 1;
            
            // Validar rango
            if (newValue < 1) {
                this.value = 1;
                return;
            }
            if (newValue > 10) {
                this.value = 10;
                return;
            }
            
            // Actualizar subtotal inmediatamente
            const precio = parseFloat(this.dataset.precio || 0);
            const subtotalElement = document.querySelector(`#subtotal-${productId}`);
            if (subtotalElement) {
                subtotalElement.textContent = `$${(precio * newValue).toFixed(2)}`;
            }
            
            // Recalcular total inmediatamente
            recalcularTotal();
            
            // Enviar actualización al servidor
            updateQuantity(productId);
        });
    });
});

console.log('🛒 Script del carrito cargado');