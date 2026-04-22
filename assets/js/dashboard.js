import { observeAuth, logoutUser, getCurrentUserProfile } from "./auth.js"

const userName = document.getElementById('userName')
const navUserName = document.getElementById('navUserName')
const userEmail = document.getElementById('userEmail')
const favoriteCity = document.getElementById('favoriteCity')
const logoutBnt = document.getElementById('logoutBtn')

observeAuth(async (user) => {
    if (!user) {
        window.location.href = '../../login.hmtl'
        return
    }
    const profile = await getCurrentUserProfile(user.uid)

    const resolvedName = profile?.name || 'Usuario'
    const resolvedEmail = profile?.email || '--'
    const resolvedCity = profile?.favoriteCity || 'No Added'

    userName.textContent = resolvedName
    navUserName.textContent = resolvedName
    userEmail.textContent = resolvedEmail
    favoriteCity.textContent = resolvedCity
})


logoutBnt?.addEventListener('click', async () => {
    await logoutUser()
    window.location.href = '../../login.html'
})