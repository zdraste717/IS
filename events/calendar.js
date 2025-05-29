const eventsByDate = {};
let eventToDelete = null;
let eventDateToDelete = null;
let currentPageToDelete = null;
let lastUsedImageBase64 = '';
let currentPage = 1;
let currentDate = null;
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
    eventTimeFormat: {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
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
                document.getElementById('floating-event-form').classList.add('d-none');
                lastUsedImageBase64 = '';

                const imageInput = document.getElementById('image_file');
                if (imageInput) imageInput.value = '';

                const previewContainer = document.getElementById('image-preview-container');
                const preview = document.getElementById('image-preview');
                if (previewContainer && preview) {
                    previewContainer.classList.add('d-none');
                    preview.src = '';
                }

                const form = document.getElementById('addEventForm');
                if (form) {
                    form.reset();
                    form.duration_time.value = '';
                    form['edit_event_index'].value = '';
                    form['edit_event_date'].value = '';
                    form.multi_date.value = '';
                }

                document.getElementById('addEventModalLabel').textContent = 'Новое мероприятие';
                document.querySelector('#addEventModal button[type="submit"]').textContent = 'Добавить';

                const modalEl = document.getElementById('addEventModal');
                const modal = new bootstrap.Modal(modalEl);
                modal.show();

                setTimeout(() => {
                    if (window.multiDatePicker) {
                        window.multiDatePicker.clear();
                        window.multiDatePicker.setDate([], false);
                    }
                    if (form) form.multi_date.value = '';
                }, 200);
            }
        },
        filterWrapper: {
            text: '',
            click: null
        }
    },

    eventClick: function (info) {
        const clickedEvent = info.event;
        const dateStr = clickedEvent.startStr.split('T')[0];
        const title = clickedEvent.title?.trim();

        const popup = document.getElementById('floating-event-form');

        popup.innerHTML = '';
        popup.classList.remove('modal-like');

        popup.classList.remove('d-none');

        setTimeout(() => {
            const events = eventsByDate[dateStr];
            if (!events || events.length === 0) return;

            const targetIndex = events.findIndex(ev =>
                ev.title?.trim() === title &&
                ev.start?.startsWith(dateStr)
            );

            if (targetIndex === -1) {
                console.warn('Мероприятие не найдено для открытия:', title, dateStr);
                return;
            }

            currentPage = targetIndex + 1;
            currentDate = dateStr;
            openPopup(dateStr);
        }, 10);
    },


    eventDidMount: function (info) {
        const cell = info.el.closest('.fc-daygrid-day');
        if (!cell) return;

        const numberCell = cell.querySelector('.fc-daygrid-day-number');
        if (numberCell && !numberCell.classList.contains('has-event-dot')) {
            const dot = document.createElement('span');
            dot.classList.add('mobile-event-dot');
            numberCell.appendChild(dot);
            numberCell.classList.add('has-event-dot');
        }
    },

    eventContent: function (info) {
        return {
            html: `
            <div class="fc-event-custom">
                <span class="fc-time">${info.timeText}</span>
                <span class="fc-title">${info.event.title}</span>
            </div>
        `
        };
    },


    events: [],
    dateClick: function (info) {
        openPopup(info.dateStr);
    }

});

calendar.render();

const imageFileInput = document.getElementById('image_file');
const imagePreviewContainer = document.getElementById('image-preview-container');
const imagePreview = document.getElementById('image-preview');
const removeImageBtn = document.getElementById('remove-image-btn');

imageFileInput.addEventListener('change', () => {
    const file = imageFileInput.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            imagePreview.src = e.target.result;
            imagePreviewContainer.classList.remove('d-none');
            lastUsedImageBase64 = e.target.result;
        };
        reader.readAsDataURL(file);
    }
});

removeImageBtn.addEventListener('click', () => {
    imagePreviewContainer.classList.add('d-none');
    imageFileInput.value = '';
    imagePreview.src = '';
    lastUsedImageBase64 = '';
});

const form = document.getElementById('addEventForm');

