-- Seed: the original Tsa Ma Grootman catalogue (images served from /public/img)

insert into public.products (id, name, collection, price, badge, short, description, featured, sort_order) values ('grootman-classic', 'The Grootman Classic', 'logo', 595, 'Essential', 'Clean chest-logo tee. The one you reach for every day.', 'Our signature crest, printed small on the left chest, with the woven neck label inside. Understated on purpose — a grootman doesn''t need to shout. Heavyweight 300 GSM cotton that keeps its shape wash after wash.', true, 0);
insert into public.product_colors (id, product_id, name, hex, position) values ('f09e266e-e682-461b-99da-a10522fb539b', 'grootman-classic', 'White', '#f4f4f2', 0);
insert into public.product_images (product_id, color_id, url, alt, position) values ('grootman-classic', 'f09e266e-e682-461b-99da-a10522fb539b', '/img/classic-white.jpg', 'The Grootman Classic in White', 0);
insert into public.product_images (product_id, color_id, url, alt, position) values ('grootman-classic', 'f09e266e-e682-461b-99da-a10522fb539b', '/img/classic-white-lifestyle.jpg', 'The Grootman Classic in White', 1);
insert into public.product_colors (id, product_id, name, hex, position) values ('0c31aee4-c7fc-429b-ab9c-5ba4e391ab8b', 'grootman-classic', 'Black', '#111111', 1);
insert into public.product_images (product_id, color_id, url, alt, position) values ('grootman-classic', '0c31aee4-c7fc-429b-ab9c-5ba4e391ab8b', '/img/classic-black.jpg', 'The Grootman Classic in Black', 2);
insert into public.product_images (product_id, color_id, url, alt, position) values ('grootman-classic', '0c31aee4-c7fc-429b-ab9c-5ba4e391ab8b', '/img/featured-folded.jpg', 'The Grootman Classic in Black', 3);
insert into public.product_images (product_id, color_id, url, alt, position) values ('grootman-classic', null, '/img/lookbook-detail.jpg', 'Tsa Ma Grootman label and print detail', 4);
insert into public.product_images (product_id, color_id, url, alt, position) values ('grootman-classic', null, '/img/lookbook-stack.jpg', 'Tsa Ma Grootman label and print detail', 5);

insert into public.products (id, name, collection, price, badge, short, description, featured, sort_order) values ('the-statement', 'The Statement', 'logo', 695, 'Bestseller', 'Full-front crest. Your move, your statement.', 'The full Tsa Ma Grootman crest, front and centre. Bold, graphic and made to be seen at the braai, the gig or the Sunday session. Heavyweight 300 GSM cotton with a relaxed, structured fit.', true, 1);
insert into public.product_colors (id, product_id, name, hex, position) values ('7d35656c-8f09-4834-b895-27463026331a', 'the-statement', 'Black', '#111111', 0);
insert into public.product_images (product_id, color_id, url, alt, position) values ('the-statement', '7d35656c-8f09-4834-b895-27463026331a', '/img/statement-black.jpg', 'The Statement in Black', 0);
insert into public.product_colors (id, product_id, name, hex, position) values ('72745ae7-e662-4780-8c5e-d24adc17bfe8', 'the-statement', 'White', '#f4f4f2', 1);
insert into public.product_images (product_id, color_id, url, alt, position) values ('the-statement', '72745ae7-e662-4780-8c5e-d24adc17bfe8', '/img/statement-white.jpg', 'The Statement in White', 1);
insert into public.product_images (product_id, color_id, url, alt, position) values ('the-statement', null, '/img/lookbook-detail.jpg', 'Tsa Ma Grootman label and print detail', 2);
insert into public.product_images (product_id, color_id, url, alt, position) values ('the-statement', null, '/img/lookbook-stack.jpg', 'Tsa Ma Grootman label and print detail', 3);

