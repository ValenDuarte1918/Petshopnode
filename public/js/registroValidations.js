window.onload = function() {
    // Verificar que estamos en la página correcta
    const form = document.querySelector('form');
    if (!form) return;
    
    const inputNombre = document.querySelector('#nombre');
    if (inputNombre) {
        inputNombre.focus();
    }
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        let errores = []
        
        if(form.nombre.value == '' || form.nombre.value.length < 2) {
            form.nombre.classList.remove('valid');
            form.nombre.classList.add('errors');
            errores.push('El nombre debe de tener al menos 2 caracteres.');
        } else {
            form.nombre.classList.remove('errors');
            form.nombre.classList.add('valid');
        }
        
        if(form.apellido.value == '' || form.apellido.value.length < 2) {
            form.apellido.classList.remove('valid');
            form.apellido.classList.add('errors');
            errores.push('El apellido debe de tener al menos 3 caracteres.');
        } else {
            form.apellido.classList.remove('errors');
            form.apellido.classList.add('valid');
        }
        
        if(form.correo.value == '' || form.correo.value.length < 2) {
            form.correo.classList.remove('valid');
            form.correo.classList.add('errors');
            errores.push('El correo electronico debe ser valido.');
        } else {
            form.correo.classList.remove('errors');
            form.correo.classList.add('valid');
        }
        
        if(form.contrasena.value == '' || form.contrasena.value.length < 8) {
            form.contrasena.classList.remove('valid');
            form.contrasena.classList.add('errors');
            errores.push('La contraseña debe tener al menos 8 caracteres.');
        } else {
            form.contrasena.classList.remove('errors');
            form.contrasena.classList.add('valid');
        }
        
        const ul = document.querySelector('.errores');

        if (errores.length != 0) {
            ul.innerHTML = ''
            ul.classList.add('alert-warning');
            for (let i = 0; i < errores.length; i++) {
                const error = errores[i];
                ul.innerHTML += `<li>${error}</li>`;
            }
            Swal.fire({
                icon : 'error',
                title : 'Hubo un error!',
                text : 'Revisar los errores!'
            });
        } else {
            Swal.fire(
                'Buen trabajo!',
                'Te registraste con exito!',
                'success'
            ).then(() => {
                form.submit()
            });
        }
    });
}