form.addEventListener('submit', function (e) {
    e.preventDefault();

    form.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));

    let valid = true;
    const requiredFields = ['name_e', 'description', 'multi_date', 'time_s', 'place'];
    requiredFields.forEach(id => {
        const input = form[id];
        if (!input.value.trim()) {
            input.classList.add('is-invalid');
            valid = false;
        }
    });

    if (!valid) {
        showToast('Пожалуйста, заполните все обязательные поля', 'error');
        return;
    }

    const imageFileInput = form.image_file;
    if (imageFileInput && imageFileInput.files && imageFileInput.files[0]) {
        const file = imageFileInput.files[0];
        const reader = new FileReader();
        reader.onload = function (event) {
            const imageBase64 = event.target.result;
            lastUsedImageBase64 = imageBase64;
            finishFormSubmit(imageBase64);
        };
        reader.readAsDataURL(file);
    } else {
        finishFormSubmit(lastUsedImageBase64);
    }
});


function finishFormSubmit(imageBase64 = '') {
    const title = form.name_e.value;
    const description = form.description.value;
    const rawDates = form.multi_date.value.split(',').map(d => d.trim()).filter(d => d);
    const time = form.time_s.value;
    const durationRaw = form.duration_time.value; // формат: "HH:MM"
    let duration = '';
    if (durationRaw) {
        const [h, m] = durationRaw.split(':').map(Number);
        duration = `${h}ч ${m}мин`;
    }
    const place = form.place.value;
    const link = form.event_link.value.trim();
    const editIndex = form['edit_event_index'].value;
    const editDate = form['edit_event_date'].value;
    const date = rawDates[0];
    const fullDateTime = `${date}T${time}`;

    if (editIndex !== '' && editDate !== '') {
        const ev = eventsByDate[editDate][editIndex];
        if (ev) {
            if (ev._ref) ev._ref.remove();
            eventsByDate[editDate].splice(editIndex, 1);
            const newEvent = {
                id: `${date}-${time}-${title}`,
                title,
                start: fullDateTime,
                description,
                end: null,
                extendedProps: { place, duration, image: imageBase64, link }
            };

            const calendarEvent = calendar.addEvent(newEvent);
            newEvent._ref = calendarEvent;

            if (!eventsByDate[date]) eventsByDate[date] = [];
            eventsByDate[date].push(newEvent);

            if (document.getElementById('floating-event-form').dataset.date === date) {
                openPopup(date);
            }
        }
    } else {
        rawDates.forEach(date => {
            const fullDateTime = `${date}T${time}`;
            const eventId = crypto.randomUUID();

            const duplicate = (eventsByDate[date] || []).some(ev => ev.title.trim().toLowerCase() === title.trim().toLowerCase());
            if (duplicate) {
                showToast(`Мероприятие с таким названием уже существует на ${date}`, 'error');
                return;
            }

            const eventObj = {
                id: eventId,
                title,
                start: fullDateTime,
                description,
                end: null,
                extendedProps: { place, duration, image: imageBase64, link }
            };

            const calendarEvent = calendar.addEvent(eventObj);
            eventObj._ref = calendarEvent;

            if (!eventsByDate[date]) eventsByDate[date] = [];
            eventsByDate[date].push(eventObj);

            if (document.getElementById('floating-event-form').dataset.date === date) {
                openPopup(date);
            }
        });
    }

    // Очистка формы
    bootstrap.Modal.getInstance(document.getElementById('addEventModal')).hide();
    form.reset();
    if (window.multiDatePicker) {
        multiDatePicker.setDate([], true);
        multiDatePicker.setDate([date], true);
        form.multi_date.value = date;
    }
    form['edit_event_index'].value = '';
    form['edit_event_date'].value = '';
    document.querySelector('#addEventModal button[type="submit"]').textContent = 'Добавить';
    document.getElementById('addEventModalLabel').textContent = 'Новое мероприятие';
    showToast('Мероприятие добавлено!', 'success');
}



function formatTime(dateStr) {
    const date = new Date(dateStr);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
}

