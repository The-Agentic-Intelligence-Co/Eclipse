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
        console.log("🔍 Buscando videos en YouTube:", query);
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
    // Buscar patrones de tiempo en el análisis
    const timePatterns = [
        /(\d{1,2}):(\d{2})/g,  // Formato MM:SS
        /(\d{1,2})h(\d{2})m(\d{2})s/g,  // Formato HH:MM:SS
        /(\d+)m(\d+)s/g,  // Formato MM:SS
        /(\d+)s/g  // Solo segundos
    ];
    
    let timestamp = null;
    
    for (const pattern of timePatterns) {
        const match = analysis.match(pattern);
        if (match) {
            // Convertir a segundos (implementación básica)
            if (pattern.source.includes(':')) {
                const [minutes, seconds] = match[0].split(':').map(Number);
                timestamp = minutes * 60 + seconds;
                break;
            }
        }
    }
    
    return timestamp;
}

/**
 * Genera URL directa con timestamp
 * @param {string} videoId - ID del video de YouTube
 * @param {number} timestamp - Timestamp en segundos
 * @returns {string} URL con timestamp
 */
export function generateDirectTimestampUrl(videoId, timestamp) {
    return `https://www.youtube.com/watch?v=${videoId}&t=${timestamp}s`;
}

/**
 * Función integrada: busca videos en YouTube y analiza el primer resultado
 * @param {string} query - Término de búsqueda
 * @param {string} analysisPrompt - Prompt personalizado para el análisis (opcional)
 * @param {number} maxSearchResults - Número máximo de resultados de búsqueda (por defecto 5)
 * @returns {Promise<Object>} Objeto con información del video analizado y otros resultados
 */
export async function searchAndAnalyzeVideo(query, analysisPrompt = null, maxSearchResults = 5) {
    try {
        // Paso 1: Buscar videos
        const videos = await searchYt(query, maxSearchResults);
        
        if (videos.length === 0) {
            return {
                success: false,
                error: `No se encontraron videos para la búsqueda: "${query}"`,
                videos: [],
                analysis: null
            };
        }
        
        // Paso 2: Analizar el primer resultado
        const firstVideo = videos[0];
        console.log(`🔍 Analizando el primer resultado: "${firstVideo.title}" (ID: ${firstVideo.video_id})`);
        
        const analysis = await analyzeVideoWithAI(firstVideo.video_id, analysisPrompt);
        
        // Intentar extraer timestamp si existe
        const timestamp = extractTimestampFromAnalysis(analysis);
        let timestampInfo = '';
        if (timestamp) {
            const directUrl = generateDirectTimestampUrl(firstVideo.video_id, timestamp);
            timestampInfo = `\n\n⏰ **Timestamp detectado:** ${Math.floor(timestamp / 60)}:${(timestamp % 60).toString().padStart(2, '0')}\n🔗 **Enlace directo:** ${directUrl}`;
        }
        
        return {
            success: true,
            query,
            analyzedVideo: {
                ...firstVideo,
                analysis: analysis + timestampInfo
            },
            otherVideos: videos.slice(1),
            totalFound: videos.length
        };
        
    } catch (error) {
        console.error('Error en búsqueda y análisis integrado:', error);
        return {
            success: false,
            error: `Error en búsqueda y análisis: ${error.message}`,
            videos: [],
            analysis: null
        };
    }
}
