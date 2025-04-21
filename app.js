globalThis.fetch = fetch;
const fs = require("fs");
//const fetch = require("node-fetch");

const WP_BASE_URL = "https://filmock.com/wp-json/wp/v2";
const WP_ACFBASE_URL = "https://filmock.com/wp-json";
const USERNAME = "nihamconnects";
const APPLICATION_PASSWORD = "LXSC FOrV VSsM l5bo 93kC ZT2B";
const AUTH_HEADER = "Basic " + Buffer.from(`${USERNAME}:${APPLICATION_PASSWORD}`).toString("base64");

// Read JSON input file
const postsData = JSON.parse(fs.readFileSync("input.json", "utf8"));

// Function to create a post
async function createPost(post) {
    try {
        // Create a new post
        let postResponse = await fetch(`${WP_BASE_URL}/posts`, {
            method: "POST",
            headers: {
                "Authorization": AUTH_HEADER,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                title: post.title,
                content: post.content,
                status: post.status,
                date: post.date  // Scheduling post
            })
        });

        let postData = await postResponse.json();
        console.log("Full API Response:", postData); // Log full response to debug
        console.log(`Post Created (ID: ${postData.id}): ${post.title}`);

        // If post creation is successful, update ACF fields
        if (postData.id) {
            console.log(`Post Created (ID: ${postData.id}): ${post.title}`);
            await updateACFFields(postData.id, post.acf_fields);
        }else {
            console.error("Error: Post creation failed!", postData);
        }
    } catch (error) {
        console.error("Error creating post:", error);
    }
}

// Function to update ACF fields
async function updateACFFields(postId, fields) {
    try {
        let acfResponse = await fetch(`${WP_ACFBASE_URL}/acf/v3/posts/${postId}`, {
            method: "POST",
            headers: {
                "Authorization": AUTH_HEADER,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ fields })
        });

        let acfData = await acfResponse.json();
        console.log(`ACF Fields Updated for Post ID: ${postId}`);
    } catch (error) {
        console.error("Error updating ACF fields:", error);
    }
}

// Loop through each post in the JSON file and create it
async function publishAllPosts() {
    for (let post of postsData) {
        await createPost(post);
    }
}

// Run the script
publishAllPosts();