function generatePopupPageHTML(ev, i, currentPage, dateStr) {
    const isActivePage = (i + 1 === currentPage);
    const time = ev.start ? formatTime(ev.start) : '';
    const duration = ev.extendedProps.duration || '';
    const place = ev.extendedProps.place || '';
    const image = ev.extendedProps.image || '';
    const link = ev.extendedProps.link || '';
    const description = ev.description || '';

    return `
        <div class="popup-page ${!isActivePage ? 'd-none' : ''}" data-page="${i + 1}" data-page-date="${dateStr}">
            <div class="d-flex justify-content-between align-items-center mb-2">
                <div class="d-flex align-items-center gap-2">
                    <i class="bi bi-calendar-event text-primary fs-5"></i>
                    <h5 class="mb-0">${ev.title}</h5>
                </div>
                <div class="d-flex align-items-center gap-2">
                    <button class="btn btn-sm p-1 custom-btn edit-btn-global" title="Редактировать">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm p-1 custom-btn delete-btn-global" title="Удалить">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </div>

            <p class="mb-2 text-muted">${description}</p>

            ${image ? `<img src="${image}" alt="Мероприятие" class="popup-image mt-2 mb-3" onerror="this.src='https://via.placeholder.com/600x250?text=Нет+изображения';">` : ''}

            <div class="popup-meta text-secondary small mb-2">
                ${time ? `⏰ Время: ${time}` : ''} ${place ? `| 📍 Место: ${place}` : ''} ${duration ? `| ⌛ Длительность: ${duration}` : ''}
            </div>

            <div class="popup-separator"></div>

            <div class="d-flex justify-content-between align-items-center mt-3">
                <div class="form-check mb-0">
                    <input class="form-check-input consent-checkbox" type="checkbox" id="consent-checkbox-${i}">
                    <label class="form-check-label small" for="consent-checkbox-${i}">Согласие на обработку</label>
                </div>
                <button class="btn custom-btn register-btn ms-3 px-3 py-1" id="register-btn-${i}" disabled>Записаться</button>
            </div>
        </div>`;
}


