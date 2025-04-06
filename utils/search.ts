'use server';

import { generateEmbeddings } from "./llm";
import { createClient } from "./supabase/server";

export async function hybridSearch(query: string, grade: string) {
  // console.log('Hybrid search query:', query);
  // console.log('Grade:', grade);

  // Generate embeddings for the query
  const { embeddings } = await generateEmbeddings(query);
  const embedding = embeddings?.[0]?.values || [];
  // console.log('Generated query embedding:', embedding);
  
  // Perform the search in the database
  const supabase = await createClient();

  const { data, error } = await supabase.rpc('match_content', {
    query_embedding: embedding,
    match_threshold: 0.7, // Adjust threshold as needed
    match_count: 10, // Limit results
    filter_grade: grade === 'all' ? 'all' : grade, // Filter by grade if specified
    query_text: query,
  });

  console.log('Supabase search results:', data);

  if (error) {
    console.error('Error performing vector search:', error);
    return { searchResults: [], searchError: error.message };
  }

  return { searchResults: data, searchError: null };
}