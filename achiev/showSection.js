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