function openPopup(dateStr) {
    const events = eventsByDate[dateStr];
    if (!events || events.length === 0) return;

    const popup = document.getElementById('floating-event-form');
    popup.classList.add('modal-like');
    popup.dataset.date = dateStr;
    const getTotalPages = () => Math.max(1, events.length);

    const renderPages = () => {
        const totalPages = getTotalPages();
        if (currentPage > totalPages) currentPage = totalPages;

        popup.innerHTML = `
            <div class="d-flex justify-content-between align-items-start mb-3">
                <div>
                    <h6 class="mb-0 text-muted">${new Date(dateStr).toLocaleDateString('ru-RU')}</h6>
                </div>
                <div class="d-flex align-items-center gap-2">
                    <button type="button" class="btn-close" aria-label="Закрыть" id="close-popup-btn"></button>
                </div>
            </div>

            <div class="popup-separator"></div>

            <div id="popup-pages">
                ${events.map((ev, i) => generatePopupPageHTML(ev, i, currentPage, dateStr)).join('')}
            </div>

            <div class="d-flex justify-content-between align-items-center mt-4">
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

        popup.querySelectorAll('.delete-btn-global').forEach((btn, index) => {
            btn.onclick = () => {
                currentPageToDelete = index;
                eventToDelete = events[index];
                eventDateToDelete = dateStr;

                popup.classList.add('d-none');
                const deleteModal = new bootstrap.Modal(document.getElementById('deleteConfirmModal'));
                deleteModal.show();
            };
        });

        popup.querySelectorAll('.edit-btn-global').forEach((btn, index) => {
            btn.onclick = () => {
                const eventToEdit = events[index];
                if (!eventToEdit) return;

                document.getElementById('addEventModalLabel').textContent = 'Редактирование мероприятия';
                document.querySelector('#addEventModal button[type="submit"]').textContent = 'Сохранить';
                popup.classList.add('d-none');

                form.name_e.value = eventToEdit.title;
                form.description.value = eventToEdit.description;
                form.time_s.value = new Date(eventToEdit.start).toTimeString().slice(0, 5);
                form.place.value = eventToEdit.extendedProps.place || '';
                form.event_link.value = eventToEdit.extendedProps.link || '';

                const durationStr = eventToEdit.extendedProps.duration || '';
                const matches = durationStr.match(/\d+/g) || [];
                if (matches.length >= 2) {
                    const hh = String(matches[0]).padStart(2, '0');
                    const mm = String(matches[1]).padStart(2, '0');
                    form.duration_time.value = `${hh}:${mm}`;
                } else {
                    form.duration_time.value = '';
                }

                lastUsedImageBase64 = eventToEdit.extendedProps.image || '';
                if (lastUsedImageBase64) {
                    imagePreview.src = lastUsedImageBase64;
                    imagePreviewContainer.classList.remove('d-none');
                } else {
                    imagePreview.src = '';
                    imagePreviewContainer.classList.add('d-none');
                }

                form.multi_date.value = dateStr;
                if (window.multiDatePicker) {
                    multiDatePicker.clear();
                    multiDatePicker.setDate([dateStr]);
                }

                form['edit_event_index'].value = index;
                form['edit_event_date'].value = dateStr;

                const modal = new bootstrap.Modal(document.getElementById('addEventModal'));
                modal.show();
            };
        });

        popup.querySelectorAll('.consent-checkbox').forEach((checkbox) => {
            checkbox.addEventListener('change', function () {
                const page = checkbox.id.split('-').pop();
                const btn = document.getElementById(`register-btn-${page}`);
                const event = events[page];

                if (this.checked && event.extendedProps.link) {
                    btn.disabled = false;
                    btn.onclick = () => {
                        window.open(event.extendedProps.link, '_blank');
                    };
                } else {
                    btn.disabled = true;
                    btn.onclick = null;
                }
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

    // Удаление точки на мобильной версии
    if (events.length === 0) {
        const cell = document.querySelector(`.fc-daygrid-day[data-date="${eventDateToDelete}"]`);
        if (cell) {
            const dot = cell.querySelector('.mobile-event-dot');
            const numberCell = cell.querySelector('.fc-daygrid-day-number');
            if (dot) dot.remove();
            if (numberCell) numberCell.classList.remove('has-event-dot');
        }

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

document.getElementById('addEventModal').addEventListener('hidden.bs.modal', () => {
    form['edit_event_index'].value = '';
    form['edit_event_date'].value = '';
    form.event_link.value = '';
    form.duration_time.value = '';
    form.reset();

    if (multiDatePicker) {
        multiDatePicker.clear();
    }

    document.getElementById('addEventModalLabel').textContent = 'Новое мероприятие';
    document.querySelector('#addEventModal button[type="submit"]').textContent = 'Добавить';
});

let multiDatePicker = null;

document.addEventListener('DOMContentLoaded', function () {
    multiDatePicker = flatpickr("#multi_date", {
    mode: "multiple",
    dateFormat: "Y-m-d",
    locale: flatpickr.l10ns.ru,
    disableMobile: true,
    static: true
});

setTimeout(() => {
    if (multiDatePicker) {
        multiDatePicker.jumpToDate(new Date());
    }
}, 100);
});

function fetchEventsFromStorage() {
    const raw = localStorage.getItem('calendarEvents');
    return raw ? JSON.parse(raw) : [];
}

function saveEventsToStorage(events) {
    localStorage.setItem('calendarEvents', JSON.stringify(events));
}

function fetchEvents() {
    return Promise.resolve(fetchEventsFromStorage());
}

function saveEvent(event) {
    const events = fetchEventsFromStorage();
    events.push(event);
    saveEventsToStorage(events);
    return Promise.resolve(event);
}

function updateEvent(id, updatedData) {
    const events = fetchEventsFromStorage();
    const index = events.findIndex(ev => ev.id === id);
    if (index !== -1) {
        events[index] = { ...events[index], ...updatedData };
        saveEventsToStorage(events);
    }
    return Promise.resolve(events[index]);
}

function deleteEvent(id) {
    const events = fetchEventsFromStorage();
    const filtered = events.filter(ev => ev.id !== id);
    saveEventsToStorage(filtered);
    return Promise.resolve(true);
}
