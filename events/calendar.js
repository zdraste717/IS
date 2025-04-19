// calendar.js
// Глобальное хранилище событий по датам
const eventsByDate = {};

// Инициализация календаря
const calendar = new FullCalendar.Calendar(document.getElementById('calendar'), {
    initialView: 'dayGridMonth',
    locale: 'ru',
    firstDay: 1,
    showNonCurrentDates: false,
    height: 'auto',
    buttonText: {
        today: 'Сегодня'
    },
    headerToolbar: {
        start: 'title',
        center: '',
        end: 'prev,next today addEventButton'
    },
    customButtons: {
        addEventButton: {
            text: 'Добавить',
            click: function () {
                const modal = new bootstrap.Modal(document.getElementById('addEventModal'));
                modal.show();
            }
        }
    },
    events: [],
    dateClick: function (info) {
        openPopup(info.dateStr);
    }
});

calendar.render();

// Обработка отправки формы
const form = document.getElementById('addEventForm');
form.addEventListener('submit', function (e) {
    e.preventDefault();

    const title = form.name_e.value;
    const description = form.description.value;
    const date = form.data_s.value;
    const time = form.time_s.value;
    const duration = form.duration.value;
    const place = form.place.value;

    const fullDateTime = `${date}T${time}`;

    const eventObj = {
        title,
        start: fullDateTime,
        description,
        extendedProps: {
            place,
            duration
        }
    };

    const calendarEvent = calendar.addEvent(eventObj);
    eventObj._ref = calendarEvent;

    if (!eventsByDate[date]) eventsByDate[date] = [];
    eventsByDate[date].push(eventObj);

    bootstrap.Modal.getInstance(document.getElementById('addEventModal')).hide();
    form.reset();

    if (document.getElementById('floating-event-form').dataset.date === date) {
        openPopup(date);
    }
});

function openPopup(dateStr) {
    const popup = document.getElementById('floating-event-form');
    const calendarRect = document.getElementById('calendar').getBoundingClientRect();
    const cell = document.querySelector(`[data-date="${dateStr}"]`);
    if (!cell) return;

    const cellRect = cell.getBoundingClientRect();
    const top = cellRect.bottom - calendarRect.top + 8;
    const left = cell.offsetLeft;

    popup.style.top = `${top}px`;
    popup.style.left = `${left}px`;
    popup.dataset.date = dateStr;

    const events = eventsByDate[dateStr] || [];
    let currentPage = 1;
    const getTotalPages = () => Math.max(1, events.length);

    const renderPages = () => {
        const totalPages = getTotalPages();
        if (currentPage > totalPages) currentPage = totalPages;

        popup.innerHTML = `
      <div class="d-flex justify-content-between align-items-start">
        <h6 class="mb-1">${new Date(dateStr).toLocaleDateString('ru-RU')}</h6>
        <div class="d-flex align-items-center gap-2">
          <button class="btn btn-sm p-1 custom-btn edit-btn-global" title="Редактировать">
            <i class="bi bi-pencil"></i>
          </button>
          <button class="btn btn-sm p-1 custom-btn delete-btn-global" title="Удалить">
            <i class="bi bi-trash"></i>
          </button>
          <button type="button" class="btn-close ms-2" aria-label="Закрыть" id="close-popup-btn"></button>
        </div>
      </div>
      <div id="popup-pages">
        ${events.map((ev, i) => {
            const time = ev.start ? new Date(ev.start).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }) : '';
            return `
          <div class="popup-page ${i + 1 !== currentPage ? 'd-none' : ''}" data-page="${i + 1}">
            <strong>${ev.title}</strong>
            <p class="mb-1 text-muted">${ev.description}</p>
            <small class="text-secondary">
              ${time ? `Время: ${time}` : ''} ${ev.extendedProps.place ? `| Место: ${ev.extendedProps.place}` : ''} ${ev.extendedProps.duration ? `| Длительность: ${ev.extendedProps.duration} ч` : ''}
            </small>
            <div class="d-flex justify-content-between align-items-center mt-3">
              <div class="form-check mb-0">
                <input class="form-check-input consent-checkbox" type="checkbox" id="consent-checkbox-${i}">
                <label class="form-check-label small" for="consent-checkbox-${i}">Согласие на обработку</label>
              </div>
              <button class="btn-sm custom-btn register-btn ms-3" id="register-btn-${i}" disabled>Записаться</button>
            </div>
          </div>`;
        }).join('')}
      </div>
      <div class="d-flex justify-content-between align-items-center mt-3">
        <button id="prev-page" class="icon-btn" ${currentPage === 1 ? 'disabled' : ''}>
          <i class="bi bi-chevron-left"></i>
        </button>
        <span id="page-indicator" class="mx-2 small">${currentPage} / ${totalPages}</span>
        <button id="next-page" class="icon-btn" ${currentPage === totalPages ? 'disabled' : ''}>
          <i class="bi bi-chevron-right"></i>
        </button>
      </div>
    `;

        popup.querySelector('#prev-page').onclick = () => {
            if (currentPage > 1) {
                currentPage--;
                renderPages();
            }
        };
        popup.querySelector('#next-page').onclick = () => {
            if (currentPage < getTotalPages()) {
                currentPage++;
                renderPages();
            }
        };

        popup.querySelector('.delete-btn-global').onclick = () => {
            if (events.length > 0) {
                const removed = events.splice(currentPage - 1, 1)[0];
                if (removed._ref) removed._ref.remove();
                if (events.length === 0) {
                    popup.classList.add('d-none');
                    popup.dataset.date = '';
                } else {
                    renderPages();
                }
            }
        };

        popup.querySelectorAll('.consent-checkbox').forEach((checkbox) => {
            checkbox.addEventListener('change', function () {
                const page = checkbox.id.split('-').pop();
                const btn = document.getElementById(`register-btn-${page}`);
                btn.disabled = !this.checked;
            });
        });

        popup.querySelector('#close-popup-btn').onclick = () => {
            popup.classList.add('d-none');
            popup.dataset.date = '';
        };
    };

    renderPages();
    popup.classList.remove('d-none');
}
