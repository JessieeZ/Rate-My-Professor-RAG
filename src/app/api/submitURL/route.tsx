import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { load } from 'cheerio'; // For scraping
import { PineconeClient } from '@pinecone-database/pinecone';


const pinecone = new PineconeClient({
  apiKey: process.env.PINECONE_API_KEY!,
  environment: process.env.PINECONE_BASE_URL!,
});

const INDEX_NAME = 'professor-reviews';

async function scrapeProfessorData(url: string) {
  const response = await fetch(url);
  const html = await response.text();
  const $ = load(html);

  const professorName = $('h1').text().trim();
  const reviews = $('div.review-content').map((i, el) => $(el).text().trim()).get();

  return { professorName, reviews };
}

async function insertIntoPinecone(data: any) {
  const index = pinecone.Index(INDEX_NAME);

  const vectors = data.reviews.map((review: string) => ({
    id: `${data.professorName}-${Date.now()}`,
    values: [review],
  }));

  await index.upsert({ vectors });
}

// Handle POST request
export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    if (typeof url !== 'string' || !url.trim()) {
      return NextResponse.json({ message: 'Invalid URL.' }, { status: 400 });
    }

    const data = await scrapeProfessorData(url);
    await insertIntoPinecone(data);

    return NextResponse.json({ message: 'Data processed and inserted successfully!' });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ message: 'Error processing request.' }, { status: 500 });
  }
}

// Handle other methods (if necessary)
export async function GET() {
  return NextResponse.json({ message: 'GET method not supported.' }, { status: 405 });
}
