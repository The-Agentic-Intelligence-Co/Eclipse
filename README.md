# Eclipse

Eclipse is an intelligent browser extension that revolutionizes how you interact with web content. Built with a multi-agent AI system, it combines powerful content analysis with browser automation to transform your browsing experience from manual tasks into intelligent workflows.

Whether you need to extract leads from websites, organize research across multiple tabs, analyze YouTube videos, or automate repetitive browser tasks, Eclipse acts as your AI-powered browsing companion that understands context and executes actions just like a human would.

## Modes

Eclipse operates in two distinct modes to match your needs:

### Ask Mode
Perfect for content analysis and information extraction. Includes all features except those that require direct browser interface actions (tab management and browser automation). Use this mode when you need to analyze content, search videos, extract information, or get insights from your web pages.

### Agent Mode
Full-featured mode with complete browser automation capabilities. This mode includes everything from Ask Mode plus tab management and browser automation. It operates with a multi-agent feedback system:

- **Planner Agent**: Understands your query and creates an actionable plan
- **Executor Agent**: Executes the necessary tools to complete your goal
- **Validator Agent**: Keeps the executor agent on track, manages errors, and provides feedback to ensure successful task completion

The multi-agent system works collaboratively to break down complex tasks into manageable steps and ensure reliable execution.

## Features

### 1. Browser Automation
![Browser Automation Demo](assets/browser_automation_demo.gif)

Eclipse can automate browser tasks like filling forms, navigating websites and completing tasks. It uses AI to understand web pages and perform actions just like a human would. In the demo, it's being used for lead extraction from a conference portal (perfect for GTM and sales teams).

The system can be used for practically any browser task and workflow, such as research, sending emails, lead research and more. The multi-agent system is limited to 30 steps as a safety mechanism, but this is enough to reduce tasks that typically take 20-30 minutes down to just 2-4 minutes in avg.

This functionality is powered by [dom-engine](https://github.com/The-Agentic-Intelligence-Co/dom-engine), a robust library from our same ecosystem of projects and libraries that turns website DOMs into actionable context for AI browser agents.

### 2. Tab Management
![Tab Management Demo](assets/group_tabs_demo.gif)

Organize your browser tabs efficiently. Eclipse can group related tabs together, switch between tabs, and help you manage multiple open tabs with ease. With the group tabs tool, you can either let the AI organize them automatically or specify exactly how you want them grouped, including choosing a color for the created tab group.

### 3. Advanced Video Search
![Advanced Video Search Demo](assets/advanced_video_search_and_analysis.gif)

Search YouTube videos and get AI-powered analysis of the content. This is especially useful when you have a vague idea or remember a specific phrase or moment from a video but don't know the exact title. Eclipse can find the right videos and pinpoint the exact timestamps where your remembered content appears.

### 4. Extract Content from One/Multiple Tabs
![Content Extraction Demo](assets/extract_multiple_tab_content_demo.gif)

Extract and analyze content from your open browser tabs. Eclipse can process single tabs or multiple tabs simultaneously to provide comprehensive analysis and summaries. It's also useful for searching specific text fragments across multiple tabs and documents. The system is limited to 5 tabs per prompt to avoid overloading the agent's context.

### 5. Video Analysis
![Video Analysis Demo](assets/video_analysis_demo.gif)

Get detailed AI analysis of YouTube videos including summaries, timestamps, and key moments. When you're on a video, you can ask Eclipse to summarize it, search for specific phrases within the video, or even generate quizzes based on the content. Any video-related task you need - including translation to other languages - Eclipse can handle it. Perfect for research, learning, and content discovery.

## How to Install

1. Clone this repository
2. Run `npm install` to install dependencies
3. Run `npm run build:extension` to build the extension
4. Open Chrome and go to `chrome://extensions/`
5. Enable "Developer mode"
6. Click "Load unpacked" and select the `dist` folder
7. The Eclipse extension will appear in your browser toolbar

## Product Roadmap

### ✅ Stable Features
- **Tab Management**: Group tabs, organize by topic, custom colors
- **Video Search & Analysis**: YouTube search, AI analysis, timestamp detection
- **Content Extraction**: Single/multiple tab content extraction with text fragment search
- **Video Analysis**: Summarization, phrase search, quiz generation, translation

### 🔬 Experimental Features
- **Browser Automation**: Currently in experimental version

### 🚀 Next Steps
The next steps include deploying MCP servers on GCP and integrating them with the extension for enhanced functionality.

## Contributions

Contributions are welcome! Please feel free to submit issues, feature requests, or pull requests to help improve Eclipse.

## Inspiration

I applied twice for early access to be part of the beta testers for Perplexity's Comet AI browser, but got rejected both times. Also, as a consumer, I wasn't comfortable with the idea of a browser tracking all my movements and activities. So I decided to build my own alternative.

---

*Eclipse is an open-source project built with the goal of making web browsing more intelligent and efficient. It was made open source to keep the door open for innovative ideas and provide an accessible, cost-effective alternative without the privacy concerns of Perplexity Comet.*
