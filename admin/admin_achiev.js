const toggleBtn = document.getElementById("toggleFiltersBtn");
const filters = document.getElementById("filtersSection");

toggleBtn.addEventListener("click", () => {
  filters.classList.toggle("show");
});

document.addEventListener('DOMContentLoaded', function () {
  let selectedCard = null;
  let achievementId = null;
  let achievementType = null;
  let currentModal = null;

  // --- УДАЛЕНИЕ ---
  document.querySelectorAll('.btn-outline-danger').forEach(btn => {
    btn.addEventListener('click', function () {
      const card = btn.closest('.card');
      selectedCard = card;
      achievementId = card.dataset.id;
      achievementType = card.dataset.type;
      const modal = new bootstrap.Modal(document.getElementById('confirmDeleteModal'));
      modal.show();
    });
  });

  document.getElementById('confirmDeleteBtn').addEventListener('click', function () {
    if (!achievementId || !achievementType) return;

    fetch('/update_achievement/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-CSRFToken': getCookie('csrftoken')
      },
      body: `id=${achievementId}&type=${achievementType}&action=reject`
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        selectedCard.remove();
        const modalEl = document.getElementById('confirmDeleteModal');
        bootstrap.Modal.getInstance(modalEl).hide();
        const toast = new bootstrap.Toast(document.getElementById('toastDeleted'));
        toast.show();
      } else {
        alert("Ошибка при удалении: " + data.error);
      }
    })
    .catch(err => {
      console.error(err);
      alert("Ошибка при отправке запроса.");
    });
  });

  // --- РЕДАКТИРОВАНИЕ ---
  document.querySelectorAll('.btn-edit').forEach(btn => {
    btn.addEventListener('click', () => {
      const modal = btn.closest('.modal');
      currentModal = modal;
      const card = document.querySelector(`[data-bs-target="#${modal.id}"]`)?.closest('.card');
      achievementId = card?.dataset.id;
      achievementType = card?.dataset.type;

      modal.querySelectorAll('.editable-field').forEach(field => {
        field.querySelector('.field-static').classList.add('d-none');
        field.querySelector('.field-edit').classList.remove('d-none');
      });

      btn.classList.add('d-none');
      modal.querySelector('.edit-actions').classList.remove('d-none');
      modal.querySelector('.btn-close-modal').classList.add('d-none');
    });
  });

  document.querySelectorAll('.btn-cancel').forEach(btn => {
    btn.addEventListener('click', () => {
      const modal = btn.closest('.modal');

      modal.querySelectorAll('.editable-field').forEach(field => {
        field.querySelector('.field-static').classList.remove('d-none');
        field.querySelector('.field-edit').classList.add('d-none');
      });

      modal.querySelector('.btn-edit').classList.remove('d-none');
      modal.querySelector('.edit-actions').classList.add('d-none');
      modal.querySelector('.btn-close-modal').classList.remove('d-none');
    });
  });

  document.querySelectorAll('.btn-save').forEach(btn => {
    btn.addEventListener('click', () => {
      currentModal = btn.closest('.modal');
      new bootstrap.Modal(document.getElementById('confirmEditModal')).show();
    });
  });

  document.getElementById('confirmSaveBtn').addEventListener('click', () => {
  if (!currentModal || !achievementId || !achievementType) return;

  const inputs = currentModal.querySelectorAll('.field-edit input');
  const formData = new URLSearchParams();

  inputs.forEach(input => {
    formData.append(input.name, input.value);
  });

  formData.append('id', achievementId);
  formData.append('type', achievementType);
  formData.append('action', 'edit');

  fetch('/update_achievement/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-CSRFToken': getCookie('csrftoken')
    },
    body: formData.toString()
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      currentModal.querySelectorAll('.editable-field').forEach(field => {
        const input = field.querySelector('.field-edit input');
        const p = field.querySelector('.field-static');
        const label = field.querySelector('label'); 

        if (input && p) {
          const labelText = label ? label.textContent : input.name;
          const valueText = input.value;
          p.innerHTML = `<strong>${labelText}:</strong> ${valueText}`;
        }

        field.querySelector('.field-static').classList.remove('d-none');
        field.querySelector('.field-edit').classList.add('d-none');
      });

      currentModal.querySelector('.btn-edit').classList.remove('d-none');
      currentModal.querySelector('.edit-actions').classList.add('d-none');
      currentModal.querySelector('.btn-close-modal').classList.remove('d-none');

      bootstrap.Modal.getInstance(document.getElementById('confirmEditModal')).hide();
      const toast = new bootstrap.Toast(document.getElementById('toastEdited'));
      toast.show();
    } else {
      alert("Ошибка при сохранении: " + data.error);
    }
  })
  .catch(err => {
    console.error(err);
    alert("Ошибка при отправке запроса.");
  });
});


  function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.substring(0, name.length + 1) === (name + '=')) {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  }

    // --- СБРОС МОДАЛКИ ПРИ ОТКРЫТИИ ---
  document.querySelectorAll('.modal').forEach(modalEl => {
    modalEl.addEventListener('show.bs.modal', () => {
      // Сброс режима редактирования
      modalEl.querySelectorAll('.editable-field').forEach(field => {
        field.querySelector('.field-static')?.classList.remove('d-none');
        field.querySelector('.field-edit')?.classList.add('d-none');
      });

      modalEl.querySelector('.btn-edit')?.classList.remove('d-none');
      modalEl.querySelector('.edit-actions')?.classList.add('d-none');
      modalEl.querySelector('.btn-close-modal')?.classList.remove('d-none');
    });
  });

});

