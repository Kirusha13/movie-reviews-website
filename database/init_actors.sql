-- Скрипт для инициализации базовых актеров
USE movie_reviews_db;

-- Добавляем известных актеров
INSERT IGNORE INTO actors (name, biography, birth_date, photo_url) VALUES
('Том Хэнкс', 'Американский актер, продюсер и режиссер. Обладатель двух премий "Оскар" за лучшую мужскую роль.', '1956-07-09', 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Tom_Hanks_2016.jpg/800px-Tom_Hanks_2016.jpg'),
('Леонардо ДиКаприо', 'Американский актер, продюсер и активист. Обладатель премии "Оскар" за лучшую мужскую роль в фильме "Выживший".', '1974-11-11', 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Leonardo_Dicaprio_Cannes_2019.jpg/800px-Leonardo_Dicaprio_Cannes_2019.jpg'),
('Морган Фриман', 'Американский актер, режиссер и продюсер. Известен своими ролями в фильмах "Побег из Шоушенка" и "Семь".', '1937-06-01', 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Morgan_Freeman_%281%29.jpg/800px-Morgan_Freeman_%281%29.jpg'),
('Роберт Дауни мл.', 'Американский актер, продюсер и музыкант. Известен по роли Тони Старка в фильмах Marvel.', '1965-04-04', 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Robert_Downey_Jr_2014_Comic_Con_%28cropped%29.jpg/800px-Robert_Downey_Jr_2014_Comic_Con_%28cropped%29.jpg'),
('Джонни Депп', 'Американский актер, продюсер и музыкант. Известен по ролям в фильмах "Пираты Карибского моря" и "Эдвард Руки-ножницы".', '1963-06-09', 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/Johnny_Depp_2020.jpg/800px-Johnny_Depp_2020.jpg'),
('Брэд Питт', 'Американский актер и продюсер. Обладатель премии "Оскар" за лучшую мужскую роль второго плана.', '1963-12-18', 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Brad_Pitt_2019_by_Glenn_Francis_%28cropped%29.jpg/800px-Brad_Pitt_2019_by_Glenn_Francis_%28cropped%29.jpg'),
('Анжелина Джоли', 'Американская актриса, режиссер и гуманитарный деятель. Обладательница премии "Оскар" за лучшую женскую роль второго плана.', '1975-06-04', 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Angelina_Jolie_2_June_2014_%28cropped%29.jpg/800px-Angelina_Jolie_2_June_2014_%28cropped%29.jpg'),
('Джулия Робертс', 'Американская актриса и продюсер. Обладательница премии "Оскар" за лучшую женскую роль в фильме "Эрин Брокович".', '1967-10-28', 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Julia_Roberts_2011_Shankbone_2.JPG/800px-Julia_Roberts_2011_Shankbone_2.JPG'),
('Харрисон Форд', 'Американский актер. Известен по ролям Индианы Джонса и Хана Соло в сериях фильмов.', '1942-07-13', 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Harrison_Ford_by_Gage_Skidmore_3.jpg/800px-Harrison_Ford_by_Gage_Skidmore_3.jpg'),
('Райан Гослинг', 'Канадский актер и музыкант. Известен по ролям в фильмах "Драйв" и "Ла-Ла Ленд".', '1980-11-12', 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Ryan_Gosling_2_Cannes_2011_%28cropped%29.jpg/800px-Ryan_Gosling_2_Cannes_2011_%28cropped%29.jpg'),
('Эмма Стоун', 'Американская актриса. Обладательница премии "Оскар" за лучшую женскую роль в фильме "Ла-Ла Ленд".', '1988-11-06', 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Emma_Stone_2018.jpg/800px-Emma_Stone_2018.jpg'),
('Мэтт Деймон', 'Американский актер, продюсер и сценарист. Известен по ролям в фильмах "Умница Уилл Хантинг" и "Буржуа".', '1970-10-08', 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Matt_Damon_2016.jpg/800px-Matt_Damon_2016.jpg'),
('Сандра Буллок', 'Американская актриса и продюсер. Обладательница премии "Оскар" за лучшую женскую роль в фильме "Невидимая сторона".', '1964-07-26', 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Sandra_Bullock_%283%29.jpg/800px-Sandra_Bullock_%283%29.jpg'),
('Дензел Вашингтон', 'Американский актер, режиссер и продюсер. Обладатель двух премий "Оскар".', '1954-12-28', 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Denzel_Washington_2018.jpg/800px-Denzel_Washington_2018.jpg'),
('Николь Кидман', 'Австралийско-американская актриса и продюсер. Обладательница премии "Оскар" за лучшую женскую роль в фильме "Часы".', '1967-06-20', 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Nicole_Kidman_2019.jpg/800px-Nicole_Kidman_2019.jpg'),
('Рассел Кроу', 'Новозеландско-австралийский актер и продюсер. Обладатель премии "Оскар" за лучшую мужскую роль в фильме "Гладиатор".', '1964-04-07', 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Russell_Crowe_2017.jpg/800px-Russell_Crowe_2017.jpg'),
('Кейт Уинслет', 'Британская актриса. Обладательница премии "Оскар" за лучшую женскую роль в фильме "Чтец".', '1975-10-05', 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Emma_Watson_2013.jpg/800px-Emma_Watson_2013.jpg'),
('Хью Джекман', 'Австралийский актер, певец и продюсер. Известен по роли Росомахи в серии фильмов "Люди Икс".', '1968-10-12', 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/Hugh_Jackman_2012.jpg/800px-Hugh_Jackman_2012.jpg'),
('Шарлиз Терон', 'Южноафриканско-американская актриса и продюсер. Обладательница премии "Оскар" за лучшую женскую роль в фильме "Монстр".', '1975-08-07', 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Charlize_Theron_2019.jpg/800px-Charlize_Theron_2019.jpg'),
('Джордж Клуни', 'Американский актер, режиссер и продюсер. Обладатель премии "Оскар" за лучшую мужскую роль второго плана.', '1961-05-06', 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/George_Clooney_2016.jpg/800px-George_Clooney_2016.jpg');

-- Проверяем результат
SELECT * FROM actors ORDER BY name;
