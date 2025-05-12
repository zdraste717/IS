const toggleBtn = document.getElementById("toggleFiltersBtn");
  const filters = document.getElementById("filtersSection");

  toggleBtn.addEventListener("click", () => {
    filters.classList.toggle("show");
  });