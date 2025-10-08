// YouTube API configuration
import { YOUTUBE_CONFIG, GOOGLE_AI_CONFIG } from '../core/config';
import type { YouTubeVideo, SearchAndAnalyzeResult } from './types';

// Search for videos on YouTube
export async function searchYt(
  query: string, 
  maxResults: number = YOUTUBE_CONFIG.DEFAULT_MAX_RESULTS, 
  pageToken: string | null = null
): Promise<YouTubeVideo[]> {
  try {
    console.log("🔍 Searching videos on YouTube:", query);
    const params = new URLSearchParams({
      part: "snippet",
      maxResults: Math.min(maxResults, YOUTUBE_CONFIG.MAX_RESULTS).toString(),
      q: query,
      videoCaption: "any",
      type: "video",
      key: YOUTUBE_CONFIG.API_KEY
    });

    if (pageToken) {
      params.append("pageToken", pageToken);
    }

    const response = await fetch(`${YOUTUBE_CONFIG.API_URL}/search?${params}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(`API Error: ${data.error?.message || 'Unknown error'}`);
    }

    // Extract only relevant information
    const extractedData: YouTubeVideo[] = data.items.map((item: any) => ({
      video_id: item.id.videoId,
      title: item.snippet.title,
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt,
      hashtags: extractHashtags(item.snippet.description)
    }));

    return extractedData;
  } catch (error) {
    console.error("Error searching videos:", error);
    return [];
  }
}

// Extract hashtags from description text
function extractHashtags(description: string): string[] {
  const hashtagRegex = /#\w+/g;
  const hashtags = description.match(hashtagRegex);
  return hashtags || [];
}

// Analyze a video using Google Generative AI
export async function analyzeVideoWithAI(
  videoId: string, 
  customPrompt: string | null = null
): Promise<string> {
  try {
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    
    const genAI = new GoogleGenerativeAI(GOOGLE_AI_CONFIG.API_KEY);
    const model = genAI.getGenerativeModel({ model: GOOGLE_AI_CONFIG.MODEL });
    
    // Default prompt if no custom one is provided
    const defaultPrompt = "Analyze this video and provide a comprehensive summary. Include key points, main topics discussed, and any notable moments. Be specific and informative.";
    const prompt = customPrompt || defaultPrompt;
    
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    
    console.log(`\n🤖 Analyzing video with AI: ${videoUrl}`);
    console.log("⏳ This may take a few moments...");
    
    const result = await model.generateContent([
      prompt,
      {
        fileData: {
          fileUri: videoUrl,
          mimeType: 'video/mp4',
        },
      },
    ]);
    
    return result.response.text();
  } catch (error) {
    console.error("Error analyzing video with AI:", error instanceof Error ? error.message : 'Unknown error');
    return `Analysis error: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
}

// Extract start timestamp from Gemini response
export function extractTimestampFromAnalysis(analysis: string): number | null {
  // Search for time patterns in the analysis
  const timePatterns = [
    /(\d{1,2}):(\d{2})/g,  // MM:SS format
    /(\d{1,2})h(\d{2})m(\d{2})s/g,  // HH:MM:SS format
    /(\d+)m(\d+)s/g,  // MM:SS format
    /(\d+)s/g  // Seconds only
  ];
  
  let timestamp: number | null = null;
  
  for (const pattern of timePatterns) {
    const match = analysis.match(pattern);
    if (match) {
      // Convert to seconds (basic implementation)
      if (pattern.source.includes(':')) {
        const [minutes, seconds] = match[0].split(':').map(Number);
        timestamp = minutes * 60 + seconds;
        break;
      }
    }
  }
  
  return timestamp;
}

// Generate direct URL with timestamp
export function generateDirectTimestampUrl(videoId: string, timestamp: number): string {
  return `https://www.youtube.com/watch?v=${videoId}&t=${timestamp}s`;
}

// Integrated function: search YouTube videos and analyze the first result
export async function searchAndAnalyzeVideo(
  query: string, 
  analysisPrompt: string | null = null, 
  maxSearchResults: number = 5
): Promise<SearchAndAnalyzeResult> {
  try {
    // Step 1: Search videos
    const videos = await searchYt(query, maxSearchResults);
    
    if (videos.length === 0) {
      return {
        success: false,
        error: `No videos found for search: "${query}"`,
        videos: [],
        analysis: null
      };
    }
    
    // Step 2: Analyze the first result
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
    console.error('Error in integrated search and analysis:', error);
    return {
      success: false,
      error: `Error in search and analysis: ${error instanceof Error ? error.message : 'Unknown error'}`,
      videos: [],
      analysis: null
    };
  }
}
