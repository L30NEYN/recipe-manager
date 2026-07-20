-- Recipe Management Database Schema

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categories Table
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tags Table
CREATE TABLE tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Conversion Table for Cups to Grams
CREATE TABLE unit_conversions (
    id SERIAL PRIMARY KEY,
    ingredient_name VARCHAR(100) NOT NULL,
    cups_to_grams DECIMAL(10, 2) NOT NULL,
    is_approximate BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Recipes Table
CREATE TABLE recipes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    servings INTEGER DEFAULT 4,
    prep_time INTEGER,
    cook_time INTEGER,
    total_time INTEGER,
    difficulty VARCHAR(20) CHECK (difficulty IN ('easy', 'medium', 'hard')),
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    is_favorite BOOLEAN DEFAULT false,
    is_archived BOOLEAN DEFAULT false,
    visibility VARCHAR(20) DEFAULT 'private' CHECK (visibility IN ('private', 'internal', 'public')),
    public_token VARCHAR(64) UNIQUE,
    source_url TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Recipe Tags (Many-to-Many)
CREATE TABLE recipe_tags (
    recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
    tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (recipe_id, tag_id)
);

-- Recipe Ingredients
CREATE TABLE recipe_ingredients (
    id SERIAL PRIMARY KEY,
    recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    position INTEGER NOT NULL,
    amount DECIMAL(10, 3),
    unit VARCHAR(50),
    ingredient_name VARCHAR(255) NOT NULL,
    preparation VARCHAR(255),
    group_name VARCHAR(100),
    original_text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Recipe Instructions
CREATE TABLE recipe_instructions (
    id SERIAL PRIMARY KEY,
    recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    step_number INTEGER NOT NULL,
    instruction TEXT NOT NULL,
    group_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Recipe Images
CREATE TABLE recipe_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    filepath VARCHAR(500) NOT NULL,
    mimetype VARCHAR(100),
    size INTEGER,
    is_primary BOOLEAN DEFAULT false,
    position INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Recipe Shares (for internal sharing with specific users)
CREATE TABLE recipe_shares (
    id SERIAL PRIMARY KEY,
    recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    shared_with_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    can_edit BOOLEAN DEFAULT false,
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(recipe_id, shared_with_user_id)
);

-- Indexes for Performance
CREATE INDEX idx_recipes_user_id ON recipes(user_id);
CREATE INDEX idx_recipes_category_id ON recipes(category_id);
CREATE INDEX idx_recipes_visibility ON recipes(visibility);
CREATE INDEX idx_recipes_public_token ON recipes(public_token);
CREATE INDEX idx_recipes_is_favorite ON recipes(is_favorite);
CREATE INDEX idx_recipes_is_archived ON recipes(is_archived);
CREATE INDEX idx_recipe_ingredients_recipe_id ON recipe_ingredients(recipe_id);
CREATE INDEX idx_recipe_instructions_recipe_id ON recipe_instructions(recipe_id);
CREATE INDEX idx_recipe_images_recipe_id ON recipe_images(recipe_id);
CREATE INDEX idx_recipe_tags_recipe_id ON recipe_tags(recipe_id);
CREATE INDEX idx_recipe_tags_tag_id ON recipe_tags(tag_id);
CREATE INDEX idx_recipe_shares_recipe_id ON recipe_shares(recipe_id);
CREATE INDEX idx_recipe_shares_shared_with ON recipe_shares(shared_with_user_id);

-- Full-text search indexes
CREATE INDEX idx_recipes_title_trgm ON recipes USING gin(title gin_trgm_ops);
CREATE INDEX idx_recipes_description_trgm ON recipes USING gin(description gin_trgm_ops);
CREATE INDEX idx_recipe_ingredients_name_trgm ON recipe_ingredients USING gin(ingredient_name gin_trgm_ops);
CREATE INDEX idx_tags_name_trgm ON tags USING gin(name gin_trgm_ops);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recipes_updated_at BEFORE UPDATE ON recipes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default categories
INSERT INTO categories (name, slug) VALUES
    ('Frühstück', 'fruehstueck'),
    ('Vorspeisen', 'vorspeisen'),
    ('Hauptgerichte', 'hauptgerichte'),
    ('Beilagen', 'beilagen'),
    ('Desserts', 'desserts'),
    ('Backen', 'backen'),
    ('Getränke', 'getraenke'),
    ('Snacks', 'snacks'),
    ('Suppen', 'suppen'),
    ('Salate', 'salate');

-- Insert common unit conversions
INSERT INTO unit_conversions (ingredient_name, cups_to_grams, is_approximate, notes) VALUES
    ('Mehl (Weizenmehl)', 120, false, 'All-purpose flour'),
    ('Zucker (weiß)', 200, false, 'Granulated white sugar'),
    ('Brauner Zucker', 220, false, 'Packed brown sugar'),
    ('Puderzucker', 120, false, 'Powdered sugar'),
    ('Butter', 227, false, 'Butter'),
    ('Wasser', 240, false, 'Water'),
    ('Milch', 240, false, 'Milk'),
    ('Reis (ungekocht)', 185, false, 'Uncooked rice'),
    ('Haferflocken', 90, false, 'Rolled oats'),
    ('Kakao', 85, false, 'Cocoa powder'),
    ('Honig', 340, false, 'Honey'),
    ('Öl', 220, false, 'Vegetable oil'),
    ('Sahne', 240, false, 'Heavy cream'),
    ('Joghurt', 245, false, 'Yogurt'),
    ('Mandeln (gemahlen)', 95, true, 'Ground almonds'),
    ('Nüsse (gehackt)', 115, true, 'Chopped nuts'),
    ('Parmesan (gerieben)', 90, true, 'Grated parmesan'),
    ('Schokoladenchips', 170, false, 'Chocolate chips');
