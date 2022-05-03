//Flos Text BITTE UNBEDINGT ALS ERKLÄRUNG LESEN:
/* Hier ist der komplette Basic-Code für das Quiz, damit es aber leicht verständlich ist hier eine komplette Erklärung aller Dateien dieses Quizzes.
--- Allgemein ---
quiz.html = Die "Index" Datei wo jeder Spieler starten soll. HTML Codes welche dynamisch durch das JS verändert werden.
quiz.js = Der komplette Code damit das Quiz ansatzweise so funktioniert, wie ich (Flo) das wollte und es vorgegeben war.
mode.js = Diese Datei habe ich extra erstellt, weil dort "Erweiterungen" die von mir programmiert wurden drin sind. Also sowas wie der Startscreen und Sound.
confetti.js = Ist über ein CDN verlinkt und nicht von mir, der Code wurde frei zur Verfügung gestellt => https://github.com/catdad/canvas-confetti
--- Preis ---
price.html = Preis Seite in HTML, diese ist dafür gedacht die besten Spieler zu belohnen. In das Dokument ist auch p5.js integriert was ich dort verwendet habe.
price.js = Mein kompletter programmierter Code für den Preis. Dieser Code besteht hauptsächlich aus meinen gewünschten Formen und p5.js Stuff.
--- Style ---
style.css = Komplettes Styling der Seite und des Quizzes. Hier wurde von mir Wert auf responsiveness gelegt, sodass man auch rein theoretisch am Handy das Quiz machen kann.
--- Sonstiges ---
images Ordner = Die von mir verwendeten Images. Bis auf das mit der HfG sind diese von Unsplash.com
sound Ordner = Hier habe ich die Sounds gespeichert, von NoCopyright Videos auf Youtube in eine MP3 konvertiert und in Audacity bearbeitet.
Aufgabenbeschreibung = Von Asisa (Vorgaben usw.).
Viel Spaß beim Lesen des Codes! (ᵔᴥᵔ)
*/
// Globale Variabeln vor dem Code.
let type = 0;
let lang = 0;
let sounds;
let backgroundCustom = "#e7e7e7";

// Zwei Funktionen um jeweils zwischen dem Quiz was man machen möchte zu wählen.
function chooseQuizHistory() {
    document.getElementById("chooseQuiz").style.display = "none";
    //document.body.style.backgroundImage = "images/pixellandscape.jpeg";
    if (lang == 0) {
    document.getElementById("quest").innerHTML = 'Welcome to the History Quiz!';
    } else if (lang == 1) {
    document.getElementById("quest").innerHTML = 'Willkommen zum Geschichtsquiz!';
    };
    document.getElementById("language").style.display = 'none';
};
function chooseQuizJavascript() {
    type++;
    document.getElementById("chooseQuiz").style.display = "none";
    //document.body.style.backgroundImage = "images/pixellandscape.jpeg";
    if (lang == 0) {
    document.getElementById("quest").innerHTML = 'Welcome to the JS Quiz!';
    } else if (lang == 1) {
    document.getElementById("quest").innerHTML = 'Willkommen zum JS Quiz!';
    };
    document.getElementById("language").style.display = 'none';
};

// Funktion die direkt beim Laden des Bodies ausgeführt wird. Wichtig um z.B. den Highscore direkt ins Game zu laden.
function load() {
    loadLanguage();
    if (lang == 0) {
    document.getElementById("highscore").innerHTML = "Your personal highscore: "+localStorage.getItem("highscore");
    } else if (lang == 1) {
    document.getElementById("highscore").innerHTML = "Dein persönlicher Highscore: "+localStorage.getItem("highscore");  
    };
    if (localStorage.getItem("Language") == null) {
        localStorage.setItem("Language", 1)
    };
    let stopper = localStorage.getItem("start");
    if (stopper > 0) {
        document.getElementById("start").style.display = "none";
    };
    showBonus();
    loadSound();
    if (existingEntries != null) {
    setList();
    };
    
    /* Bei Firefox gab es bei mir einen Bug dass nichts richtig geladen wurde. Daher soll ein Error angezeigt werden wenn das passiert. 
    Ansonsten ist es auch nochmal auf dem Startscreen erklärt. */
    try {
        setLocalStorageItem("highscore", points);
    } catch(e) {
        if(e.name == "NS_ERROR_FILE_CORRUPTED") {
            showMessageSomehow("Sorry, it looks like your browser storage has been corrupted. Please clear your storage by going to Tools -> Clear Recent History -> Cookies and set time range to 'Everything'. This will remove the corrupted browser storage across all sites.");
        }
    };
};

