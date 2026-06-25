const { Pool, neonConfig } = require('../node_modules/@neondatabase/serverless');
const ws = require('../node_modules/ws');
neonConfig.webSocketConstructor = ws;

const DB_URL = 'postgresql://neondb_owner:npg_mcehMi1IL8bG@ep-late-cake-ao7s5q32-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';
const pool = new Pool({ connectionString: DB_URL });

const IMG = (id) => `https://images.unsplash.com/${id}?w=800&h=500&fit=crop&auto=format&q=80`;

const RESTAURANTS = [
  { name: '맛있는 치킨', category: '치킨', description: '30년 전통 비법 양념으로 만든 바삭한 황금 치킨', delivery_time: 25, min_order: 15000, image_url: IMG('photo-1569169743032-4fec9e78cdfd') },
  { name: '황금올리브 치킨', category: '치킨', description: '엑스트라 버진 올리브오일로 튀긴 프리미엄 치킨', delivery_time: 30, min_order: 18000, image_url: IMG('photo-1626645738196-c2a7c87a8f58') },
  { name: '후라이드 공화국', category: '치킨', description: '국내산 닭 당일 입고, 국내 최강 바삭함 보장', delivery_time: 35, min_order: 17000, image_url: IMG('photo-1527477396000-e27163b481c2') },
  { name: '네네치킨', category: '치킨', description: '뿌링클·허니콤보 등 개성 넘치는 시그니처 치킨', delivery_time: 28, min_order: 16000, image_url: IMG('photo-1598103442097-8b74394b95c6') },
  { name: '찜닭 명가', category: '치킨', description: '안동 직전수 레시피 50년 찜닭 명가', delivery_time: 40, min_order: 20000, image_url: IMG('photo-1603133872878-684f208fb84b') },
  { name: '행복한 피자', category: '피자', description: '이탈리아 화덕에서 구운 정통 나폴리 피자', delivery_time: 35, min_order: 20000, image_url: IMG('photo-1565299624946-b28f40a0ae38') },
  { name: '피자나라', category: '피자', description: '두툼한 씨앗 도우에 풍성한 토핑이 가득', delivery_time: 30, min_order: 18000, image_url: IMG('photo-1574071318508-1cdbab80d002') },
  { name: '도미노피자', category: '피자', description: '30분 배달 보장! 항상 뜨겁고 신선하게', delivery_time: 40, min_order: 20000, image_url: IMG('photo-1513104890138-7c749659a591') },
  { name: '피자스쿨', category: '피자', description: '착한 가격으로 즐기는 피자의 모든 것', delivery_time: 25, min_order: 12000, image_url: IMG('photo-1593560708920-61dd98c46a4e') },
  { name: '나폴리의 맛', category: '피자', description: '이탈리아 현지 셰프가 만드는 정통 화덕 피자', delivery_time: 45, min_order: 25000, image_url: IMG('photo-1571997478779-2adcbbe9ab2f') },
  { name: '신선한 초밥', category: '일식', description: '매일 직접 공수하는 제철 생선으로 만드는 프리미엄 초밥', delivery_time: 40, min_order: 25000, image_url: IMG('photo-1617196034183-421b4040ed20') },
  { name: '라멘하우스', category: '일식', description: '12시간 끓인 진한 돈코츠 육수 현지의 맛 그대로', delivery_time: 30, min_order: 14000, image_url: IMG('photo-1569718212165-3a8278d5f624') },
  { name: '돈카츠 명가', category: '일식', description: '두툼한 국내산 등심 돈카츠 전문점', delivery_time: 25, min_order: 12000, image_url: IMG('photo-1565958011703-44f9829ba187') },
  { name: '우동 전문점', category: '일식', description: '쫄깃쫄깃 수제 면의 우동 맛집', delivery_time: 20, min_order: 10000, image_url: IMG('photo-1569058242567-93de6f36f8eb') },
  { name: '카레야', category: '일식', description: '진하고 깊은 일본식 카레 전문점', delivery_time: 25, min_order: 12000, image_url: IMG('photo-1455619452474-d2be8b1e70cd') },
  { name: '든든한 한식', category: '한식', description: '집밥 느낌의 따뜻한 한식 백반', delivery_time: 30, min_order: 10000, image_url: IMG('photo-1498654896293-37aaa4a85b6c') },
  { name: '삼겹살 고집', category: '한식', description: '국내산 생삼겹살 숯불 직화구이', delivery_time: 35, min_order: 20000, image_url: IMG('photo-1544025162-d76538b2a681') },
  { name: '부대찌개 본가', category: '한식', description: '40년 전통 국물이 끝내주는 원조 부대찌개', delivery_time: 30, min_order: 12000, image_url: IMG('photo-1607330289024-1535c6b4e1c1') },
  { name: '냉면 전문점', category: '한식', description: '평양식 물냉면과 함흥식 비빔냉면 전문', delivery_time: 20, min_order: 10000, image_url: IMG('photo-1583187855251-7c9f2e9b2c32') },
  { name: '갈비탕 명가', category: '한식', description: '10시간 이상 우린 진한 갈비탕 한 그릇', delivery_time: 40, min_order: 15000, image_url: IMG('photo-1553361371-9b22f78e8b1d') },
];

