// calendar.js
// Глобальное хранилище событий по датам
const eventsByDate = {};
let eventToDelete = null;
let eventDateToDelete = null;
let currentPageToDelete = null;
// Инициализация календаря
const calendar = new FullCalendar.Calendar(document.getElementById('calendar'), {
    initialView: 'dayGridMonth',
    locale: 'ru',
    firstDay: 1,
    showNonCurrentDates: false,
    eventDisplay: 'block',
    aspectRatio: 1.2,
    dayMaxEventRows: true,
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

    const editIndex = form.edit_event_index.value;
    const editDate = form.edit_event_date.value;

    if (editIndex !== '' && editDate !== '') {
        const ev = eventsByDate[editDate][editIndex];
        if (ev) {
            ev.title = title;
            ev.description = description;
            ev.start = fullDateTime;
            ev.extendedProps.place = place;
            ev.extendedProps.duration = duration;

            if (ev._ref) {
                ev._ref.setProp('title', title);
                ev._ref.setStart(fullDateTime);
            }

            if (document.getElementById('floating-event-form').dataset.date === editDate) {
                openPopup(editDate);
            }
        }
    } else {
        const eventObj = {
            title,
            start: fullDateTime,
            description,
            extendedProps: { place, duration }
        };

        const calendarEvent = calendar.addEvent(eventObj);
        eventObj._ref = calendarEvent;

        if (!eventsByDate[date]) eventsByDate[date] = [];
        eventsByDate[date].push(eventObj);

        if (document.getElementById('floating-event-form').dataset.date === date) {
            openPopup(date);
        }
    }

    bootstrap.Modal.getInstance(document.getElementById('addEventModal')).hide();
    form.reset();
    form.edit_event_index.value = '';
    form.edit_event_date.value = '';
    document.querySelector('#addEventModal button[type="submit"]').textContent = 'Добавить';

    if (editIndex !== '' && editDate !== '') {
        showToast('Мероприятие успешно отредактировано!', 'success');
    } else {
        showToast('Мероприятие успешно добавлено!', 'success');
    }
});

function openPopup(dateStr) {
    const popup = document.getElementById('floating-event-form');
    popup.classList.add('modal-like');
    popup.dataset.date = dateStr;
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
            currentPageToDelete = currentPage - 1;
            eventToDelete = events[currentPageToDelete];
            eventDateToDelete = dateStr;

            const popup = document.getElementById('floating-event-form');
            popup.classList.add('d-none'); 

            const deleteModal = new bootstrap.Modal(document.getElementById('deleteConfirmModal'));
            deleteModal.show();
        };

        popup.querySelector('.edit-btn-global').onclick = () => {
            const eventToEdit = events[currentPage - 1];
            document.getElementById('floating-event-form').classList.add('d-none');
            if (!eventToEdit) return;

            form.name_e.value = eventToEdit.title;
            form.description.value = eventToEdit.description;
            form.data_s.value = dateStr;
            form.time_s.value = new Date(eventToEdit.start).toTimeString().slice(0, 5);
            form.place.value = eventToEdit.extendedProps.place || '';
            form.duration.value = eventToEdit.extendedProps.duration || '';

            form.edit_event_date.value = dateStr;
            form.edit_event_index.value = currentPage - 1;

            const submitBtn = document.querySelector('#addEventModal button[type="submit"]');
            submitBtn.textContent = 'Сохранить';

            const modal = new bootstrap.Modal(document.getElementById('addEventModal'));
            modal.show();
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
            popup.classList.remove('modal-like');
            popup.dataset.date = '';
        };
    };

    renderPages();
    popup.classList.remove('d-none');
}

function showToast(message, type = 'success') {
    const toastContainer = document.getElementById('toast-container');
    const toast = document.createElement('div');

    const backgroundColor = type === 'success' ? '#0e1b30' : '#dc3545';

    toast.className = 'toast align-items-center border-0 show';
    toast.role = 'alert';
    toast.ariaLive = 'assertive';
    toast.ariaAtomic = 'true';
    toast.style.zIndex = 1055;
    toast.style.backgroundColor = backgroundColor;
    toast.style.color = '#fff';

    toast.innerHTML = `
      <div class="d-flex">
        <div class="toast-body">${message}</div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Закрыть"></button>
      </div>
    `;

    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

document.getElementById('confirmDeleteBtn').onclick = () => {
    if (!eventToDelete || !eventDateToDelete) return;

    const events = eventsByDate[eventDateToDelete];
    const removed = events.splice(currentPageToDelete, 1)[0];
    if (removed._ref) removed._ref.remove();

    if (events.length === 0) {
        const popup = document.getElementById('floating-event-form');
        popup.classList.add('d-none');
        popup.dataset.date = '';
    } else {
        openPopup(eventDateToDelete);
    }

    bootstrap.Modal.getInstance(document.getElementById('deleteConfirmModal')).hide();
    showToast('Мероприятие удалено', 'success');

    eventToDelete = null;
    eventDateToDelete = null;
    currentPageToDelete = null;
};

document.getElementById('cancelDeleteBtn').addEventListener('click', () => {
    if (eventDateToDelete && eventsByDate[eventDateToDelete]?.length > 0) {
        openPopup(eventDateToDelete);
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const cancelEditBtn = document.getElementById('cancelEditBtn');
    if (cancelEditBtn) {
        cancelEditBtn.addEventListener('click', () => {
            const popup = document.getElementById('floating-event-form');
            const date = popup.dataset.date;
            if (date && eventsByDate[date]?.length > 0) {
                openPopup(date);
            }
        });
    }
});

if (!document.getElementById('toast-container')) {
    const container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container position-fixed bottom-0 end-0 p-3';
    document.body.appendChild(container);
}
