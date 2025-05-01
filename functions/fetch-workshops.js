const axios = require('axios');
const cheerio = require('cheerio');

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
    // 네이버 예약 페이지 요청
    const response = await axios.get('https://booking.naver.com/booking/5/bizes/1189894/items', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      }
    });
    const html = response.data;
    
    // HTML 파싱
    const $ = cheerio.load(html);
    const workshopItems = [];
    
    // 디버깅을 위한 HTML 구조 출력
    console.log('HTML Content:', html);
    
    // 워크샵 아이템 파싱
    $('.item_list_wrap .item_list').each((i, el) => {
      const title = $(el).find('.item_title').text().trim();
      const price = $(el).find('.price').text().trim();
      const description = $(el).find('.item_desc').text().trim();
      const imageUrl = $(el).find('.item_img img').attr('src');
      
      // 디버깅을 위한 각 아이템 정보 출력
      console.log('Found item:', { title, price, description, imageUrl });
      
      if (title) {  // 제목이 있는 경우에만 추가
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
        'Access-Control-Allow-Origin': '*', // 모든 도메인에서의 접근 허용 (또는 특정 도메인으로 제한)
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
        'Access-Control-Allow-Origin': '*', // 모든 도메인에서의 접근 허용
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
