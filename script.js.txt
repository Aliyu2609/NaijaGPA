(() => {
  const STORAGE_KEY = 'naijagpa_data_v1';
  const SCALE_KEY = 'naijagpa_scale_v1';

  const coursesArea = document.getElementById('coursesArea');
  const addCourseBtn = document.getElementById('addCourseBtn');
  const calcBtn = document.getElementById('calcBtn');
  const saveSemBtn = document.getElementById('saveSemBtn');
  const resetBtn = document.getElementById('resetBtn');
  const semesterNameEl = document.getElementById('semesterName');
  const semesterGPAEl = document.getElementById('semesterGPA');
  const totalCreditsEl = document.getElementById('totalCredits');
  const resultCard = document.getElementById('resultCard');
  const semList = document.getElementById('semList');
  const cgpaValue = document.getElementById('cgpaValue');
  const cgpaDetails = document.getElementById('cgpaDetails');
  const exportBtn = document.getElementById('exportBtn');
  const importBtn = document.getElementById('importBtn');
  const importFile = document.getElementById('importFile');
  const clearAllBtn = document.getElementById('clearAllBtn');
  const searchSem = document.getElementById('searchSem');
  const gradingScaleSelect = document.getElementById('gradingScale');
  const customScaleRow = document.getElementById('customScaleRow');
  const customScaleValues = document.getElementById('customScaleValues');
  const gradesPieCanvas = document.getElementById('gradesPie');
  const gpaTrendCanvas = document.getElementById('gpaTrendChart');

  let courseCounter = 0;
  let semesters = loadSemesters();
  let gradeOptions = loadGradeOptions();
  let gradesPieChart, gpaTrendChart;

  init();

  function init() {
    addCourse();
    renderSemesters();
    updateCGPA();
    renderGpaTrendChart();

    gradingScaleSelect.value = localStorage.getItem(SCALE_KEY) || '5';
    handleScaleChange();
  }

  gradingScaleSelect.addEventListener('change', handleScaleChange);
  addCourseBtn.addEventListener('click', addCourse);
  calcBtn.addEventListener('click', calculateAndShow);
  saveSemBtn.addEventListener('click', saveSemester);
  resetBtn.addEventListener('click', resetForm);
  exportBtn.addEventListener('click', exportJSON);
  importBtn.addEventListener('click', () => importFile.click());
  importFile.addEventListener('change', handleImport);
  clearAllBtn.addEventListener('click', clearAll);
  searchSem.addEventListener('input', () => renderSemesters(searchSem.value.trim().toLowerCase()));

  function handleScaleChange() {
    const val = gradingScaleSelect.value;
    localStorage.setItem(SCALE_KEY, val);
    if (val === 'custom') {
      customScaleRow.style.display = 'flex';
      const raw = customScaleValues.value.trim();
      if (raw) gradeOptions = parseCustomScale(raw);
    } else {
      customScaleRow.style.display = 'none';
      gradeOptions = defaultScale(val);
    }
    updateCourseDropdowns();
  }

  customScaleValues.addEventListener('input', () => {
    if (gradingScaleSelect.value === 'custom') {
      gradeOptions = parseCustomScale(customScaleValues.value.trim());
      updateCourseDropdowns();
    }
  });

  function parseCustomScale(str) {
    const vals = str.split(',').map(v => parseFloat(v.trim()) || 0);
    const letters = ['A','B','C','D','E','F'];
    return letters.map((l, i) => ({ label: `${l} (${vals[i] ?? 0})`, value: vals[i] ?? 0 }));
  }

  function defaultScale(max) {
    if (max === '4') {
      return [
        {label:'A (4)', value:4},
        {label:'B (3)', value:3},
        {label:'C (2)', value:2},
        {label:'D (1)', value:1},
        {label:'F (0)', value:0}
      ];
    }
    return [
      {label:'A (5)', value:5},
      {label:'B (4)', value:4},
      {label:'C (3)', value:3},
      {label:'D (2)', value:2},
      {label:'E (1)', value:1},
      {label:'F (0)', value:0}
    ];
  }

  function updateCourseDropdowns() {
    const selects = coursesArea.querySelectorAll('select');
    selects.forEach(sel => {
      sel.innerHTML = '';
      gradeOptions.forEach(opt => {
        const o = document.createElement('option');
        o.value = opt.value;
        o.textContent = opt.label;
        sel.appendChild(o);
      });
    });
  }

  function addCourse() {
    courseCounter++;
    const row = document.createElement('div');
    row.className = 'course-row';
    row.dataset.id = courseCounter;

    const title = document.createElement('input');
    title.type = 'text';
    title.placeholder = 'Course title';

    const creditInput = document.createElement('input');
    creditInput.type = 'number';
    creditInput.min = '0';
    creditInput.placeholder = 'Credits';

    const select = document.createElement('select');
    gradeOptions.forEach(opt => {
      const o = document.createElement('option');
      o.value = opt.value;
      o.textContent = opt.label;
      select.appendChild(o);
    });

    const removeBtn = document.createElement('button');
    removeBtn.className = 'btn ghost';
    removeBtn.innerHTML = '✕';
    removeBtn.onclick = () => row.remove();

    row.append(title, creditInput, select, removeBtn);
    coursesArea.appendChild(row);
  }

  function getCourseDataFromUI() {
    return Array.from(coursesArea.querySelectorAll('.course-row')).map(r => {
      const inputs = r.querySelectorAll('input, select');
      return {
        title: inputs[0].value.trim(),
        credit: parseFloat(inputs[1].value) || 0,
        point: parseFloat(inputs[2].value) || 0
      };
    }).filter(c => c.credit > 0);
  }

  function calculateGPA(courses) {
    let totalPoints = 0, totalCredits = 0;
    courses.forEach(c => {
      totalPoints += c.credit * c.point;
      totalCredits += c.credit;
    });
    return {
      gpa: totalCredits === 0 ? 0 : totalPoints / totalCredits,
      totalCredits,
      totalPoints
    };
  }

  function calculateAndShow() {
    const courses = getCourseDataFromUI();
    if (!courses.length) return alert('Add courses first.');
    const { gpa, totalCredits } = calculateGPA(courses);
    semesterGPAEl.textContent = gpa.toFixed(2);
    totalCreditsEl.textContent = totalCredits;
    resultCard.hidden = false;
    saveSemBtn.disabled = false;
    renderGradesPie(courses);
  }

  function saveSemester() {
    const name = semesterNameEl.value || `Semester ${semesters.length+1}`;
    const courses = getCourseDataFromUI();
    const { gpa, totalCredits, totalPoints } = calculateGPA(courses);
    semesters.unshift({ id: Date.now(), name, courses, meta:{ gpa, totalCredits, totalPoints } });
    persistSemesters();
    renderSemesters();
    updateCGPA();
    renderGpaTrendChart();
    resetForm();
  }

  function resetForm() {
    coursesArea.innerHTML = '';
    courseCounter = 0;
    addCourse();
    semesterNameEl.value = '';
    resultCard.hidden = true;
    saveSemBtn.disabled = true;
    if (gradesPieChart) gradesPieChart.destroy();
  }

  function renderSemesters(filter='') {
    semList.innerHTML = '';
    semesters.filter(s => s.name.toLowerCase().includes(filter)).forEach(s => {
      const li = document.createElement('li');
      li.className = 'sem-item';
      li.innerHTML = `<div><strong>${s.name}</strong><div class="sem-small">${s.meta.gpa.toFixed(2)} GPA • ${s.meta.totalCredits} credits</div></div>`;
      semList.appendChild(li);
    });
  }

  function updateCGPA() {
    if (!semesters.length) return;
    let totPoints = 0, totCredits = 0;
    semesters.forEach(s => {
      totPoints += s.meta.totalPoints;
      totCredits += s.meta.totalCredits;
    });
    const cgpa = totPoints / totCredits;
    cgpaValue.textContent = `CGPA ${cgpa.toFixed(2)}`;
    cgpaDetails.textContent = `${semesters.length} semesters`;
  }

  function renderGradesPie(courses) {
    if (gradesPieChart) gradesPieChart.destroy();
    const labels = gradeOptions.map(g => g.label);
    const counts = Array(gradeOptions.length).fill(0);
    courses.forEach(c => {
      const idx = gradeOptions.findIndex(g => g.value === c.point);
      if (idx >= 0) counts[idx] += 1;
    });
    gradesPieChart = new Chart(gradesPieCanvas, {
      type: 'pie',
      data: {
        labels,
        datasets: [{
          data: counts,
          backgroundColor: ['#16a34a','#3b82f6','#facc15','#f97316','#ef4444','#6b7280']
        }]
      }
    });
  }

  function renderGpaTrendChart() {
    if (gpaTrendChart) gpaTrendChart.destroy();
    const labels = semesters.map(s => s.name).reverse();
    const data = semesters.map(s => s.meta.gpa).reverse();
    gpaTrendChart = new Chart(gpaTrendCanvas, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Semester GPA',
          data,
          fill: false,
          borderColor: '#ff7a18',
          tension: 0.2
        }]
      }
    });
  }

  function persistSemesters() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(semesters));
  }

  function loadSemesters() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  }

  function loadGradeOptions() {
    const savedScale = localStorage.getItem(SCALE_KEY) || '5';
    return savedScale === 'custom' ? defaultScale('5') : defaultScale(savedScale);
  }

  function exportJSON() {
    const blob = new Blob([JSON.stringify(semesters,null,2)],{type:'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'naijagpa.json';
    a.click();
  }

  function handleImport(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const data = JSON.parse(ev.target.result);
        if (Array.isArray(data)) {
          semesters = data;
          persistSemesters();
          renderSemesters();
          updateCGPA();
          renderGpaTrendChart();
        }
      } catch { alert('Invalid file'); }
    };
    reader.readAsText(file);
  }

  function clearAll() {
    if (confirm('Clear all semesters?')) {
      semesters = [];
      persistSemesters();
      renderSemesters();
      updateCGPA();
      renderGpaTrendChart();
    }
  }
})();