// Hier werden Fragen für das Quiz der Kategorie "History" bzw. "Geschichte" in einem Objekt / Array definiert. Die Antworten ebenfalls.
const questions1 = [0, 1, 2, 3, 4];
const questionText1 = ['In which year was the HfG founded', 'When was the first internet-connection active?',  'When was Napoleon born?','When did the second world war begin?',  'In which year flew the first plane?'];
const imgShow1 = ['images/hfg.jpeg', 'images/internet.jpeg', 'images/napoleon.jpeg', 'images/secondworldwar.jpg', 'images/plane.jpeg']
const answers1 = [
    {
    answer:['1776', '1800', '1923'], 
    },
    {
    answer:['1969', '1950', '1987'], 
    },
    {
    answer:['1769', '1640', '1723'], 
    },
    {
    answer:['1939', '1940', '1945'], 
    },
    {
    answer:['1903', '1906', '1912'], 
    },
];
// Und hier sind diese auf deutsch übersetzt
const questions1de = [0, 1, 2, 3, 4];
const questionText1de = ['In welchem Jahr wurde die HfG gegründet?', 'Wann war die erste Internetverbindung aktiv?',  'Wann wurde Napoleon geboren?','Wann begann der zweite Weltkrieg?',  'In welchem Jahr flog das erste Flugzeug?'];
const imgShow1de = ['images/hfg.jpeg', 'images/internet.jpeg', 'images/napoleon.jpeg', 'images/secondworldwar.jpg', 'images/plane.jpeg']
const answers1de = [
    {
    answer:['1776', '1800', '1923'], 
    },
    {
    answer:['1969', '1950', '1987'], 
    },
    {
    answer:['1769', '1640', '1723'], 
    },
    {
    answer:['1939', '1940', '1945'], 
    },
    {
    answer:['1903', '1906', '1912'], 
    },
];

// Hier werden Fragen für das Quiz der Kategorie "Javascript" in einem Objekt / Array definiert. Die Antworten ebenfalls.
const questions2 = [0, 1, 2, 3, 4];
const questionText2 = ['What is Javascript?', 'What is an array?',  'What is Processing.js?','When was JS first released?',  'How hard is Javascript to learn?'];
const imgShow2 = ['images/whatsjs.jpeg', 'images/array.jpeg', 'images/processing.jpeg', 'images/jsrelease.jpeg', 'images/learn.jpeg']
const answers2 = [
    {
    answer:['A text based programming language', 'It is an addon for C++', 'Its the hypertext markup language'], 
    },
    {
    answer:['A single variable to store different elements', 'Its an element', 'It doesnt exist in Javascript'], 
    },
    {
    answer:['A open source tool', 'Its the loading screen of a webpage', 'Its a other Name for C#'], 
    },
    {
    answer:['1995 by Brendan Eich', '1995 by Jeff Bezos', '1993 by Brendan Eich'], 
    },
    {
    answer:['Its easy compared to C++ and C', 'C++ and C is more easy to learn', 'Javascript is extremely hard to learn you cant even compare it'], 
    },
];
// Und hier sind diese auf deutsch übersetzt
const questions2de = [0, 1, 2, 3, 4];
const questionText2de = ['Was ist Javascript?', 'Was ist ein Array?',  'Was ist Processing JS?','Wann wurde JS veröffentlicht?',  'Wie schwierig ist Javascript zu lernen?'];
const imgShow2de = ['images/whatsjs.jpeg', 'images/array.jpeg', 'images/processing.jpeg', 'images/jsrelease.jpeg', 'images/learn.jpeg']
const answers2de = [
    {
    answer:['Eine textbasierte Programmiersprache', 'Ein Addon für C++', 'Es ist die Hypertext Markup Language'], 
    },
    {
    answer:['Eine Variable um verschiedene Elemente zu speichern', 'Es ist ein Element', 'So etwas gibt es in Javascript nicht'], 
    },
    {
    answer:['Ein Open Source Tool', 'Es ist der Ladebildschirm einer Website', 'Es ist ein anderer Name für C#'], 
    },
    {
    answer:['1995 von Brendan Eich', '1995 von Jeff Bezos', '1993 von Brendan Eich'], 
    },
    {
    answer:['Es ist im Vergleich zu C++ und C leicht', 'C++ und C ist viel einfacher zu lernen', 'Javascript ist unvergleichbar schwer zu lernen.'], 
    },
];

