# Generated by Django 5.2 on 2025-04-17 00:39

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='AddProgramm',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('fullname', models.CharField(max_length=255)),
                ('name_p', models.CharField(max_length=255)),
                ('education_t', models.CharField(max_length=255)),
                ('hours', models.IntegerField()),
                ('terms', models.CharField(max_length=255)),
                ('education_p', models.CharField(max_length=255)),
                ('name_d', models.CharField(max_length=255)),
            ],
            options={
                'db_table': 'add_programm',
            },
        ),
        migrations.CreateModel(
            name='Creation',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('fullname', models.CharField(max_length=255)),
                ('activity_t', models.CharField(max_length=255)),
                ('part_fest', models.CharField(max_length=255)),
                ('date_f', models.DateField()),
                ('note', models.TextField()),
            ],
            options={
                'db_table': 'creation',
            },
        ),
        migrations.CreateModel(
            name='Experience',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('fullname', models.CharField(max_length=255)),
                ('place_w', models.CharField(max_length=255)),
                ('work_t', models.CharField(max_length=255)),
                ('title_j', models.CharField(max_length=255)),
                ('deadlines', models.CharField(max_length=255)),
                ('respons', models.TextField()),
            ],
            options={
                'db_table': 'experience',
            },
        ),
        migrations.CreateModel(
            name='OtherAchiev',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('fullname', models.CharField(max_length=255)),
                ('activity_t', models.CharField(max_length=255)),
                ('achiev', models.CharField(max_length=255)),
                ('date_o', models.DateField()),
                ('note', models.TextField()),
            ],
            options={
                'db_table': 'other_achiev',
            },
        ),
        migrations.CreateModel(
            name='Publication',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('fullname', models.CharField(max_length=255)),
                ('coauthors', models.CharField(max_length=255)),
                ('fname_work', models.CharField(max_length=255)),
                ('output_d', models.DateField()),
                ('form_w', models.CharField(max_length=255)),
                ('public_t', models.CharField(max_length=255)),
                ('article_inc', models.CharField(max_length=255)),
            ],
            options={
                'db_table': 'publication',
            },
        ),
        migrations.CreateModel(
            name='Scienes',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('fullname', models.CharField(max_length=255)),
                ('srw_name', models.CharField(max_length=255)),
                ('customer', models.CharField(max_length=255)),
                ('l_programm', models.CharField(max_length=255)),
                ('p_name', models.CharField(max_length=255)),
                ('s_date', models.DateField()),
                ('f_date', models.DateField()),
                ('result', models.TextField()),
            ],
            options={
                'db_table': 'scienes',
            },
        ),
        migrations.CreateModel(
            name='Sport',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('fullname', models.CharField(max_length=255)),
                ('sport_t', models.CharField(max_length=255)),
                ('compet', models.CharField(max_length=255)),
                ('date_c', models.DateField()),
                ('note', models.TextField()),
            ],
            options={
                'db_table': 'sport',
            },
        ),
        migrations.CreateModel(
            name='Student',
            fields=[
                ('fullname', models.CharField(max_length=255, primary_key=True, serialize=False)),
            ],
            options={
                'db_table': 'students',
            },
        ),
        migrations.CreateModel(
            name='StudentGovernment',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('fullname', models.CharField(max_length=255)),
                ('body_g', models.CharField(max_length=255)),
                ('activity_t', models.CharField(max_length=255)),
                ('activity_per', models.CharField(max_length=255)),
                ('note', models.TextField()),
            ],
            options={
                'db_table': 'student_government',
            },
        ),
        migrations.CreateModel(
            name='VariousLevel',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('fullname', models.CharField(max_length=255)),
                ('event_e', models.CharField(max_length=255)),
                ('level_e', models.CharField(max_length=255)),
                ('name_e', models.CharField(max_length=255)),
                ('venue', models.CharField(max_length=255)),
                ('date_e', models.DateField()),
                ('result', models.TextField()),
            ],
            options={
                'db_table': 'various_level',
            },
        ),
    ]
