import { NextResponse, type NextRequest } from 'next/server';
import { ck12, khanacademy, pbslearning } from '@/utils/scraper';

// Scrape Khan Academy Search Engine
export async function GET(req: NextRequest) {
  // Get the query parameters from the request
  const searchParams = req.nextUrl.searchParams;
  const query = searchParams.get('query');
  const grade = searchParams.get('grade');

  if (!query && !grade) {
    return NextResponse.json({ error: 'Query, Type and Grade parameters are required' }, { status: 400 });
  }

  // Data
  const data: any = [];
  
  // Extract Data
  if (query && grade) {
    const [kaResults, pbsResults, ck12Results] = await Promise.all([
      khanacademy(query, grade),
      pbslearning(query, grade),
      ck12(query, grade),
    ]);
    
    // Add results with source information in one pass
    // More efficient - avoid unnecessary mapping when arrays already have the right structure
    const processedResults = [
      ...(kaResults || []),
      ...(pbsResults || []),
      ...(ck12Results || [])
    ];
    // Filter out any undefined or null items and add to data
    data.push(...processedResults.filter(Boolean));
  }

  return Response.json({ res: data }, { status: 200 });
}
