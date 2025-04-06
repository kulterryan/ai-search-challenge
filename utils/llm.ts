import { GoogleGenAI } from '@google/genai';
import { createClient } from '@/utils/supabase/server'

// init supabase

export const google_ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

export async function generateEmbeddings(text: string) {
  const result = await google_ai.models.embedContent({
    model: 'text-embedding-004',
    contents: text,
    config: {
      outputDimensionality: 10,
    },
  });
  // console.log('Embedding result:', result);
  return result;
}

// Deprecated function
export async function scoreRelevance(query: string, content: SearchResult) {
  const prompt = `
  You are a relevance scoring assistant. Score the relevance of the document to the query on a scale of 0-100, where 100 is perfectly relevant.
  
  Query: ${query}
  Document Title: ${content.title}
  Document Description: ${content.description || ''}
  
  Provide only the numerical score without explanation.
  `;
  const result = await google_ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: prompt,
  });
  const responseText = result.text;

  const scoreMatch = responseText?.match(/\d+/);
  if (scoreMatch) {
    const score = parseInt(scoreMatch[0], 10);
    return score;
  }
  console.error('Failed to extract score from response:', responseText);
  return 0;
}


// Deprecated function
export async function searchContent(query: string) {
  const supabase = await createClient();

  // 1. Convert query to embedding
  const queryEmbedding = await generateEmbeddings(query);

  // 2. Perform vector similarity search in Supabase
  const { data: similarDocs } = await supabase.from('content').select('id, title, content, url, source').order('embedding <-> $1', { ascending: true }).limit(10).eq('1', queryEmbedding);

  if (!similarDocs) {
    console.error('No similar documents found');
    return [];
  }

  // 3. Score results with Gemini for better relevance
  const scoredResults = await Promise.all(
    similarDocs.map(async (doc: { content: SearchResult; }) => {
      const relevanceScore = await scoreRelevance(query, doc.content);
      return { ...doc, relevanceScore };
    })
  );

  // 4. Sort by relevance score
  return scoredResults.sort((a: { relevanceScore: number; }, b: { relevanceScore: number; }) => b.relevanceScore - a.relevanceScore);
}
