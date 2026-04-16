document.getElementById('registerForm')?.addEventListener('submit', (e) => {
    e.preventDefault() // para que no se refresque la pagina 

    const name = document.getElementById('name').value
    const email = document.getElementById('email').value
    const password = document.getElementById('password').value
    const confirmPassword = document.getElementById('confirmPassword').value

    if (!name || !email || !password || !confirmPassword) {
        showAlert('registerAlert', 'Todos los datos son obligatorios')
        return
    }

    if (password != confirmPassword) {
        showAlert('registerAlert', 'Las contraseñas no son iguales')
        return
    }

    // Simulacion de registro 
    localStorage.setItem('userName', name)
    showAlert('registerAlert', 'Registro Satisfactorio')
    window.location.href = 'login.html'


})