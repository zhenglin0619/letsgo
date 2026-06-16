-- ══════════════════════════════════════════════════════════════════════════════
-- Step 1: (Re)create item_collaborators with item_id as text
--         to match the text id columns in trips/restaurants/hotels
-- ══════════════════════════════════════════════════════════════════════════════

DROP TABLE IF EXISTS item_collaborators CASCADE;

CREATE TABLE item_collaborators (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id          text NOT NULL,
  item_type        text NOT NULL CHECK (item_type IN ('trip', 'restaurant', 'hotel')),
  item_name        text,
  inviter_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  collaborator_id  uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status           text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted')),
  created_at       timestamptz DEFAULT now(),
  UNIQUE(item_id, item_type, collaborator_id)
);

ALTER TABLE item_collaborators ENABLE ROW LEVEL SECURITY;

CREATE POLICY "item_collabs_select" ON item_collaborators
  FOR SELECT USING (inviter_id = auth.uid() OR collaborator_id = auth.uid());

CREATE POLICY "item_collabs_insert" ON item_collaborators
  FOR INSERT WITH CHECK (inviter_id = auth.uid());

CREATE POLICY "item_collabs_update" ON item_collaborators
  FOR UPDATE USING (inviter_id = auth.uid() OR collaborator_id = auth.uid());

CREATE POLICY "item_collabs_delete" ON item_collaborators
  FOR DELETE USING (inviter_id = auth.uid() OR collaborator_id = auth.uid());


-- ══════════════════════════════════════════════════════════════════════════════
-- Step 2: Drop the old table (CASCADE removes all dependent RLS policies)
-- ══════════════════════════════════════════════════════════════════════════════

DROP TABLE IF EXISTS collaborators CASCADE;


-- ══════════════════════════════════════════════════════════════════════════════
-- Step 3: Recreate RLS policies using item_collaborators
-- ══════════════════════════════════════════════════════════════════════════════

-- ── trips ─────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "trips_select" ON trips;
DROP POLICY IF EXISTS "trips_update" ON trips;
DROP POLICY IF EXISTS "trips_delete" ON trips;

CREATE POLICY "trips_select" ON trips
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM item_collaborators ic
      WHERE ic.item_id = trips.id AND ic.item_type = 'trip'
        AND ic.collaborator_id = auth.uid() AND ic.status = 'accepted'
    )
  );

CREATE POLICY "trips_update" ON trips
  FOR UPDATE USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM item_collaborators ic
      WHERE ic.item_id = trips.id AND ic.item_type = 'trip'
        AND ic.collaborator_id = auth.uid() AND ic.status = 'accepted'
    )
  );

CREATE POLICY "trips_delete" ON trips
  FOR DELETE USING (user_id = auth.uid());


-- ── restaurants ───────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "restaurants_select" ON restaurants;
DROP POLICY IF EXISTS "restaurants_update" ON restaurants;
DROP POLICY IF EXISTS "restaurants_delete" ON restaurants;

CREATE POLICY "restaurants_select" ON restaurants
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM item_collaborators ic
      WHERE ic.item_id = restaurants.id AND ic.item_type = 'restaurant'
        AND ic.collaborator_id = auth.uid() AND ic.status = 'accepted'
    ) OR
    (restaurants.trip_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM item_collaborators ic
      WHERE ic.item_id = restaurants.trip_id AND ic.item_type = 'trip'
        AND ic.collaborator_id = auth.uid() AND ic.status = 'accepted'
    ))
  );

CREATE POLICY "restaurants_update" ON restaurants
  FOR UPDATE USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM item_collaborators ic
      WHERE ic.item_id = restaurants.id AND ic.item_type = 'restaurant'
        AND ic.collaborator_id = auth.uid() AND ic.status = 'accepted'
    ) OR
    (restaurants.trip_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM item_collaborators ic
      WHERE ic.item_id = restaurants.trip_id AND ic.item_type = 'trip'
        AND ic.collaborator_id = auth.uid() AND ic.status = 'accepted'
    ))
  );

CREATE POLICY "restaurants_delete" ON restaurants
  FOR DELETE USING (
    user_id = auth.uid() OR
    (restaurants.trip_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM item_collaborators ic
      WHERE ic.item_id = restaurants.trip_id AND ic.item_type = 'trip'
        AND ic.collaborator_id = auth.uid() AND ic.status = 'accepted'
    ))
  );


-- ── hotels ────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "hotels_select" ON hotels;
DROP POLICY IF EXISTS "hotels_update" ON hotels;
DROP POLICY IF EXISTS "hotels_delete" ON hotels;

CREATE POLICY "hotels_select" ON hotels
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM item_collaborators ic
      WHERE ic.item_id = hotels.id AND ic.item_type = 'hotel'
        AND ic.collaborator_id = auth.uid() AND ic.status = 'accepted'
    ) OR
    (hotels.trip_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM item_collaborators ic
      WHERE ic.item_id = hotels.trip_id AND ic.item_type = 'trip'
        AND ic.collaborator_id = auth.uid() AND ic.status = 'accepted'
    ))
  );

CREATE POLICY "hotels_update" ON hotels
  FOR UPDATE USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM item_collaborators ic
      WHERE ic.item_id = hotels.id AND ic.item_type = 'hotel'
        AND ic.collaborator_id = auth.uid() AND ic.status = 'accepted'
    ) OR
    (hotels.trip_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM item_collaborators ic
      WHERE ic.item_id = hotels.trip_id AND ic.item_type = 'trip'
        AND ic.collaborator_id = auth.uid() AND ic.status = 'accepted'
    ))
  );

CREATE POLICY "hotels_delete" ON hotels
  FOR DELETE USING (
    user_id = auth.uid() OR
    (hotels.trip_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM item_collaborators ic
      WHERE ic.item_id = hotels.trip_id AND ic.item_type = 'trip'
        AND ic.collaborator_id = auth.uid() AND ic.status = 'accepted'
    ))
  );


-- ── storage.objects (photos) ──────────────────────────────────────────────────

DROP POLICY IF EXISTS "photos_delete" ON storage.objects;

CREATE POLICY "photos_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'photos' AND (
      owner = auth.uid() OR
      EXISTS (
        SELECT 1 FROM item_collaborators ic
        WHERE ic.collaborator_id = auth.uid() AND ic.status = 'accepted'
      )
    )
  );


-- ── future_plans ──────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "future_plans_select" ON future_plans;
DROP POLICY IF EXISTS "future_plans_insert" ON future_plans;
DROP POLICY IF EXISTS "future_plans_update" ON future_plans;
DROP POLICY IF EXISTS "future_plans_delete" ON future_plans;

CREATE POLICY "future_plans_select" ON future_plans
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "future_plans_insert" ON future_plans
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "future_plans_update" ON future_plans
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "future_plans_delete" ON future_plans
  FOR DELETE USING (user_id = auth.uid());