insert into public.products (id, name, collection, price, badge, short, description, featured, sort_order) values ('the-selector', 'The Selector', 'music', 795, 'Music', 'Life-size turntable print for the man behind the decks.', 'A tribute to the selectors who soundtracked our lives — Deep House Sundays, Kwaito on the radio, Old School R&B at the after-party. Full-front turntable print with the crest on the chest.', true, 2);
insert into public.product_colors (id, product_id, name, hex, position) values ('9534deb5-52b8-4712-ab66-b72b553d357f', 'the-selector', 'White', '#f4f4f2', 0);
insert into public.product_images (product_id, color_id, url, alt, position) values ('the-selector', '9534deb5-52b8-4712-ab66-b72b553d357f', '/img/selector-white.jpg', 'The Selector in White', 0);
insert into public.product_images (product_id, color_id, url, alt, position) values ('the-selector', '9534deb5-52b8-4712-ab66-b72b553d357f', '/img/lookbook-vinyl.jpg', 'The Selector in White', 1);
insert into public.product_colors (id, product_id, name, hex, position) values ('a2887d74-9fe4-4670-a5a5-94e4841e058b', 'the-selector', 'Black', '#111111', 1);
insert into public.product_images (product_id, color_id, url, alt, position) values ('the-selector', 'a2887d74-9fe4-4670-a5a5-94e4841e058b', '/img/selector-black.jpg', 'The Selector in Black', 2);
insert into public.product_images (product_id, color_id, url, alt, position) values ('the-selector', 'a2887d74-9fe4-4670-a5a5-94e4841e058b', '/img/selector-black-folded.jpg', 'The Selector in Black', 3);
insert into public.product_colors (id, product_id, name, hex, position) values ('e76beb6d-ad93-4b8e-9875-b4ccb49d2b69', 'the-selector', 'Charcoal', '#4a4a4a', 2);
insert into public.product_images (product_id, color_id, url, alt, position) values ('the-selector', 'e76beb6d-ad93-4b8e-9875-b4ccb49d2b69', '/img/selector-charcoal.jpg', 'The Selector in Charcoal', 4);
insert into public.product_colors (id, product_id, name, hex, position) values ('d1f2b829-a33c-4f51-8d2e-6484fcab2197', 'the-selector', 'Bone', '#e9e0cc', 3);
insert into public.product_images (product_id, color_id, url, alt, position) values ('the-selector', 'd1f2b829-a33c-4f51-8d2e-6484fcab2197', '/img/selector-bone.jpg', 'The Selector in Bone', 5);
insert into public.product_images (product_id, color_id, url, alt, position) values ('the-selector', null, '/img/lookbook-detail.jpg', 'Tsa Ma Grootman label and print detail', 6);
insert into public.product_images (product_id, color_id, url, alt, position) values ('the-selector', null, '/img/lookbook-stack.jpg', 'Tsa Ma Grootman label and print detail', 7);

insert into public.products (id, name, collection, price, badge, short, description, featured, sort_order) values ('side-a', 'Side A', 'music', 795, null, 'Turntable print with the crest on the record label.', 'The Selector''s smoother sibling. The Grootman crest spins on the centre label of the record — a detail for those who know. Printed on a warm bone-coloured heavyweight tee.', false, 3);
insert into public.product_colors (id, product_id, name, hex, position) values ('09188e8e-8872-4692-a61d-16bf0d96e6be', 'side-a', 'Bone', '#e9e0cc', 0);
insert into public.product_images (product_id, color_id, url, alt, position) values ('side-a', '09188e8e-8872-4692-a61d-16bf0d96e6be', '/img/sidea-bone.jpg', 'Side A in Bone', 0);
insert into public.product_images (product_id, color_id, url, alt, position) values ('side-a', null, '/img/lookbook-detail.jpg', 'Tsa Ma Grootman label and print detail', 1);
insert into public.product_images (product_id, color_id, url, alt, position) values ('side-a', null, '/img/lookbook-stack.jpg', 'Tsa Ma Grootman label and print detail', 2);

