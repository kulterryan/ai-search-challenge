import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const runtime = 'edge';

export async function GET() {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [{
        parts: [{
          text: `
        Purpose and Goals:  
        * Search videos, resources, and interactive articles available for [greenhouse gases] for grade [6th] students on Khan Academy, CK12, PBS Learning and other relevant website. 
        * Return the results in a well-structured format that is easy to understand and use. Make sure the links are not broken.
        `
        }]
      }],
      config: {
        tools: [{ googleSearch: {
          query: 'greenhouse gases 6th grade',
          numResults: 5,
          filters: {
            time: 'any',
            type: 'video',
            siteSearch: ['khanacademy.org', 'ck12.org', 'pbslearningmedia.org'],
          },
        } }],
      },
    });
    const results = response.text;
    // console.log("Response from Gemini:", results);
    // console.log("Grounded Metadata from Gemini:", response.candidates?.[0]?.groundingMetadata);
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
    console.log('Links found:', uniqueLinks);
    return Response.json({ res: uniqueLinks });
  } catch (error) {
    console.error('Error generating content');
    console.error('Error Log:', error);
    return Response.json({ error: 'Failed to generate content' }, { status: 500 });
  }

  // To get grounding metadata as web content.
  // console.log(response.candidates[0].groundingMetadata.searchEntryPoint.renderedContent)
}
