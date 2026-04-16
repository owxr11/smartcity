document.addEventListener('DOMContentLoaded', () => { // espera que todo este cargado antes de hacer el evento 
    const userName = localStorage.getItem('userName') || 'Usuario'
    document.getElementById(userName).textContent = userName

    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.removeItem('userName')
        window.location.href = 'login.html'
    })
}) 