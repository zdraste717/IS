function toggleFilters() {
        const panel = document.getElementById('filterPanel')
        const btn = document.getElementById('toggleFiltersBtn')
      
        if (panel.classList.contains('show')) {
          panel.classList.remove('show')
          btn.style.display = 'block'
        } else {
          panel.classList.add('show')
          btn.style.display = 'none'
        }
      }
      
      // Автоматически скрывать фильтры, если клик вне фильтра
      document.addEventListener('click', function (event) {
        const panel = document.getElementById('filterPanel')
        const btn = document.getElementById('toggleFiltersBtn')
      
        if (!panel.contains(event.target) && !btn.contains(event.target)) {
          if (panel.classList.contains('show')) {
            panel.classList.remove('show')
            btn.style.display = 'block'
          }
        }
      })