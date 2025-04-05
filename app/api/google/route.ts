import { GOOGLE_GENERATIVE_AI_API_KEY } from '@/lib/const';
import { GoogleGenAI } from '@google/genai';

export const runtime = 'edge';

export async function GET() {
  const ai = new GoogleGenAI({ apiKey: GOOGLE_GENERATIVE_AI_API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [{
        parts: [{
          text: `
        Purpose and Goals:  
        * Search videos, resources, and interactive articles available for [greenhouse gases] for grade [6th] students on Khan Academy, CK12, PBS Learning and other relevant website. 
        * Return the results in a well-structured format that is easy to understand and use. 
        * Make sure the links are not broken.
        * Always return the results in markdown format.
        `
        }]
      }],
      config: {
        tools: [{ googleSearch: {
          query: 'greenhouse gases 6th grade',
          numResults: 5,
          filters: {
            time: 'any',
            type: ['video', 'article', 'interactive', 'game', 'worksheet'],
            siteSearch: ['khanacademy.org', 'ck12.org', 'pbslearningmedia.org'],
          },
        } }],
      },
    });
    console.log('Response from Gemini:', response.candidates?.[0]?.groundingMetadata);

    const results = response.text;

    // Extract links from markdown-formatted text using regex
    // Match both [text](url) format and plain URLs
    const markdownLinkPattern = /\[.*?\]\((https?:\/\/[^\s)]+)\)|(?<![(\[])(https?:\/\/[^\s)"\]]+)/g;
    
    // Extract all link matches from the results
    const links = [];
    const matches = results ? Array.from(results.matchAll(markdownLinkPattern)) : [];

    for (const match of matches) {
      // If it's a markdown link [text](url), get the URL from group 1
      // Otherwise use the direct URL match
      links.push(match[1] || match[0]);
    }

    // Remove any duplicates
    const uniqueLinks = Array.from(new Set(links));
    // console.log('Links found:', uniqueLinks);
    return Response.json({ links: uniqueLinks, chunks: response.candidates?.[0]?.groundingMetadata }, { status: 200 });
  } catch (error) {
    console.error('Error generating content');
    console.error('Error Log:', error);
    return Response.json({ error: 'Failed to generate content' }, { status: 500 });
  }

  // To get grounding metadata as web content.
  // console.log(response.candidates[0].groundingMetadata.searchEntryPoint.renderedContent)
}
