-- ============================================================
-- MIGRATION: Cập nhật hệ thống quản lý cây — Sun Group Landscape
-- Chạy toàn bộ file này trong Supabase SQL Editor
-- ============================================================

-- 0) GỠ CHECK CONSTRAINT GIỚI HẠN LEVEL (nếu có) ĐỂ CHO PHÉP LEVEL 3
-- ------------------------------------------------------------
do $$
declare
  con record;
begin
  for con in
    select conname from pg_constraint
    where conrelid = 'plant_groups'::regclass
      and pg_get_constraintdef(oid) ilike '%level%'
      and contype = 'c'
  loop
    execute format('alter table plant_groups drop constraint %I', con.conname);
  end loop;
end $$;


-- 1) SỬA TÊN TIẾNG VIỆT KHÔNG DẤU -> CÓ DẤU
-- ------------------------------------------------------------

-- Bảng climates (Khí hậu phù hợp)
update climates set name = 'Ôn đới' where code = 'KH_ON_DOI';
update climates set name = 'Nhiệt đới' where code = 'KH_NHIET_DOI';
update climates set name = 'Á nhiệt đới' where code = 'KH_A_NHIET';
update climates set name = 'Cả ôn đới và nhiệt đới' where code = 'OD_ND';
update climates set name = 'Chịu hạn tốt' where code = 'KH_KHO_HAN';
update climates set name = 'Ưa ẩm - mưa nhiều' where code = 'KH_AM_UOT';

-- Bảng special_functions (Công năng đặc thù)
update special_functions set name = 'Trồng đường viền' where code = 'CN_VIEN';
update special_functions set name = 'Tạo bóng mát' where code = 'CN_BONG_MAT';
update special_functions set name = 'Cảnh quan thẩm mỹ' where code = 'CN_CANH_QUAN';
update special_functions set name = 'Chắn gió - Chắn bụi' where code = 'CN_CHONG_GIO';
update special_functions set name = 'Phòng hộ - Bảo vệ đất' where code = 'CN_PHONG_HO';
update special_functions set name = 'Đặc trưng điểm nhấn cảnh quan' where code = 'CN_DANG_CAY';
update special_functions set name = 'Tỏa hương thơm' where code = 'CN_THOM';
update special_functions set name = 'Cây ăn quả / gia vị' where code = 'CN_AN_QUAT';
update special_functions set name = 'Lọc không khí' where code = 'CN_LOC_KK';


-- 2) THÊM CỘT MỚI VÀO BẢNG plants
-- ------------------------------------------------------------
alter table plants add column if not exists trunk_diameter_cm numeric;
alter table plants add column if not exists canopy_diameter_max_m numeric;
alter table plants add column if not exists is_imported boolean default false;