insert into public.products (id, name, collection, price, badge, short, description, featured, sort_order) values ('the-mixtape', 'The Mixtape', 'music', 750, 'New', 'Green-label cassette. Rewind it with a pencil.', 'Before playlists, there were mixtapes. A full-colour cassette print with the Tsa Ma Grootman label — and yes, that''s a pencil in the spool. Heavyweight 300 GSM black cotton.', false, 4);
insert into public.product_colors (id, product_id, name, hex, position) values ('cd17d1ca-9f55-408c-8e6f-e924a6b92bd1', 'the-mixtape', 'Black', '#111111', 0);
insert into public.product_images (product_id, color_id, url, alt, position) values ('the-mixtape', 'cd17d1ca-9f55-408c-8e6f-e924a6b92bd1', '/img/mixtape-black.jpg', 'The Mixtape in Black', 0);
insert into public.product_images (product_id, color_id, url, alt, position) values ('the-mixtape', 'cd17d1ca-9f55-408c-8e6f-e924a6b92bd1', '/img/mixtape-black-wall.jpg', 'The Mixtape in Black', 1);
insert into public.product_images (product_id, color_id, url, alt, position) values ('the-mixtape', null, '/img/lookbook-detail.jpg', 'Tsa Ma Grootman label and print detail', 2);
insert into public.product_images (product_id, color_id, url, alt, position) values ('the-mixtape', null, '/img/lookbook-stack.jpg', 'Tsa Ma Grootman label and print detail', 3);

insert into public.products (id, name, collection, price, badge, short, description, featured, sort_order) values ('retro-tape', 'Retro Tape', 'music', 750, null, 'Cream-label cassette with a vintage finish.', 'Our cassette graphic in a muted cream-and-black colourway with a worn, vintage feel. For the man who still has a shoebox of tapes somewhere at home.', false, 5);
insert into public.product_colors (id, product_id, name, hex, position) values ('bc6540f6-f118-48ec-b062-ce78e43abcd8', 'retro-tape', 'Black', '#111111', 0);
insert into public.product_images (product_id, color_id, url, alt, position) values ('retro-tape', 'bc6540f6-f118-48ec-b062-ce78e43abcd8', '/img/retro-tape-black.jpg', 'Retro Tape in Black', 0);
insert into public.product_images (product_id, color_id, url, alt, position) values ('retro-tape', null, '/img/lookbook-detail.jpg', 'Tsa Ma Grootman label and print detail', 1);
insert into public.product_images (product_id, color_id, url, alt, position) values ('retro-tape', null, '/img/lookbook-stack.jpg', 'Tsa Ma Grootman label and print detail', 2);

insert into public.products (id, name, collection, price, badge, short, description, featured, sort_order) values ('crate-digger', 'The Crate Digger', 'music', 895, 'Premium', 'Vinyl slipping out of its sleeve. Pure crate-digging energy.', 'A record sliding out of its sleeve, with the Grootman face on the label. Our most detailed print, finished in warm cream and gold tones. Heavyweight 300 GSM cotton.', true, 6);
insert into public.product_colors (id, product_id, name, hex, position) values ('691c7902-ac42-4969-877b-46fc49f09785', 'crate-digger', 'Black', '#111111', 0);
insert into public.product_images (product_id, color_id, url, alt, position) values ('crate-digger', '691c7902-ac42-4969-877b-46fc49f09785', '/img/crate-black.jpg', 'The Crate Digger in Black', 0);
insert into public.product_colors (id, product_id, name, hex, position) values ('bfa902ec-6f26-45ec-82e2-74f297c1ebc6', 'crate-digger', 'White', '#f4f4f2', 1);
insert into public.product_images (product_id, color_id, url, alt, position) values ('crate-digger', 'bfa902ec-6f26-45ec-82e2-74f297c1ebc6', '/img/crate-white.jpg', 'The Crate Digger in White', 1);
insert into public.product_colors (id, product_id, name, hex, position) values ('b4eef209-9289-40db-a4f8-0765bde85167', 'crate-digger', 'Sand', '#d9c4a3', 2);
insert into public.product_images (product_id, color_id, url, alt, position) values ('crate-digger', 'b4eef209-9289-40db-a4f8-0765bde85167', '/img/crate-sand.jpg', 'The Crate Digger in Sand', 2);
insert into public.product_images (product_id, color_id, url, alt, position) values ('crate-digger', null, '/img/lookbook-detail.jpg', 'Tsa Ma Grootman label and print detail', 3);
insert into public.product_images (product_id, color_id, url, alt, position) values ('crate-digger', null, '/img/lookbook-stack.jpg', 'Tsa Ma Grootman label and print detail', 4);
