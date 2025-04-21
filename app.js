globalThis.fetch = fetch;
const fs = require("fs");

const WP_BASE_URL = "https://filmock.com/wp-json/wp/v2";
const WP_ACFBASE_URL = "https://filmock.com/wp-json";

const USERNAME = "nihamconnects";
const APPLICATION_PASSWORD = "LXSC FOrV VSsM l5bo 93kC ZT2B";
const AUTH_HEADER = "Basic " + Buffer.from(`${USERNAME}:${APPLICATION_PASSWORD}`).toString("base64");

// Load input file
//const postsData = JSON.parse(fs.readFileSync("movie_input.json", "utf8"));
const postsData = JSON.parse(fs.readFileSync("wiki_input.json", "utf8"));


// Category name → ID map (Replace with your actual WordPress category IDs)
const categoryMap = {
    "movies": 32, // ✅ Replace with your actual ID
    "wiki": 34    // ✅ Replace with your actual ID
};

// Main function to publish all posts
async function publishAllPosts() {
    for (let post of postsData) {
        await createPost(post);
    }
}

// Create a post
async function createPost(post) {
    try {
        const categoryName = post.category?.toLowerCase();
        const categoryId = categoryMap[categoryName] || 1; // default to Uncategorized if not mapped

        // Create WordPress post
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
                date: post.date,
                categories: [categoryId]
            })
        });

        let postData = await postResponse.json();

        if (postData.id) {
            console.log(`✅ Post Created (ID: ${postData.id}): ${post.title}`);

            // Update ACF fields only for 'movies'
            if (categoryName === "movies") {
                await updateACFFields(postData.id, post.acf_fields);
            } 
            else if (categoryName === "wiki") {
                //console.log("📦 Wiki ACF fields:", post.acf_fields);
                await updateACFFields(postData.id, post.acf_fields);
            }
            else {
                console.log(`ℹ️ ACF skipped for category: ${categoryName}`);
            }
        } else {
            console.error("❌ Post creation failed:", postData);
        }

    } catch (err) {
        console.error("❌ Error creating post:", err);
    }
}

// Update ACF fields
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

        if (acfData.fields) {
            console.log(`✅ ACF fields updated for post ID ${postId}`);
        } else {
            console.error("❌ Failed to update ACF:", acfData);
        }
    } catch (err) {
        console.error("❌ Error updating ACF fields:", err);
    }
}

// Run the script
publishAllPosts();
