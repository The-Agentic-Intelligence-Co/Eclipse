/**
 * Ejecutores de herramientas de video
 */

import { 
  searchYt, 
  analyzeVideoWithAI, 
  extractTimestampFromAnalysis, 
  generateDirectTimestampUrl 
} from './search.js';

/**
 * Ejecuta la herramienta search_youtube
 */
export async function executeSearchYoutube(toolCall) {
  const args = JSON.parse(toolCall.function.arguments);
  const { query, maxResults = 5 } = args;
  
  const videos = await searchYt(query, maxResults);
  
  if (videos.length === 0) {
    return {
      tool_call_id: toolCall.id,
      functionName: toolCall.function.name,
      content: `No se encontraron videos para la búsqueda: "${query}"`,
      success: true
    };
  }
  
  const formattedResults = videos.map((video, index) => 
    `**${index + 1}. ${video.title}**\n` +
    `📺 ID: ${video.video_id}\n` +
    `👤 Canal: ${video.channelTitle}\n` +
    `📅 Publicado: ${new Date(video.publishedAt).toLocaleDateString()}\n` +
    `🏷️ Hashtags: ${video.hashtags.length > 0 ? video.hashtags.join(', ') : 'Ninguno'}\n` +
    `🔗 URL: https://www.youtube.com/watch?v=${video.video_id}\n`
  ).join('\n---\n');
  
  return {
    tool_call_id: toolCall.id,
    functionName: toolCall.function.name,
    content: `**Resultados de búsqueda para "${query}":**\n\n${formattedResults}`,
    success: true
  };
}

/**
 * Ejecuta la herramienta analyze_video_with_ai
 */
export async function executeAnalyzeVideoWithAI(toolCall) {
  const args = JSON.parse(toolCall.function.arguments);
  const { videoId, prompt } = args;
  
  const analysis = await analyzeVideoWithAI(videoId, prompt);
  
  // Intentar extraer timestamp si existe
  const timestamp = extractTimestampFromAnalysis(analysis);
  let timestampInfo = '';
  if (timestamp) {
    const directUrl = generateDirectTimestampUrl(videoId, timestamp);
    timestampInfo = `\n\n⏰ **Timestamp detectado:** ${Math.floor(timestamp / 60)}:${(timestamp % 60).toString().padStart(2, '0')}\n🔗 **Enlace directo:** ${directUrl}`;
  }
  
  return {
    tool_call_id: toolCall.id,
    functionName: toolCall.function.name,
    content: `**Análisis del video ${videoId}:**\n\n${analysis}${timestampInfo}`,
    success: true
  };
}

/**
 * Ejecuta la herramienta search_and_analyze_video
 */
export async function executeSearchAndAnalyzeVideo(toolCall) {
  const args = JSON.parse(toolCall.function.arguments);
  const { query, analysisPrompt, maxSearchResults = 5 } = args;
  
  // Paso 1: Buscar videos en YouTube
  const videos = await searchYt(query, maxSearchResults);
  
  if (videos.length === 0) {
    return {
      tool_call_id: toolCall.id,
      functionName: toolCall.function.name,
      content: `No se encontraron videos para la búsqueda: "${query}"`,
      success: true
    };
  }
  
  // Paso 2: Tomar el primer resultado y analizarlo
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
  
  // Formatear información del video analizado
  const videoInfo = `**🎬 Video Analizado:**\n` +
    `📺 **Título:** ${firstVideo.title}\n` +
    `👤 **Canal:** ${firstVideo.channelTitle}\n` +
    `📅 **Publicado:** ${new Date(firstVideo.publishedAt).toLocaleDateString()}\n` +
    `🏷️ **Hashtags:** ${firstVideo.hashtags.length > 0 ? firstVideo.hashtags.join(', ') : 'Ninguno'}\n` +
    `🔗 **URL:** https://www.youtube.com/watch?v=${firstVideo.video_id}\n\n`;
  
  // Mostrar también los otros resultados encontrados
  const otherResults = videos.slice(1).map((video, index) => 
    `**${index + 2}. ${video.title}**\n` +
    `👤 Canal: ${video.channelTitle}\n` +
    `🔗 URL: https://www.youtube.com/watch?v=${video.video_id}\n`
  ).join('\n');
  
  const otherResultsSection = otherResults.length > 0 ? 
    `\n---\n**🔍 Otros resultados encontrados:**\n\n${otherResults}` : '';
  
  return {
    tool_call_id: toolCall.id,
    functionName: toolCall.function.name,
    content: `**Búsqueda y Análisis para "${query}":**\n\n${videoInfo}**📊 Análisis con IA:**\n\n${analysis}${timestampInfo}${otherResultsSection}`,
    success: true
  };
}