-- 3) CẬP NHẬT PHÂN LOẠI CẤP 1, CẤP 2 THEO SƠ ĐỒ SUN GROUP MỚI
-- ------------------------------------------------------------
-- LƯU Ý: Đoạn này sẽ thêm các nhóm CẤP 1 mới (#1-#7) theo sơ đồ.
-- Các nhóm cấp 1 cũ vẫn giữ lại (không xóa) để không mất liên kết
-- với các cây đã gán nhóm trước đó. Bạn có thể xóa nhóm cũ thừa
-- sau khi đã chuyển hết cây sang nhóm mới (làm tại trang Admin).

-- Cấp 1 — theo đúng số thứ tự sơ đồ
insert into plant_groups (name, level, parent_id, sort_order) values
  ('#1 Cây cảnh quan lớn', 1, null, 1),
  ('#2 Cây bụi', 1, null, 2),
  ('#3 Cây tạo khối, dáng, thế', 1, null, 3),
  ('#4 Cây đường viền, thảm', 1, null, 4),
  ('#5 Hoa chậu', 1, null, 5),
  ('#6 Cây cảnh lá', 1, null, 6),
  ('#7 Khác', 1, null, 7)
on conflict do nothing;

-- Cấp 2 cho từng nhóm cấp 1 mới (dùng subquery lấy parent_id theo tên)
-- #1 Cây cảnh quan lớn
insert into plant_groups (name, level, parent_id, sort_order)
select v.name, 2, g.id, v.sort_order from (values
  ('Thường xanh', 1), ('Lá đổi màu', 2), ('Có hoa', 3), ('Ăn trái', 4), ('Họ cau dừa', 5)
) as v(name, sort_order)
cross join (select id from plant_groups where name = '#1 Cây cảnh quan lớn' and level = 1) g
on conflict do nothing;

-- #2 Cây bụi
insert into plant_groups (name, level, parent_id, sort_order)
select v.name, 2, g.id, v.sort_order from (values
  ('Thường xanh', 1), ('Có hoa', 2), ('Ăn trái', 3), ('Lá đổi màu', 4)
) as v(name, sort_order)
cross join (select id from plant_groups where name = '#2 Cây bụi' and level = 1) g
on conflict do nothing;

-- #3 Cây tạo khối, dáng, thế
insert into plant_groups (name, level, parent_id, sort_order)
select v.name, 2, g.id, v.sort_order from (values
  ('Tạo hình, khối', 1), ('Tạo dáng, thế', 2)
) as v(name, sort_order)
cross join (select id from plant_groups where name = '#3 Cây tạo khối, dáng, thế' and level = 1) g
on conflict do nothing;

-- #4 Cây đường viền, thảm
insert into plant_groups (name, level, parent_id, sort_order)
select v.name, 2, g.id, v.sort_order from (values
  ('Đường viền', 1), ('Thảm', 2)
) as v(name, sort_order)
cross join (select id from plant_groups where name = '#4 Cây đường viền, thảm' and level = 1) g
on conflict do nothing;

-- #5 Hoa chậu
insert into plant_groups (name, level, parent_id, sort_order)
select v.name, 2, g.id, v.sort_order from (values
  ('Hoa nhiệt đới', 1), ('Hoa ôn đới', 2), ('Hoa cận nhiệt đới', 3)
) as v(name, sort_order)
cross join (select id from plant_groups where name = '#5 Hoa chậu' and level = 1) g
on conflict do nothing;

-- #6 Cây cảnh lá
insert into plant_groups (name, level, parent_id, sort_order)
select v.name, 2, g.id, v.sort_order from (values
  ('Nội thất', 1), ('Ngoại thất', 2), ('Cây lá màu', 3)
) as v(name, sort_order)
cross join (select id from plant_groups where name = '#6 Cây cảnh lá' and level = 1) g
on conflict do nothing;

-- #7 Khác
insert into plant_groups (name, level, parent_id, sort_order)
select v.name, 2, g.id, v.sort_order from (values
  ('Thủy sinh', 1), ('Dây leo, rủ, bám tường', 2), ('Cây không khí', 3),
  ('Gia vị / Dược liệu', 4), ('Xương rồng, sen đá', 5), ('Lan các loại', 6), ('Thân / Rễ / Củ', 7)
) as v(name, sort_order)
cross join (select id from plant_groups where name = '#7 Khác' and level = 1) g
on conflict do nothing;


-- 4) THÊM PHÂN NHÓM CẤP 3: TẦM CAO / TẦM TRUNG / TẦM THẤP
-- ------------------------------------------------------------
-- Tạo 1 nhóm cấp 3 độc lập (không phụ thuộc cấp 1/2), dùng chung
-- cho mọi cây. parent_id để null vì đây là 1 trục phân loại riêng
-- (lưu vào group_lv3_id của bảng plants).
insert into plant_groups (name, level, parent_id, sort_order) values
  ('Tầm cao', 3, null, 1),
  ('Tầm trung', 3, null, 2),
  ('Tầm thấp', 3, null, 3)
on conflict do nothing;

-- ============================================================
-- 5) MỞ QUYỀN UPLOAD ẢNH THỦ CÔNG CHO BUCKET "plant-images"
-- ------------------------------------------------------------
-- Bucket plant-images đã có sẵn (Public) nhưng cần policy cho
-- phép web (anon key) Insert/Update/Delete ảnh. Lệnh dưới tự
-- xóa policy trùng tên trước khi tạo lại, an toàn khi chạy nhiều lần.

drop policy if exists "Cho phép upload anh plant-images" on storage.objects;
create policy "Cho phép upload anh plant-images"
on storage.objects for insert
to public
with check (bucket_id = 'plant-images');

drop policy if exists "Cho phép cap nhat anh plant-images" on storage.objects;
create policy "Cho phép cap nhat anh plant-images"
on storage.objects for update
to public
using (bucket_id = 'plant-images');

drop policy if exists "Cho phép xoa anh plant-images" on storage.objects;
create policy "Cho phép xoa anh plant-images"
on storage.objects for delete
to public
using (bucket_id = 'plant-images');

-- ============================================================
-- XONG. Sau khi chạy, vào Table Editor kiểm tra lại các bảng:
-- plant_groups, climates, special_functions, plants
--
-- BƯỚC TIẾP THEO (làm thủ công, không chạy SQL):
-- KHÔNG cần tạo bucket mới — bucket "plant-images" đã có sẵn
-- và đã được mở quyền upload bởi đoạn SQL phía trên.
-- ============================================================
