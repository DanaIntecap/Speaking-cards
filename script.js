let allQuestions = [];
let availableQuestions = [];
let remainingQuestions = [];
let currentCard = null;

fetch("questions.json")
.then(response => response.json())
.then(data => {

    allQuestions = data;

    createFilters();

    applyFilters();

})
.catch(error => {

    document.getElementById("question").innerHTML =
    "Error loading questions.json";

    console.error(error);

});

function createFilters(){

    const challenge =
    document.querySelector(".challenge-box");

    challenge.insertAdjacentHTML("afterend",`

    <div class="filters" style="
    display:grid;
    grid-template-columns:repeat(auto-fit,minmax(180px,1fr));
    gap:10px;
    margin:20px 0;">

        <select id="levelFilter">
            <option value="">All Levels</option>
        </select>

        <select id="unitFilter">
            <option value="">All Units</option>
        </select>

        <select id="topicFilter">
            <option value="">All Topics</option>
        </select>

    </div>

    <div style="margin-bottom:15px">

        <label><strong>Speech Speed:</strong></label>

        <select id="speechRate">
            <option value="1">1x Normal</option>
            <option value="0.85">0.85x Slow</option>
        </select>

    </div>

    <button class="btn-primary" onclick="resetFilters()">
        🔄 Reset Filters
    </button>

    <button class="btn-primary" onclick="toggleAnswer()">
        ✅ Show Answer
    </button>
    `);

    populateFilters();

    document.getElementById("levelFilter")
    .addEventListener("change",applyFilters);

    document.getElementById("unitFilter")
    .addEventListener("change",applyFilters);

    document.getElementById("topicFilter")
    .addEventListener("change",applyFilters);

    const card =
    document.querySelector(".card");

    card.insertAdjacentHTML("afterbegin",`

    <div id="badges"
         style="
         display:flex;
         gap:8px;
         justify-content:center;
         flex-wrap:wrap;
         margin-bottom:15px">

        <span id="levelBadge"
        style="
        background:#00205b;
        color:white;
        padding:6px 12px;
        border-radius:20px">
        Level
        </span>

        <span id="unitBadge"
        style="
        background:#008D36;
        color:white;
        padding:6px 12px;
        border-radius:20px">
        Unit
        </span>

        <span id="topicBadge"
        style="
        background:#ffed00;
        color:#00205b;
        padding:6px 12px;
        border-radius:20px">
        Topic
        </span>

    </div>

    <div id="answerBox"
    class="hidden"
    style="
    margin-top:20px;
    background:#eaffea;
    border-left:6px solid #008D36;
    padding:15px;
    border-radius:10px">
    </div>

    `);

}

function populateFilters(){

    const levels =
    [...new Set(
        allQuestions.map(q => q.Level)
    )].sort();

    const units =
    [...new Set(
        allQuestions.map(q => q.Unit)
    )].sort((a,b)=>a-b);

    const topics =
    [...new Set(
        allQuestions.map(q => q.Topic)
    )].sort();

    const level =
    document.getElementById("levelFilter");

    const unit =
    document.getElementById("unitFilter");

    const topic =
    document.getElementById("topicFilter");

    level.innerHTML =
    '<option value="">All Levels</option>';

    unit.innerHTML =
    '<option value="">All Units</option>';

    topic.innerHTML =
    '<option value="">All Topics</option>';

    levels.forEach(v=>{
        level.innerHTML +=
        `<option value="${v}">${v}</option>`;
    });

    units.forEach(v=>{
        unit.innerHTML +=
        `<option value="${v}">Unit ${v}</option>`;
    });

    topics.forEach(v=>{
        topic.innerHTML +=
        `<option value="${v}">${v}</option>`;
    });

}

function applyFilters(){

    const level =
    document.getElementById("levelFilter").value;

    const unit =
    document.getElementById("unitFilter").value;

    const topic =
    document.getElementById("topicFilter").value;

    availableQuestions =
    allQuestions.filter(q=>{

        return (
            (!level || q.Level===level) &&
            (!unit || String(q.Unit)===unit) &&
            (!topic || q.Topic===topic)
        );

    });

    remainingQuestions =
    [...availableQuestions];

    updateCounter();

}

function nextCard(){

    if(remainingQuestions.length===0){

        remainingQuestions =
        [...availableQuestions];

    }

    if(remainingQuestions.length===0){

        document.getElementById("question")
        .innerHTML =
        "No questions match the selected filters.";

        return;

    }

    const random =
    Math.floor(
        Math.random() *
        remainingQuestions.length
    );

    currentCard =
    remainingQuestions[random];

    remainingQuestions.splice(random,1);

    document.getElementById("question")
    .innerHTML =
    currentCard.Question;

    document.getElementById("topic")
    .innerHTML =
    currentCard.Topic;

    document.getElementById("levelBadge")
    .innerHTML =
    currentCard.Level;

    document.getElementById("unitBadge")
    .innerHTML =
    "Unit " + currentCard.Unit;

    document.getElementById("topicBadge")
    .innerHTML =
    currentCard.Topic;

    document.getElementById("hintBox")
    .classList.add("hidden");

    document.getElementById("answerBox")
    .classList.add("hidden");

    updateCounter();

}

function toggleHint(){

    if(!currentCard)return;

    const hint =
    document.getElementById("hintBox");

    hint.innerHTML =
    currentCard.Hint
    ?
    "<strong>Hint:</strong><br><br>" +
    currentCard.Hint
    :
    "<strong>No hint available.</strong>";

    hint.classList.toggle("hidden");

}

function toggleAnswer(){

    if(!currentCard)return;

    const answer =
    document.getElementById("answerBox");

    answer.innerHTML =
    currentCard.Answer
    ?
    "<strong>Sample Answer:</strong><br><br>" +
    currentCard.Answer
    :
    "<strong>No sample answer available.</strong>";

    answer.classList.toggle("hidden");

}

function playQuestion(){

    if(!currentCard)return;

    speechSynthesis.cancel();

    const msg =
    new SpeechSynthesisUtterance(
        currentCard.Question
    );

    msg.lang = "en-US";

    const selector =
    document.getElementById("speechRate");

    msg.rate =
    selector
    ?
    Number(selector.value)
    :
    0.95;

    speechSynthesis.speak(msg);

}

function resetFilters(){

    document.getElementById("levelFilter").value="";
    document.getElementById("unitFilter").value="";
    document.getElementById("topicFilter").value="";

    applyFilters();

}

function updateCounter(){

    document.getElementById("counter")
    .innerHTML =

    "Filtered Questions: " +
    availableQuestions.length +

    "<br><br>Cards Remaining: " +
    remainingQuestions.length;

}
