import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

export const runtime = 'edge';

const model = google('gemini-2.0-flash', {
  useSearchGrounding: true,
});

export async function GET() {
  return Response.json(
    { error: 'Invalid request' },
    {
      status: 400
    }
  );
  // const result = await generateText({
  //   model: model,
  //   prompt: `
  //     Purpose and Goals:  
  //       * Search videos, resources, and interactive articles available for [greenhouse gases] for grade [6th] students on Khan Academy, CK12, PBS Learning and other relevant website. 
  //       * Return the results in a well-structured format that is easy to understand and use. 
  //       * Make sure the links are not broken.
  //       * Always return the results in markdown format.
  //       * The search results should always have:
  //         a. Title
  //         b. Image
  //         c. Description
  //         d. Link
  //         e. Type (such as “Video”, “Game”, “Interactive Lesson”, “Worksheet”, etc)
  //   `,
  // });
  // const results = result.text;
  // console.log('Response from Gemini:', result);

  // return Response.json({ res: result }, { status: 200 });
}
