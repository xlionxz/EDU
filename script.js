/* EDEDEDI — Main Application Script */

// ==========================================
// COMMON WORD LIST (for spell checking)
// ==========================================
const commonWords=new Set(["the","be","to","of","and","a","in","that","have","i","it","for","not","on","with","he","as","you","do","at","this","but","his","by","from","they","we","her","she","or","an","will","my","one","all","would","there","their","what","so","up","out","if","about","who","get","which","go","me","when","make","can","like","time","no","just","him","know","take","people","into","year","your","good","some","could","them","see","other","than","then","now","look","only","come","its","over","think","also","back","after","use","two","how","our","work","first","well","way","even","new","want","because","any","these","give","day","most","us","great","big","should","still","every","must","between","each","much","own","too","life","old","right","being","long","very","same","before","more","many","school","need","through","world","read","write","story","word","while","last","found","still","place","thing","where","help","home","here","why","may","away","again","off","went","both","down","tell","does","set","three","small","end","put","hand","high","keep","house","head","room","against","side","turn","might","under","start","city","part","once","night","until","never","above","few","change","around","point","form","show","play","move","live","letter","air","line","water","open","left","seem","state","run","close","name","used","call","kind","learn","during","best","begin","try","hold","question","early","real","far","without","second","hard","near","children","light","along","often","walk","young","add","food","stop","answer","study","grow","across","country","always","such","upon","four","white","together","important","family","face","car","enough","body","complete","girl","stand","miss","hold","gone","several","plan","quite","model","less","money","course","since","next","later","thought","among","half","morning","paper","group","often","number","already","program","sure","believe","question","minutes","better","however","develop","interest","certain","power","written","understand","whether","system","although","general","problem","possible","given","human","social","english","language","example","within","result","student","level","practice","rather","order","different","include","special","nothing","support","provide","today","clear","another","class","able","toward","sense","state","area","consider","experience","table","effort","became","whole","nature","perhaps","purpose","therefore","subject","common","million","building","condition","various","reason","almost","hundred","value","similar","increase","record","require","report","strong","effect","produce","public","evidence","either","recent","century","personal"]);

// ==========================================
// ACHIEVEMENTS
// ==========================================
const achievementsDef=[
{id:"first_quiz",icon:"🎯",name:"First Steps",desc:"Complete your first quiz",condition:s=>s.totalQuizzes>=1},
{id:"five_quizzes",icon:"📚",name:"Bookworm",desc:"Complete 5 quizzes",condition:s=>s.totalQuizzes>=5},
{id:"ten_quizzes",icon:"🎓",name:"Scholar",desc:"Complete 10 quizzes",condition:s=>s.totalQuizzes>=10},
{id:"perfect_score",icon:"💎",name:"Perfectionist",desc:"Score 100% on any quiz",condition:s=>s.hasPerfect},
{id:"english_master",icon:"📖",name:"Wordsmith",desc:"Complete 3 English quizzes",condition:s=>s.englishCount>=3},
{id:"math_master",icon:"🔢",name:"Mathematician",desc:"Complete 3 Math quizzes",condition:s=>s.mathCount>=3},
{id:"streak_3",icon:"🔥",name:"On Fire",desc:"Reach a 3-day streak",condition:s=>s.streak>=3},
{id:"xp_500",icon:"⭐",name:"Rising Star",desc:"Earn 500 XP",condition:s=>s.xp>=500},
{id:"writer",icon:"✍️",name:"Author",desc:"Complete a writing task",condition:s=>s.writingCount>=1},
{id:"all_levels",icon:"🌟",name:"Well-Rounded",desc:"Complete quizzes at all difficulty levels",condition:s=>s.diffLevels>=4}
];

// ==========================================
// STATE
// ==========================================
const STORAGE_KEY="edededi_data";
function getDefaultState(){return{history:[],streak:0,lastActiveDate:null,settings:{dailyReminder:true,achievementAlerts:true,showCorrectAnswer:true,soundEffects:false}};}
function loadState(){try{const r=localStorage.getItem(STORAGE_KEY);if(r)return{...getDefaultState(),...JSON.parse(r)};}catch(e){}return getDefaultState();}
function saveState(s){localStorage.setItem(STORAGE_KEY,JSON.stringify(s));}
let appState=loadState();

