'use server';

import { BROWSERLESS_API_KEY, BROWSERLESS_ENDPOINT } from '@/lib/const';
import * as cheerio from 'cheerio';
import puppeteer from 'puppeteer';
import { generateEmbeddings } from './llm';
import { insertResources } from './db';

async function browserScraper(url: string) {
  const browser = await puppeteer.connect({
    browserWSEndpoint: `wss://${BROWSERLESS_ENDPOINT}?token=${BROWSERLESS_API_KEY}`,
  });

  // console.log('Navigating to:', url);

  // Create a new page
  const page = await browser.newPage();

  await page.goto(url, {
    waitUntil: 'networkidle2',
    timeout: 0,
  });

  // console.log('Page loaded, scraping content...');

  // Wait for the content to load
  const content = await page.content();
  await browser.close();

  return content;
}

// Use Promise.all to wait for all embeddings to be generated & Save them to the data array
async function generateEmbeddingsForResults(data: SearchResult[], query: string) {
  // First check and filter out duplicate URLs to avoid redundant embedding generation
  const uniqueLinks = new Set<string>();
  const filteredData = data.filter(item => {
    if (item.link && !uniqueLinks.has(item.link)) {
      uniqueLinks.add(item.link);
      return true;
    }
    return false;
  });

  // Use the filtered data for embedding generation
  const dataToProcess = filteredData;
  await Promise.all(
    dataToProcess.map(async (item) => {
      // Generate embeddings for each result
      const { embeddings } = await generateEmbeddings(`
        Title: ${item.title},
        Description:  ${item.description}
        Query: ${query}
         `);
      item.embedding = embeddings?.[0]?.values || [];
      return item;
    })
  );

  const x = await insertResources(data);
  console.log('Inserted resources into the database:', x);

  return data;
}

export async function khanacademy(query: string, grade: string) {
  // const updatedQuery = query + ` for Grade ` + (grade === 'all' ? '' : grade);
  // console.log('Updated query:', updatedQuery);
  const url = `https://www.khanacademy.org/search?search_again=1&page_search_query=${encodeURIComponent(query)}&content_kinds=Exercise%2CVideo%2CTopic`;

  const content = await browserScraper(url);

  // console.log('Page loaded, scraping content...');
  const $ = cheerio.load(content);

  // console.log('Content loaded, scraping results...');

  const data: SearchResult[] = [];

  $('li').each((index, element) => {
    const $elem = $(element);
    const link = $elem.find('a').attr('href');
    const title = $elem.find('div._2dibcm7').text();
    const type = $elem.find('div._1ufuji7').text();
    const description = $elem.find('span._1n941cdr').text() || '';

    if (link && title) {
      data.push({
        title,
        link: `https://www.khanacademy.org${link}`,
        content_type: type,
        grades: grade === 'all' ? [] : [grade],
        image: $elem.find('img').attr('src') || '',
        description,
        source: 'Khan Academy',
      });
    }
  });

  console.log('Extracted Khan Academy results:', data.length);

  // Use Promise.all to wait for all embeddings to be generated
  await generateEmbeddingsForResults(data, query);

  console.log('Generated embeddings for Khan Academy results:', data.length);
  return data;
}

