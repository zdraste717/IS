document.addEventListener('DOMContentLoaded', function () {
  let selectedCard = null;
  let selectedId = null;
  let selectedType = null;

  // --- ОТКЛОНЕНИЕ ---
  document.querySelectorAll('.btn-reject').forEach(btn => {
    btn.addEventListener('click', function () {
      selectedCard = btn.closest('.card');
      selectedId = selectedCard.dataset.id;
      selectedType = selectedCard.dataset.type;

      new bootstrap.Modal(document.getElementById('confirmDeleteModal')).show();
    });
  });

  document.getElementById('confirmDeleteBtn').addEventListener('click', function () {
    sendAction('reject', 'toastRejected');
    bootstrap.Modal.getInstance(document.getElementById('confirmDeleteModal')).hide();
  });

  // --- ПРИНЯТИЕ ---
  document.querySelectorAll('.btn-accept').forEach(btn => {
    btn.addEventListener('click', function () {
      selectedCard = btn.closest('.card');
      selectedId = selectedCard.dataset.id;
      selectedType = selectedCard.dataset.type;

      new bootstrap.Modal(document.getElementById('confirmAcceptModal')).show();
    });
  });

  document.getElementById('confirmAcceptBtn').addEventListener('click', function () {
    sendAction('accept', 'toastAccepted');
    bootstrap.Modal.getInstance(document.getElementById('confirmAcceptModal')).hide();
  });

  // --- Общий запрос на обновление ---
  function sendAction(action, toastId) {
    fetch('/update_achievement/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-CSRFToken': getCookie('csrftoken')
      },
      body: `id=${selectedId}&type=${selectedType}&action=${action}`
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        selectedCard.remove();
        const toast = new bootstrap.Toast(document.getElementById(toastId));
        toast.show();
      } else {
        alert('Ошибка: ' + data.error);
      }
    })
    .catch(err => {
      console.error(err);
      alert("Произошла ошибка при отправке.");
    });
  }

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
});
