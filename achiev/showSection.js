console.log("✅ JS подключен");

function showSection(id) {
    // Скрыть все секции
    const sections = document.querySelectorAll('.achievement-section');
    sections.forEach(section => section.classList.add('d-none'));

    // Показать выбранную
    const selected = document.getElementById(id);
    selected.classList.remove('d-none');

    // Скролл к секции
    selected.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

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
        blocks[type].classList.remove('d-none');
        blocks[type].querySelectorAll('input, select, textarea').forEach(field => {
            field.disabled = false;
        });
    }
}

//Уведомление об отправке заявки
document.getElementById('applicationForm').addEventListener('submit', function (e) {
  e.preventDefault(); // Остановить обычную отправку

  const form = e.target;
  const formData = new FormData(form);
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
      toast.show();

      form.reset(); // Сбросить форму
    } else {
      alert("Ошибка: " + (data.error || "Неизвестная"));
    }
  })
  .catch(error => {
    console.error('Ошибка:', error);
    alert("Произошла ошибка при отправке формы.");
  });
});


