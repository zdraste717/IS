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
            // {
            //     title: 'День открытых дверей',
            //     start: '2025-05-02',
            //     description: 'Актовый зал, 12:00'
            // },
            // {
            //     title: 'Научная конференция',
            //     start: '2025-05-10',
            //     end: '2025-05-12',
            //     description: '3-й корпус, конференц-зал'
            // }
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
                <div class="d-flex justify-content-between align-items-start">
                    <h6 class="mb-1">${new Date(info.dateStr).toLocaleDateString('ru-RU')}</h6>
                    <button type="button" class="btn-close ms-2" aria-label="Закрыть" id="close-popup-btn"></button>
                </div>

                <div id="popup-pages">
                    <div class="popup-page" data-page="1">
                    Информация о мероприятии №1
                    <div class="form-check mt-3">
                        <input class="form-check-input consent-checkbox" type="checkbox" id="consent-checkbox-1">
                        <label class="form-check-label small" for="consent-checkbox-1">
                        Я соглашаюсь на обработку персональных данных
                        </label>
                    </div>
                    <div class="d-flex justify-content-end mt-2">
                        <button class="btn btn-sm btn-primary register-btn" id="register-btn-1" disabled>Записаться</button>
                    </div>
                    </div>

                    <div class="popup-page d-none" data-page="2">
                    Информация о мероприятии №2
                    <div class="form-check mt-3">
                        <input class="form-check-input consent-checkbox" type="checkbox" id="consent-checkbox-2">
                        <label class="form-check-label small" for="consent-checkbox-2">
                        Я соглашаюсь на обработку персональных данных
                        </label>
                    </div>
                    <div class="d-flex justify-content-end mt-2">
                        <button class="btn btn-sm btn-primary register-btn" id="register-btn-2" disabled>Записаться</button>
                    </div>
                    </div>

                    <div class="popup-page d-none" data-page="3">
                    Информация о мероприятии №3
                    <div class="form-check mt-3">
                        <input class="form-check-input consent-checkbox" type="checkbox" id="consent-checkbox-3">
                        <label class="form-check-label small" for="consent-checkbox-3">
                        Я соглашаюсь на обработку персональных данных
                        </label>
                    </div>
                    <div class="d-flex justify-content-end mt-2">
                        <button class="btn btn-sm btn-primary register-btn" id="register-btn-3" disabled>Записаться</button>
                    </div>
                    </div>

                    <div class="popup-page d-none" data-page="4">
                    Информация о мероприятии №4
                    <div class="form-check mt-3">
                        <input class="form-check-input consent-checkbox" type="checkbox" id="consent-checkbox-4">
                        <label class="form-check-label small" for="consent-checkbox-4">
                        Я соглашаюсь на обработку персональных данных
                        </label>
                    </div>
                    <div class="d-flex justify-content-end mt-2">
                        <button class="btn btn-sm btn-primary register-btn" id="register-btn-4" disabled>Записаться</button>
                    </div>
                    </div>

                    <div class="popup-page d-none" data-page="5">
                    Информация о мероприятии №5
                    <div class="form-check mt-3">
                        <input class="form-check-input consent-checkbox" type="checkbox" id="consent-checkbox-5">
                        <label class="form-check-label small" for="consent-checkbox-5">
                        Я соглашаюсь на обработку персональных данных
                        </label>
                    </div>
                    <div class="d-flex justify-content-end mt-2">
                        <button class="btn btn-sm btn-primary register-btn" id="register-btn-5" disabled>Записаться</button>
                    </div>
                    </div>
                </div>

                <div class="d-flex justify-content-between align-items-center mt-3">
                    <button id="prev-page" class="icon-btn" disabled>
                    <i class="bi bi-chevron-left"></i>
                    </button>
                    <span id="page-indicator" class="mx-2 small">1 / 5</span>
                    <button id="next-page" class="icon-btn">
                    <i class="bi bi-chevron-right"></i>
                    </button>
                </div>
            `;

            // Кнопка закрытия
            document.getElementById('close-popup-btn').addEventListener('click', function () {
                popup.classList.add('d-none');
                popup.dataset.date = '';
            });

            // Пагинация
            let currentPage = 1;
            const totalPages = 5; // максимум 10

            const updatePages = () => {
                document.querySelectorAll('.popup-page').forEach((el) => {
                    el.classList.add('d-none');
                    if (parseInt(el.dataset.page) === currentPage) {
                        el.classList.remove('d-none');
                    }
                });

                document.getElementById('page-indicator').textContent = `${currentPage} / ${totalPages}`;
                document.getElementById('prev-page').disabled = currentPage === 1;
                document.getElementById('next-page').disabled = currentPage === totalPages;
            };

            // Стрелки навигации
            document.getElementById('prev-page').addEventListener('click', function () {
                if (currentPage > 1) {
                    currentPage--;
                    updatePages();
                }
            });

            document.getElementById('next-page').addEventListener('click', function () {
                if (currentPage < totalPages) {
                    currentPage++;
                    updatePages();
                }
            });

            // Слушатели для всех чекбоксов
            document.querySelectorAll('.consent-checkbox').forEach((checkbox) => {
                checkbox.addEventListener('change', function () {
                    const page = checkbox.id.split('-').pop(); // получаем номер страницы
                    const btn = document.getElementById(`register-btn-${page}`);
                    btn.disabled = !this.checked;
                });
            });

            // Показать popup
            popup.classList.remove('d-none');
            updatePages();
        }
    });

    calendar.render();
});