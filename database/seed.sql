-- Starter data. Safe to re-run: categories use INSERT IGNORE,
-- and the profile row is only added if the table is empty.

USE vaidya_jayeshkumar;

INSERT IGNORE INTO categories (name, slug, description) VALUES
  ('Ayurvedic Concepts',         'ayurvedic-concepts',         NULL),
  ('Ayurvedic Points',           'ayurvedic-points',           NULL),
  ('Ayurvedic Treatments',       'ayurvedic-treatments',       NULL),
  ('Herbs and Medicinal Plants', 'herbs-and-medicinal-plants', NULL),
  ('Blogs',                      'blogs',                      NULL),
  ('General Wellness',           'general-wellness',           NULL);

INSERT INTO doctor_profile (doctor_name, qualifications, about)
SELECT 'Vaidya Jayeshkumar',
       'PLACEHOLDER - verified qualifications to be provided by the doctor.',
       'PLACEHOLDER - doctor introduction to be provided and approved by the doctor.'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM doctor_profile);