// ==========================================
// DERIVED STATS
// ==========================================
function getStats(){
const h=appState.history;
const totalQuizzes=h.length;
const totalCorrect=h.reduce((a,r)=>a+(r.correct||0),0);
const totalQuestions=h.reduce((a,r)=>a+(r.total||0),0);
const englishCount=h.filter(r=>r.subject==="english").length;
const mathCount=h.filter(r=>r.subject==="math").length;
const writingCount=h.filter(r=>r.type==="writing").length;
const hasPerfect=h.some(r=>r.correct===r.total&&r.total>0);
const avgAccuracy=totalQuestions>0?Math.round((totalCorrect/totalQuestions)*100):0;
const xp=h.reduce((a,r)=>a+(r.xp||0),0);
const bestEnglish=h.filter(r=>r.subject==="english"&&r.percentage).reduce((b,r)=>r.percentage>b?r.percentage:b,0);
const bestMath=h.filter(r=>r.subject==="math"&&r.percentage).reduce((b,r)=>r.percentage>b?r.percentage:b,0);
const diffLevels=new Set(h.map(r=>r.difficulty)).size;
return{totalQuizzes,totalCorrect,totalQuestions,englishCount,mathCount,writingCount,hasPerfect,avgAccuracy,xp,bestEnglish,bestMath,streak:appState.streak,diffLevels};
}

function updateStreak(){
const today=new Date().toISOString().slice(0,10);
if(appState.lastActiveDate===today)return;
const yesterday=new Date(Date.now()-86400000).toISOString().slice(0,10);
if(appState.lastActiveDate===yesterday)appState.streak+=1;
else if(appState.lastActiveDate!==today)appState.streak=1;
appState.lastActiveDate=today;
saveState(appState);
}

// ==========================================
// SPA ROUTER
// ==========================================
const navItems=document.querySelectorAll(".nav-item[data-view]");
const views=document.querySelectorAll(".view");

function navigateTo(viewId){
views.forEach(v=>v.classList.remove("active"));
navItems.forEach(n=>n.classList.remove("active"));
const target=document.getElementById("view-"+viewId);
const nav=document.querySelector('.nav-item[data-view="'+viewId+'"]');
if(target)target.classList.add("active");
if(nav)nav.classList.add("active");
document.getElementById("sidebar").classList.remove("open");
document.getElementById("sidebarOverlay").classList.remove("show");
if(viewId==="dashboard")refreshDashboard();
if(viewId==="daily-tasks")renderDailyTasks();
if(viewId==="task-history")renderHistory();
if(viewId==="profile")renderProfile();
if(viewId==="achievements")renderAchievements();
if(viewId==="settings")refreshSettings();
}
function showView(viewId){
views.forEach(v=>v.classList.remove("active"));
navItems.forEach(n=>n.classList.remove("active"));
const t=document.getElementById("view-"+viewId);
if(t)t.classList.add("active");
}

navItems.forEach(item=>{item.addEventListener("click",e=>{e.preventDefault();navigateTo(item.dataset.view);});});

// Mobile sidebar
document.getElementById("mobileToggle").addEventListener("click",()=>{document.getElementById("sidebar").classList.toggle("open");document.getElementById("sidebarOverlay").classList.toggle("show");});
document.getElementById("sidebarOverlay").addEventListener("click",()=>{document.getElementById("sidebar").classList.remove("open");document.getElementById("sidebarOverlay").classList.remove("show");});

// ==========================================
// DASHBOARD
// ==========================================
function refreshDashboard(){
const stats=getStats();const now=new Date();
document.getElementById("current-day").textContent=now.getDate();
document.getElementById("current-month-year").textContent=now.toLocaleDateString("en-US",{month:"long",year:"numeric"});
document.getElementById("stat-total-quizzes").textContent=stats.totalQuizzes;
document.getElementById("stat-total-correct").textContent=stats.totalCorrect;
document.getElementById("stat-streak").textContent=stats.streak;
document.getElementById("stat-xp").textContent=stats.xp;
updateRing("ring-english","ring-english-text",stats.bestEnglish);
updateRing("ring-math","ring-math-text",stats.bestMath);
}
function updateRing(cId,tId,pct){
const c=document.getElementById(cId),t=document.getElementById(tId);
const circ=2*Math.PI*22;
c.style.strokeDashoffset=circ-(pct/100)*circ;
t.textContent=pct+"%";
}

// Subject card clicks → difficulty selector
document.getElementById("subject-english").addEventListener("click",()=>showDifficultySelector("english"));
document.getElementById("subject-math").addEventListener("click",()=>showDifficultySelector("math"));

// ==========================================
// DIFFICULTY SELECTOR
// ==========================================
let selectedSubject=null;
let selectedType="grammar";
let selectedDifficulty=null;

