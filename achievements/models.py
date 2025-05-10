from django.db import models
from django.db import models

class Student(models.Model):
    fullname = models.CharField(max_length=255, primary_key=True)
    faculty = models.CharField(max_length=255) 

    class Meta:
        db_table = 'students'  # ← Указываем явное имя таблицы в БД

    def __str__(self):
        return self.fullname

class Scienes(models.Model):
    id = models.AutoField(primary_key=True)
    fullname = models.CharField(max_length=255)
    srw_name = models.CharField(max_length=255)
    customer = models.CharField(max_length=255)
    l_programm = models.CharField(max_length=255)
    p_name = models.CharField(max_length=255)
    s_date = models.DateField()
    f_date = models.DateField()
    result = models.TextField()

    class Meta:
        db_table = 'scienes'

class Sport(models.Model):
    id = models.AutoField(primary_key=True)
    fullname = models.CharField(max_length=255)
    sport_t = models.CharField(max_length=255)
    compet = models.CharField(max_length=255)
    date_c = models.DateField()
    note = models.TextField()

    class Meta:
        db_table = 'sport'

class Creation(models.Model):
    id = models.AutoField(primary_key=True)
    fullname = models.CharField(max_length=255)
    activity_t = models.CharField(max_length=255)
    part_fest = models.CharField(max_length=255)
    date_f = models.DateField()
    note = models.TextField()

    class Meta:
        db_table = 'creation'

class VariousLevel(models.Model):
    id = models.AutoField(primary_key=True)
    fullname = models.CharField(max_length=255)
    event_t = models.CharField(max_length=255)
    level_e = models.CharField(max_length=255)
    name_e = models.CharField(max_length=255)
    venue = models.CharField(max_length=255)
    date_e = models.DateField()
    result = models.TextField()

    class Meta:
        db_table = 'various_level'

class Publication(models.Model):
    id = models.AutoField(primary_key=True)
    fullname = models.CharField(max_length=255)
    coauthors = models.CharField(max_length=255)
    fname_work = models.CharField(max_length=255)
    output_d = models.DateField()
    form_w = models.CharField(max_length=255)
    public_t = models.CharField(max_length=255)
    article_inc = models.CharField(max_length=255)

    class Meta:
        db_table = 'publications'

class StudentGovernment(models.Model):
    id = models.AutoField(primary_key=True)
    fullname = models.CharField(max_length=255)
    body_g = models.CharField(max_length=255)
    activity_t = models.CharField(max_length=255)
    activity_per = models.CharField(max_length=255)
    note = models.TextField()

    class Meta:
        db_table = 'student_government'

class OtherAchiev(models.Model):
    id = models.AutoField(primary_key=True)
    fullname = models.CharField(max_length=255)
    activity_t = models.CharField(max_length=255)
    achiev = models.CharField(max_length=255)
    date_o = models.DateField()
    note = models.TextField()

    class Meta:
        db_table = 'other_achiev'

class AddProgramm(models.Model):
    id = models.AutoField(primary_key=True)
    fullname = models.CharField(max_length=255)
    name_p = models.CharField(max_length=255)
    education_t = models.CharField(max_length=255)
    hours = models.IntegerField()
    terms = models.CharField(max_length=255)
    education_p = models.CharField(max_length=255)
    name_d = models.CharField(max_length=255)

    class Meta:
        db_table = 'add_programm'

class Experience(models.Model):
    id = models.AutoField(primary_key=True)
    fullname = models.CharField(max_length=255)
    place_w = models.CharField(max_length=255)
    work_t = models.CharField(max_length=255)
    title_j = models.CharField(max_length=255)
    deadlines = models.CharField(max_length=255)
    respons = models.TextField()

    class Meta:
        db_table = 'experience'