/* Count = Die Anzahl der Runden die einfach hochgezählt werden.
Points = Die Anzahl der richtigen Antworten, gibt es natürlich dementsprechend auch nur wenn man richtig wählt! 
Count ≠ Points */
let count = 0;
let points = 0;

// Funktion um eine neue Runde auszuführen. Eine Runde hat jeweils 5 Fragen.
starteNeueRunde = function() {

// Starte neue Runde in der Kategorie "History" bzw "Geschichte".
    if (type === 0) {
    count++;

// Starte neue Runde in der Sprache Englisch
    if (lang == 0) {

/* Mache die Fragen und die Antworten komplett random, aber die Antworten sollen zu jeder Frage passen.
Dabei sind die drei möglichen Antworten unter der Frage die man wählen kann allerdings auch jedes mal komplett random. */
let random1 = Math.floor(Math.random() * questions1.length);
let choice1 = questions1[random1];
let image1 = questions1[random1];
let text1 = questionText1[choice1];
let image = imgShow1[image1];
const shuffledAnswers = answers1[choice1].answer.sort((a, b) => 0.5 - Math.random());
let answer11 = answers1[choice1].answer[0];
let answer12 = answers1[choice1].answer[1];
let answer13 = answers1[choice1].answer[2];
document.body.style.backgroundImage = "none";

// Stelle die Frage in dem HTML Dokument dar.
document.getElementById("quest").innerHTML = text1;
document.getElementById("images").style.backgroundImage = "url('"+image+"')";
document.getElementById("images").style.backgroundColor = backgroundCustom;

// Stelle die random Antworten in dem Dokument dar und verändere das HTML bzw. CSS Dokument dynamisch basierend darauf.
document.getElementById("11").innerHTML = answer11;
document.getElementById("12").innerHTML = answer12;
document.getElementById("13").innerHTML = answer13;
document.getElementById("click").innerHTML = '';
document.getElementById("pointer").style.pointerEvents = "none";
questions1.splice(random1, 1); //Entferne die gewählte Antwort bzw. Fragen.
document.getElementById("copy").style.display = "none";
document.getElementById("button").style.display = "none";
document.getElementById("auswahl").style.display = "flex";
for (i = 11; i<=13; i++) {
    document.getElementById(i).style.pointerEvents = "auto";
    document.getElementById(i).style.background = "rgb(231, 231, 231)";
    document.getElementById(i).style.color = "black";
}
document.getElementById("points").innerHTML = "Points: <br/>"+ points;
document.getElementById("questNr").innerHTML = 'Question Nr. '+count;

// Deutsch
    } else if (lang == 1) {
/* Mache die Fragen und die Antworten komplett random, aber die Antworten sollen zu jeder Frage passen.
Dabei sind die drei möglichen Antworten unter der Frage die man wählen kann allerdings auch jedes mal komplett random. */
let random1de = Math.floor(Math.random() * questions1de.length);
let choice1de = questions1de[random1de];
let image1de = questions1de[random1de];
let text1de = questionText1de[choice1de];
let imagede = imgShow1de[image1de];
const shuffledAnswers = answers1de[choice1de].answer.sort((a, b) => 0.5 - Math.random());
let answer11de = answers1de[choice1de].answer[0];
let answer12de = answers1de[choice1de].answer[1];
let answer13de = answers1de[choice1de].answer[2];
document.body.style.backgroundImage = "none";

// Stelle die Frage in dem HTML Dokument dar.
document.getElementById("quest").innerHTML = text1de;
document.getElementById("images").style.backgroundImage = "url('"+imagede+"')";
document.getElementById("images").style.backgroundColor = backgroundCustom;

// Stelle die random Antworten in dem Dokument dar und verändere das HTML bzw. CSS Dokument dynamisch basierend darauf.
document.getElementById("11").innerHTML = answer11de;
document.getElementById("12").innerHTML = answer12de;
document.getElementById("13").innerHTML = answer13de;
document.getElementById("click").innerHTML = '';
document.getElementById("pointer").style.pointerEvents = "none";
questions1de.splice(random1de, 1); //Entferne die gewählte Antwort bzw. Fragen.
document.getElementById("copy").style.display = "none";
document.getElementById("button").style.display = "none";
document.getElementById("auswahl").style.display = "flex";
for (i = 11; i<=13; i++) {
    document.getElementById(i).style.pointerEvents = "auto";
    document.getElementById(i).style.background = "rgb(231, 231, 231)";
    document.getElementById(i).style.color = "black";
}
document.getElementById("points").innerHTML = "Punkte: <br/>"+ points;
document.getElementById("questNr").innerHTML = 'Frage Nr. '+count;
    };
};

// Starte neue Runde in der Kategorie "Javascript".
if (type === 1) {
    count++;

// In der Sprache Englisch
if (lang == 0) {
let random2 = Math.floor(Math.random() * questions2.length);
let choice2 = questions2[random2];
let image2 = questions2[random2];
let text2 = questionText2[choice2];
let image = imgShow2[image2];
const shuffledAnswers = answers2[choice2].answer.sort((a, b) => 0.5 - Math.random());
let answer21 = answers2[choice2].answer[0];
let answer22 = answers2[choice2].answer[1];
let answer23 = answers2[choice2].answer[2];
document.body.style.backgroundImage = "none";

// Genauso wie bei "Geschichte" bzw. "History" ist hier alles exakt gleich.
document.getElementById("quest").innerHTML = text2;
document.getElementById("images").style.backgroundImage = "url('"+image+"')";
document.getElementById("images").style.backgroundColor = backgroundCustom;

/* Der einzige Unterschied ist nur, dass die Fragen, Antworten und Bilder jetzt nicht von der ersten definierten Kategorie,
sondern von der zweiten genommen werden! */
document.getElementById("11").innerHTML = answer21;
document.getElementById("12").innerHTML = answer22;
document.getElementById("13").innerHTML = answer23;
document.getElementById("click").innerHTML = '';
document.getElementById("pointer").style.pointerEvents = "none";
questions2.splice(random2, 1);
document.getElementById("copy").style.display = "none";
document.getElementById("button").style.display = "none";
document.getElementById("auswahl").style.display = "flex";
for (i = 11; i<=13; i++) {
    document.getElementById(i).style.pointerEvents = "auto";
    document.getElementById(i).style.background = "rgb(231, 231, 231)";
    document.getElementById(i).style.color = "black";
}
document.getElementById("points").innerHTML = "Points: <br/>"+ points;
document.getElementById("questNr").innerHTML = 'Question Nr. '+count;

// In der Sprache Deutsch
} else if (lang == 1) {
    let random2de = Math.floor(Math.random() * questions2de.length);
    let choice2de = questions2de[random2de];
    let image2de = questions2de[random2de];
    let text2de = questionText2de[choice2de];
    let imagede = imgShow2de[image2de];
    const shuffledAnswers = answers2de[choice2de].answer.sort((a, b) => 0.5 - Math.random());
    let answer21de = answers2de[choice2de].answer[0];
    let answer22de = answers2de[choice2de].answer[1];
    let answer23de = answers2de[choice2de].answer[2];
    document.body.style.backgroundImage = "none";
    
    // Genauso wie bei "Geschichte" bzw. "History" ist hier alles exakt gleich.
    document.getElementById("quest").innerHTML = text2de;
    document.getElementById("images").style.backgroundImage = "url('"+imagede+"')";
    document.getElementById("images").style.backgroundColor = backgroundCustom;
    
    /* Der einzige Unterschied ist nur, dass die Fragen, Antworten und Bilder jetzt nicht von der ersten definierten Kategorie,
    sondern von der zweiten genommen werden! */
    document.getElementById("11").innerHTML = answer21de;
    document.getElementById("12").innerHTML = answer22de;
    document.getElementById("13").innerHTML = answer23de;
    document.getElementById("click").innerHTML = '';
    document.getElementById("pointer").style.pointerEvents = "none";
    questions2de.splice(random2de, 1);
    document.getElementById("copy").style.display = "none";
    document.getElementById("button").style.display = "none";
    document.getElementById("auswahl").style.display = "flex";
    for (i = 11; i<=13; i++) {
        document.getElementById(i).style.pointerEvents = "auto";
        document.getElementById(i).style.background = "rgb(231, 231, 231)";
        document.getElementById(i).style.color = "black";
    }
    document.getElementById("points").innerHTML = "Punkte: <br/>"+ points;
    document.getElementById("questNr").innerHTML = 'Frage Nr. '+count;
};
};
};

