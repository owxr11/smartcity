export async function fetchNewsByCity(cityName) {
    const cleanCity = String(cityName || "Mexico").trim();

    const queries = [
        `"${cleanCity}" sourcelang:spanish`,
        `"${cleanCity}"`,
        `Mexico sourcelang:spanish`
    ];

    for (const query of queries) {
        try {
            const articles = await requestGdelt(query);

            if (articles.length) {
                return articles;
            }
        } catch (error) {
            console.warn("GDELT falló con query:", query, error.message);
        }
    }

    return [];
}

async function requestGdelt(query) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const url = new URL("https://api.gdeltproject.org/api/v2/doc/doc");
    url.searchParams.set("query", query);
    url.searchParams.set("mode", "artlist");
    url.searchParams.set("format", "json");
    url.searchParams.set("maxrecords", "6");
    url.searchParams.set("sort", "datedesc");

    try {
        const response = await fetch(url.toString(), {
            signal: controller.signal
        });

        if (!response.ok) {
            throw new Error(`Error HTTP ${response.status}`);
        }

        const data = await response.json();
        const articles = Array.isArray(data.articles) ? data.articles : [];

        return articles.map(normalizeArticle).filter(Boolean);
    } finally {
        clearTimeout(timeoutId);
    }
}

function normalizeArticle(article) {
    if (!article?.title || !article?.url) return null;

    return {
        title: article.title,
        url: article.url,
        image: article.socialimage || "",
        domain: article.domain || "Fuente no disponible",
        language: article.language || "",
        sourceCountry: article.sourcecountry || "",
        seenDate: article.seendate || ""
    };
}

export function formatNewsDate(value) {
    if (!value) return "Fecha no disponible";

    const normalized = String(value).replace(
        /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/,
        "$1-$2-$3T$4:$5:$6Z"
    );

    const date = new Date(normalized);

    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleString("es-MX", {
        dateStyle: "medium",
        timeStyle: "short"
    });
}

export function escapeHtml(value) {
    return String(value || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}