function showDifficultySelector(subject){
selectedSubject=subject;
selectedType=subject==="english"?"grammar":"quiz";
document.getElementById("diff-subject-title").textContent=(subject==="english"?"English":"Mathematics")+" — Choose Your Level";
const tabs=document.getElementById("quiz-type-tabs");
tabs.style.display=subject==="english"?"flex":"none";
// Reset tabs
document.querySelectorAll(".quiz-type-tab").forEach(t=>{t.classList.remove("active");if(t.dataset.type==="grammar")t.classList.add("active");});
showView("difficulty");
}

document.getElementById("diff-back-btn").addEventListener("click",()=>navigateTo("dashboard"));

// Quiz type tabs
document.querySelectorAll(".quiz-type-tab").forEach(tab=>{
tab.addEventListener("click",()=>{
document.querySelectorAll(".quiz-type-tab").forEach(t=>t.classList.remove("active"));
tab.classList.add("active");
selectedType=tab.dataset.type;
});
});

// Difficulty cards
document.querySelectorAll(".difficulty-card").forEach(card=>{
card.addEventListener("click",()=>{
selectedDifficulty=card.dataset.diff;
if(selectedSubject==="english"&&selectedType==="reading")startReading();
else if(selectedSubject==="english"&&selectedType==="writing")startWriting();
else startMCQQuiz();
});
});

// ==========================================
// MCQ QUIZ ENGINE
// ==========================================
let currentQuiz={subject:null,questions:[],currentIndex:0,answers:[],selectedOption:null};

function startMCQQuiz(){
let questions;
if(selectedSubject==="english")questions=[...quizData.english.grammar[selectedDifficulty]];
else questions=[...quizData.math[selectedDifficulty]];
currentQuiz={subject:selectedSubject,questions,currentIndex:0,answers:[],selectedOption:null};
const label=selectedSubject==="english"?"English Grammar":"Mathematics";
const diffLabel=selectedDifficulty.charAt(0).toUpperCase()+selectedDifficulty.slice(1);
document.getElementById("quiz-subject-title").textContent=label+" — "+diffLabel;
document.getElementById("quiz-subject-subtitle").textContent="Answer all questions to complete the quiz";
document.getElementById("quiz-progress-fill").className="quiz-progress-fill "+(selectedSubject==="english"?"english":"math");
showView("quiz");
renderQuestion();
}

function renderQuestion(){
const q=currentQuiz.questions[currentQuiz.currentIndex];
const idx=currentQuiz.currentIndex,total=currentQuiz.questions.length;
const pct=Math.round(((idx+1)/total)*100);
document.getElementById("quiz-progress-label").textContent="Question "+(idx+1)+" of "+total;
document.getElementById("quiz-progress-pct").textContent=pct+"%";
document.getElementById("quiz-progress-fill").style.width=pct+"%";
const letters=["A","B","C","D"];
document.getElementById("quiz-body").innerHTML=
'<div class="quiz-question-card"><div class="quiz-question-number">Question '+(idx+1)+'</div><div class="quiz-question-text">'+q.question+'</div><div class="quiz-options">'+
q.options.map((opt,i)=>'<div class="quiz-option" data-index="'+i+'" id="quiz-opt-'+i+'"><span class="option-letter">'+letters[i]+'</span><span>'+opt+'</span></div>').join("")+
'</div></div><div class="quiz-nav"><button class="quiz-btn primary" id="quiz-next-btn" disabled>'+(idx<total-1?"Next →":"Finish Quiz ✓")+'</button></div>';
currentQuiz.selectedOption=null;
document.querySelectorAll(".quiz-option").forEach(opt=>{opt.addEventListener("click",()=>selectOption(parseInt(opt.dataset.index)));});
document.getElementById("quiz-next-btn").addEventListener("click",nextQuestion);
}

function selectOption(index){
if(currentQuiz.selectedOption!==null)return;
currentQuiz.selectedOption=index;
const q=currentQuiz.questions[currentQuiz.currentIndex];
const isCorrect=index===q.correct;
document.querySelectorAll(".quiz-option").forEach(o=>o.classList.add("disabled"));
document.getElementById("quiz-opt-"+index).classList.add(isCorrect?"correct":"wrong");
if(!isCorrect&&appState.settings.showCorrectAnswer)document.getElementById("quiz-opt-"+q.correct).classList.add("correct");
currentQuiz.answers.push({selected:index,correct:isCorrect});
document.getElementById("quiz-next-btn").disabled=false;
}

function nextQuestion(){
if(currentQuiz.currentIndex<currentQuiz.questions.length-1){currentQuiz.currentIndex++;renderQuestion();}
else finishMCQQuiz();
}