/* Ist die Antwort richtig, ist Button z.B: grün
Ist die Antwort falsch, ist Button z.B: rot
Sperre die Buttons wenn einer der Antworten geklickt wurde
Wenn eine Antwort in deinem html file ausgewählt wurde, muss dein Programm darauf reagieren
Die Funktion wird daher in deinem html file mit onclick="tippeButton(this); aufgerufen. */
function tippeButton(gewaehlterButton){

/* Hier für "History" bzw. "Geschichte".
Antwort richtig = Grüner Button, entsprechender Sound (wenn aktiviert) und ein Punkt wird hinzugefügt.
Antwort falsch = Roter Button, und entsprechender Sound (wenn aktiviert). */
if (type === 0) {

// Sprache Englisch
    if (lang == 0) {
let correct = new Audio('sound/correct.mp3');
let incorrect = new Audio('sound/incorrect.mp3');
let target = gewaehlterButton;
if (target.innerHTML === '1776' || target.innerHTML === '1969' || target.innerHTML === '1769' || target.innerHTML === '1939' || target.innerHTML === '1903') {
    points++;
    document.getElementById("points").innerHTML = "Points: <br/>"+ points;
    target.style.background = "#0bfc03";
    if (sounds == 1) {
    correct.play();
}
    for (i = 11; i<=13; i++) {
        document.getElementById(i).style.pointerEvents = "none";
    }
// Prozessbar erweitern
    document.getElementById("processbar").value += 20;
} else {
    for (i = 11; i<=13; i++) {
        document.getElementById(i).style.pointerEvents = "none";
        target.style.background = "red";
        target.style.color = "white";
        if (sounds == 1) {
        incorrect.play();
    }
    }
}

// Punkte werden hier passend dargestellt.
if (count < 5) {
document.getElementById("button").style.display = "block";
document.getElementById("points").innerHTML = "Points: <br/>"+ points;
} else {
    document.getElementById("button").style.display = "none";
    document.getElementById("endbutton").style.display = "block";
    document.getElementById("points").innerHTML = "Points: <br/>"+ points;
}

// Sprache Deutsch
} else if (lang == 1) {
    let correct = new Audio('sound/correct.mp3');
    let incorrect = new Audio('sound/incorrect.mp3');
    let target = gewaehlterButton;
    if (target.innerHTML === '1776' || target.innerHTML === '1969' || target.innerHTML === '1769' || target.innerHTML === '1939' || target.innerHTML === '1903') {
        points++;
        document.getElementById("points").innerHTML = "Punkte: <br/>"+ points;
        target.style.background = "#0bfc03";
        if (sounds == 1) {
        correct.play();
    }        for (i = 11; i<=13; i++) {
            document.getElementById(i).style.pointerEvents = "none";
        }
// Prozessbar erweitern
    document.getElementById("processbar").value += 20;
    } else {
        for (i = 11; i<=13; i++) {
            document.getElementById(i).style.pointerEvents = "none";
            target.style.background = "red";
            target.style.color = "white";
            if (sounds == 1) {
            incorrect.play();
        }
        }
    }
    
    // Punkte werden hier passend dargestellt.
    if (count < 5) {
    document.getElementById("button").style.display = "block";
    document.getElementById("points").innerHTML = "Punkte: <br/>"+ points;
    } else {
        document.getElementById("button").style.display = "none";
        document.getElementById("endbutton").style.display = "block";
        document.getElementById("points").innerHTML = "Punkte: <br/>"+ points;
    };

};
};

// Hier für "Javascript". Wir schon bei der darstellung der Fragen und Antworten funktioniert hier im Grunde alles wie oben bereits erklärt.
if (type === 1) {

// Sprache Englisch
    if (lang == 0) {
    let correct = new Audio('sound/correct.mp3');
    let incorrect = new Audio('sound/incorrect.mp3');
    let target = gewaehlterButton;
    if (target.innerHTML === 'A text based programming language' || target.innerHTML === 'A single variable to store different elements' || target.innerHTML === 'A open source tool' || target.innerHTML === '1995 by Brendan Eich' || target.innerHTML === 'Its easy compared to C++ and C') {
        points++;
        document.getElementById("points").innerHTML = "Points: <br/>"+ points;
        target.style.background = "#0bfc03";
        if (sounds == 1) {
        correct.play();
    }
        for (i = 11; i<=13; i++) {
            document.getElementById(i).style.pointerEvents = "none";
        }
// Prozessbar erweitern
    document.getElementById("processbar").value += 20;
    } else {
        for (i = 11; i<=13; i++) {
            document.getElementById(i).style.pointerEvents = "none";
            target.style.background = "red";
            target.style.color = "white";
            if (sounds == 1) {
            incorrect.play();
        }
        }
    }
    if (count < 5) {
    document.getElementById("button").style.display = "block";
    document.getElementById("points").innerHTML = "Points: <br/>"+ points;
    } else {
        document.getElementById("button").style.display = "none";
        document.getElementById("endbutton").style.display = "block";
        document.getElementById("points").innerHTML = "Points: <br/>"+ points;
    };

// Sprache Deutsch
    } else if (lang == 1) {
        let correct = new Audio('sound/correct.mp3');
        let incorrect = new Audio('sound/incorrect.mp3');
        let target = gewaehlterButton;
        if (target.innerHTML === 'Eine Variable um verschiedene Elemente zu speichern' || target.innerHTML === '1995 von Brendan Eich' || target.innerHTML === 'Es ist im Vergleich zu C++ und C leicht' || target.innerHTML === 'Eine textbasierte Programmiersprache' || target.innerHTML === 'Ein Open Source Tool') {
            points++;
            document.getElementById("points").innerHTML = "Punkte: <br/>"+ points;
            target.style.background = "#0bfc03";
            if (sounds == 1) {
            correct.play();
        }
            for (i = 11; i<=13; i++) {
                document.getElementById(i).style.pointerEvents = "none";
            }
// Prozessbar erweitern
    document.getElementById("processbar").value += 20;
        } else {
            for (i = 11; i<=13; i++) {
                document.getElementById(i).style.pointerEvents = "none";
                target.style.background = "red";
                target.style.color = "white";
                if (sounds == 1) {
                incorrect.play();
            }
            }
        }
        if (count < 5) {
        document.getElementById("button").style.display = "block";
        document.getElementById("points").innerHTML = "Punkte: <br/>"+ points;
        } else {
            document.getElementById("button").style.display = "none";
            document.getElementById("endbutton").style.display = "block";
            document.getElementById("points").innerHTML = "Punkte: <br/>"+ points;
        };
    };
    };
// Weil man auf Handy trotzdem noch Buttons anwählen konnte, habe ich hier die Events für jeden einzelnen ausgestellt.
document.getElementById("11").style.pointerEvents = "none";
document.getElementById("12").style.pointerEvents = "none";
document.getElementById("13").style.pointerEvents = "none";
};

