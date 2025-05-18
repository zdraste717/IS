from django.contrib.admin.views.decorators import staff_member_required
from django.shortcuts import render, redirect
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

def admin_panel_view(request):
    if not request.session.get('is_admin'):
        return redirect('main')  # доступ только для админа
    
    type_filter = request.GET.get('type')
    search_query = request.GET.get('search', '').strip()

    context = {}
    def apply_search(queryset, fields):
        if not search_query:
            return queryset
        q_objects = Q()
        for field in fields:
            q_objects |= Q(**{f"{field}__icontains": search_query})
        return queryset.filter(q_objects)

    model_map = {
    'scienes': (Scienes, ['fullname', 'srw_name', 'customer', 'p_name', 'result']),
    'sport': (Sport, ['fullname', 'sport_t', 'compet', 'note']),
    'creation': (Creation, ['fullname', 'activity_t', 'part_fest', 'note']),
    'various_level': (VariousLevel, ['fullname', 'event_e', 'name_e', 'venue', 'result']),
    'publication': (Publication, ['fullname', 'fname_work', 'coauthors', 'form_w']),
    'student_government': (StudentGovernment, ['fullname', 'body_g', 'activity_t', 'note']),
    'other_achiev': (OtherAchiev, ['fullname', 'activity_t', 'achiev', 'note']),
    'add_programm': (AddProgramm, ['fullname', 'name_p', 'education_t', 'education_p']),
    'experience': (Experience, ['fullname', 'place_w', 'title_j', 'respons']),
    }

    if not type_filter or type_filter == 'all':
        for key, (model, fields) in model_map.items():
            context[key] = apply_search(model.objects.all(), fields)
    else:
        model_info = model_map.get(type_filter)
        if model_info:
            model, fields = model_info
            context[type_filter] = apply_search(model.objects.all(), fields)

    context['type_filter'] = type_filter or 'all'
    context['search_query'] = search_query

    return render(request, 'admin_panel.html', context)

