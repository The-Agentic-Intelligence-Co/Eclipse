// Video tool executors

import { 
  searchYt, 
  analyzeVideoWithAI, 
  extractTimestampFromAnalysis, 
  generateDirectTimestampUrl 
} from './search';

import type { ToolCall, ToolResult } from '../tabs/types';
import type { SearchYoutubeArgs, AnalyzeVideoArgs, SearchAndAnalyzeArgs } from './types';

// Execute search_youtube tool
export async function executeSearchYoutube(toolCall: ToolCall): Promise<ToolResult> {
  const args: SearchYoutubeArgs = JSON.parse(toolCall.function.arguments);
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
    `🏷️ Hashtags: ${video.hashtags.length > 0 ? video.hashtags.join(', ') : 'None'}\n` +
    `🔗 URL: https://www.youtube.com/watch?v=${video.video_id}\n`
  ).join('\n---\n');
  
  return {
    tool_call_id: toolCall.id,
    functionName: toolCall.function.name,
    content: `**Search results for "${query}":**\n\n${formattedResults}`,
    success: true
  };
}

// Execute analyze_video_with_ai tool
export async function executeAnalyzeVideoWithAI(toolCall: ToolCall): Promise<ToolResult> {
  const args: AnalyzeVideoArgs = JSON.parse(toolCall.function.arguments);
  const { videoId, prompt } = args;
  
  const analysis = await analyzeVideoWithAI(videoId, prompt);
  
  // Try to extract timestamp if it exists
  const timestamp = extractTimestampFromAnalysis(analysis);
  let timestampInfo = '';
  if (timestamp) {
    const directUrl = generateDirectTimestampUrl(videoId, timestamp);
    timestampInfo = `\n\n⏰ **Timestamp detected:** ${Math.floor(timestamp / 60)}:${(timestamp % 60).toString().padStart(2, '0')}\n🔗 **Direct link:** ${directUrl}`;
  }
  
  return {
    tool_call_id: toolCall.id,
    functionName: toolCall.function.name,
    content: `**Analysis of video ${videoId}:**\n\n${analysis}${timestampInfo}`,
    success: true
  };
}

// Execute search_and_analyze_video tool
export async function executeSearchAndAnalyzeVideo(toolCall: ToolCall): Promise<ToolResult> {
  const args: SearchAndAnalyzeArgs = JSON.parse(toolCall.function.arguments);
  const { query, analysisPrompt, maxSearchResults = '5' } = args;
  const maxResults = parseInt(maxSearchResults, 10) || 5;
  
  // Step 1: Search videos on YouTube
  const videos = await searchYt(query, maxResults);
  
  if (videos.length === 0) {
    return {
      tool_call_id: toolCall.id,
      functionName: toolCall.function.name,
      content: `No se encontraron videos para la búsqueda: "${query}"`,
      success: true
    };
  }
  
  // Step 2: Take the first result and analyze it
  const firstVideo = videos[0];
  console.log(`🔍 Analyzing first result: "${firstVideo.title}" (ID: ${firstVideo.video_id})`);
  
  const analysis = await analyzeVideoWithAI(firstVideo.video_id, analysisPrompt);
  
  // Try to extract timestamp if it exists
  const timestamp = extractTimestampFromAnalysis(analysis);
  let timestampInfo = '';
  if (timestamp) {
    const directUrl = generateDirectTimestampUrl(firstVideo.video_id, timestamp);
    timestampInfo = `\n\n⏰ **Timestamp detected:** ${Math.floor(timestamp / 60)}:${(timestamp % 60).toString().padStart(2, '0')}\n🔗 **Direct link:** ${directUrl}`;
  }
  
  // Format analyzed video information
  const videoInfo = `**🎬 Analyzed Video:**\n` +
    `📺 **Title:** ${firstVideo.title}\n` +
    `👤 **Channel:** ${firstVideo.channelTitle}\n` +
    `📅 **Published:** ${new Date(firstVideo.publishedAt).toLocaleDateString()}\n` +
    `🏷️ **Hashtags:** ${firstVideo.hashtags.length > 0 ? firstVideo.hashtags.join(', ') : 'None'}\n` +
    `🔗 **URL:** https://www.youtube.com/watch?v=${firstVideo.video_id}\n\n`;
  
  // Also show other results found
  const otherResults = videos.slice(1).map((video, index) => 
    `**${index + 2}. ${video.title}**\n` +
    `👤 Canal: ${video.channelTitle}\n` +
    `🔗 URL: https://www.youtube.com/watch?v=${video.video_id}\n`
  ).join('\n');
  
  const otherResultsSection = otherResults.length > 0 ? 
    `\n---\n**🔍 Other results found:**\n\n${otherResults}` : '';
  
  return {
    tool_call_id: toolCall.id,
    functionName: toolCall.function.name,
    content: `**Search and Analysis for "${query}":**\n\n${videoInfo}**📊 AI Analysis:**\n\n${analysis}${timestampInfo}${otherResultsSection}`,
    success: true
  };
}