/* Dieser Code ist für das Ende des Quizzes da.
Wenn der Count 5 erreicht, also alle Runden gespielt sind, soll der Button natürlich eine andere Rückmeldung geben.
Außerdem wollte ich dann bei knacken des Highscores eine Confetti Animation.
Das Confetti selbst habe ich nicht selbst programmiert sondern von Github, die Animation habe ich dann darauf einprogrammiert dass diese
nur startet sobald jemand den Highscore auch wirklich knackt.*/
function endRound() {
    if (count = 5) {
        if (lang == 0) {

// Englisch
    document.getElementById("endscreen").style.display = "flex";
    document.getElementById("endpoints").innerHTML = "Reached points: "+ points;
    document.getElementById("questbox").style.display = "none";
    //Effekt wenn Highscore geknackt ist
    if(localStorage.getItem("highscore") < points){
        let confettiSound = new Audio('sound/confetti.mp3');
        if (sounds == 1) {
        confettiSound.play();
        }
        confetti({
            particleCount: 150
          });
    };

// Hier wird der Score und der Endscore abgeglichen um das bei knacken des Highscores ins Dokument einzusetzen.
    if (localStorage.getItem("user_name") !== localStorage.getItem("user_name")) {
    if (localStorage.getItem("highscore") == null || localStorage.getItem("highscore") == 0) {
    document.getElementById("highscore").innerHTML = "More than 0 never saved."; 
    } else {
        document.getElementById("highscore").innerHTML = "Your personal highscore: "+localStorage.getItem("highscore");
    }
    }

// Hier wird angezeigt ob das Schaf gefunden wurde
    if (points < 5) {
        document.getElementById("found").innerHTML = "Sheep was not found.";
    } else {
        document.getElementById("found").innerHTML = "Sheep was found. Save Highscore to get it.";
    };

// Deutsch
    } else if (lang == 1) {
        document.getElementById("endscreen").style.display = "flex  ";
    document.getElementById("endpoints").innerHTML = "Erreichte Punkte: "+ points;
    document.getElementById("questbox").style.display = "none";
    //Effekt wenn Highscore geknackt ist
    if(localStorage.getItem("highscore") < points){
        let confettiSound = new Audio('sound/confetti.mp3');
        if (sounds == 1) {
        confettiSound.play();
        }
        confetti({
            particleCount: 150
          });
    };

//Hier wird der Score und der Endscore abgeglichen um das bei knacken des Highscores ins Dokument einzusetzen.
    if (localStorage.getItem("user_name") !== localStorage.getItem("user_name")) {
    if (localStorage.getItem("highscore") == null || localStorage.getItem("highscore") == 0) {
    document.getElementById("highscore").innerHTML = "Nie mehr als 0 gespeichert."; 
    } else {
        document.getElementById("highscore").innerHTML = "Dein persönlicher Highscore: "+localStorage.getItem("highscore");
    }
    }
// Hier wird angezeigt ob das Schaf gefunden wurde
    if (points < 5) {
        document.getElementById("found").innerHTML = "Schaf wurde nicht gefunden.";
    } else {
        document.getElementById("found").innerHTML = "Das Schaf wurde gefunden. Sichere den Highscore um es zu erhalten.";
    };
    };
    };
};

