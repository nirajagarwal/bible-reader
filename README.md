# Berean Bible Reader

A modern, AI-enhanced Bible study application built with Next.js, Material-UI, and TypeScript. Experience scripture through intelligent semantic search, contextual AI commentary, and an intuitive reading interface designed for deep study and reflection.

## ✨ Key Features

### 📖 **Smart Bible Reader**
- Clean, distraction-free reading interface
- Keyboard navigation (arrow keys for chapter navigation)
- Verse highlighting and smooth scrolling
- Reading state persistence across sessions
- Responsive design for all devices

### 🧠 **AI-Powered Semantic Search**
- Find verses by meaning, not just keywords
- Vector-based similarity search using embeddings
- Results organized by Old/New Testament
- Related verse discovery for cross-references
- Copy search results functionality

### 💡 **Intelligent Commentary System**
- AI-generated verse-by-verse commentary using Google Gemini
- Structured commentary with headings and context
- Cross-reference suggestions within commentary
- Commentary caching for performance
- Rate limiting to manage API costs

### 🎯 **Advanced User Experience**
- Context menus for verse interactions
- Drawer-based navigation for commentary and search
- Theme switching (dark/light mode)
- Local storage for user preferences
- SEO-optimized with dynamic metadata
- Automated sitemap generation
- Dynamic Open Graph images for social sharing

## 🛠 Tech Stack

-   **Frontend**: [Next.js](https://nextjs.org/) 14 with App Router
-   **Language**: [TypeScript](https://www.typescriptlang.org/) for type safety
-   **UI Framework**: [Material-UI](https://mui.com/) with Emotion styling
-   **AI/ML**: [Google Gemini](https://ai.google.dev/) for embeddings and commentary
-   **Database**: [MongoDB](https://www.mongodb.com/) with vector search capabilities
-   **Analytics**: [Vercel Analytics](https://vercel.com/analytics) for insights

## 🚀 Getting Started

### Prerequisites

-   **Node.js** 18.0 or later
-   **npm** or **yarn** package manager
-   **MongoDB** database with vector search capabilities
-   **Google Gemini API** key for AI features

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/nirajagarwal/bible-reader.git
   cd bible-reader
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Configuration:**
   
   Create a `.env.local` file in the project root:
   ```env
   # MongoDB Configuration
   MONGODB_URI=your_mongodb_connection_string
   
   # Google Gemini API Configuration
   GEMINI_API_KEY=your_gemini_api_key
   GEMINI_MODEL=gemini-2.5-pro
   
   # Rate Limiting (Optional)
   COMMENTARY_RATE_LIMIT_PER_DAY=1000
   
   # Deployment (Optional)
   VERCEL_ENV=development
   ```

4. **Database Setup:**
   ```bash
   # Set up Bible data and embeddings
   npm run db:setup
   
   # Generate sitemap
   npm run generate-sitemap
   ```

### Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start
```

Visit [http://localhost:3000](http://localhost:3000) to see your application.

## 📖 Usage Guide

### Navigation
- **Chapter Navigation**: Use arrow keys (←/→) or navigation buttons
- **Verse Selection**: Click any verse to access commentary and related verses
- **Search**: Use the search bar for semantic verse discovery

### Features
- **Commentary**: Right-click or tap verses for AI-generated insights
- **Related Verses**: Find thematically similar passages
- **Search Results**: Organized by Testament with copy functionality
- **Theme Toggle**: Switch between light and dark modes
- **Reading State**: Automatically saves your current position

## 🏗 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── [slug]/            # Dynamic Bible chapter routes
│   ├── api/               # API endpoints
│   │   ├── commentary/    # AI commentary generation
│   │   ├── search/        # Semantic search
│   │   └── verses/        # Bible text retrieval
│   └── layout.tsx         # Root layout with providers
├── components/            # React components
│   ├── BibleReader.tsx    # Main reading interface
│   └── Navigation.tsx     # App navigation
├── context/              # React context providers
├── lib/                  # Utilities and data
└── types/                # TypeScript definitions
```

## 🔧 API Endpoints

- **GET** `/api/verses` - Retrieve chapter verses
- **POST** `/api/search` - Semantic verse search
- **POST** `/api/commentary` - Generate AI commentary
- **GET** `/api/og` - Dynamic Open Graph images

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use Material-UI components consistently
- Write meaningful commit messages
- Test your changes thoroughly

## 📄 License

This project is licensed under the MIT License - see the `LICENSE` file for details.

## 🙏 Acknowledgments

- Bible text data processing and embedding
- Google Gemini AI for intelligent commentary
- Material-UI for the beautiful interface
- MongoDB for vector search capabilities 