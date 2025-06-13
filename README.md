# Berean Bible

A modern web application for reading and studying the Bible, built with Next.js, Material-UI, and TypeScript. This project features AI-powered semantic search and verse-by-verse commentary, providing a rich, interactive experience for users.

## Features

-   📖 **Interactive Bible Reader**: A clean and intuitive interface for reading the Bible.
-   🧠 **AI-Powered Semantic Search**: Find verses based on meaning and context, not just keywords.
-   💡 **Verse-by-Verse Commentary**: Get AI-generated commentary for any verse, powered by Google's Gemini models.
-   ⚙️ **Configurable AI Model**: Choose which Gemini model to use for commentary via an environment variable.
-   📈 **Rate Limiting**: Built-in rate limiting for commentary generation to manage API costs.
-   📱 **Responsive Design**: A seamless experience across desktop and mobile devices.
-   🌙 **Dark/Light Theme**: Switch between dark and light modes for comfortable reading.

## Tech Stack

-   **Framework**: [Next.js](https://nextjs.org/) 14
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **UI**: [Material-UI](https://mui.com/)
-   **AI**: [Google Gemini](https://ai.google.dev/)
-   **Database**: [MongoDB](https://www.mongodb.com/) (for caching and rate limiting)

## Getting Started

### Prerequisites

-   Node.js 18.0 or later
-   npm or yarn
-   Access to a MongoDB database
-   A Google Gemini API key

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/nirajagarwal/bible-reader.git
    cd bible-reader
    ```

2.  Install dependencies:
    ```bash
    npm install
    # or
    yarn install
    ```

3.  Create a `.env.local` file in the root of your project and add the following environment variables.

    ```env
    # For connecting to your MongoDB database
    MONGODB_URI=your_mongodb_connection_string

    # Your Google Gemini API Key
    GEMINI_API_KEY=your_gemini_api_key

    # (Optional) Specify the Gemini model to use for commentary
    # Defaults to gemini-1.5-flash-latest
    GEMINI_MODEL=gemini-1.5-flash-latest

    # (Optional) Set a daily rate limit for commentary generation
    # Defaults to 1000
    COMMENTARY_RATE_LIMIT_PER_DAY=1000
    ```

### Running the Application

1.  Run the development server:
    ```bash
    npm run dev
    ```

2.  Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Usage

-   **Reading**: Use the navigation controls to select a book and chapter.
-   **Commentary**: Click on any verse to open a drawer with AI-generated commentary.
-   **Search**: Use the search bar to find verses using natural language.

## Contributing

Contributions are welcome! If you have suggestions or want to improve the project, please feel free to open an issue or submit a pull request.

## License

This project is licensed under the MIT License - see the `LICENSE` file for details. 