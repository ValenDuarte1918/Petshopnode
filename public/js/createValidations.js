window.onload = function() {
    // Verificar que estamos en la página correcta
    const form = document.querySelector('form');
    if (!form) return;
    
    const inputName = document.querySelector('#name');
    if (inputName) {
        inputName.focus();
    }
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        let errores = []
        
        if(form.name.value == '') {
            form.name.classList.remove('valid');
            form.name.classList.add('errors');
            errores.push('El campo "Nombre" es obligatorio.');
        } else {
            form.name.classList.remove('errors');
            form.name.classList.add('valid');
        }
        
        if(form.description.value == '') {
            form.description.classList.remove('valid');
            form.description.classList.add('errors');
            errores.push('El campo "Descripcion" es obligatorio.');
        } else {
            form.description.classList.remove('errors');
            form.description.classList.add('valid');
        }
        
        if(form.price.value == '') {
            form.price.classList.remove('valid');
            form.price.classList.add('errors');
            errores.push('El campo "Precio" es obligatorio.');
        } else {
            form.price.classList.remove('errors');
            form.price.classList.add('valid');
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
                'Producto creado con éxito!',
                'success'
            ).then(() => {
                form.submit()
            });
        }
    });
}