/* Hier ist der Highscore und zwar eine Funktion dafür, dass dieser korrekt gespeichert wird.
Um den Score zu speichern benutze ich den Local Storage des Browsers.
Diesen benutze ich allgemein immer um etwas hier zu speichern.
Er dient als Alternative zu einer Datenbank oder Cookies und ist relativ einfach zu programmieren. */
function saveScore() {
    addEntry();
    showBonus();
    let name = document.getElementById("saveName").value;
    let guest = 'Guest';
    let highscore = localStorage.getItem("highscore");
    //Leerzeichen ausschließen
    if (document.getElementById("saveName").value === null || document.getElementById("saveName").value === '' || document.getElementById("saveName").value === ' ') {
        name = guest;
    };

// Englisch
    if (lang == 0) {
    if(highscore !== null){
        if (points > highscore) {
            localStorage.setItem("highscore", points); 
            localStorage.setItem("user_name", name); 
            document.getElementById("highscore").innerHTML = 'Your personal highscore: '+localStorage.getItem("highscore");
    };
} else {
        localStorage.setItem("highscore", points);
        document.getElementById("highscore").innerHTML = 'Your personal highscore: '+localStorage.getItem("highscore");
    };

// Deutsch
} else if (lang == 1) {
    if(highscore !== null){
        if (points > highscore) {
            localStorage.setItem("highscore", points); 
            localStorage.setItem("user_name", name); 
            document.getElementById("highscore").innerHTML = 'Dein persönlicher Highscore: '+localStorage.getItem("highscore");
    };
} else {
        localStorage.setItem("highscore", points);
        document.getElementById("highscore").innerHTML = 'Dein persönlicher Highscore: '+localStorage.getItem("highscore");
    };
};
    document.getElementById("save").style.pointerEvents = "none";
    document.getElementById("save").style.opacity = "0.5";
    document.getElementById("price").style.pointerEvents = "initial";
};

