from django.shortcuts import render, redirect
from django.contrib import messages
from .models import Student

def main_view(request):
    return render(request, 'main.html')

def login_view(request):
    if request.method == 'POST':
        last_name = request.POST.get('last_name', '').strip()
        first_name = request.POST.get('first_name', '').strip()
        middle_name = request.POST.get('middle_name', '').strip()

        full_name = f"{last_name} {first_name} {middle_name}"

        student = Student.objects.filter(fullname__iexact=full_name).first()

        if student:
            request.session['student_fullname'] = student.fullname  # ✅ вот здесь
            return redirect('main')
        else:
            messages.error(request, "Студент с таким ФИО не найден.")

    return render(request, 'index.html')

