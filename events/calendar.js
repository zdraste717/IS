document.addEventListener('DOMContentLoaded', function () {
    var calendarEl = document.getElementById('calendar');
    var popup = document.getElementById('floating-event-form');

    var calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        locale: 'ru',
        firstDay: 1,
        showNonCurrentDates: false,
        height: 'auto',
        buttonText: {
            today: 'Сегодня'
        },
        events: [
            {
                title: 'День открытых дверей',
                start: '2025-05-02',
                description: 'Актовый зал, 12:00'
            },
            {
                title: 'Научная конференция',
                start: '2025-05-10',
                end: '2025-05-12',
                description: '3-й корпус, конференц-зал'
            }
        ],
        dateClick: function (info) {
            const calendarRect = calendarEl.getBoundingClientRect();
            const cell = document.querySelector(`[data-date="${info.dateStr}"]`);
            if (!cell) return;

            // Переключение (повторный клик скрывает)
            if (popup.dataset.date === info.dateStr && !popup.classList.contains('d-none')) {
                popup.classList.add('d-none');
                popup.dataset.date = '';
                return;
            }

            const cellRect = cell.getBoundingClientRect();

            const top = cellRect.bottom - calendarRect.top + 8;
            let left = cellRect.left - calendarRect.left;
            const popupWidth = 260; // ширина попапа
            const calendarWidth = calendarEl.offsetWidth;

            if (left + popupWidth > calendarWidth) {
                left = calendarWidth - popupWidth - 10; // сдвигаем влево с запасом
            }

            popup.style.top = top + 'px';
            popup.style.left = left + 'px';
            popup.dataset.date = info.dateStr;

            popup.innerHTML = `
            <h6>${new Date(info.dateStr).toLocaleDateString('ru-RU')}</h6>
            <p class="text-muted">Здесь будет информация о мероприятиях.</p>
            <button class="btn btn-sm mt-2" disabled>Записаться</button>
          `;

            popup.classList.remove('d-none');
        }
    });

    calendar.render();
});