from django.contrib.admin.views.decorators import staff_member_required
from django.shortcuts import render, redirect
from datetime import datetime
import re
from django.contrib import messages
from django.db.models import Q
from .models import (
    Student, Scienes, Sport, Creation, VariousLevel, Publication,
    StudentGovernment, OtherAchiev, AddProgramm, Experience
)

def achiev_view(request):
    fullname = request.session.get('student_fullname')
    if not fullname:
        return redirect('login')
    
    student = Student.objects.filter(fullname=fullname).first()

    data = {
        'scienes': Scienes.objects.filter(fullname=fullname),
        'sport': Sport.objects.filter(fullname=fullname),
        'creation': Creation.objects.filter(fullname=fullname),
        'various_level': VariousLevel.objects.filter(fullname=fullname),
        'publication': Publication.objects.filter(fullname=fullname),
        'student_government': StudentGovernment.objects.filter(fullname=fullname),
        'other_achiev': OtherAchiev.objects.filter(fullname=fullname),
        'add_programm': AddProgramm.objects.filter(fullname=fullname),
        'experience': Experience.objects.filter(fullname=fullname),
    }

    # Проверяем — есть ли хоть одно достижение
    has_achievements = any(qs.exists() for qs in data.values())

    return render(request, 'achiev.html', {
        **data,
        'fullname': fullname,
        'student': student,
        'has_achievements': has_achievements
    })

def main_view(request):
    return render(request, 'main.html')

def login_view(request):
    if request.method == 'POST':
        last_name = request.POST.get('last_name', '').strip()
        first_name = request.POST.get('first_name', '').strip()
        middle_name = request.POST.get('middle_name', '').strip()

        full_name = f"{last_name} {first_name} {middle_name}"
        request.session['student_fullname'] = full_name

        # 👉 Определяем, является ли пользователь администратором
        if full_name.lower() == "махалкина татьяна олеговна":
            request.session['is_admin'] = True
        else:
            request.session['is_admin'] = False

        return redirect('main')

    return render(request, 'index.html')

from django.db.models import Q
from datetime import datetime
import re

import re
from datetime import datetime

def normalize_date(date_str):
    """
    Преобразует строку даты в формат YYYYMMDD, игнорируя разделители
    Поддерживаются форматы: ДД.ММ.ГГГГ, ДД-ММ-ГГГГ, ГГГГ-ММ-ДД, и др.
    """
    if not date_str:
        return None

    date_str = date_str.strip()

    # Пробуем определить формат автоматически
    known_formats = [
        '%d.%m.%Y',
        '%d-%m-%Y',
        '%Y-%m-%d',
        '%Y.%m.%d',
        '%d/%m/%Y',
        '%Y/%m/%d',
    ]

    for fmt in known_formats:
        try:
            parsed = datetime.strptime(date_str[:10], fmt)
            return parsed.strftime('%Y%m%d')
        except ValueError:
            continue

    # Если не удалось — убираем всё, кроме цифр (например, 12022022)
    digits = re.sub(r'\D', '', date_str)
    if len(digits) == 8:
        if int(digits[:4]) > 1900:
            return digits  # ГГГГММДД
        else:
            return digits[4:] + digits[2:4] + digits[0:2]  # ДДММГГГГ → ГГГГММДД
    return None



def admin_panel_view(request):
    if not request.session.get('is_admin'):
        return redirect('main')

    type_filter = request.GET.get('type')
    search_query = request.GET.get('search', '').strip()
    date_from = request.GET.get('date_from', '')
    date_to = request.GET.get('date_to', '')

    # Мапа моделей с полями для поиска и датой
    model_map = {
        'scienes': (Scienes, ['fullname', 'srw_name', 'customer', 'l_programm', 'p_name', 'f_date', 'result'], 's_date'),
        'sport': (Sport, ['fullname', 'sport_t', 'compet', 'note'], 'date_c'),
        'creation': (Creation, ['fullname', 'activity_t', 'part_fest', 'note'], 'date_f'),
        'various_level': (VariousLevel, ['fullname', 'event_t', 'level_e', 'name_e', 'venue', 'result'], 'date_e'),
        'publication': (Publication, ['fullname', 'coauthors', 'fname_work', 'form_w', 'public_t', 'article_inc'], 'output_d'),
        'student_government': (StudentGovernment, ['fullname', 'body_g', 'activity_t', 'note'], 'activity_per'),
        'other_achiev': (OtherAchiev, ['fullname', 'activity_t', 'achiev', 'note'], 'date_o'),
        'add_programm': (AddProgramm, ['fullname', 'name_p', 'education_t', 'hours', 'education_p', 'name_d'], 'terms'),
        'experience': (Experience, ['fullname', 'place_w', 'work_t', 'title_j', 'respons'], 'deadlines'),
    }

    def apply_filters(queryset, fields, date_field):
        # Поиск по ключевым словам
        if search_query:
            q = Q()
            for f in fields:
                q |= Q(**{f"{f}__icontains": search_query})
            queryset = queryset.filter(q)

        # Фильтр по дате
        if date_from and date_to:
            norm_from = normalize_date(date_from)
            norm_to = normalize_date(date_to)

            filtered = []
            for obj in queryset:
                raw_date = str(getattr(obj, date_field))[:10]
                norm_obj_date = normalize_date(raw_date)
                if norm_obj_date and norm_from <= norm_obj_date <= norm_to:
                    filtered.append(obj)
                    print('FROM:', norm_from, 'TO:', norm_to, 'OBJ:', norm_obj_date)
            return filtered

        return queryset

    context = {}

    if not type_filter or type_filter == 'all':
        for key, (model, fields, date_field) in model_map.items():
            context[key] = apply_filters(model.objects.all(), fields, date_field)
    else:
        model_info = model_map.get(type_filter)
        if model_info:
            model, fields, date_field = model_info
            context[type_filter] = apply_filters(model.objects.all(), fields, date_field)

    context.update({
        'type_filter': type_filter or 'all',
        'search_query': search_query,
        'date_from': date_from,
        'date_to': date_to,
    })

    return render(request, 'admin_panel.html', context)


