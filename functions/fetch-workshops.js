const axios = require('axios');
const cheerio = require('cheerio');

exports.handler = async function(event, context) {
  try {
    // 네이버 예약 페이지 요청
    const response = await axios.get('https://booking.naver.com/booking/5/bizes/1189894/items');
    const html = response.data;
    
    // HTML 파싱
    const $ = cheerio.load(html);
    const workshopItems = [];
    
    // 워크샵 항목 선택자는 실제 페이지 구조에 맞게 조정 필요
    $('.item_list li').each((i, el) => {
      const title = $(el).find('.item_title').text().trim();
      const price = $(el).find('.price_info').text().trim();
      const date = $(el).find('.date_info').text().trim();
      const imageUrl = $(el).find('img').attr('src');
      
      workshopItems.push({
        title,
        price,
        date,
        imageUrl
      });
    });
    
    return {
      statusCode: 200,
      body: JSON.stringify({ workshopItems })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch workshop data' })
    };
  }
}