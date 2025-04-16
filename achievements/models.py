from django.db import models
from django.db import models

class Student(models.Model):
    fullname = models.CharField(max_length=255, primary_key=True)

    class Meta:
        db_table = 'students'  # ← Указываем явное имя таблицы в БД

    def __str__(self):
        return self.fullname