const MENUS = [
  [{ name: '후라이드 치킨', description: '바삭하게 튀긴 전통 후라이드', price: 18000 }, { name: '양념 치킨', description: '달콤 매콤한 특제 양념', price: 19000 }, { name: '반반 치킨', description: '후라이드 반 + 양념 반', price: 20000 }, { name: '간장 치킨', description: '달콤 짭조름한 간장 소스', price: 20000 }],
  [{ name: '황금올리브 순살', description: '올리브오일로 튀긴 부드러운 순살', price: 21000 }, { name: '마늘 치킨', description: '고소한 통마늘 한가득', price: 22000 }, { name: '올리브 콤보', description: '순살 + 뼈 반반 세트', price: 25000 }],
  [{ name: '크리스피 후라이드', description: '한국식 바삭 후라이드', price: 18000 }, { name: '스파이시 치킨', description: '청양고추 소스 매운 치킨', price: 19000 }, { name: '마늘치즈 치킨', description: '마늘 소스 + 치즈 토핑', price: 21000 }],
  [{ name: '뿌링클', description: '버터구이 + 뿌링클 시즈닝', price: 20000 }, { name: '허니콤보', description: '달콤한 허니머스타드 소스', price: 21000 }, { name: '파닭', description: '매콤달콤 대파 소스 치킨', price: 21000 }],
  [{ name: '오리지널 찜닭', description: '안동식 전통 찜닭 1마리', price: 22000 }, { name: '매운 찜닭', description: '불닭 소스로 더 맵게', price: 23000 }, { name: '치즈 찜닭', description: '모짜렐라 치즈 가득한 찜닭', price: 25000 }],
  [{ name: '마르게리타', description: '신선한 토마토 소스 + 모짜렐라', price: 22000 }, { name: '페퍼로니', description: '풍성하게 올라간 페퍼로니', price: 24000 }, { name: '불고기 피자', description: '달콤한 국산 불고기 토핑', price: 25000 }],
  [{ name: '슈퍼시드 피자', description: '씨앗 도우 + 신선 야채', price: 22000 }, { name: '포테이토 피자', description: '감자 + 베이컨 + 치즈', price: 23000 }, { name: '콤비네이션', description: '다양한 재료가 한가득', price: 25000 }],
  [{ name: '블랙타이거 새우', description: '탱글탱글 새우 가득 프리미엄', price: 26000 }, { name: '오리지널 치즈', description: '클래식 4치즈 피자', price: 22000 }, { name: '갈릭 스테이크', description: '마늘 소스 + 소고기 스테이크', price: 28000 }],
  [{ name: '불닭 피자', description: '핵불닭 소스 매운 피자', price: 15000 }, { name: '씨푸드 피자', description: '새우 + 오징어 해산물', price: 16000 }, { name: '치즈 피자', description: '쭉쭉 늘어나는 모짜렐라 4겹', price: 14000 }],
  [{ name: '나폴리 마르게리타', description: '이탈리아 DOP 인증 정통 레시피', price: 28000 }, { name: '프로슈토 에 루콜라', description: '이탈리안 생햄 + 루꼴라', price: 32000 }, { name: '트러플 버섯 피자', description: '블랙 트러플 오일 + 포르치니', price: 35000 }],
  [{ name: '연어 초밥 세트', description: '신선한 노르웨이 연어 8피스', price: 28000 }, { name: '모둠 초밥', description: '제철 생선 12피스 모둠', price: 32000 }, { name: '새우 튀김 초밥', description: '바삭한 새우 튀김 6피스', price: 20000 }],
  [{ name: '돈코츠 라멘', description: '12시간 끓인 진한 돼지뼈 육수', price: 14000 }, { name: '시오 라멘', description: '닭 육수 베이스 깔끔한 소금 라멘', price: 13000 }, { name: '미소 라멘', description: '구수한 된장 + 차슈 토핑', price: 14000 }],
  [{ name: '등심 돈카츠', description: '두툼한 등심 + 특제 소스', price: 15000 }, { name: '안심 돈카츠', description: '부드러운 안심 + 데미그라스', price: 14000 }, { name: '치즈 돈카츠', description: '치즈가 흘러넘치는 돈카츠', price: 17000 }],
  [{ name: '가케 우동', description: '따뜻한 기본 간장 우동', price: 10000 }, { name: '나베야키 우동', description: '새우튀김 + 달걀 냄비 우동', price: 13000 }, { name: '카레 우동', description: '진한 카레 국물 우동', price: 12000 }],
  [{ name: '포크 카레', description: '부드러운 돼지고기 일본 카레', price: 12000 }, { name: '비프 카레', description: '육즙 넘치는 소고기 카레', price: 14000 }, { name: '해산물 카레', description: '새우 + 오징어 + 관자', price: 15000 }],
  [{ name: '된장찌개 정식', description: '구수한 된장찌개 + 밥 + 반찬 3종', price: 9000 }, { name: '김치찌개 정식', description: '얼큰한 김치찌개 + 밥 + 반찬 3종', price: 9000 }, { name: '제육볶음 정식', description: '매콤달콤 제육볶음 + 밥', price: 11000 }],
  [{ name: '삼겹살 1인분 (200g)', description: '국내산 냉장 삼겹살', price: 14000 }, { name: '목살 1인분 (200g)', description: '국내산 냉장 목살', price: 13000 }, { name: '삼겹+목살 세트 (400g)', description: '삼겹살 + 목살 믹스', price: 25000 }],
  [{ name: '부대찌개 1인', description: '햄 + 소시지 + 라면 사리', price: 12000 }, { name: '부대찌개 2인', description: '넉넉한 2인분 큰 냄비', price: 22000 }, { name: '스페셜 부대찌개', description: '치즈 + 만두 + 떡 사리 추가', price: 15000 }],
  [{ name: '물냉면', description: '시원한 육수의 평양식 물냉면', price: 11000 }, { name: '비빔냉면', description: '새콤매콤 함흥식 비빔냉면', price: 12000 }, { name: '열무냉면', description: '시원한 열무 물냉면', price: 11000 }],
  [{ name: '갈비탕', description: '한우 갈비를 10시간 우린 진한 국물', price: 15000 }, { name: '설렁탕', description: '사골 + 도가니 진한 설렁탕', price: 13000 }, { name: '육개장', description: '얼큰하고 구수한 소고기 육개장', price: 14000 }],
];

