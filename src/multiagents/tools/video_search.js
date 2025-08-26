// Configuración de la API de YouTube
const YOUTUBE_API_KEY = "AIzaSyC3ekSF0lZN91aNLK8c0QlWzgqfo8H2kiM";
const YOUTUBE_API_URL = "https://www.googleapis.com/youtube/v3";

/**
 * Busca videos en YouTube
 * @param {string} query - Término de búsqueda
 * @param {number} maxResults - Número máximo de resultados (por defecto 5)
 * @param {string} pageToken - Token para paginación (opcional)
 * @returns {Promise<Array>} Array con información de los videos
 */
export async function searchYt(query, maxResults = 5, pageToken = null) {
    try {
        const params = new URLSearchParams({
            part: "snippet",
            maxResults: maxResults.toString(),
            q: query,
            videoCaption: "any",
            type: "video",
            key: YOUTUBE_API_KEY
        });

        if (pageToken) {
            params.append("pageToken", pageToken);
        }

        const response = await fetch(`${YOUTUBE_API_URL}/search?${params}`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(`Error de API: ${data.error?.message || 'Error desconocido'}`);
        }

        // Extraer solo la información relevante
        const extractedData = data.items.map(item => ({
            video_id: item.id.videoId,
            title: item.snippet.title,
            channelTitle: item.snippet.channelTitle,
            publishedAt: item.snippet.publishedAt,
            hashtags: extractHashtags(item.snippet.description)
        }));

        return extractedData;
    } catch (error) {
        console.error("Error al buscar videos:", error);
        return [];
    }
}

/**
 * Extrae hashtags del texto de descripción
 * @param {string} description - Texto de descripción
 * @returns {Array<string>} Array de hashtags encontrados
 */
function extractHashtags(description) {
    const hashtagRegex = /#\w+/g;
    const hashtags = description.match(hashtagRegex);
    return hashtags || [];
}

/**
 * Analiza un video usando Google Generative AI
 * @param {string} videoId - ID del video de YouTube
 * @param {string} customPrompt - Prompt personalizado (opcional)
 * @returns {Promise<string>} Respuesta del análisis del video
 */
export async function analyzeVideoWithAI(videoId, customPrompt = null) {
    try {
        const { GoogleGenerativeAI } = await import("@google/generative-ai");
        
        const genAI = new GoogleGenerativeAI("AIzaSyAjhElUElRbIOQHh1hp7IokzOIwOKYSOZk");
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
        
        // Prompt por defecto si no se proporciona uno personalizado
        const defaultPrompt = "Analyze this video and provide a comprehensive summary. Include key points, main topics discussed, and any notable moments. Be specific and informative.";
        const prompt = customPrompt || defaultPrompt;
        
        const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
        
        console.log(`\n🤖 Analizando video con AI: ${videoUrl}`);
        console.log("⏳ Esto puede tomar unos momentos...");
        
        const result = await model.generateContent([
            prompt,
            {
                fileData: {
                    fileUri: videoUrl,
                },
            },
        ]);
        
        return result.response.text();
    } catch (error) {
        console.error("Error al analizar video con AI:", error.message);
        return `Error en el análisis: ${error.message}`;
    }
}

/**
 * Extrae el timestamp de inicio de la respuesta de Gemini
 * @param {string} analysis - Respuesta del análisis de Gemini
 * @returns {number|null} Timestamp en segundos o null si no se encuentra
 */
export function extractTimestampFromAnalysis(analysis) {
    try {
        // Buscar patrón MM:SS o M:SS en la respuesta
        const timestampMatch = analysis.match(/(\d{1,2}):(\d{2})/);
        if (timestampMatch) {
            const minutes = parseInt(timestampMatch[1]);
            const seconds = parseInt(timestampMatch[2]);
            return minutes * 60 + seconds;
        }
        return null;
    } catch (error) {
        console.error("Error al extraer timestamp:", error);
        return null;
    }
}

/**
 * Genera una URL directa con timestamp para un video
 * @param {string} videoId - ID del video de YouTube
 * @param {number} timestamp - Timestamp en segundos
 * @returns {string} URL directa al momento específico
 */
export function generateDirectTimestampUrl(videoId, timestamp) {
    return `https://www.youtube.com/watch?v=${videoId}&t=${timestamp}s`;
}
