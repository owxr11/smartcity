document.getElementById('loginForm')?.addEventListener('submit', (e) => {
    e.preventDefault()

    const email = document.getElementById('loginEmail').value
    const password = document.getElementById('loginPassword').value

    if (!email || !password) {
        showAlert('loginAlert', 'Por favor, completa todos los campos')
        return
    }

    localStorage.setItem('userName', email.split('@'[0]))

    window.location.href = 'dashboard.html'
})