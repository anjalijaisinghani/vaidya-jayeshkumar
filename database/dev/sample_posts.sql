-- DEVELOPMENT TEST DATA ONLY. Never load this in production.
-- Remove later with:
--   DELETE FROM posts WHERE slug LIKE 'sample-%';

USE vaidya_jayeshkumar;

INSERT IGNORE INTO posts
  (category_id, title, slug, excerpt, content, status, is_featured, published_at)
SELECT c.id, 'Sample Published Post One', 'sample-published-one',
       'Test excerpt one.',
       '<p>Test content one. Sample text for development only.</p>',
       'PUBLISHED', 1, NOW()
FROM categories c WHERE c.slug = 'blogs';

INSERT IGNORE INTO posts
  (category_id, title, slug, excerpt, content, status, is_featured, published_at)
SELECT c.id, 'Sample Herbs Post', 'sample-herbs-post',
       'Test excerpt about herbs.',
       '<p>Sample text mentioning herbs, used only to test search.</p>',
       'PUBLISHED', 0, NOW()
FROM categories c WHERE c.slug = 'herbs-and-medicinal-plants';

INSERT IGNORE INTO posts
  (category_id, title, slug, excerpt, content, status, is_featured, published_at)
SELECT c.id, 'Sample Wellness Post', 'sample-wellness-post',
       'Test excerpt three.',
       '<p>Sample wellness text for development only.</p>',
       'PUBLISHED', 0, NOW()
FROM categories c WHERE c.slug = 'general-wellness';

INSERT IGNORE INTO posts
  (category_id, title, slug, excerpt, content, status, is_featured, published_at)
SELECT c.id, 'Sample Draft Post', 'sample-draft-secret',
       'This draft must never appear publicly.',
       '<p>Draft test content.</p>',
       'DRAFT', 0, NULL
FROM categories c WHERE c.slug = 'blogs';