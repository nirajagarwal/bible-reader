# Bible Verse Embedding Script

This project contains a Node.js script designed to process Bible verses from a JSON file, generate vector embeddings for each verse using the Google Gemini API, and store the results in a MongoDB database. This is a crucial data preparation step for building a semantic search or question-answering application based on biblical texts.

## Features

- **Vector Embeddings**: Uses Google's `text-embedding-004` model to create high-quality vector representations of each Bible verse.
- **MongoDB Storage**: Stores verses along with their embeddings in a MongoDB collection, ready for vector search.
- **Resumable**: If the script is interrupted, it can be restarted and will automatically resume from where it left off, preventing duplicate processing.
- **Robust Error Handling**: Implements a retry mechanism with exponential backoff for handling transient API errors.
- **Efficient Batching**: Processes verses in batches to work within API rate limits and improve efficiency.

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v18 or later recommended)
- npm or yarn
- Access to a MongoDB database (local or cloud-based like MongoDB Atlas).
- A Google AI API Key for Gemini.

## Setup

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd <your-repository-directory>
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Create the environment file:**
    Create a file named `.env.local` in the root of the project and add your credentials.

    ```env
    # .env.local

    # Your Google AI Studio API Key
    GEMINI_API_KEY="YOUR_GEMINI_API_KEY"

    # Your MongoDB connection string
    MONGODB_URI="mongodb+srv://<user>:<password>@<cluster-url>/<db-name>?retryWrites=true&w=majority"
    ```

4.  **Prepare the data file:**
    Ensure your Bible data is located at `src/lib/bible_data.json`. The script expects a specific JSON structure where keys are book names, containing chapters, which in turn contain an array of verse strings.

## Usage

Once the setup is complete, you can run the script to start the embedding and storage process.

```bash
npm run embed
```

*(Note: You may need to add the `embed` script to your `package.json`'s `scripts` section: `"embed": "ts-node scripts/embed_and_store_verses.ts"`)*

The script will log its progress to the console, including which batch it's processing, and will notify you upon completion. If it's run again, it will detect the already processed verses and only work on new ones.

## Next Steps

After running this script, your MongoDB collection (`knowra.bible` by default) will be populated with verse documents, each containing a vector embedding. The next step is to create a vector search index on the `embedding` field in your MongoDB Atlas dashboard to enable efficient semantic search queries.