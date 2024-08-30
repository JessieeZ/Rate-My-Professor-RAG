import { NextResponse } from "next/server";
import { Pinecone } from "@pinecone-database/pinecone";

const { GoogleGenerativeAI } = require("@google/generative-ai");

// Access your API key as an environment variable (see "Set up your API key" above)
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

const model = genAI.getGenerativeModel({ model: "text-embedding-004" });

const systemPrompt = `You are an intelligent assistant specialized in helping students find the best professors based on their specific queries. When a user asks about professors, use the provided information and perform a Retrieval-Augmented Generation (RAG) to search and rank professors according to their teaching quality, course difficulty, and student reviews. Always try to match data to the user's query. If a user asks about the best teacher in a department give them the teacher in that the department with the best ratings and reviews. Don't give the user teachers that aren't within the subject they are asking for if they do ask for a specific subject.

For each professor, include the following details:

Name: The full name of the professor.
Department: The department or faculty they belong to.
Overall Rating: A summary rating based on student reviews.
Course Difficulty: A rating or comment on the difficulty of the courses they teach.
Top Review Comment: A highlighted review from a student that encapsulates the professor’s teaching style or reputation.
Pros: What students generally appreciate about the professor.
Cons: Areas where students have had concerns.
Always provide the information clearly and concisely, ensuring it is easy for the student to compare the top 3 professors.`;

const chatBot = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  systemInstruction: systemPrompt,
});

export async function POST(req) {
  //3 Steps, read data, make embedding, generate results with embeddings
  const data = await req.json();
  const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
  const index = pc.index("rag").namespace("ns1");
  //Where are taking the last index of data since it is a chat. The users question will be the last thing in messages
  const text = data[data.length - 1].content;

  //Create an embedding out of the users queury
  const result = await model.embedContent(text);
  const embedding = result.embedding;

  //Send the users message as an embedding to pinecone
  const results = await index.query({
    topK: 3,
    includeMetadata: true,
    //Might be wrong
    vector: embedding.values,
  });

  let resultString = "";
  results.matches.forEach((match) => {
    resultString += `\n
        Professor: ${match.id}
        Review: ${match.metadata.review}
        Subject: ${match.metadata.subject}
        Stars ${match.metadata.stars}
        \n\n
        `;
  });

  const lastMessage = data[data.length - 1];
  const lastMessageContent = lastMessage.content + resultString;
  const lastDataWithoutLastMessage = data.slice(0, data.length - 1);
  const completion = await chatBot.generateContentStream(lastMessageContent);
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      try {
        for await (const chunk of completion.stream) {
          const content = chunk.text();
          if (content) {
            const text = encoder.encode(content);
            // process.stdout.write(text);
            // console.log(text);
            controller.enqueue(text);
          }
        }
      } catch (err) {
        controller.error(err);
      } finally {
        controller.close();
      }
    },
  });

  return new NextResponse(stream);
}
