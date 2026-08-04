<script>
let allQuestions = [];
let availableQuestions = [];
let remainingQuestions = [];
let currentCard = null;

fetch("questions.json")
    .then(r => r.json())
    .then(data => {
        allQuestions = data;
        loadFilters();
        applyFilters();
    });

function loadFilters() {
    const levels = [...new Set(allQuestions.map(x => x.Level))];
    const units = [...new Set(allQuestions.map(x => x.Unit))];
    
    levels.forEach(v => levelFilter.innerHTML += `<option value="${v}">${v}</option>`);
    units.forEach(v => unitFilter.innerHTML += `<option value="${v}">Unit ${v}</option>`);
    
    // Escuchar cambios
    levelFilter.addEventListener("change", applyFilters);
    unitFilter.addEventListener("change", applyFilters);
    setFilter.addEventListener("change", applyFilters);
}

// NUEVA FUNCIÓN: Actualiza el menú de Sets dinámicamente
function updateSetDropdown() {
    // Guardamos la selección actual del estudiante por si sigue siendo válida
    let currentSelection = setFilter.value;
    
    // Filtramos temporalmente solo por Nivel y Unidad
    let filteredByLevelAndUnit = allQuestions.filter(q => {
        return (!levelFilter.value || q.Level === levelFilter.value) &&
               (!unitFilter.value || String(q.Unit) === unitFilter.value);
    });

    // Extraemos solo las etiquetas de esas preguntas filtradas
    let validSets = new Set();
    filteredByLevelAndUnit.forEach(q => {
        if(q.Tag) { 
            let tagsArray = q.Tag.split(';').map(tag => tag.trim()); // Leemos el punto y coma de tu CSV
            tagsArray.forEach(tag => validSets.add(tag));
        }
    });
    
    const sets = [...validSets].sort();

    // Reconstruimos el menú desplegable desde cero
    setFilter.innerHTML = '<option value="">All Sets (Temas)</option>';
    sets.forEach(v => setFilter.innerHTML += `<option value="${v}">${v}</option>`);
    
    // Si la opción que tenía seleccionada el estudiante aún existe, la mantenemos
    if (sets.includes(currentSelection)) {
        setFilter.value = currentSelection;
    }
}

function applyFilters() {
    // 1. Primero actualizamos las opciones del menú de Sets
    updateSetDropdown();

    // 2. Luego aplicamos el filtro real a las preguntas
    availableQuestions = allQuestions.filter(q => {
        let qTags = q.Tag ? q.Tag.split(';').map(t => t.trim()) : [];
        
        return (!levelFilter.value || q.Level === levelFilter.value) &&
               (!unitFilter.value || String(q.Unit) === unitFilter.value) &&
               (!setFilter.value || qTags.includes(setFilter.value));
    });

    remainingQuestions = [...availableQuestions];
    updateCounter();
}

function nextCard() {
    if(remainingQuestions.length === 0) {
        remainingQuestions = [...availableQuestions];
    }

    if(remainingQuestions.length === 0) {
        question.innerHTML = "No questions match selected filters.";
        return;
    }

    const index = Math.floor(Math.random() * remainingQuestions.length);
    currentCard = remainingQuestions[index];
    remainingQuestions.splice(index, 1);

    question.innerHTML = currentCard.Question;
    levelBadge.innerHTML = currentCard.Level;
    unitBadge.innerHTML = "Unit " + currentCard.Unit;
    
    let cardTags = currentCard.Tag ? currentCard.Tag.split(';').map(t => t.trim()) : ["No Set"];
    setBadge.innerHTML = cardTags[0]; 

    hintBox.classList.add("hidden");
    answerBox.classList.add("hidden");

    updateCounter();
}

function toggleHint() {
    if(!currentCard) return;
    hintBox.innerHTML = currentCard.Hint
        ? "<strong>Hint:</strong><br><br>" + currentCard.Hint
        : "<strong>No hint available.</strong>";
    hintBox.classList.toggle("hidden");
}

function toggleAnswer() {
    if(!currentCard) return;
    answerBox.innerHTML = currentCard.Answer
        ? "<strong>Sample Answer:</strong><br><br>" + currentCard.Answer
        : "<strong>No sample answer available.</strong>";
    answerBox.classList.toggle("hidden");
}

function playQuestion() {
    if(!currentCard) return;
    speechSynthesis.cancel();
    const msg = new SpeechSynthesisUtterance(currentCard.Question);
    msg.lang = "en-US";
    msg.rate = Number(speechRate.value);
    speechSynthesis.speak(msg);
}

function resetFilters() {
    levelFilter.value = "";
    unitFilter.value = "";
    setFilter.value = ""; 
    applyFilters();
}

function updateCounter() {
    counter.innerHTML = "Filtered Questions: " + availableQuestions.length + "<br><br>Cards Remaining: " + remainingQuestions.length;
}
</script>
