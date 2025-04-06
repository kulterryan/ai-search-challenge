import { GOOGLE_GENERATIVE_AI_API_KEY } from '@/lib/const';
import { google_ai } from '@/utils/llm';
import { GoogleGenAI } from '@google/genai';
import { type NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  // Check if the request has the required headers
  return Response.json(
    { error: 'Invalid request' },
    {
      status: 400
    }
  );
  // // Get the query parameters from the request
  // const searchParams = request.nextUrl.searchParams;
  // const query = searchParams.get('query');
  // const type = searchParams.get('type');
  // const grade = searchParams.get('grade');

  // if (!query) {
  //   return Response.json({ error: 'Query parameter is required' }, { status: 400 });
  // }
  // if (!type) {
  //   return Response.json({ error: 'Type parameter is required' }, { status: 400 });
  // }
  // if (!grade) {
  //   return Response.json({ error: 'Grade parameter is required' }, { status: 400 });
  // }

  // try {
  //   const response = await google_ai.models.generateContent({
  //     model: 'gemini-2.0-flash',
  //     contents: [
  //       {
  //         parts: [
  //           {
  //             text: `
  //     Purpose and Goals:  
  //     * Search videos, resources, and interactive articles available for [${query}] for grade [${grade}] students on Khan Academy, CK12, PBS Learning and other relevant website. 
  //     * Return the results in a well-structured format that is easy to understand and use. 
  //     * Make sure the links are not broken.
  //     * Always return the results in markdown format.
  //     `,
  //           },
  //         ],
  //       },
  //     ],
  //     config: {
  //       tools: [
  //         {
  //           googleSearch: {
  //             query: `${query} ${grade ? `for ${grade}` : ''}`,
  //             numResults: 5,
  //             filters: {
  //               time: 'any',
  //               type: type,
  //               siteSearch: ['khanacademy.org', 'ck12.org', 'pbslearningmedia.org', 'ixl.com'],
  //             },
  //           },
  //         },
  //       ],
  //     },
  //   });
  //   console.log('Response from Gemini:', response.candidates?.[0]?.groundingMetadata);

  //   const results = response.text;

  //   // Extract links from markdown-formatted text using regex
  //   // Match both [text](url) format and plain URLs
  //   const markdownLinkPattern = /\[.*?\]\((https?:\/\/[^\s)]+)\)|(?<![(\[])(https?:\/\/[^\s)"\]]+)/g;

  //   // Extract all link matches from the results
  //   const links = [];
  //   const matches = results ? Array.from(results.matchAll(markdownLinkPattern)) : [];

  //   for (const match of matches) {
  //     // If it's a markdown link [text](url), get the URL from group 1
  //     // Otherwise use the direct URL match
  //     links.push(match[1] || match[0]);
  //   }

  //   // Remove any duplicates
  //   const uniqueLinks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;

  //   // console.log('Links found:', uniqueLinks);
  //   return Response.json({ links: uniqueLinks }, { status: 200 });
  // } catch (error) {
  //   console.error('Error generating content');
  //   console.error('Error Log:', error);
  //   return Response.json({ error: 'Failed to generate content' }, { status: 500 });
  // }

  // // To get grounding metadata as web content.
  // // console.log(response.candidates[0].groundingMetadata.searchEntryPoint.renderedContent)
}
