import { NextResponse } from "next/server";
import * as cheerio from "cheerio";
import { Pinecone } from "@pinecone-database/pinecone";
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Access your API key as an environment variable (see "Set up your API key" above)
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

const model = genAI.getGenerativeModel({ model: "text-embedding-004" });

export async function POST(req) {
  const data = await req.json();
  const website = data.website;
  // console.log(`THIS IS THE DATA: ${website}`);
  //Sends a get request to the website to get the html
  const response = await fetch(website);
  const html = await response.text();

  //Loads the html into the html parser known as Cheerio
  const $ = cheerio.load(html);

  console.log(
    "proffesor firstname:",
    $("div.NameTitle__Name-dowf0z-0").find("span").eq("0").text()
  );
  const firstName = $("div.NameTitle__Name-dowf0z-0")
    .find("span")
    .eq("0")
    .text();

  console.log(
    "proffesor last name:",
    $("div.NameTitle__Name-dowf0z-0").find("span").eq("1").text()
  );

  const lastName = $("div.NameTitle__Name-dowf0z-0")
    .find("span")
    .eq("1")
    .text();

  const fullName = firstName + " " + lastName;

  console.log("subject:", $("a.iMmVHb").find("b").text());
  const subject = $("a.iMmVHb").find("b").text();

  console.log("stars:", $("div.liyUjw").text());

  const stars = $("div.liyUjw").text();

  console.log("reviews:", $("div.gRjWel").length);

  let reviews = "";
  for (let i = 0; i < $("div.gRjWel").length; i++) {
    reviews += $("div.gRjWel").eq(i).text() + "\n";
  }

  console.log("review content", reviews);

  // const reviewContent = reviews;
  // JSON.stringify({
  //   professor: "Dr. Jane Smith",
  //   subject: "Computer Science",
  //   stars: 5,
  //   reviews:
  //     "Excellent professor! Very clear explanations and always available for questions.",
  // }

  const embedding = (await model.embedContent(reviews)).embedding;
  console.log(embedding);

  const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
  const index = pc.index("rag");

  await index.namespace("ns1").upsert([
    {
      id: fullName,
      values: embedding.values,
      metadata: { review: reviews, subject: subject, stars: stars },
    },
  ]);
  console.log(index.describeIndexStats());

  return new NextResponse(html);
}
