import { NextResponse } from "next/server";
import * as cheerio from "cheerio";
import { Pinecone } from "@pinecone-database/pinecone";
const { OpenAI } = require('openai');

// Initialize the OpenAI client with your API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Use environment variable for API key
});

// Function to get embeddings for a given text
async function getTextEmbeddings(text) {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: text,
    });

    const embedding = response.data[0].embedding;
    console.log('Embedding Dimensions:', embedding.length);
    return embedding; // Return as a flat array
  } catch (error) {
    console.error('Error fetching embeddings:', error);
    throw error;
  }
}

// Define the POST function to handle incoming requests
export async function POST(req) {
  try {
    // Parse the incoming JSON request body
    const data = await req.json();
    const website = data.website; // Extract the website URL from the request data

    // Send a GET request to the specified website to fetch its HTML content
    const response = await fetch(website);
    const html = await response.text(); // Convert the response to text (HTML)

    // Load the HTML content into Cheerio for parsing
    const $ = cheerio.load(html);

    // Extract the professor's first name
    const firstName = $("div.NameTitle__Name-dowf0z-0").find("span").eq("0").text();
    console.log("professor firstname:", firstName);

    // Extract the professor's last name
    const lastName = $("div.NameTitle__Name-dowf0z-0").find("span").eq("1").text();
    console.log("professor last name:", lastName);

    // Combine first and last names to form the full name
    const fullName = firstName + " " + lastName;

    // Extract the subject being taught
    const subject = $("a.iMmVHb").find("b").text();
    console.log("subject:", subject);

    // Extract the star rating
    const stars = $("div.liyUjw").text();
    console.log("stars:", stars);

    // Count the number of reviews and extract their content
    const reviewCount = $("div.gRjWel").length;
    console.log("reviews:", reviewCount);

    let reviews = "";
    for (let i = 0; i < reviewCount; i++) {
      reviews += $("div.gRjWel").eq(i).text() + "\n"; // Append each review to the reviews string
    }

    console.log("review content", reviews);

    // Function to process embeddings and upsert to Pinecone
    await (async () => {
      try {
        // Get embeddings for the reviews
        const text = reviews;
        const embedding = await getTextEmbeddings(text);
        console.log('Embedding:', embedding);
    
        // Initialize the Pinecone client with your API key
        const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
        const index = pc.index("rag");
    
        // Upsert the embedding data into the Pinecone index
        await index.namespace("ns1").upsert([
          {
            id: fullName, // Document ID
            values: embedding, // Embedding values should be a flat array
            metadata: { review: reviews, subject: subject, stars: stars }, // Metadata associated with the document
          },
        ]);
    
        // Log index statistics
        console.log(await index.describeIndexStats());
      } catch (error) {
        console.error('Error processing embeddings or upserting to Pinecone:', error);
        throw error;
      }
    })();

    // Return a success response
    return NextResponse.json({ message: 'URL scraped successfully. The professor has been added to the database!' });

  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json({ error: 'Failed to scrape URL. Please ensure that the format of the url is correct.' }, { status: 500 });
  }
}
