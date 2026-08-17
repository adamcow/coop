/*
# Create coops and chickens tables

1. New Tables
- `coops`
  - `id` (uuid, primary key)
  - `name` (text, not null)
  - `notes` (text, nullable)
  - `user_id` (uuid, not null, defaults to the authenticated user)
  - `created_at` (timestamptz, defaults to now)
- `chickens`
  - `id` (uuid, primary key)
  - `coop_id` (uuid, nullable, references coops.id with ON DELETE SET NULL)
  - `name` (text, not null)
  - `breed` (text, nullable)
  - `sex` (text, nullable)
  - `status` (text, nullable)
  - `hatch_date` (date, nullable)
  - `features` (text, nullable)
  - `photo_url` (text, nullable)
  - `user_id` (uuid, not null, defaults to the authenticated user)
  - `created_at` (timestamptz, defaults to now)

2. Security
- Enable RLS on both tables.
- Owner-scoped CRUD: each authenticated user can only access rows they own.
- Both tables get 4 separate policies (select/insert/update/delete) scoped to `authenticated` via `auth.uid() = user_id`.
*/

CREATE TABLE IF NOT EXISTS coops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  notes text,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE coops ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_coops" ON coops;
CREATE POLICY "select_own_coops" ON coops FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_coops" ON coops;
CREATE POLICY "insert_own_coops" ON coops FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_coops" ON coops;
CREATE POLICY "update_own_coops" ON coops FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_coops" ON coops;
CREATE POLICY "delete_own_coops" ON coops FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS chickens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coop_id uuid REFERENCES coops(id) ON DELETE SET NULL,
  name text NOT NULL,
  breed text,
  sex text,
  status text,
  hatch_date date,
  features text,
  photo_url text,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE chickens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_chickens" ON chickens;
CREATE POLICY "select_own_chickens" ON chickens FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_chickens" ON chickens;
CREATE POLICY "insert_own_chickens" ON chickens FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_chickens" ON chickens;
CREATE POLICY "update_own_chickens" ON chickens FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_chickens" ON chickens;
CREATE POLICY "delete_own_chickens" ON chickens FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS chickens_coop_id_idx ON chickens(coop_id);
CREATE INDEX IF NOT EXISTS chickens_user_id_idx ON chickens(user_id);
CREATE INDEX IF NOT EXISTS coops_user_id_idx ON coops(user_id);
