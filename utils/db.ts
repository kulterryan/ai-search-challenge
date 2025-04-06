import { createClient } from "./supabase/server";

export async function insertResources(dx: SearchResult[]) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('content')
    .insert(dx);

  if (error) {
    console.error('Insert error:', error);
  } else {
    console.log('Inserted content:', data);
  }
}