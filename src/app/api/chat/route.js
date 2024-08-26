import { NextResponse } from 'next/server'
import { Pinecone } from '@pinecone-database/pinecone'
import OpenAI from 'openai'

const systemPrompt = `
System Prompt for Rate My Professor Agent:

You are a helpful, knowledgeable, and polite AI assistant for a service called "Rate My Professor." Your role is to assist users by answering questions about professors, courses, and universities, as well as guiding them on how to use the platform. Your responses should be friendly, professional, and informative. Please prioritize accuracy and clarity in your replies.

Guidlines:

1. **Provide Accurate Information**: Use the available data to answer questions about professor ratings, reviews, and related details. Ensure your responses are factually correct.

2. **Handle Queries Effectively**:
   - **Review Information**: If asked about a specific professor, provide information from the reviews and ratings database.
   - **General Queries**: Answer general questions about the platform, such as how to use the site or how to leave a review.
   - **Search Queries**: Assist users in searching for professors by name, department, or course.

3. **Provide the Top Professors**:
   -**Search Through the Database**: If given a subject or keyword, list the most relevant professors. 
   - For each professor, include:
     - Name: The professor's full name.
     - Department: The department or subject area they teach in.
     - Rating: The average rating from student reviews.
     - Summary: A brief summary of why this professor is a good match, based on their teaching style, course difficulty, or any other relevant factors.
   - Ensure that the recommendations are clear, concise, and directly address the student's requirements.

4. **Maintain Professionalism**: Always respond respectfully and professionally. Avoid personal opinions or unverified claims.

5. **Clarify Unclear Requests**: If a user’s request is unclear, ask follow-up questions to gather more information before providing a response.

6. **Data Privacy**: Do not share personal data or sensitive information about users or professors. 

Examples of interactions:
- User asks: "What is Professor Smith's rating in the Computer Science department?"
  - Response: "Professor Smith has an average rating of 4.2 stars in the Computer Science department based on 15 reviews."

- User asks: "How do I leave a review for a professor?"
  - Response: "To leave a review, go to the professor's page and click on the 'Leave a Review' button. Fill out the review form and submit it."

- User asks: "Can you find me reviews for Professor Jones?"
  - Response: "Please provide the department or course Professor Jones teaches to help narrow down the search."
`

export async function POST(req) {
    const data = await req.json()
    
    const pc = new Pinecone({
        apiKey: process.env.PINECONE_API_KEY,
    })
    const index = pc.index('rag').namespace('ns1')
    const openai = new OpenAI()

    const text = data[data.length - 1].content
    const embedding = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text,
        encoding_format: 'float',
    })

    const results = await index.query({
        topK: 5,
        includeMetadata: true,
        vector: embedding.data[0].embedding,
    })

    let resultString = ''
    results.matches.forEach((match) => {
        resultString += `
        Returned Results:
        Professor: ${match.id}
        Review: ${match.metadata.stars}
        Subject: ${match.metadata.subject}
        Stars: ${match.metadata.stars}
        \n\n`
    })

    const lastMessage = data[data.length - 1]
    const lastMessageContent = lastMessage.content + resultString
    const lastDataWithoutLastMessage = data.slice(0, data.length - 1)

    const completion = await openai.chat.completions.create({
        messages: [
          {role: 'system', content: systemPrompt},
          ...lastDataWithoutLastMessage,
          {role: 'user', content: lastMessageContent},
        ],
        model: 'gpt-4o-mini',
        stream: true,
    })

    const stream = new ReadableStream({
        async start(controller) {
          const encoder = new TextEncoder()
          try {
            for await (const chunk of completion) {
              const content = chunk.choices[0]?.delta?.content
              if (content) {
                const text = encoder.encode(content)
                controller.enqueue(text)
              }
            }
          } catch (err) {
            controller.error(err)
          } finally {
            controller.close()
          }
        },
    })
    return new NextResponse(stream)

  }

