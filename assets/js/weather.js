const WEATHER_CODE_MAP = {
    0: {
        label: "Cielo despejado",
        icon: "bi-brightness-high"
    },
    1: {
        label: "Mayormente despejado",
        icon: "bi-brightness-high"
    },
    2: {
        label: "Parcialmente nublado",
        icon: "bi-cloud-sun"
    },
    3: {
        label: "Nublado",
        icon: "bi-cloud"
    },
    45: {
        label: "Niebla",
        icon: "bi-cloud-fog"
    },
    48: {
        label: "Niebla con escarcha",
        icon: "bi-cloud-fog2"
    },
    51: {
        label: "Llovizna ligera",
        icon: "bi-cloud-drizzle"
    },
    53: {
        label: "Llovizna moderada",
        icon: "bi-cloud-drizzle"
    },
    55: {
        label: "Llovizna intensa",
        icon: "bi-cloud-drizzle-fill"
    },
    61: {
        label: "Lluvia ligera",
        icon: "bi-cloud-rain"
    },
    63: {
        label: "Lluvia moderada",
        icon: "bi-cloud-rain"
    },
    65: {
        label: "Lluvia intensa",
        icon: "bi-cloud-rain-heavy"
    },
    71: {
        label: "Nieve ligera",
        icon: "bi-cloud-snow"
    },
    73: {
        label: "Nieve moderada",
        icon: "bi-cloud-snow"
    },
    75: {
        label: "Nieve intensa",
        icon: "bi-cloud-snow-fill"
    },
    80: {
        label: "Chubascos ligeros",
        icon: "bi-cloud-rain"
    },
    81: {
        label: "Chubascos moderados",
        icon: "bi-cloud-rain"
    },
    82: {
        label: "Chubascos violentos",
        icon: "bi-cloud-rain-heavy"
    },
    95: {
        label: "Tormenta",
        icon: "bi-cloud-lightning-rain"
    },
    96: {
        label: "Tormenta con granizo ligero",
        icon: "bi-cloud-lightning-rain"
    },
    99: {
        label: "Tormenta con granizo fuerte",
        icon: "bi-cloud-lightning-rain"
    }
};

export function getWeatherCodeInfo(code) {
    return WEATHER_CODE_MAP[code] || {
        label: "Condición no disponible",
        icon: "bi-cloud"
    };
}

export async function geocodeCity(cityName) {
    const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
    url.searchParams.set("name", cityName);
    url.searchParams.set("count", "1");
    url.searchParams.set("language", "es");
    url.searchParams.set("format", "json");

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("No fue posible consultar la ubicación de la ciudad.");
    }

    const data = await response.json();

    if (!data.results || !data.results.length) {
        throw new Error("No se encontró la ciudad especificada.");
    }

    const place = data.results[0];

    return {
        name: place.name,
        country: place.country,
        admin1: place.admin1 || "",
        latitude: place.latitude,
        longitude: place.longitude
    };
}

export async function fetchCurrentWeather(latitude, longitude) {
    const url = new URL("https://api.open-meteo.com/v1/forecast");

    url.searchParams.set("latitude", latitude);
    url.searchParams.set("longitude", longitude);
    url.searchParams.set(
        "current",
        [
            "temperature_2m",
            "relative_humidity_2m",
            "apparent_temperature",
            "weather_code",
            "wind_speed_10m"
        ].join(",")
    );
    url.searchParams.set("timezone", "auto");

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("No fue posible consultar el clima actual.");
    }

    const data = await response.json();

    if (!data.current) {
        throw new Error("La respuesta del servicio meteorológico es inválida.");
    }

    return data.current;
}

export async function getCityWeather(cityName) {
    const location = await geocodeCity(cityName);
    const current = await fetchCurrentWeather(location.latitude, location.longitude);
    console.log('data => ', {
        location, current
    });

    return {
        location,
        current,
        weatherInfo: getWeatherCodeInfo(current.weather_code)
    };
}

export function formatWeatherUpdateTime(timeValue) {
    if (!timeValue) return "--";

    const date = new Date(timeValue);

    if (Number.isNaN(date.getTime())) return timeValue;

    return date.toLocaleString("es-MX", {
        dateStyle: "medium",
        timeStyle: "short"
    });
}