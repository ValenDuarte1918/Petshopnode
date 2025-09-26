window.onload = function() {
    // Verificar que estamos en la página correcta
    const form = document.querySelector('form');
    if (!form) return;
    
    const inputEmail = document.querySelector('#email');
    if (inputEmail) {
        inputEmail.focus();
    }
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        let errores = []
        
        if(form.email.value == '') {
            form.email.classList.remove('valid');
            form.email.classList.add('errors');
            errores.push('El campo "email" es obligatorio.');
        } else {
            form.email.classList.remove('errors');
            form.email.classList.add('valid');
        }
        
        if(form.contraseña.value == '') {
            form.contraseña.classList.remove('valid');
            form.contraseña.classList.add('errors');
            errores.push('El campo "contraseña" es obligatorio.');
        } else {
            form.contraseña.classList.remove('errors');
            form.contraseña.classList.add('valid');
        }

        if (errores.length != 0) {
            // Mostrar errores usando SweetAlert
            let mensajeErrores = errores.join('\n');
            Swal.fire({
                icon : 'error',
                title : 'Error en el formulario',
                text : mensajeErrores
            });
        } else {
            // Si no hay errores, enviar el formulario
            form.submit();
        }
    });
}