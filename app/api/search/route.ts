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
    const ka = await khanacademy(query);
    data.push(...ka);
    const pbs = await pbslearning(query, grade);
    data.push(...pbs);
    const ck12_x = await ck12(query, grade);
    data.push(...ck12_x);
  }

  return Response.json({ res: data }, { status: 200 });
}
