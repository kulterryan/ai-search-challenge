'use server';

import { BROWSERLESS_API_KEY, BROWSERLESS_ENDPOINT } from '@/lib/const';
import * as cheerio from 'cheerio';
import puppeteer from 'puppeteer';

export async function khanacademy(query: string) {
  const url = `https://www.khanacademy.org/search?search_again=1&page_search_query=${query}&content_kinds=Article%2CVideo%2CTopic`;
  const browser = await puppeteer.connect({
    browserWSEndpoint: `wss://${BROWSERLESS_ENDPOINT}?token=${BROWSERLESS_API_KEY}`,
  });
  const page = await browser.newPage();

  console.log('Navigating to:', url);
  await page.goto(url, {
    waitUntil: 'networkidle2',
    timeout: 0,
  });
  console.log('Page loaded, scraping content...');
  const content = await page.content();
  const $ = cheerio.load(content);
  console.log('Content loaded, scraping results...');
  const data : any = [];

  $('li').each((index, element) => {
    const $elem = $(element);
    const link = $elem.find('a').attr('href');
    const title = $elem.find('div._2dibcm7').text();
    const type = $elem.find('div._1ufuji7').text();
    const subject = $elem.find('div._12itjrk5').text();
    const description = $elem.find('span._1n941cdr').text() || '';
    
    if (link && title) {
      data.push({
        title,
        link: `https://www.khanacademy.org${link}`,
        type,
        subject,
        description
      });
    }
  });
  console.log('Extracting results...');
  // console.log(data);
  return data;
}

export async function pbslearning(query : string, grade: string){
  const pbsGrade = (() => {
    // This needs to be updated to match the PBS Learning Media search API
    if (grade === "K") return 'K-2';
    switch ((grade)) {
      case "1":
        return '3-5';
      case "2":
        return '6-8';
      case "3":
        return '9-12';
      default:
        return '';
    }
  })();
  const url = `https://www.pbslearningmedia.org/search/?rank_by=recency&q=${query}&page=1` + (pbsGrade ? `&selected_facet=grades:=${pbsGrade}` : '');

  const browser = await puppeteer.connect({
    browserWSEndpoint: `wss://${BROWSERLESS_ENDPOINT}?token=${BROWSERLESS_API_KEY}`,
  });
  const page = await browser.newPage();
  console.log('Navigating to:', url);
  await page.goto(url, {
    waitUntil: 'networkidle2',
    timeout: 0,
  });
  console.log('Page loaded, scraping content...');
  const content = await page.content();
  const $ = cheerio.load(content);
  console.log('Content loaded, scraping results...');
  const data : any = [];
  $('.search-item').each((index, element) => {
    const $elem = $(element);
    const title = $elem.find('.card-title').text().trim();
    const link = $elem.find('app-link a.app-link').attr('href');
    const description = $elem.find('.card-description').text().trim();
    
    // Extract media type
    const mediaTypeElem = $elem.find('.media-type .text');
    const mediaType = mediaTypeElem.length ? mediaTypeElem.text().trim() : '';
    
    // Extract brand
    const brandElem = $elem.find('.brand .label');
    const brand = brandElem.length ? brandElem.text().trim() : '';
    
    // Extract grades
    const gradesElem = $elem.find('.grades');
    const grades = gradesElem.length ? gradesElem.text().replace('Grades', '').trim() : '';
    
    // Extract poster image
    const posterUrl = $elem.find('.poster-image').css('background-image')?.replace(/^url\(['"](.+)['"]\)$/, '$1') || '';
    
    if (title && link) {
      data.push({
        title,
        link: link.startsWith('/') ? `https://www.pbslearningmedia.org${link}` : link,
        description,
        mediaType,
        brand,
        grades,
        posterUrl
      });
    }
  });

  await browser.close();
  console.log('Extracted PBS Learning Media results:', data.length);
  return data;
      
}

export async function ck12(query: string, grade: string) {
  const url = `https://www.ck12.org/search/?referrer=search&pageNum=1&tabId=communityContributedContentTab&gradeFilters=${grade}&q=${query}`;
  const browser = await puppeteer.connect({
    browserWSEndpoint: `wss://${BROWSERLESS_ENDPOINT}?token=${BROWSERLESS_API_KEY}`,
  });

  const page = await browser.newPage();
  console.log('Navigating to:', url);

  await page.goto(url, {
    waitUntil: 'networkidle2', 
    timeout: 0,
  });
  console.log('Page loaded, scraping content...');
  const content = await page.content();

  const $ = cheerio.load(content);
  console.log('Content loaded, scraping results...');
  const data : any = [];

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
    
    // Extract metadata
    const grades = $elem.find('.ContentListItem__ListItem-sc-8bx8mv-1:contains("Grade:")').text().replace('Grade:', '').trim();
    const difficulty = $elem.find('.ContentListItem__ListItem-sc-8bx8mv-1:contains("Difficulty Level:")').text().replace('Difficulty Level:', '').trim();
    const creator = $elem.find('.ContentListItem__ListItem-sc-8bx8mv-1:contains("Created by:")').text().replace('Created by:', '').trim();
    const subject = $elem.find('.ContentListItem__ListItem-sc-8bx8mv-1:contains("Subject:")').text().replace('Subject:', '').trim();
    const foundIn = $elem.find('.ContentListItem__ListItem-sc-8bx8mv-1:contains("Found in")').text().replace('Found in', '').trim();
    
    if (rawTitle && link) {
      data.push({
        title: rawTitle,
        contentType,
        link: link.startsWith('/') ? `https://www.ck12.org${link}` : link,
        description,
        posterUrl,
        grades,
        difficulty,
        creator,
        subject,
      });
    }
  });

  await browser.close();
  console.log('Extracted CK12 results:', data.length);
  return data;
}