-- Demo-Rezepte (optional, nach dem ersten Start ausführen)
-- Diese müssen nach dem ersten Login manuell angelegt oder dieses Skript ausgeführt werden

-- Beispiel: Demo-Benutzer-ID abrufen und Rezept erstellen
-- DO $$
-- DECLARE
--     demo_user_id UUID;
-- BEGIN
--     SELECT id INTO demo_user_id FROM users WHERE username = 'demo';

--     INSERT INTO recipes (id, user_id, title, description, servings, prep_time, cook_time, total_time, difficulty, category_id, visibility)
--     VALUES (
--         'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
--         demo_user_id,
--         'Spaghetti Carbonara',
--         'Klassische italienische Pasta mit Ei, Speck und Parmesan',
--         4,
--         10,
--         15,
--         25,
--         'easy',
--         (SELECT id FROM categories WHERE slug = 'hauptgerichte'),
--         'public'
--     );

--     INSERT INTO recipe_ingredients (recipe_id, position, amount, unit, ingredient_name) VALUES
--         ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 0, 400, 'g', 'Spaghetti'),
--         ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 1, 150, 'g', 'Pancetta oder Guanciale'),
--         ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 2, 4, 'Stück', 'Eigelb'),
--         ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 3, 100, 'g', 'Parmesan (gerieben)'),
--         ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 4, 1, 'Prise', 'Schwarzer Pfeffer'),
--         ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 5, 1, 'Prise', 'Salz');

--     INSERT INTO recipe_instructions (recipe_id, step_number, instruction) VALUES
--         ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 1, 'Einen großen Topf mit Salzwasser zum Kochen bringen.'),
--         ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 2, 'Pancetta in kleine Würfel schneiden und in einer Pfanne knusprig braten.'),
--         ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 3, 'Eigelb, Parmesan und Pfeffer in einer Schüssel verquirlen.'),
--         ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 4, 'Spaghetti nach Packungsanweisung al dente kochen.'),
--         ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 5, 'Pasta abgießen, dabei etwas Kochwasser aufbewahren.'),
--         ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 6, 'Heiße Pasta zur Pancetta geben, Pfanne vom Herd nehmen.'),
--         ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 7, 'Ei-Parmesan-Mischung unterrühren, mit Pastawasser cremig rühren.'),
--         ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 8, 'Sofort servieren mit extra Parmesan und Pfeffer.');
-- END $$;

-- Hinweis: Für produktive Demo-Rezepte nach dem ersten Start ausführen
