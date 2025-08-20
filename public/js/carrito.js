// JavaScript para la funcionalidad del carrito
document.addEventListener('DOMContentLoaded', function() {
    
    // Función para aumentar cantidad
    window.increaseQuantity = function(productId) {
        const input = document.getElementById(`cantidad-${productId}`);
        let currentValue = parseInt(input.value);
        if (currentValue < 10) {
            input.value = currentValue + 1;
            updateQuantity(productId);
        }
    };

    // Función para disminuir cantidad
    window.decreaseQuantity = function(productId) {
        const input = document.getElementById(`cantidad-${productId}`);
        let currentValue = parseInt(input.value);
        if (currentValue > 1) {
            input.value = currentValue - 1;
            updateQuantity(productId);
        }
    };

    // Función para actualizar cantidad
    window.updateQuantity = function(productId) {
        const input = document.getElementById(`cantidad-${productId}`);
        const form = input.closest('.quantity-form');
        
        // Enviar formulario automáticamente
        form.submit();
    };

    // Función para proceder al checkout
    window.proceedToCheckout = function() {
        // Aquí puedes agregar la lógica del checkout
        alert('¡Funcionalidad de pago próximamente! 🚀\n\nPor ahora puedes:\n• Seguir agregando productos\n• Modificar cantidades\n• Guardar tu carrito');
    };

    // Efectos de animación para los botones
    const buttons = document.querySelectorAll('.qty-btn, .btn-remove, .btn-checkout, .btn-clear');
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
    });

    // Animación para cuando se actualiza el carrito
    const cartItems = document.querySelectorAll('.carrito-item');
    cartItems.forEach((item, index) => {
        item.style.animationDelay = `${index * 0.1}s`;
    });

    // Validación de cantidades
    const quantityInputs = document.querySelectorAll('input[name="cantidad"]');
    quantityInputs.forEach(input => {
        input.addEventListener('change', function() {
            let value = parseInt(this.value);
            if (value < 1) {
                this.value = 1;
            } else if (value > 10) {
                this.value = 10;
            }
        });
    });

    // Confirmación mejorada para eliminar productos
    const removeButtons = document.querySelectorAll('.btn-remove');
    removeButtons.forEach(button => {
        const form = button.closest('.remove-form');
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const confirmation = confirm('¿Estás seguro de eliminar este producto del carrito?');
            if (confirmation) {
                // Agregar efecto de salida
                const item = this.closest('.carrito-item');
                item.style.animation = 'fadeOut 0.3s ease-out forwards';
                
                setTimeout(() => {
                    this.submit();
                }, 300);
            }
        });
    });

    // Efecto de carga suave para las imágenes
    const images = document.querySelectorAll('.item-image img');
    images.forEach(img => {
        img.addEventListener('load', function() {
            this.style.opacity = '0';
            this.style.transition = 'opacity 0.3s ease';
            setTimeout(() => {
                this.style.opacity = '1';
            }, 100);
        });
    });

    console.log('🛒 Carrito JavaScript cargado correctamente!');
});

// Agregar estilos adicionales
const additionalStyles = document.createElement('style');
additionalStyles.textContent = `
    @keyframes fadeOut {
        from { 
            opacity: 1; 
            transform: translateX(0); 
        }
        to { 
            opacity: 0; 
            transform: translateX(-100%); 
        }
    }
    
    .quantity-form {
        margin: 0;
    }
    
    .add-to-cart-form {
        margin: 0;
    }
    
    .add-to-cart-form button {
        width: 100%;
    }
    
    /* Efectos adicionales para botones */
    .btn-checkout:active, .btn-login:active {
        transform: scale(0.98);
    }
    
    /* Animación de pulso para el total */
    .total-amount {
        animation: pulse 2s ease-in-out infinite;
    }
    
    @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
    }
`;
document.head.appendChild(additionalStyles);