function finishMCQQuiz(){
const correctCount=currentQuiz.answers.filter(a=>a.correct).length;
const total=currentQuiz.questions.length;
const pct=Math.round((correctCount/total)*100);
const xpEarned=correctCount*10+(pct===100?50:0);
appState.history.push({subject:currentQuiz.subject,type:selectedType||"quiz",difficulty:selectedDifficulty,correct:correctCount,total,percentage:pct,xp:xpEarned,date:new Date().toISOString()});
updateStreak();saveState(appState);
const color=pct>=80?"var(--accent-green)":pct>=50?"var(--accent-orange)":"var(--accent-red)";
let title,subtitle;
if(pct===100){title="🎉 Perfect Score!";subtitle="Amazing! You got every question right!";}
else if(pct>=80){title="🌟 Great Job!";subtitle="You really know your stuff!";}
else if(pct>=50){title="👍 Good Effort!";subtitle="You're on the right track!";}
else{title="💪 Keep Trying!";subtitle="Review the material and try again.";}
const circ=2*Math.PI*60,offset=circ-(pct/100)*circ;
document.getElementById("quiz-body").innerHTML=
'<div class="quiz-results"><div class="results-score-circle"><svg width="160" height="160"><circle class="results-score-bg" cx="80" cy="80" r="60"/><circle class="results-score-fill" cx="80" cy="80" r="60" stroke="'+color+'" stroke-dasharray="'+circ+'" stroke-dashoffset="'+circ+'" id="results-ring"/></svg><div class="results-score-value"><div class="score-number">'+pct+'%</div><div class="score-label">Score</div></div></div><h2 class="results-title">'+title+'</h2><p class="results-subtitle">'+subtitle+'</p><div class="results-stats"><div class="results-stat correct-stat"><div class="value">'+correctCount+'</div><div class="label">Correct</div></div><div class="results-stat wrong-stat"><div class="value">'+(total-correctCount)+'</div><div class="label">Wrong</div></div><div class="results-stat"><div class="value">+'+xpEarned+'</div><div class="label">XP Earned</div></div></div><div class="results-actions"><button class="quiz-btn secondary" id="results-back-btn">← Dashboard</button><button class="quiz-btn primary" id="results-retry-btn">Retry ↻</button></div></div>';
requestAnimationFrame(()=>{requestAnimationFrame(()=>{document.getElementById("results-ring").style.strokeDashoffset=offset;});});
document.getElementById("results-back-btn").addEventListener("click",()=>navigateTo("dashboard"));
document.getElementById("results-retry-btn").addEventListener("click",startMCQQuiz);
}

document.getElementById("quiz-back-btn").addEventListener("click",()=>showDifficultySelector(selectedSubject));

// ==========================================
// READING ENGINE
// ==========================================
let readingState={questions:[],currentIndex:0,answers:[]};

function startReading(){
const data=quizData.english.reading[selectedDifficulty];
readingState={questions:data.questions,currentIndex:0,answers:[]};
document.getElementById("reading-title").textContent="Reading — "+selectedDifficulty.charAt(0).toUpperCase()+selectedDifficulty.slice(1);
let html='<div class="reading-passage"><h3>'+data.title+'</h3><div class="passage-text">'+data.passage+'</div></div>';
html+='<div id="reading-questions"></div>';
document.getElementById("reading-body").innerHTML=html;
showView("reading");
renderReadingQuestion();
}

function renderReadingQuestion(){
const q=readingState.questions[readingState.currentIndex];
const idx=readingState.currentIndex,total=readingState.questions.length;
const letters=["A","B","C","D"];
const container=document.getElementById("reading-questions");
container.innerHTML=
'<div class="quiz-question-card"><div class="quiz-question-number">Comprehension Question '+(idx+1)+' of '+total+'</div><div class="quiz-question-text">'+q.question+'</div><div class="quiz-options">'+
q.options.map((opt,i)=>'<div class="quiz-option" data-index="'+i+'" id="rq-opt-'+i+'"><span class="option-letter">'+letters[i]+'</span><span>'+opt+'</span></div>').join("")+
'</div></div><div class="quiz-nav"><button class="quiz-btn primary" id="rq-next-btn" disabled>'+(idx<total-1?"Next →":"Finish ✓")+'</button></div>';
document.querySelectorAll("#reading-questions .quiz-option").forEach(opt=>{
opt.addEventListener("click",()=>{
if(readingState.answered)return;
readingState.answered=true;
const i=parseInt(opt.dataset.index),isCorrect=i===q.correct;
document.querySelectorAll("#reading-questions .quiz-option").forEach(o=>o.classList.add("disabled"));
document.getElementById("rq-opt-"+i).classList.add(isCorrect?"correct":"wrong");
if(!isCorrect&&appState.settings.showCorrectAnswer)document.getElementById("rq-opt-"+q.correct).classList.add("correct");
readingState.answers.push({correct:isCorrect});
document.getElementById("rq-next-btn").disabled=false;
});
});
readingState.answered=false;
document.getElementById("rq-next-btn").addEventListener("click",()=>{
if(readingState.currentIndex<readingState.questions.length-1){readingState.currentIndex++;renderReadingQuestion();}
else finishReading();
});
}

