const axios = require('axios');
const cheerio = require('cheerio');
const chromium = require('@sparticuz/chromium');
const puppeteer = require('puppeteer-core');

exports.handler = async function(event, context) {
  // CORS 관련 처리 - Preflight 요청에 대응
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
      },
      body: ''
    };
  }
  
  try {
    // Puppeteer 브라우저 실행
    const executablePath = await chromium.executablePath();
    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: executablePath,
      headless: true,
      ignoreHTTPSErrors: true,
    });
    
    const page = await browser.newPage();
    
    // 네이버 예약 페이지 접속
    await page.goto('https://booking.naver.com/booking/5/bizes/1189894/items', {
      waitUntil: 'networkidle0'
    });
    
    // 페이지의 HTML 가져오기
    const html = await page.content();
    
    // 브라우저 종료
    await browser.close();
    
    // HTML 파싱
    const $ = cheerio.load(html);
    const workshopItems = [];
    
    // 워크샵 아이템 파싱
    $('.booking_list .list_item').each((i, el) => {
      const title = $(el).find('.item_title').text().trim();
      const price = $(el).find('.price').text().trim();
      const description = $(el).find('.item_desc').text().trim();
      const imageUrl = $(el).find('.item_img img').attr('src');
      
      if (title) {
        workshopItems.push({
          title,
          price,
          description,
          imageUrl
        });
      }
    });
    
    // CORS 헤더를 포함한 응답 반환
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
      },
      body: JSON.stringify({ workshopItems })
    };
    
  } catch (error) {
    console.error('워크샵 데이터 가져오기 실패:', error);
    
    // 오류 응답에도 CORS 헤더 포함
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
      },
      body: JSON.stringify({ 
        error: '워크샵 데이터를 가져오는데 실패했습니다',
        message: error.message
      })
    };
  }
};