document.getElementById('addAchiev').addEventListener('click', function () {
  const modal = new bootstrap.Modal(document.getElementById('applicationModal'));
  modal.show();
});

const applicationModal = document.getElementById('applicationModal');

  applicationModal.addEventListener('show.bs.modal', function () {
    const form = document.getElementById('applicationForm');
    form.reset(); // очищает все поля ввода
  });

 function handleTypeChange() {
    const type = document.getElementById('achievementType').value;

    const blocks = {
        science: document.getElementById('scienceFields'),
        sport: document.getElementById('sportFields'),
        creative: document.getElementById('creativeFields'),
        various: document.getElementById('variousFields'),
        public: document.getElementById('publicFields'),
        government: document.getElementById('governmentFields'),
        other: document.getElementById('otherFields'),
        addprogramm: document.getElementById('addFields'),
        experience: document.getElementById('experienceFields'),
    };

    // Скрыть и отключить все поля
    Object.values(blocks).forEach(block => {
        block.classList.add('d-none');
        block.querySelectorAll('input, select, textarea').forEach(field => {
            field.disabled = true;
        });
    });

    // Показать и включить нужные поля
    if (type && blocks[type]) {
        const currentBlock = blocks[type];
        currentBlock.classList.remove('d-none');
        currentBlock.querySelectorAll('input, select, textarea').forEach(field => {
            field.disabled = false;
        });

        // Активировать отдельно поля ФИО, группа и факультет, если они есть
        ['lastname', 'firstname', 'middlename', 'group_s', 'faculty'].forEach(id => {
            const input = currentBlock.querySelector(`#${id}`);
            if (input) input.disabled = false;
        });
    }
}


document.getElementById('applicationForm').addEventListener('submit', function (e) {
  e.preventDefault(); // Остановить обычную отправку

  const form = e.target;
  const formData = new FormData(form);
  const selectedType = form.querySelector('[name="achievementType"]').value;
  formData.append('achievementType', selectedType);
    // Добавляем ФИО в одну строку, если админ
  const isAdmin = form.dataset.isAdmin === "1";
  if (isAdmin) {
    const last = form.querySelector('[name="lastname"]')?.value?.trim() || "";
    const first = form.querySelector('[name="firstname"]')?.value?.trim() || "";
    const middle = form.querySelector('[name="middlename"]')?.value?.trim() || "";
    const fullName = `${last} ${first} ${middle}`.trim();

    formData.append('lastname', last);
    formData.append('firstname', first);
    formData.append('middlename', middle);
    formData.append('fullname', fullName);

  }

  const url = form.action;

  fetch(url, {
    method: 'POST',
    headers: {
      'X-CSRFToken': form.querySelector('[name=csrfmiddlewaretoken]').value
    },
    body: formData
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      // Показываем Bootstrap Toast
      const toast = new bootstrap.Toast(document.getElementById('toastSuccess'));
      
      const query = new URLSearchParams(window.location.search).toString();
      window.location.href = window.location.pathname + (query ? `?${query}` : '');
      toast.show();
      //bootstrap.Modal.getInstance(document.getElementById('applicationModal')).hide();
    } else {
      alert("Ошибка: " + (data.error || "Неизвестная"));
    }
  })
  .catch(error => {
    console.error('Ошибка:', error);
    alert("Произошла ошибка при отправке формы.");
  });
});

function setReportFormat(format) {
  document.getElementById('reportFormat').value = format;

  const form = document.getElementById('reportForm');
  if (format === 'docx') {
  form.action = '/generate_report/';  
  } else if (format === 'excel') {
    form.action = '/generate_report_excel/';
  }
}

document.getElementById('reportForm').addEventListener('submit', function(e) {
  const achievements = [];

  document.querySelectorAll('.modal').forEach(modal => {
    const modalBody = modal.querySelector('.modal-body');
    if (!modalBody) return;

    const type = modal.dataset.type || '';
    const fullnameEl = modalBody.querySelector('p strong');
    let fullname = '';
    if (fullnameEl) {
      const text = fullnameEl.parentElement.textContent || '';
      fullname = text.replace('ФИО:', '').trim();
    }

    const content = Array.from(modalBody.querySelectorAll('p'))
      .map(p => p.textContent.trim())
      .filter(text => text.length > 0);

    achievements.push({
      type: type,
      fullname: fullname,
      content: content
    });
  });

  document.getElementById('reportData').value = JSON.stringify(achievements);
});


