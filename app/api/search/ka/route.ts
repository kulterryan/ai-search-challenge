import * as cheerio from "cheerio";

// Scrape Khan Academy Search Engine
export async function GET(){
  const response = await fetch('https://www.khanacademy.org/search?search_again=1&page_search_query=Volcanoes', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/html; charset=UTF-8',
    },
    redirect: 'follow',
    referrerPolicy: 'no-referrer',
  }).then(res => res.text());

  const $ = cheerio.load(response);
  console.log($('inner-wrapper').text());
  const results = $('.search-results').children('.search-result');
  console.log(results);
  return Response.json({"res": response});
}