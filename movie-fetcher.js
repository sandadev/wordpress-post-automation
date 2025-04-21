require("dotenv").config();
const axios = require("axios");
const fs = require("fs");

// Load API Key from .env
const API_KEY = process.env.OPENAI_API_KEY;

// List of movies to fetch details for
const movies = [
    "Inception",
    "The Matrix",
    "Interstellar",
    "Titanic",
    "Avatar"
];

// Function to fetch movie details
async function fetchMovieDetails(movieName) {
    try {
        const response = await axios.post(
            "https://api.openai.com/v1/chat/completions",
            {
                model: "gpt-3.5-turbo",
                messages: [
                    { role: "system", content: "You are a helpful assistant providing movie details in JSON format." },
                    { role: "user", content: `Provide details about the movie "${movieName}" including release year, director, cast, genre, and summary. Return only a JSON object.` }
                ],
                max_tokens: 500
            },
            {
                headers: {
                    "Authorization": `Bearer ${API_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );

        // Parse API response
        return JSON.parse(response.data.choices[0].message.content);
    } catch (error) {
        console.error(`❌ Error fetching details for ${movieName}:`, error.response?.data || error.message);
        return null;
    }
}

// Fetch details for all movies and save in a single JSON file
async function fetchAllMovies() {
    let movieList = [];

    for (const movie of movies) {
        const details = await fetchMovieDetails(movie);
        if (details) {
            movieList.push(details);
        }
    }

    // Save all movie details in a single JSON file
    fs.writeFileSync("movies.json", JSON.stringify(movieList, null, 4), "utf-8");

    console.log("✅ All movie details saved in movies.json");
}

// Run the function
fetchAllMovies();