let existingEntries = JSON.parse(localStorage.getItem("allEntries"));

/* Funktion um bei entsprechendem Button Klick die Highscore Liste zu erweitern.
Hier wird ein Array erstellt mit allen Entries, das ganze wird dann auch ins LocalStorage geladen. 
Ein Array wird benötigt weil der Name dazu ja auch in die Liste geladen werden soll. */
function addEntry() {
    let guest = 'Guest';
    if(existingEntries == null) existingEntries = [];
    let entryTitle = document.getElementById("saveName").value;
    if (document.getElementById("saveName").value === null || document.getElementById("saveName").value === '' || document.getElementById("saveName").value === ' ') {
        entryTitle = guest;
    }
    let entryText = points;
    let entry = {
        name: entryTitle,
        points: entryText
    };
    localStorage.setItem("entry", JSON.stringify(entry));

// Alle Entries speichern.
    existingEntries.push(entry);
    localStorage.setItem("allEntries", JSON.stringify(existingEntries));
    existingEntries.sort(function(a, b){return b.points-a.points});
};

// Diese Funktion ist dazu da den Entry, also Highscore mit Namen in die Liste reinzuladen. Maximal sollen nur die besten fünf Highscores angezeigt werden.
    function setList() {
    existingEntries.sort(function(a, b){return b.points-a.points});

// Englisch
if (lang == 0) {
    if (existingEntries.length<5){
        for (let x=0; x<existingEntries.length; x++){
            document.getElementById("highscoreList").innerHTML +="<li>"+ existingEntries[x].name+" with a score of: "+existingEntries[x].points+"</li>";
        }; 
    }   else {
            for (let x=0; x<5; x++){
                document.getElementById("highscoreList").innerHTML +="<li>"+ existingEntries[x].name+" with a score of: "+existingEntries[x].points+"</li>"; 
            };
        };

// Deutsch
} else if (lang == 1) {
    if (existingEntries.length<5){
        for (let x=0; x<existingEntries.length; x++){
            document.getElementById("highscoreList").innerHTML +="<li>"+ existingEntries[x].name+" mit: "+existingEntries[x].points+" Punkte(n)</li>";
        }; 
    }   else {
            for (let x=0; x<5; x++){
                document.getElementById("highscoreList").innerHTML +="<li>"+ existingEntries[x].name+" mit: "+existingEntries[x].points+" Punkte(n)</li>"; 
            };
        };
    };
};

