/**
 * Tipos para herramientas de video
 */

export interface YouTubeVideo {
  video_id: string;
  title: string;
  channelTitle: string;
  publishedAt: string;
  hashtags: string[];
}

export interface SearchAndAnalyzeResult {
  success: boolean;
  query?: string;
  analyzedVideo?: YouTubeVideo & {
    analysis: string;
  };
  otherVideos?: YouTubeVideo[];
  totalFound?: number;
  error?: string;
  videos?: YouTubeVideo[];
  analysis?: string | null;
}

export interface SearchYoutubeArgs {
  query: string;
  maxResults?: number;
  userDescription: string;
}

export interface AnalyzeVideoArgs {
  videoId: string;
  prompt?: string;
  userDescription: string;
}

export interface SearchAndAnalyzeArgs {
  query: string;
  analysisPrompt?: string;
  maxSearchResults?: string;
  userDescription: string;
}