function finishReading(){
const correctCount=readingState.answers.filter(a=>a.correct).length;
const total=readingState.questions.length;
const pct=Math.round((correctCount/total)*100);
const xpEarned=correctCount*10+(pct===100?50:0);
appState.history.push({subject:"english",type:"reading",difficulty:selectedDifficulty,correct:correctCount,total,percentage:pct,xp:xpEarned,date:new Date().toISOString()});
updateStreak();saveState(appState);
const color=pct>=80?"var(--accent-green)":pct>=50?"var(--accent-orange)":"var(--accent-red)";
const circ=2*Math.PI*60,offset=circ-(pct/100)*circ;
document.getElementById("reading-body").innerHTML=
'<div class="quiz-results"><div class="results-score-circle"><svg width="160" height="160"><circle class="results-score-bg" cx="80" cy="80" r="60"/><circle class="results-score-fill" cx="80" cy="80" r="60" stroke="'+color+'" stroke-dasharray="'+circ+'" stroke-dashoffset="'+circ+'" id="rr-ring"/></svg><div class="results-score-value"><div class="score-number">'+pct+'%</div><div class="score-label">Score</div></div></div><h2 class="results-title">'+(pct>=80?"🌟 Great Reading!":"👍 Good Effort!")+'</h2><p class="results-subtitle">You answered '+correctCount+' of '+total+' comprehension questions correctly.</p><div class="results-actions"><button class="quiz-btn secondary" id="rr-back">← Dashboard</button><button class="quiz-btn primary" id="rr-retry">Try Again ↻</button></div></div>';
requestAnimationFrame(()=>{requestAnimationFrame(()=>{document.getElementById("rr-ring").style.strokeDashoffset=offset;});});
document.getElementById("rr-back").addEventListener("click",()=>navigateTo("dashboard"));
document.getElementById("rr-retry").addEventListener("click",startReading);
}

document.getElementById("reading-back-btn").addEventListener("click",()=>showDifficultySelector("english"));

// ==========================================
// WRITING ENGINE + AI EVALUATOR
// ==========================================
function startWriting(){
const data=quizData.english.writing[selectedDifficulty];
const minWords={beginner:50,intermediate:100,advanced:150,expert:200}[selectedDifficulty];
document.getElementById("writing-title").textContent="Writing — "+selectedDifficulty.charAt(0).toUpperCase()+selectedDifficulty.slice(1);
document.getElementById("writing-body").innerHTML=
'<div class="writing-prompt-card"><h3>'+data.prompt+'</h3><p>'+data.description+'</p></div>'+
'<textarea class="writing-area" id="essay-input" placeholder="Start writing your essay here..."></textarea>'+
'<div class="writing-word-count"><span id="wc-count">0 words</span><span class="min-words" id="wc-min">Minimum: '+minWords+' words</span></div>'+
'<div class="quiz-nav"><button class="quiz-btn primary" id="submit-essay-btn" disabled>Submit for Review ✓</button></div>'+
'<div id="ai-feedback-container"></div>';
showView("writing");
const textarea=document.getElementById("essay-input");
const wcCount=document.getElementById("wc-count");
const wcMin=document.getElementById("wc-min");
const submitBtn=document.getElementById("submit-essay-btn");
textarea.addEventListener("input",()=>{
const words=textarea.value.trim().split(/\s+/).filter(w=>w.length>0).length;
wcCount.textContent=words+" words";
if(words>=minWords){wcMin.classList.add("met");wcMin.textContent="✓ Minimum met";submitBtn.disabled=false;}
else{wcMin.classList.remove("met");wcMin.textContent="Minimum: "+minWords+" words";submitBtn.disabled=true;}
});
submitBtn.addEventListener("click",()=>{evaluateEssay(textarea.value,minWords);});
}

