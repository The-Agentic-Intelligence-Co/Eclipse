# Eclipse

Eclipse is an intelligent browser extension that revolutionizes how you interact with web content. Built with a multi-agent AI system, it combines powerful content analysis with browser automation to transform your browsing experience from manual tasks into intelligent workflows.

## 📋 Table of Contents

- [Features](#features)
  - [1. Browser Automation](#1-browser-automation)
  - [2. Tab Management](#2-tab-management)
  - [3. Advanced Video Search](#3-advanced-video-search)
  - [4. Extract Content from One/Multiple Tabs](#4-extract-content-from-onemultiple-tabs)
  - [5. Video Analysis](#5-video-analysis)
- [Modes](#modes)
- [How to Install](#how-to-install)
- [Product Roadmap](#product-roadmap)
- [Contributions](#contributions)
- [Why Eclipse?](#why-eclipse)

## ✨ Features

### 1. Browser Automation
[![Browser Automation Demo](https://img.youtube.com/vi/5h2P5Kgs7sw/0.jpg)](https://youtu.be/5h2P5Kgs7sw)

Eclipse can automate browser tasks like filling forms, navigating websites and completing tasks. It uses AI to understand web pages and perform actions just like a human would. In the demo, it's being used for lead extraction from a conference portal, perfect for GTM and sales teams. The multi-agent system is limited to 30 steps as a safety mechanism, but this is enough to reduce tasks that typically take 15-30 minutes down to just 2-4 minutes.

Powered by [dom-engine](https://github.com/The-Agentic-Intelligence-Co/dom-engine), our in-house library that turns website DOMs into actionable context for AI agents.

### 2. Tab Management
![Tab Management Demo](assets/group_tabs_demo.gif)

Organize your browser tabs efficiently. Eclipse can group related tabs, switch between tabs, and manage multiple open tabs. Let the AI organize them automatically or specify how you want them grouped, including choosing colors.

### 3. Advanced Video Search
![Advanced Video Search Demo](assets/advanced_video_search_and_analysis.gif)

Search YouTube videos and get AI-powered analysis. Perfect when you remember a phrase or moment from a video but not the title. Eclipse finds the right videos and pinpoints exact timestamps.

### 4. Extract Content from One/Multiple Tabs
![Content Extraction Demo](assets/extract_multiple_tab_content_demo.gif)

Extract and analyze content from your open browser tabs. Eclipse can process single or multiple tabs simultaneously. Also useful for searching text fragments across tabs and documents. Limited to 5 tabs per prompt for optimal context management.

### 5. Video Analysis
![Video Analysis Demo](assets/video_analysis_demo.gif)

Get AI analysis of YouTube videos with summaries, timestamps, and key moments. Ask Eclipse to summarize, search phrases, generate quizzes, or translate content. Perfect for research and learning.

## 🎯 Modes

Eclipse operates in two distinct modes to match your needs:

### Ask Mode
Perfect for content analysis and information extraction. Includes all features except those that require direct browser interface actions (tab management and browser automation). Use this mode when you need to analyze content, search videos, extract information, or get insights from your web pages.

### Agent Mode
Full-featured mode with complete browser automation capabilities. This mode includes everything from Ask Mode plus tab management and browser automation. It operates with a multi-agent feedback system:

- **Planner Agent**: Understands your query and creates an actionable plan
- **Executor Agent**: Executes the necessary tools to complete your goal
- **Validator Agent**: Keeps the executor agent on track, manages errors, and provides feedback to ensure successful task completion

The multi-agent system works collaboratively to break down complex tasks into manageable steps and ensure reliable execution.

## 🚀 How to Install

1. Clone this repository
2. Run `npm install` to install dependencies
3. Run `npm run build:extension` to build the extension
4. Open Chrome and go to `chrome://extensions/`
5. Enable "Developer mode"
6. Click "Load unpacked" and select the `dist` folder
7. The Eclipse extension will appear in your browser toolbar

## 🗺️ Product Roadmap

### ✅ Stable Features
- **Tab Management**: Group tabs, organize by topic, custom colors
- **Video Search & Analysis**: YouTube search, AI analysis, timestamp detection
- **Content Extraction**: Single/multiple tab content extraction with text fragment search
- **Video Analysis**: Summarization, phrase search, quiz generation, translation

### 🔬 Experimental Features
- **Browser Automation**: Currently in experimental version

### 🚀 Next Steps
The next steps include deploying MCP servers on GCP and integrating them with the extension for enhanced functionality.

## 🤝 Contributions

Contributions are welcome! Please feel free to submit issues, feature requests, or pull requests to help improve Eclipse.

## 💡 Why Eclipse?

I applied twice for early access to be part of the beta testers for Perplexity's Comet AI browser, but got rejected both times. Also, as a consumer, I wasn't comfortable with the idea of a browser tracking all my movements and activities. So I decided to build my own alternative.

---

*Eclipse is an open-source project built with the goal of making web browsing more intelligent and efficient. It was made open source to keep the door open for innovative ideas and provide an accessible, cost-effective alternative without the privacy concerns of Perplexity Comet.*
