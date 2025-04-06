# AI-Powered Educational Resource Search Engine

An intelligent search engine that aggregates and analyzes educational resources from multiple platforms using AI embeddings and real-time web scraping.

## Core Features

### Intelligent Search
- Vector-based semantic search using Google's Generative AI
- Real-time web scraping from educational platforms
- Smart content filtering and ranking
- Grade-level specific resource matching

### Supported Platforms
- Khan Academy
  - Videos, exercises, and tutorials
  - Automatic content type detection
- PBS Learning Media
  - Grade-specific content filtering
  - Rich media resources including videos and interactive content
- CK-12
  - Textbook content and exercises
  - Grade-aligned materials

### Technical Features
- Next.js 13+ App Router for modern React architecture
- Server-side scraping with Puppeteer and Cheerio
- Vector embeddings using Google's Generative AI
- Supabase for vector storage and database operations
- Real-time search results with progressive enhancement
- TypeScript for type safety
- TailwindCSS for styling

## Setup Requirements

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account
- Google AI API access
- Browserless.io account

### Environment Variables
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GOOGLE_GENERATIVE_AI_API_KEY=your_google_ai_key
BROWSERLESS_ENDPOINT=your_browserless_endpoint
BROWSERLESS_API_KEY=your_browserless_key
```

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/ai-search-challenge
cd ai-search-challenge
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up your environment variables:
```bash
cp .env.example .env.local
```

4. Start the development server:
```bash
npm run dev
# or
yarn dev
```

## Architecture

### Search Flow
1. User submits search query with grade level
2. System checks existing vector database for matches
3. Parallel web scraping from educational platforms
4. Content processing and embedding generation
5. Results ranking and presentation

### Key Components
- `SearchInterface`: Main search UI component
- `scraper.ts`: Web scraping logic for educational platforms
- `llm.ts`: AI embedding and content processing
- Vector database for semantic search
- Real-time result streaming

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see LICENSE for details

