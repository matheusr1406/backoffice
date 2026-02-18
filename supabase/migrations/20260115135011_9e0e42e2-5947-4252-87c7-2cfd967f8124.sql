-- Delete all coupon data in order (respecting foreign key constraints)
DELETE FROM location_coupons;
DELETE FROM coupon_import_items;
DELETE FROM coupon_import_batches;