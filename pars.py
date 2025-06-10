import pandas as pd
from sqlalchemy import create_engine, text

# Подключение к PostgreSQL
engine = create_engine("postgresql+psycopg2://postgres:430251@localhost:5432/postgres")

# Загружаем Excel с несколькими листами
xls = pd.ExcelFile(r"C:\Users\evgen\Documents\ДИПЛОМ\Достижения студентов.xlsx")

# Словарь: имя_листа → имя_таблицы
sheet_to_table = {
    "Научные достижения": "scienes",
    "Спортивные достижения": "sport",
    "Творческие достижения": "creation",
    "Различный уровень": "various_level",
    "Публикации": "publications",
    "Студенческое самоуправление": "student_government",
    "Иные достижения": "other_achiev",
    "Освоение доп. программ": "add_programm",
    "Опыт работы": "experience"
}

# Словарь: имя_листа → сопоставление колонок Excel → БД
column_mappings = {
    "Научные достижения":{
        "ФИО": "fullname",
        "Группа": "group_s",
        "Факультет": "faculty",
        "Название НИР": "srw_name",
        "Заказчик": "customer",
        "Уровень программы": "l_programm",
        "Название проекта": "p_name",
        "Дата начала": "s_date",
        "Дата окончания": "f_date",
        "Результат": "result"
    },
    "Спортивные достижения": {
        "ФИО": "fullname",
        "Группа": "group_s",
        "Факультет": "faculty",
        "Вид спорта": "sport_t",
        "Участие в соревнованиях": "compet",
        "Дата соревнований": "date_c",
        "Примечание": "note"
    },
    "Творческие достижения": {
        "ФИО": "fullname",
        "Группа": "group_s",
        "Факультет": "faculty",
        "Вид деятельности": "activity_t",
        "Участие в конкурсах/фестивалях": "part_fest",
        "Дата": "date_f",
        "Примечание": "note"
    },
    "Различный уровень":{
        "ФИО": "fullname",
        "Группа": "group_s",
        "Факультет": "faculty",
        "Вид мероприятия": "event_t",
        "Уровень мероприятия": "level_e",
        "Название мероприятия": "name_e",
        "Место проведения": "venue",
        "Дата": "date_e",
        "Результат": "result"
    },
    "Публикации":{
        "ФИО": "fullname",
        "Группа": "group_s",
        "Факультет": "faculty",
        "Соавтор(ы)": "coauthors",
        "Полное название работы": "fname_work",
        "Выходные данные": "output_d",
        "Форма работы": "form_w",
        "Тип издания": "public_t",
        "Статья входит в перечень ВАК, РИНЦ и т.д.": "article_inc"
    },
    "Студенческое самоуправление":{
        "ФИО": "fullname",
        "Группа": "group_s",
        "Факультет": "faculty",
        "Орган студенческого самоуправления": "body_g",
        "Вид деятельности": "activity_t",
        "Период деятельности": "activity_per",
        "Примечание": "note"
    },
    "Иные достижения": {
        "ФИО": "fullname",
        "Группа": "group_s",
        "Факультет": "faculty",
        "Вид деятельности": "activity_t",
        "Достижение": "achiev",
        "Дата": "date_o",
        "Примечание": "note"
    },
    "Освоение доп. программ": {
        "ФИО": "fullname",
        "Группа": "group_s",
        "Факультет": "faculty",
        "Название программы": "name_p",
        "Вид обучения": "education_t",
        "Кол-во часов": "hours",
        "Сроки обучения": "terms",
        "Место обучения": "education_p",
        "Название и реквизиты": "name_d"
    },
    "Опыт работы": {
        "ФИО": "fullname",
        "Группа": "group_s",
        "Факультет": "faculty",
        "Место работы": "place_w",
        "Вид работы": "work_t",
        "Должность": "title_j",
        "Сроки": "deadlines",
        "Обязанности": "respons"
    }
}

# Обработка каждого листа
for sheet in sheet_to_table.keys():
    print(f"\n📄 Обрабатывается лист: {sheet}")

    # Загружаем лист и переименовываем колонки
    df = xls.parse(sheet)
    mapping = column_mappings[sheet]
    df.rename(columns=mapping, inplace=True)
    df = df[list(mapping.values())]

    # Имя таблицы в БД
    table_name = sheet_to_table[sheet]

    # Загружаем текущие записи из таблицы
    with engine.begin() as connection:
        existing_df = pd.read_sql_table(table_name, con=connection)

        # Если таблица не пуста, убираем дубликаты
        if not existing_df.empty:
            # Объединяем с новыми данными
            df = pd.concat([existing_df, df])
            # Убираем полные дубликаты
            df.drop_duplicates(inplace=True)
            # Оставляем только новые строки
            df = df[~df.index.isin(existing_df.index)]

        # Если есть, что вставлять — загружаем
        if not df.empty:
            df.to_sql(table_name, con=connection, if_exists='append', index=False)
            print(f"✅ Добавлено новых строк: {len(df)}")
        else:
            print("ℹ️ Дубликаты найдены — ничего не добавлено.")
