// Clase para manejar el proceso de checkout usando la API
class CheckoutManager {
    constructor() {
        this.apiBase = '/api';
        this.paymentMethods = [];
        this.cartInfo = null;
        this.init();
    }

    // Inicializar el checkout
    async init() {
        try {
            await this.loadPaymentMethods();
            await this.loadCartInfo();
            this.setupEventListeners();
            } catch (error) {
            this.showError('Error al cargar información del checkout');
        }
    }

    // Cargar métodos de pago disponibles
    async loadPaymentMethods() {
        try {
            const response = await fetch(`${this.apiBase}/payment/methods`);
            const result = await response.json();
            
            if (result.success) {
                this.paymentMethods = result.data;
                this.renderPaymentMethods();
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            console.error('Error cargando métodos de pago:', error);
            throw error;
        }
    }

    // Cargar información del carrito
    async loadCartInfo() {
        try {
            const response = await fetch(`${this.apiBase}/cart`, {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });
            const result = await response.json();
            if (result.success) {
                this.cartInfo = result.data;
                // Verificar cada item del carrito
                if (this.cartInfo.items) {
                    this.cartInfo.items.forEach((item, index) => {
                        });
                }
                
                this.renderCartSummary();
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            throw error;
        }
    }

    // Validar dirección de envío
    async validateShippingAddress(addressData) {
        try {
            const response = await fetch(`${this.apiBase}/shipping/validate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify(addressData)
            });
            
            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Error validando dirección:', error);
            return {
                success: false,
                error: 'NETWORK_ERROR',
                message: 'Error de conexión'
            };
        }
    }

    // Procesar pago
    async processPayment(paymentData) {
        try {
            this.showLoading('Procesando pago...');
            
            const response = await fetch(`${this.apiBase}/payment/process`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify(paymentData)
            });
            
            const result = await response.json();
            
            this.hideLoading();
            
            if (result.success) {
                this.showSuccess(result);
                return result;
            } else {
                this.showError(result.message, result.error);
                return result;
            }
        } catch (error) {
            this.hideLoading();
            console.error('Error procesando pago:', error);
            this.showError('Error de conexión al procesar el pago');
            return {
                success: false,
                error: 'NETWORK_ERROR',
                message: 'Error de conexión'
            };
        }
    }

    // Renderizar métodos de pago
    renderPaymentMethods() {
        const container = document.getElementById('payment-methods');
        if (!container) return;

        container.innerHTML = this.paymentMethods.map(method => `
            <div class="payment-method ${method.enabled ? '' : 'disabled'}" data-method="${method.id}">
                <input type="radio" name="paymentMethod" value="${method.id}" ${method.enabled ? '' : 'disabled'}>
                <div class="method-info">
                    <i class="${method.icon}"></i>
                    <div>
                        <h4>${method.name}</h4>
                        <p>${method.description}</p>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Renderizar resumen del carrito
    renderCartSummary() {
        const container = document.getElementById('cart-summary');
        if (!container || !this.cartInfo) {
            return;
        }

        // Usar subtotal de la API o calcularlo si no existe
        const subtotal = this.cartInfo.subtotal || this.cartInfo.items.reduce((sum, item) => {
            const precio = parseFloat(item.precio) || 0;
            const cantidad = parseInt(item.cantidad) || 0;
            return sum + (precio * cantidad);
        }, 0);
        
        const shipping = subtotal >= 45000 ? 0 : 5000;
        const tax = subtotal * 0.21;
        const total = subtotal + shipping + tax;

        container.innerHTML = `
            <div class="summary-items">
                ${this.cartInfo.items.map(item => {
                    const precio = parseFloat(item.precio) || 0;
                    const cantidad = parseInt(item.cantidad) || 0;
                    const itemTotal = precio * cantidad;
                    return `
                        <div class="summary-item">
                            <span>${item.nombre} x${cantidad}</span>
                            <span>$${itemTotal.toFixed(2)}</span>
                        </div>
                    `;
                }).join('')}
            </div>
            <div class="summary-totals">
                <div class="summary-row">
                    <span>Subtotal:</span>
                    <span>$${subtotal.toFixed(2)}</span>
                </div>
                <div class="summary-row">
                    <span>Envío:</span>
                    <span>${shipping === 0 ? 'GRATIS' : '$' + shipping.toFixed(2)}</span>
                </div>
                <div class="summary-row">
                    <span>IVA (21%):</span>
                    <span>$${tax.toFixed(2)}</span>
                </div>
                <div class="summary-row total">
                    <span><strong>Total:</strong></span>
                    <span><strong>$${total.toFixed(2)}</strong></span>
                </div>
            </div>
        `;
    }

    // Configurar event listeners
    setupEventListeners() {
        // Validación de dirección en tiempo real
        const addressInputs = document.querySelectorAll('#shipping-form input');
        addressInputs.forEach(input => {
            input.addEventListener('blur', () => this.validateAddressForm());
        });

        // Procesar pago
        const checkoutForm = document.getElementById('checkout-form');
        if (checkoutForm) {
            checkoutForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleCheckoutSubmit();
            });
        }

        // Cambio de método de pago
        document.addEventListener('change', (e) => {
            if (e.target.name === 'paymentMethod') {
                this.handlePaymentMethodChange(e.target.value);
            }
        });
    }

    // Manejar envío del formulario de checkout
    async handleCheckoutSubmit() {
        const formData = this.collectFormData();
        
        // Validar formulario
        const validation = this.validateForm(formData);
        if (!validation.valid) {
            this.showError(validation.message);
            return;
        }

        // Procesar pago
        const result = await this.processPayment(formData);
        
        if (result.success) {
            // Redirigir a página de confirmación
            window.location.href = `/order-confirmation?orderId=${result.data.orderId}`;
        }
    }

    // Recopilar datos del formulario
    collectFormData() {
        return {
            shippingAddress: {
                address: document.getElementById('address')?.value,
                city: document.getElementById('city')?.value,
                postalCode: document.getElementById('postalCode')?.value,
                state: document.getElementById('state')?.value
            },
            paymentMethod: document.querySelector('input[name="paymentMethod"]:checked')?.value,
            cardDetails: this.getCardDetails()
        };
    }

    // Obtener detalles de tarjeta si es necesario
    getCardDetails() {
        const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value;
        
        if (paymentMethod === 'credit_card' || paymentMethod === 'debit_card') {
            return {
                number: document.getElementById('cardNumber')?.value,
                expiry: document.getElementById('cardExpiry')?.value,
                cvv: document.getElementById('cardCvv')?.value,
                name: document.getElementById('cardName')?.value
            };
        }
        
        return null;
    }

    // Validar formulario
    validateForm(formData) {
        const { shippingAddress, paymentMethod } = formData;
        
        if (!shippingAddress.address || !shippingAddress.city || 
            !shippingAddress.postalCode || !shippingAddress.state) {
            return {
                valid: false,
                message: 'Todos los campos de dirección son requeridos'
            };
        }

        if (!paymentMethod) {
            return {
                valid: false,
                message: 'Selecciona un método de pago'
            };
        }

        return { valid: true };
    }

    // Manejar cambio de método de pago
    handlePaymentMethodChange(method) {
        const cardFields = document.getElementById('card-fields');
        
        if (method === 'credit_card' || method === 'debit_card') {
            cardFields?.classList.remove('hidden');
        } else {
            cardFields?.classList.add('hidden');
        }
    }

    // Validar formulario de dirección
    async validateAddressForm() {
        const addressData = {
            address: document.getElementById('address')?.value,
            city: document.getElementById('city')?.value,
            postalCode: document.getElementById('postalCode')?.value,
            state: document.getElementById('state')?.value
        };

        if (Object.values(addressData).every(value => value && value.trim())) {
            const result = await this.validateShippingAddress(addressData);
            
            if (result.success) {
                this.showAddressValid(result.data);
            } else {
                this.showAddressInvalid(result.message);
            }
        }
    }

    // Mostrar dirección válida
    showAddressValid(data) {
        const indicator = document.getElementById('address-validation');
        if (indicator) {
            indicator.innerHTML = `
                <div class="validation-success">
                    ✅ Dirección válida
                    <div>Costo de envío: $${data.shippingCost}</div>
                    <div>Entrega estimada: ${data.estimatedDelivery}</div>
                </div>
            `;
        }
    }

    // Mostrar dirección inválida
    showAddressInvalid(message) {
        const indicator = document.getElementById('address-validation');
        if (indicator) {
            indicator.innerHTML = `
                <div class="validation-error">
                    ❌ ${message}
                </div>
            `;
        }
    }

    // Mostrar loading
    showLoading(message) {
        const overlay = document.createElement('div');
        overlay.id = 'loading-overlay';
        overlay.innerHTML = `
            <div class="loading-content">
                <div class="spinner"></div>
                <p>${message}</p>
            </div>
        `;
        document.body.appendChild(overlay);
    }

    // Ocultar loading
    hideLoading() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.remove();
        }
    }

    // Mostrar éxito
    showSuccess(result) {
        alert(`¡Pago exitoso!\nID de transacción: ${result.data.transactionId}\nTotal: $${result.data.amount}`);
    }

    // Mostrar error
    showError(message, errorCode = null) {
        const fullMessage = errorCode ? `Error (${errorCode}): ${message}` : message;
        // Mostrar en la UI en lugar de alert
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #e74c3c;
            color: white;
            padding: 1rem;
            border-radius: 8px;
            z-index: 9999;
            max-width: 400px;
        `;
        errorDiv.textContent = fullMessage;
        document.body.appendChild(errorDiv);
        
        // Remover después de 5 segundos
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 5000);
    }
}

// Inicializar cuando se carga la página de checkout
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('checkout-form')) {
        window.checkoutManager = new CheckoutManager();
    }
});