// Wir wollen ja auch dass der Highscore resettet werden kann, deswegen hier der Code dafür.
function resetScore () {
    localStorage.setItem("highscore", 0); 
    localStorage.removeItem("allEntries");
    document.getElementById("highscoreList").innerHTML = '';

// Englisch
    if (lang == 0) {
    document.getElementById("highscore").innerHTML = "Highscore was reset."; 

// Deutsch
    } else if (lang == 1) {
        document.getElementById("highscore").innerHTML = "Highscore zurückgesetzt."; 
    };
    document.getElementById("reset").style.pointerEvents = "none";
    document.getElementById("reset").style.opacity = "0.5";
    document.getElementById("save").style.pointerEvents = "none";
    document.getElementById("save").style.opacity = "0.5";
}

/* Da ich ja den Effekt beim knacken des Highscores nicht komplett selbst geschrieben habe, wollte ich bei erreichen der Höchstpunktzahl noch ein Easter Egg einbauen.
Das Easter Egg ist ein neue Seite, bei der ich mithilfe von P5 versucht habe ansatzweise generative Kunst zu erzeugen welche man sich dann runter laden kann.
Wenn der Browser es supportet (Firefox tut es scheinbar nicht) dann wird auch der Highscore Name des Spielers in die Kunst eingetragen.
Außerdem wird der Button für den "Preis" erst angezeigt sobald man die Höchstpunktzahl erreicht UND seinen Highscore speichert. */
function getPrice() {
    location.href = "price.html";
};

/* Der Bonus wird nur angezeigt, wenn man fünf Punkte erreicht hat. */
function showBonus() {
    if (points > 4) {
        document.getElementById("price").style.display = "block";
    } else {
        document.getElementById("price").style.display = "none";
    }
};
