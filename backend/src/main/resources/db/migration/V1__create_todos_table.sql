CREATE TABLE IF NOT EXISTS todos (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    priority VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    due_date DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_todos_completed (completed),
    INDEX idx_todos_priority (priority),
    INDEX idx_todos_created_at (created_at),
    INDEX idx_todos_due_date (due_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sample initial tasks
INSERT INTO todos (title, description, completed, priority, due_date, created_at, updated_at) VALUES
('Thiết kế kiến trúc hệ thống Fullstack', 'Xác định các thành phần Backend Spring Boot, Frontend React, MySQL và Docker Compose.', TRUE, 'HIGH', DATE_ADD(NOW(), INTERVAL 2 DAY), NOW(), NOW()),
('Triển khai Backend REST API', 'Hoàn thiện CRUD Todo với Spring Boot 3, JPA Specifications và Flyway migrations.', FALSE, 'HIGH', DATE_ADD(NOW(), INTERVAL 3 DAY), NOW(), NOW()),
('Xây dựng Frontend React & Tailwind', 'Tạo UI hiện đại với Dashboard thống kê, modal thêm/sửa, bộ lọc và sắp xếp.', FALSE, 'MEDIUM', DATE_ADD(NOW(), INTERVAL 5 DAY), NOW(), NOW()),
('Đóng gói Docker & chuẩn bị Deploy AWS', 'Viết Dockerfile multi-stage, docker-compose.yml và tài liệu hướng dẫn triển khai.', FALSE, 'LOW', DATE_ADD(NOW(), INTERVAL 7 DAY), NOW(), NOW());
