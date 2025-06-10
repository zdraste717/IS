import pandas as pd
from sqlalchemy import create_engine, Table, MetaData
from sqlalchemy.dialects.postgresql import insert

# Подключение к базе данных
engine = create_engine("postgresql+psycopg2://postgres:430251@localhost:5432/postgres")

# === Загрузка Excel и объединение листов ===
xls = pd.ExcelFile(r"C:\Users\evgen\Documents\ДИПЛОМ\Достижения студентов.xlsx")
target_sheets = ["Научные достижения", "Спортивные достижения", "Творческие достижения", "Различный уровень", "Публикации", 
                 "Студенческое самоуправление", "Иные достижения", "Освоение доп. программ", "Опыт работы"]

students_df_list = []
for sheet in target_sheets:
    df = xls.parse(sheet)
    if "ФИО" in df.columns and "Группа" in df.columns:
        students_df_list.append(df[["ФИО", "Группа"]].dropna())

# Объединение и очистка
combined_df = pd.concat(students_df_list).drop_duplicates()
combined_df.rename(columns={"ФИО": "fullname", "Группа": "group_s"}, inplace=True)

# === Вставка с ON CONFLICT DO NOTHING ===
metadata = MetaData()
metadata.reflect(bind=engine)
students_table = Table("students", metadata, autoload_with=engine)

with engine.begin() as conn:
    for _, row in combined_df.iterrows():
        stmt = insert(students_table).values(
            fullname=row["fullname"],
            group_s=row["group_s"]
        ).on_conflict_do_nothing(index_elements=["fullname"])
        conn.execute(stmt)

print("✅ Вставка завершена: дубликаты автоматически пропущены.")
