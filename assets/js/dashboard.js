import { observeAuth, logoutUser, getCurrentUserProfile, hideAlert, showAlert, setButtonLoading, updateCurrentUserProfile } from "./auth.js"
// Import Nuevo Fase 3
import { getCityWeather, formatWeatherUpdateTime } from "./weather.js"

import { fetchNewsByCity, formatNewsDate, escapeHtml } from "./news.js"

const userName = document.getElementById('userName')
const navUserName = document.getElementById('navUserName')
const userEmail = document.getElementById('userEmail')
const favoriteCity = document.getElementById('favoriteCity')
const logoutBtn = document.getElementById('logoutBtn')

// Const nuevas para el clima
const refreshWeatherBtn = document.getElementById('refreshWeatherBtn')
const weatherAlert = document.getElementById('weatherAlert')
const weatherLoading = document.getElementById('weatherLoading')
const weatherContent = document.getElementById('weatherContent')
const weatherCityName = document.getElementById('weatherCityName')
const weatherDescription = document.getElementById('weatherDescription')
const weatherTemperature = document.getElementById('weatherTemperature')
const weatherApparentTemp = document.getElementById('weatherApparentTemp')
const weatherHumidity = document.getElementById('weatherHumidity')
const weatherWind = document.getElementById('weatherWind')
const weatherCoords = document.getElementById('weatherCoords')
const weatherUpdatedAt = document.getElementById('weatherUpdatedAt')
const weatherIcon = document.getElementById('weatherIcon')

// Constantes para el perfil
const editProfileForm = document.getElementById('editProfileForm')
const editName = document.getElementById('editName')
const editEmail = document.getElementById('editEmail')
const editCity = document.getElementById('editCity')
const editProfileBtn = document.getElementById('editProfileBtn')

const editProfileModalElement = document.getElementById('editProfileModal')
const editProfileModal = editProfileModalElement ? bootstrap.Modal.getOrCreateInstance(editProfileModalElement) : null

// constantes de noticias
const newsAlert = document.getElementById('newsAlert')
const newsLoading = document.getElementById('newsLoading')
const newsEmpty = document.getElementById('newsEmpty')
const newsGrid = document.getElementById('newsGrid')
const refreshNewsBtn = document.getElementById('refreshNewsBtn')

// Funciones de Clima
let currentFavoriteCity = ''
// Variables de usuario
let currentUser = null
let currentProfile = null
let userLogged

const showWeatherAlert = message => {
    weatherAlert.textContent = message
    weatherAlert.classList.remove('d-none')
}

const hideWeatherAlert = () => {
    weatherAlert.textContent = ''
    weatherAlert.classList.add('d-none')
}

const showNewsAlert = message => {
    newsAlert.textContent = message
    newsAlert.classList.remove('d-none')
}

const hideNewsAlert = () => {
    newsAlert.textContent = ''
    newsAlert.classList.add('d-none')
}

const setWeatherLoading = isLoading => {
    weatherLoading.classList.toggle('d-none', !isLoading)
    refreshWeatherBtn.disabled = isLoading
}

const setNewsLoading = isLoading => {
    newsLoading.classList.toggle('d-none', !isLoading)
    refreshNewsBtn.disabled = isLoading
}

const clearNews = () => {
    newsGrid.innerHTML = ''
    newsEmpty.classList.add('d-none')
}

const hideWeatherContent = () => {
    weatherContent.classList.add('d-none')
}

const showWeatherContent = () => {
    weatherContent.classList.remove('d-none')
}

const buildLocationLabel = location => {
    const parts = [location.name]
    if (location.admin1) {
        parts.push(location.admin1)
    }
    if (location.country) {
        parts.push(location.country)
    }
    return parts.join(", ")
}

const renderWeather = weatherData => {
    const { location, current, weatherInfo } = weatherData
    console.log('@@ render - weather => ', { location, current, weatherInfo })

    weatherCityName.textContent = buildLocationLabel(location)
    weatherDescription.textContent = weatherInfo.label
    weatherTemperature.textContent = `${Math.round(current.temperature_2m)} °C`
    weatherApparentTemp.textContent = `${Math.round(current.apparent_temperature)} °C`
    weatherHumidity.textContent = `${current.relative_humidity_2m}%`
    weatherWind.textContent = `${current.wind_speed_10m} Km/h`
    weatherCoords.textContent = `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`
    weatherUpdatedAt.textContent = formatWeatherUpdateTime(current.time)
    weatherIcon.className = `bi ${weatherInfo.icon} weather-main-icon`
    showWeatherContent()
}

const renderProfile = (user, profile) => {
    const resolvedName = profile?.name || user.email?.split('@')[0] || Usuario
    const resolvedEmail = profile?.email || user.email || '-'
    const resolvedCity = profile?.favoriteCity?.trim() || ''

    userName.textContent = resolvedName
    navUserName.textContent = resolvedName
    userEmail.textContent = resolvedEmail
    favoriteCity.textContent = resolvedCity || 'No Definida'

    editName.value = resolvedName
    editEmail.value = resolvedEmail
    editCity.value = resolvedCity

    currentFavoriteCity = resolvedCity
}



