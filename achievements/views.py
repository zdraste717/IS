from django.shortcuts import render, redirect
from django.contrib import messages
from .models import (
    Student, Scienes, Sport, Creation, VariousLevel, Publication,
    StudentGovernment, OtherAchiev, AddProgramm, Experience
)

def achiev_view(request):
    fullname = request.session.get('student_fullname')
    if not fullname:
        return redirect('login')

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

        return redirect('main')

    return render(request, 'index.html')
