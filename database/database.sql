CREATE DATABASE IF NOT EXISTS content_management;
USE content_management;

DROP TABLE IF EXISTS contents;

CREATE TABLE contents (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    author VARCHAR(100) NOT NULL,
    status ENUM('Published', 'Draft') NOT NULL DEFAULT 'Draft',
    image_url VARCHAR(500) DEFAULT 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop',
    read_time VARCHAR(50) DEFAULT '5 min read',
    views_count INT DEFAULT 1200,
    likes_count INT DEFAULT 85,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO contents (title, description, category, author, status, image_url, read_time, views_count, likes_count, created_at) VALUES
('The Night the Internet Was Born — and Almost Wasn\'t', 'On October 29, 1969, a student typed two letters into a terminal at UCLA. The system crashed. The internet had arrived.', 'Technology', 'Thomas Okeke', 'Published', 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop', '6 min read', 3104, 198, NOW() - INTERVAL 10 DAY),
('Understanding Modern Ecosystem Dynamics & Climate Systems', 'An in-depth study on how regional climate shifts affect biodiversity across coastal regions and marine ecosystems.', 'Environment', 'Loga Shree S', 'Published', 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&auto=format&fit=crop', '4 min read', 2410, 142, NOW() - INTERVAL 8 DAY),
('The Architecture of Ancient European Libraries', 'Exploring how classical reading rooms preserved knowledge through centuries of political turbulence and technological shifts.', 'History', 'Loga Shree S', 'Published', 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=800&auto=format&fit=crop', '8 min read', 1890, 95, NOW() - INTERVAL 5 DAY),
('Breakthroughs in Preventive Healthcare Diagnostics', 'How modern algorithmic telemetry and remote physiological sensors are aiding early medical detections.', 'Health', 'Loga Shree S', 'Draft', 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop', '5 min read', 950, 44, NOW() - INTERVAL 4 DAY),
('Quantum Computing Foundations and Future Limits', 'An introduction to qubits, quantum superposition, and quantum supremacy algorithms.', 'Science', 'Loga Shree S', 'Published', 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&auto=format&fit=crop', '7 min read', 4210, 312, NOW() - INTERVAL 3 DAY),
('Building Accessible Web Applications with WCAG Standards', 'A comprehensive technical checklist for modern web application accessibility compliance.', 'Technology', 'Loga Shree S', 'Draft', 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop', '6 min read', 620, 29, NOW() - INTERVAL 2 DAY),
('The Evolution of Renewable Solar Cell Efficiency', 'Analyzing silicon wafer advancements and next-generation perovskite solar cell technologies.', 'Environment', 'Loga Shree S', 'Published', 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=800&auto=format&fit=crop', '5 min read', 1530, 110, NOW() - INTERVAL 1 DAY),
('Cognitive Neurobiology and Memory Retrieval', 'Examining how neural networks encode short-term and long-term memories in human brain tissue.', 'Science', 'Loga Shree S', 'Draft', 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=800&auto=format&fit=crop', '9 min read', 880, 52, NOW());