async function migrate() {
  console.log('Starting migration...');
  await pool.query(`ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS image_url TEXT`);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS reviews (
      id SERIAL PRIMARY KEY,
      restaurant_id INTEGER REFERENCES restaurants(id) ON DELETE CASCADE,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
      content TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
  await pool.query('DELETE FROM reviews');
  await pool.query('DELETE FROM cart_items');
  await pool.query('DELETE FROM order_items');
  await pool.query('DELETE FROM orders');
  await pool.query('DELETE FROM menu_items');
  await pool.query('DELETE FROM restaurants');
  await pool.query(`SELECT setval(pg_get_serial_sequence('restaurants', 'id'), 1, false)`);
  await pool.query(`SELECT setval(pg_get_serial_sequence('menu_items', 'id'), 1, false)`);
  for (const r of RESTAURANTS) {
    await pool.query(
      'INSERT INTO restaurants (name, category, description, delivery_time, min_order, image_url) VALUES ($1,$2,$3,$4,$5,$6)',
      [r.name, r.category, r.description, r.delivery_time, r.min_order, r.image_url]
    );
  }
  for (let i = 0; i < MENUS.length; i++) {
    for (const item of MENUS[i]) {
      await pool.query(
        'INSERT INTO menu_items (restaurant_id, name, description, price) VALUES ($1,$2,$3,$4)',
        [i + 1, item.name, item.description, item.price]
      );
    }
  }
  const rc = await pool.query('SELECT COUNT(*) FROM restaurants');
  const mc = await pool.query('SELECT COUNT(*) FROM menu_items');
  console.log(`Done: ${rc.rows[0].count} restaurants, ${mc.rows[0].count} menu items`);
  await pool.end();
}

migrate().catch(e => { console.error('Failed:', e.message); process.exit(1); });
