CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS restaurants (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL,
  description TEXT,
  delivery_time INTEGER DEFAULT 30,
  min_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS menu_items (
  id SERIAL PRIMARY KEY,
  restaurant_id INTEGER REFERENCES restaurants(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS cart_items (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  menu_item_id INTEGER REFERENCES menu_items(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  restaurant_id INTEGER REFERENCES restaurants(id),
  total_price INTEGER NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id INTEGER REFERENCES menu_items(id),
  quantity INTEGER NOT NULL,
  price_at_order INTEGER NOT NULL
);

-- 식당 시드 데이터
INSERT INTO restaurants (name, category, description, delivery_time, min_order) VALUES
  ('맛있는 치킨', '치킨', '바삭바삭한 치킨 전문점', 25, 15000),
  ('행복한 피자', '피자', '화덕에서 구운 정통 피자', 35, 20000),
  ('신선한 초밥', '일식', '매일 신선한 생선으로 만드는 초밥', 40, 25000),
  ('든든한 한식', '한식', '집밥 느낌의 따뜻한 한식 백반', 30, 10000)
ON CONFLICT DO NOTHING;

-- 메뉴 시드 데이터
INSERT INTO menu_items (restaurant_id, name, description, price) VALUES
  (1, '후라이드 치킨', '바삭하게 튀긴 후라이드', 18000),
  (1, '양념 치킨', '달콤 매콤 양념 치킨', 19000),
  (1, '반반 치킨', '후라이드 반 + 양념 반', 20000),
  (1, '치킨무 추가', '시원한 치킨무', 1000),
  (2, '마르게리타', '토마토 소스 + 모짜렐라', 22000),
  (2, '페퍼로니', '풍성한 페퍼로니 피자', 24000),
  (2, '불고기 피자', '달콤한 한국식 불고기 피자', 25000),
  (3, '연어 초밥 세트', '신선한 연어 8피스', 28000),
  (3, '모둠 초밥', '제철 생선 12피스', 32000),
  (3, '새우 튀김 초밥', '바삭한 새우 튀김 6피스', 20000),
  (4, '된장찌개 정식', '구수한 된장찌개 + 밥 + 반찬', 9000),
  (4, '김치찌개 정식', '얼큰한 김치찌개 + 밥 + 반찬', 9000),
  (4, '제육볶음 정식', '매콤달콤 제육볶음 + 밥 + 반찬', 11000)
ON CONFLICT DO NOTHING;
