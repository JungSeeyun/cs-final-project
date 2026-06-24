.PHONY: up down logs clean

up:
	docker-compose up -d
	@echo "✅ 앱 시작됨 → http://localhost:3000"

down:
	docker-compose down

logs:
	docker-compose logs -f app

clean:
	docker-compose down -v