function evaluateEssay(text,minWords){
const words=text.trim().split(/\s+/).filter(w=>w.length>0);
const wordCount=words.length;
const sentences=text.split(/[.!?]+/).filter(s=>s.trim().length>0);
const sentenceCount=sentences.length;
const paragraphs=text.split(/\n\s*\n/).filter(p=>p.trim().length>0);
const paragraphCount=paragraphs.length;
const avgSentenceLen=sentenceCount>0?Math.round(wordCount/sentenceCount):0;
const uniqueWords=new Set(words.map(w=>w.toLowerCase().replace(/[^a-z]/g,"")));
const vocabDiversity=wordCount>0?Math.round((uniqueWords.size/wordCount)*100):0;

// Grammar checks
const grammarErrors=[];
const lowerText=text.toLowerCase();
const grammarPatterns=[
{pattern:/\btheir\s+(?:is|was|are|were|going|doing)\b/gi,msg:"Possible confusion of 'their' with 'there' or 'they're'"},
{pattern:/\bthere\s+(?:car|house|book|dog|cat|friend|mom|dad|brother|sister)\b/gi,msg:"Possible confusion of 'there' with 'their'"},
{pattern:/\bits\s+(?:a|the|very|really|not|been|own)\b.*?\bits\b/gi,msg:"Check 'its' vs 'it's' usage"},
{pattern:/\byour\s+(?:welcome|right|wrong|going|doing|the|a)\b/gi,msg:"Possible confusion of 'your' with 'you're'"},
{pattern:/\bi\s/g,msg:"'I' should always be capitalized"},
{pattern:/\bcould of\b|\bshould of\b|\bwould of\b/gi,msg:"Use 'could have' instead of 'could of'"},
{pattern:/\balot\b/gi,msg:"'A lot' should be two words"},
{pattern:/\bthen\s+(?:me|him|her|us|them)\b/gi,msg:"Possible confusion of 'then' with 'than'"},
];
grammarPatterns.forEach(p=>{const m=text.match(p.pattern);if(m)grammarErrors.push(p.msg);});

// Spelling check
let misspelled=0;
const checkedWords=words.map(w=>w.toLowerCase().replace(/[^a-z']/g,"")).filter(w=>w.length>2);
checkedWords.forEach(w=>{if(!commonWords.has(w)&&w.length>4){
// Simple heuristic: very long uncommon words might be misspelled
// We don't flag short or moderately common-looking words
}});
// Count potential issues with doubled letters or common misspellings
const commonMisspellings=["recieve","seperately","occured","definately","accomodate","occurence","refered","begining","wierd","untill","tommorow","neccessary","goverment","enviroment","acheive","beleive","fourty","grammer","knowlege","libary","mispell","noticable","occassion","posession","publically","recomend","succesful","suprise","truely","writting"];
let spellingIssues=[];
checkedWords.forEach(w=>{if(commonMisspellings.includes(w))spellingIssues.push(w);});

// Scoring
let grammarScore=Math.max(0,100-grammarErrors.length*15);
let vocabScore=Math.min(100,vocabDiversity*1.5);
let structureScore=0;
if(paragraphCount>=2)structureScore+=30;
if(paragraphCount>=3)structureScore+=20;
if(avgSentenceLen>=8&&avgSentenceLen<=25)structureScore+=30;
else if(avgSentenceLen>=5)structureScore+=15;
if(sentenceCount>=3)structureScore+=20;
structureScore=Math.min(100,structureScore);
let spellingScore=Math.max(0,100-spellingIssues.length*20);
let lengthScore=Math.min(100,Math.round((wordCount/minWords)*80)+20);
if(wordCount>=minWords*2)lengthScore=100;

let overallScore=Math.round(grammarScore*0.25+vocabScore*0.2+structureScore*0.2+spellingScore*0.15+lengthScore*0.2);
overallScore=Math.min(100,Math.max(0,overallScore));

let grade;
if(overallScore>=90)grade="A";else if(overallScore>=80)grade="B";else if(overallScore>=70)grade="C";else if(overallScore>=60)grade="D";else grade="F";

const xpEarned=Math.round(overallScore/10)*5;
appState.history.push({subject:"english",type:"writing",difficulty:selectedDifficulty,correct:overallScore,total:100,percentage:overallScore,xp:xpEarned,date:new Date().toISOString()});
updateStreak();saveState(appState);

// Build feedback
const color=overallScore>=80?"var(--accent-green)":overallScore>=50?"var(--accent-orange)":"var(--accent-red)";
const circ=2*Math.PI*48,offset=circ-(overallScore/100)*circ;
let feedbackTitle=overallScore>=80?"Excellent Writing!":overallScore>=60?"Good Work!":"Needs Improvement";
let feedbackDesc=overallScore>=80?"Your essay demonstrates strong writing skills.":overallScore>=60?"You're on the right track. Focus on the areas below.":"Review the feedback below to improve your writing.";

let positives=[],negatives=[];
if(vocabDiversity>50)positives.push("Good vocabulary diversity ("+vocabDiversity+"% unique words)");
else negatives.push("Try using more varied vocabulary ("+vocabDiversity+"% unique words)");
if(paragraphCount>=3)positives.push("Well-structured with "+paragraphCount+" paragraphs");
else negatives.push("Consider organizing into more paragraphs (currently "+paragraphCount+")");
if(avgSentenceLen>=8&&avgSentenceLen<=25)positives.push("Good sentence length (avg "+avgSentenceLen+" words)");
else if(avgSentenceLen<8)negatives.push("Sentences are too short (avg "+avgSentenceLen+" words). Elaborate more.");
else negatives.push("Sentences are too long (avg "+avgSentenceLen+" words). Break them up.");
if(wordCount>=minWords*1.5)positives.push("Thorough response with "+wordCount+" words");
if(grammarErrors.length===0)positives.push("No common grammar errors detected");
grammarErrors.forEach(e=>negatives.push(e));
spellingIssues.forEach(w=>negatives.push("Possible misspelling: '"+w+"'"));

const categories=[
{label:"Grammar",score:grammarScore,color:"var(--accent-green)"},
{label:"Vocabulary",score:vocabScore,color:"var(--accent-cyan)"},
{label:"Structure",score:structureScore,color:"var(--accent-purple)"},
{label:"Spelling",score:spellingScore,color:"var(--accent-pink)"},
{label:"Length",score:lengthScore,color:"var(--accent-orange)"}
];

let feedbackHTML='<div class="ai-feedback-panel"><h3>🤖 AI Writing Analysis</h3>';
feedbackHTML+='<div class="ai-score-overview"><div class="ai-score-circle"><svg width="120" height="120"><circle class="score-bg" cx="60" cy="60" r="48"/><circle class="score-fill" cx="60" cy="60" r="48" stroke="'+color+'" stroke-dasharray="'+circ+'" stroke-dashoffset="'+circ+'" id="essay-ring"/></svg><div class="score-text"><span class="number">'+overallScore+'</span><span class="grade">Grade '+grade+'</span></div></div>';
feedbackHTML+='<div class="ai-score-summary"><h4>'+feedbackTitle+'</h4><p>'+feedbackDesc+'</p><p style="font-size:12px;color:var(--text-muted);margin-top:8px">'+wordCount+' words · '+sentenceCount+' sentences · '+paragraphCount+' paragraphs</p></div></div>';
feedbackHTML+='<div class="ai-categories">'+categories.map(c=>'<div class="ai-category"><span class="ai-category-label">'+c.label+'</span><div class="ai-category-bar"><div class="ai-category-bar-fill" style="width:0%;background:'+c.color+'" data-target="'+c.score+'"></div></div><span class="ai-category-score">'+c.score+'%</span></div>').join("")+'</div>';

if(positives.length||negatives.length){
feedbackHTML+='<div class="ai-feedback-details"><h4>Detailed Feedback</h4>';
positives.forEach(p=>{feedbackHTML+='<div class="ai-feedback-item positive"><span class="fb-icon">✅</span><span>'+p+'</span></div>';});
negatives.forEach(n=>{feedbackHTML+='<div class="ai-feedback-item negative"><span class="fb-icon">⚠️</span><span>'+n+'</span></div>';});
feedbackHTML+='</div>';
}
feedbackHTML+='<div class="results-actions" style="margin-top:24px"><button class="quiz-btn secondary" id="wr-back">← Dashboard</button><button class="quiz-btn primary" id="wr-retry">Write Again ↻</button></div></div>';

document.getElementById("ai-feedback-container").innerHTML=feedbackHTML;

// Animate
requestAnimationFrame(()=>{requestAnimationFrame(()=>{
document.getElementById("essay-ring").style.strokeDashoffset=offset;
document.querySelectorAll(".ai-category-bar-fill").forEach(bar=>{bar.style.width=bar.dataset.target+"%";});
});});

document.getElementById("wr-back").addEventListener("click",()=>navigateTo("dashboard"));
document.getElementById("wr-retry").addEventListener("click",startWriting);

// Disable textarea and submit
document.getElementById("essay-input").disabled=true;
document.getElementById("submit-essay-btn").disabled=true;
document.getElementById("submit-essay-btn").textContent="Submitted ✓";
}

document.getElementById("writing-back-btn").addEventListener("click",()=>showDifficultySelector("english"));

// ==========================================
// DAILY TASKS
// ==========================================
function renderDailyTasks(){
const today=new Date().toISOString().slice(0,10);
const todayHistory=appState.history.filter(r=>r.date&&r.date.slice(0,10)===today);
const tasks=[
{title:"Complete an English Quiz",desc:"Practice grammar, reading, or writing",tag:"english",done:todayHistory.some(r=>r.subject==="english")},
{title:"Complete a Math Quiz",desc:"Sharpen your calculation skills",tag:"math",done:todayHistory.some(r=>r.subject==="math")},
{title:"Score above 80%",desc:"Aim for excellence in any subject",done:todayHistory.some(r=>r.percentage>=80)}
];
document.getElementById("daily-task-list").innerHTML=tasks.map(t=>
'<div class="task-item"><div class="task-checkbox '+(t.done?"checked":"")+'">'+
(t.done?"✓":"")+'</div><div class="task-item-info"><h4>'+t.title+'</h4><p>'+t.desc+'</p></div>'+
(t.tag?'<span class="task-tag '+t.tag+'">'+t.tag.charAt(0).toUpperCase()+t.tag.slice(1)+'</span>':"")+
'</div>').join("");
document.getElementById("daily-task-count").textContent=tasks.filter(t=>!t.done).length;
}

// ==========================================
// TASK HISTORY
// ==========================================
function renderHistory(){
const history=[...appState.history].reverse();
const container=document.getElementById("history-list");
if(!history.length){container.innerHTML='<div class="task-item" style="justify-content:center;color:var(--text-muted)">No quiz history yet.</div>';return;}
container.innerHTML=history.map(r=>{
const date=new Date(r.date).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"});
const isEng=r.subject==="english";
const color=r.percentage>=80?"var(--accent-green)":r.percentage>=50?"var(--accent-orange)":"var(--accent-red)";
const typeLabel=(r.type||"quiz").charAt(0).toUpperCase()+(r.type||"quiz").slice(1);
const diffLabel=r.difficulty?(" · "+r.difficulty.charAt(0).toUpperCase()+r.difficulty.slice(1)):"";
return '<div class="history-item"><div class="history-icon" style="background:'+(isEng?"rgba(139,92,246,0.15)":"rgba(6,182,212,0.15)")+'">'+(isEng?"📖":"🔢")+'</div><div class="history-info"><h4>'+(isEng?"English":"Math")+' — '+typeLabel+diffLabel+'</h4><p>'+date+(r.type!=="writing"?" · "+r.correct+"/"+r.total+" correct":"")+'</p></div><div class="history-score" style="color:'+color+'">'+r.percentage+'%</div></div>';
}).join("");
}

// ==========================================
// PROFILE, ACHIEVEMENTS, SETTINGS
// ==========================================
function renderProfile(){
const s=getStats();
document.getElementById("profile-quizzes").textContent=s.totalQuizzes;
document.getElementById("profile-accuracy").textContent=s.avgAccuracy+"%";
document.getElementById("profile-xp").textContent=s.xp;
}

function renderAchievements(){
const s=getStats();
document.getElementById("achievements-grid").innerHTML=achievementsDef.map(a=>{
const unlocked=a.condition(s);
return '<div class="achievement-card '+(unlocked?"":"locked")+'"><div class="achievement-icon">'+a.icon+'</div><h4>'+a.name+'</h4><p>'+a.desc+'</p></div>';
}).join("");
}

function refreshSettings(){
document.querySelectorAll(".toggle-switch").forEach(t=>{
const k=t.dataset.setting;
if(k&&appState.settings[k]!==undefined)t.classList.toggle("active",appState.settings[k]);
});
}
document.querySelectorAll(".toggle-switch").forEach(t=>{
t.addEventListener("click",()=>{
const k=t.dataset.setting;
if(k&&appState.settings[k]!==undefined){appState.settings[k]=!appState.settings[k];t.classList.toggle("active",appState.settings[k]);saveState(appState);}
});
});
document.getElementById("reset-progress-btn").addEventListener("click",()=>{
if(confirm("Reset all progress? This cannot be undone.")){appState=getDefaultState();saveState(appState);navigateTo("dashboard");}
});

// ==========================================
// INIT
// ==========================================
updateStreak();
refreshDashboard();
renderDailyTasks();
