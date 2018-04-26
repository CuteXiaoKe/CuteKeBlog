INSERT INTO user (id, username, password, name, email) VALUES (1, 'CuteKe', '2fbaaad94cfc4b26bf8efaec607ee7a9', 'CuteKe', '839713259@qq.com');

INSERT INTO authority (id, name) VALUES (1, 'ROLE_ADMIN');
INSERT INTO authority (id, name) VALUES (2, 'ROLE_USER');
INSERT INTO authority (id, name) VALUES (3, 'ROLE_VISTOR');

INSERT INTO user_authority (user_id, authority_id) VALUES (1, 1);