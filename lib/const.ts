export const GOOGLE_GENERATIVE_AI_API_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
if (!GOOGLE_GENERATIVE_AI_API_KEY) {
  throw new Error('GOOGLE_GENERATIVE_AI_API_KEY is not defined');
}

export const BROWSERLESS_ENDPOINT = process.env.BROWSERLESS_ENDPOINT;
if (!BROWSERLESS_ENDPOINT) {
  throw new Error('BROWSERLESS_ENDPOINT is not defined');
}

export const BROWSERLESS_API_KEY = process.env.BROWSERLESS_API_KEY;
if (!BROWSERLESS_API_KEY) {
  throw new Error('BROWSERLESS_API_KEY is not defined');
}