function renderNews(articles) {
    clearNews();

    if (!articles.length) {
        newsEmpty.classList.remove("d-none");
        return;
    }

    newsGrid.innerHTML = articles.map((article) => {
        const safeTitle = escapeHtml(article.title);
        const safeDomain = escapeHtml(article.domain);
        const safeDate = escapeHtml(formatNewsDate(article.seenDate));
        const safeUrl = escapeHtml(article.url);
        const safeImage = escapeHtml(article.image);
        const imageBlock = safeImage
            ? `<img src="${safeImage}" class="news-img" alt="${safeTitle}" loading="lazy" referrerpolicy="no-referrer">`
            : `
        <div class="news-img-placeholder">
          <i class="bi bi-newspaper"></i>
        </div>
      `;

        return `
      <div class="col-md-6 col-xl-4">
        <article class="news-card h-100">
          <div class="news-img-wrap">
            ${imageBlock}
          </div>
          <div class="news-card-body">
            <div class="d-flex align-items-center justify-content-between gap-2 mb-2">
              <span class="badge text-bg-light border">${safeDomain}</span>
              <span class="news-date">${safeDate}</span>
            </div>
            <h5 class="news-title">${safeTitle}</h5>
            <a href="${safeUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-outline-success mt-3">
              Leer noticia
              <i class="bi bi-box-arrow-up-right ms-1"></i>
            </a>
          </div>
        </article>
      </div>
    `;
    }).join("");
}

const reloadProfileAndWeather = async () => {
    if (!currentUser) {
        return
    }
    const profile = await getCurrentUserProfile(currentUser.uid)
    currentProfile = profile
    renderProfile(currentUser, profile)

    await Promise.allSettled([
        loadWeather(currentFavoriteCity),
        loadNews(currentFavoriteCity)
    ])
}

const loadWeather = async (city) => {
    if (!city) {
        hideWeatherContent()
        showWeatherAlert('No tienes una ciudad definida')
        return
    }

    hideWeatherAlert()
    hideWeatherContent()
    setWeatherLoading(true)

    try {
        const weatherData = await getCityWeather(city)
        console.log('@@@ weather => ', weatherData)
        renderWeather(weatherData)
    } catch (error) {
        hideWeatherContent()
        showWeatherAlert(error.message || 'No se encontro el clima')
    } finally {
        setWeatherLoading(false)
    }
}
// Terminan Funciones de Clima

async function loadNews(city) {
    if (!city) {
        clearNews();
        showNewsAlert("No tienes una ciudad favorita definida para buscar noticias.");
        return;
    }

    hideNewsAlert();
    clearNews();
    setNewsLoading(true);

    try {
        const articles = await fetchNewsByCity(city);
        renderNews(articles);
    } catch (error) {
        clearNews();
        showNewsAlert(error.message || "No fue posible cargar las noticias.");
    } finally {
        setNewsLoading(false);
    }
}

observeAuth(async (user) => {
    if (!user) {
        window.location.href = './../../login.html'
        return
    }

    try {
        currentUser = user
        const profile = await getCurrentUserProfile(user.uid)
        currentProfile = profile
        renderProfile(user, profile)

        await Promise.allSettled([
            loadWeather(currentFavoriteCity),
            loadNews(currentFavoriteCity)
        ])
    } catch (error) {
        showWeatherAlert('No fue posible cargar tu perfil')
    }
})

logoutBtn?.addEventListener('click', async () => {
    await logoutUser()
    window.location.href = './../../login.html'
})

refreshWeatherBtn?.addEventListener('click', async () => {
    await loadWeather(currentFavoriteCity)
})

refreshNewsBtn?.addEventListener('click', async () => {
    await loadNews(currentFavoriteCity)
})

editProfileForm?.addEventListener('submit', async (event) => {
    event.preventDefault()

    hideAlert('profileAlert')
    hideAlert('profileSuccess')

    const name = editName.value.trim()
    const city = editCity.value.trim()

    if (!name) {
        showAlert('profileAlert', 'El nombre es obligatorio')
    }

    if (!city) {
        showAlert('profileAlert', 'La ciudad es obligatoria')
    }

    try {
        setButtonLoading(
            saveProfileBtn,
            true,
            '<i class="bi bi-check-circle m-2"></i> Guardar Camibios',
            'Guardando...'
        )

        await updateCurrentUserProfile(currentUser.uid, {
            name,
            favoriteCity: city
        })

        showAlert('profileSuccess', 'Perfil Actualizado')
        await reloadProfileAndWeather()
        setTimeout(() => {
            editProfileModal?.hide()
            hideAlert('profileSuccess')
        }, 1500)
    } catch (error) {
        showAlert('profileAlert', error.message || 'No se pudo actualizar')
    } finally {
        setButtonLoading(
            saveProfileBtn,
            false,
            '<i class="bi bi-check-circle m-2"></i> Guardar Camibios'
        )
    }
})