export async function pbslearning(query: string, grade: string) {
  const pbsGrade = grade === 'K' ? 'K-2' : grade === '1' ? '3-5' : grade === '2' ? '6-8' : grade === '3' ? '9-12' : grade === 'all' ? 'PreK-K,K-2,3-5,6-8,9-12' : '';

  const url = `https://www.pbslearningmedia.org/search/?rank_by=relevance&q=${encodeURIComponent(query)}&page=1` + (pbsGrade ? `&selected_facet=grades:=${encodeURIComponent(pbsGrade)}` : '');

  const content = await browserScraper(url);
  const $ = cheerio.load(content);
  console.log('Content loaded, scraping results...');

  const data: SearchResult[] = [];

  $('.search-item').each((index, element) => {
    const $elem = $(element);
    const title = $elem.find('.card-title').text().trim();
    const link = $elem.find('app-link a.app-link').attr('href');
    const description = $elem.find('.card-description').text().trim();

    // Extract media type
    const mediaTypeElem = $elem.find('.media-type .text');
    const mediaType = mediaTypeElem.length ? mediaTypeElem.text().trim() : '';

    // Extract grades
    const gradesElem = $elem.find('.grades');
    const grades = gradesElem.length ? gradesElem.text().replace('Grades', '').trim() : '';

    // Extract poster image
    const posterUrl =
      $elem
        .find('.poster-image')
        .css('background-image')
        ?.replace(/^url\(['"](.+)['"]\)$/, '$1') || '';

    if (title && link) {
      // Process grades to expand ranges (e.g., "3-5" becomes ["3","4","5"])
      const expandedGrades: string[] = [];
      if (grades) {
        grades
          .replace(/\|/g, '')
          .split(',')
          .forEach((gradeRange) => {
            gradeRange = gradeRange.trim();
            if (gradeRange.includes('-')) {
              const [start, end] = gradeRange.split('-').map((g) => g.trim());
              if (start === 'K' && !isNaN(parseInt(end, 10))) {
                // Handle K-2 case: add K, 1, 2
                expandedGrades.push('K');
                for (let i = 1; i <= parseInt(end, 10); i++) {
                  expandedGrades.push(i.toString());
                }
              } else if (!isNaN(parseInt(start, 10)) && !isNaN(parseInt(end, 10))) {
                // Handle numeric ranges like 3-5
                for (let i = parseInt(start, 10); i <= parseInt(end, 10); i++) {
                  expandedGrades.push(i.toString());
                }
              } else {
                expandedGrades.push(gradeRange); // Keep as is if not standard range
              }
            } else if (gradeRange.toLowerCase() === 'kindergarten') {
              expandedGrades.push('K');
            } else {
              expandedGrades.push(gradeRange);
            }
          });
      }

      data.push({
        title,
        link: link.startsWith('/') ? `https://www.pbslearningmedia.org${link}` : link,
        description,
        content_type: mediaType,
        grades: expandedGrades,
        image: posterUrl,
        source: 'PBS Learning',
      });
    }
  });

  console.log('Extracted PBS Learning Media results:', data.length);

  // Use Promise.all to wait for all embeddings to be generated
  await generateEmbeddingsForResults(data, query);

  console.log('Generated embeddings for PBS Learning Media results:', data.length);
  return data;
}

export async function ck12(query: string, grade: string) {
  const url = `https://www.ck12.org/search/?referrer=search&typeFilters=read%2Cvideo&pageNum=1&tabId=communityContributedContentTab&gradeFilters=${encodeURIComponent(grade)}&q=${encodeURIComponent(query)}`;

  const content = await browserScraper(url);

  const $ = cheerio.load(content);
  console.log('Content loaded, scraping results...');

  const data: SearchResult[] = [];

  $('.contentListItemStyles__Container-sc-5gkytp-0').each((index, element) => {
    const $elem = $(element);
    const title = $elem.find('.contentListItemStyles__TitleContainer-sc-5gkytp-3 a').text().trim();

    // Extract content type from the title (after the dash)
    let rawTitle = title;
    let contentType = '';
    if (title.includes('-')) {
      const parts = title.split('-');
      rawTitle = parts[0].trim();
      contentType = parts[1].trim();
    }

    const link = $elem.find('.contentListItemStyles__TitleContainer-sc-5gkytp-3 a').attr('href');
    const description = $elem.find('.contentListItemStyles__TextContainer-sc-5gkytp-1 > div:first-child > div:nth-child(2)').text().trim();
    const posterUrl = $elem.find('.contentListItemStyles__Image-sc-5gkytp-2').attr('src') || '';
    const grades = $elem.find('.ContentListItem__ListItem-sc-8bx8mv-1:contains("Grade:")').text().replace('Grade:', '').trim();

    if (rawTitle && link) {
      data.push({
        title: rawTitle,
        content_type: contentType,
        link: link.startsWith('/') ? `https://www.ck12.org${link}` : link,
        description,
        image: posterUrl,
        grades: grades.split(',').map((g) => g.trim()),
        source: 'CK-12',
      });
    }
  });

  console.log('Extracted CK12 results:', data.length);

  // Use it in the ck12 function
  await generateEmbeddingsForResults(data, query);

  console.log('Generated embeddings for CK12 results:', data.length);
  return data;
}

export async function mainScraper(query: string, grade: string) {
  // console.log('Main scraper query:', query);
  // console.log('Grade:', grade);

  const [khanAcademyResults, pbsLearningResults, ck12Results] = await Promise.all([khanacademy(query, grade), pbslearning(query, grade), ck12(query, grade)]);

  const allResults = [...khanAcademyResults, ...pbsLearningResults, ...ck12Results];

  console.log('Total results from all sources:', allResults.length);

  return allResults;
}
