// Um für mehr Ordnung zu sorgen sind hier alle Modus Einstellungen drin was man während dem Quiz einstellen kann, also sowas wie die Sound Einstellung.

/* Habe das Quiz in Englisch geschrieben deshalb will ich es ins deutsche übersetzen */
function languageChange() {
    if (localStorage.getItem("Language") == null) {
        lang = 0;
        localStorage.setItem("Language", lang);
    }
    if (lang == 0) {
        lang++;
        de();
        console.log("Deutsch");
        document.getElementById("language").innerHTML = '&#127465;&#127466; <br/> Deutsch';
        localStorage.setItem("Language", lang);
        console.log(localStorage.getItem("Language"));
    } else if (lang == 1) {
        lang--;
        en();
        console.log("Englisch");
        document.getElementById("language").innerHTML = '&#127468;&#127463; <br/> English';
        localStorage.setItem("Language", lang);
        console.log(localStorage.getItem("Language"));
    };
    setSound();
    setSound();
    document.getElementById("highscoreList").innerHTML = "";
    if (existingEntries != null) {
    setList();
    };
    if (lang == 0) {
    document.getElementById("highscore").innerHTML = "Your personal highscore: "+localStorage.getItem("highscore");
    } else if (lang == 1) {
    document.getElementById("highscore").innerHTML = "Dein persönlicher Highscore: "+localStorage.getItem("highscore");  
    };
};

// Sprache speichern und laden
function loadLanguage() {
    lang = localStorage.getItem("Language");
    if (localStorage.getItem("Language") == 0) {
        en();
        console.log("Englisch geladen");
        document.getElementById("language").innerHTML = '&#127468;&#127463; <br/> English';
    } else if (localStorage.getItem("Language") == 1) {
        de();
        console.log("Deutsch geladen");
        document.getElementById("language").innerHTML = '&#127465;&#127466; <br/> Deutsch';
    };
    if (localStorage.getItem("Language") == null) {
        lang = 0;
        localStorage.setItem("Language", lang);
    }
};

// Funktion für die deutsche Übersetzungen
function de() {
    document.getElementById("quest").innerHTML = 'Willkommen zum Geschichtsquiz!';
    document.getElementById("click").innerHTML = 'Klicke hier um zu starten. Du musst zum Schaf gehen, das kannst du tun indem du die Fragen richtig beantwortest.';
    if (document.getElementById("questNr") == "1") {
    document.getElementById("questNr").innerHTML = 'Frage Nr. '+count; 
    };
    document.getElementById("choose-title").innerHTML = "Welchen Weg soll Bruno gehen?";
    document.getElementById("history").innerHTML = "<i class='material-icons'>history_toggle_off</i><br/>Geschichte";
    document.getElementById("points").innerHTML = "Punkte: <br/>0";
    document.getElementById("button").innerHTML = "Nächste Frage";
    document.getElementById("endbutton").innerHTML = "Ergebnisse";
    document.getElementById("save").innerHTML = "Highscore speichern";
    document.getElementById("reset").innerHTML = "Highscore zurücksetzen";
    document.getElementById("restart").innerHTML = "Quiz neu starten";
    document.getElementById("desc").innerHTML = 'Um einen neuen Highscore zu speichern klicke den "Speichern"-Button.';
    document.getElementById("input-name").innerHTML = 'Wer hat Bruno geholfen? ';
    document.getElementById("bestlist").innerHTML = 'Bestliste:';
    document.getElementById("h1-title-start").innerHTML = 'Willkommen zu meinem ersten "großen" Javascript Projekt:<br/> Ein Quiz Spiel';
    document.getElementById("h2-title-how").innerHTML = 'Story';
    document.getElementById("h2-title-goal").innerHTML = 'Ziel';
    document.getElementById("h2-title-error").innerHTML = 'Browser Fehler';
    document.getElementById("price").innerHTML = 'Zum Schaf';
    document.getElementById("what-he-wants").innerHTML = 'Damit Bruno der Hirte sein Schaf wiederfindet, muss er fünf Fragen richtig beantworten. Doch das geht nur, indem du ihm hilfst.<br/><br/><b>Wähle eine Kategorie aus.</b>'
    document.getElementById("p-text-how").innerHTML = 'Bruno ist ein Hirte und hat sein geliebtes Schaf verloren. Deshalb ist seine Mission dieses zu finden. Um es zu finden muss er fünf schwierige Fragen richtig beantworten. Wenn er alle fünf Punkte hat kommt er zu seinem Schaf. Du kannst seine Punkte oben links in der Ecke sehen. Außerdem kannst du deinen Score speichern. Die Höchspunktzahl (5) zu speichern ist wichtig um zu dem Schaf zu gehen.';
    document.getElementById("p-text-error").innerHTML = "Wenn du diesen Startscreen nicht mit dem X Button oben rechts schließen kannst, dann liegt es vermutlich daran dass dein Browser die temporären Daten nicht korrekt speichert. Bitte lösche deine gesamten Browser- und Cookiedaten und starte den Browser neu, dann sollte es wieder gehen.";
    document.getElementById("p-text-goal").innerHTML = "Das Ziel ist es, wie bereits oben erwähnt, Bruno zu helfen, Fragen einer Kategorie richtig zu beantworten. Wenn du 5 Fragen richtig beantwortet hast, dann kann Bruno sein Schaf (rechts) finden.";
    document.getElementById("copy").innerHTML = '<p>Quiz von Florian Kiem <br/> Projekt an der HfG Schwäbisch Gmünd <br/> Musik von <a href="https://bit.ly/3JnOr0D" target="_blank">hier</a> – Konfetti von <a href="https://github.com/catdad/canvas-confetti">hier</a></p>';
};

//Funktion für die englische Übersetzung
function en() {
        document.getElementById("quest").innerHTML = 'Welcome to the History Quiz!';
        document.getElementById("click").innerHTML = 'Click here to start it. You have to go to the sheep, you can to that through answering right.';
        if (document.getElementById("questNr") == "1") {
        document.getElementById("questNr").innerHTML = 'Question Nr. '+count;
        };
        document.getElementById("choose-title").innerHTML = "Which way should Bruno go?"
        document.getElementById("history").innerHTML = "<i class='material-icons'>history_toggle_off</i><br/>History"
        document.getElementById("points").innerHTML = "Points: <br/>0";
        document.getElementById("button").innerHTML = "Next question";
        document.getElementById("endbutton").innerHTML = "Finish";
        document.getElementById("save").innerHTML = "Save new Highscore";
        document.getElementById("reset").innerHTML = "Reset Highscore";
        document.getElementById("restart").innerHTML = "Restart quiz";
        document.getElementById("desc").innerHTML = 'To save a highscore to the list click the "save"-button.';
        document.getElementById("input-name").innerHTML = 'Who helped Bruno? ';
        document.getElementById("bestlist").innerHTML = 'Bestlist:';
        document.getElementById("h1-title-start").innerHTML = 'Welcome to my first "big" JavaScript Project:<br/> A Quiz Game';
        document.getElementById("h2-title-how").innerHTML = 'Story';
        document.getElementById("h2-title-goal").innerHTML = 'Goal';
        document.getElementById("h2-title-error").innerHTML = 'Browser Error';
        document.getElementById("price").innerHTML = 'Go to sheep';
        document.getElementById("what-he-wants").innerHTML = 'Bruno the shepherd needs to answer five questions right to find his sheep. That only works if you help him. <br/><br/><b>Choose one category below.</b>'
        document.getElementById("p-text-how").innerHTML = "Bruno is a shepherd and lost a sheep. That's because his mission is to find it. To find it, he has to answer right difficult questions in five levels. If he get's five Points he is able to see his sheep. You can see his points on the top left corner, you also have the ability to save your score. Saving your score with the highest number of points (5) is necessary to go to the sheep.";
        document.getElementById("p-text-error").innerHTML = "If you are unable to close this frame with the X button on the top right corner, your browser isn't loading the temporary files correctly. To fix this error just delete all your browser cookies & data and completely restart the browser, then it should work.";
        document.getElementById("p-text-goal").innerHTML = "The goal is, as said on top, to help Bruno answering questions in one category right. If you answered all 5 questions right, Bruno is able to find his sheep as seen on the right side of the screen.";
        document.getElementById("copy").innerHTML = '<p>Quiz from Florian Kiem <br/> Projekt at HfG Schwaebisch Gmuend <br/> Music from <a href="https://bit.ly/3JnOr0D" target="_blank">here</a> – Confetti from <a href="https://github.com/catdad/canvas-confetti">here</a></p>';
};

// Startscreen der beim wegklicken auch nach erneutem Besuchen der Seite nicht mehr erscheinen soll.
function startScreen() {
    let starter = 0;
    starter++;
    localStorage.setItem("start", starter);
    let stopper = localStorage.getItem("start");
    console.log(stopper);
    if (stopper > 0 || starter > 0) {
        document.getElementById("start").style.display = "none";
    };
};

//Musik Globale Variable
let music = new Audio('sound/adhesivewombat_nightshade.mp3');

// Sound, nachfolgend hier nur der Code damit die Einstellung die man getroffen hat auch gespeichert wird. Wäre ja aufwendig jedes mal den Sound erneut anzumachen per Button-Klick.
function withoutStorage() {  
    sounds = 0;

// Englisch
if (lang == 0) {
    if (sounds == 0) {
        sounds++;
        document.getElementById("soundButton").innerHTML = "Sound enabled";
        document.getElementById("soundButton").style.backgroundColor = "#0bfc03";
        document.getElementById("soundButton").style.color= "black";
        sounds = 1;
        music.play();
    } else if (sounds > 0) {
        sounds--;
        document.getElementById("soundButton").innerHTML = "Sound disabled";
        document.getElementById("soundButton").style.backgroundColor = "red";
        document.getElementById("soundButton").style.color= "white";
        sounds = 0;
        music.pause();
        music.currentTime = 0;
    };
    localStorage.setItem("Sound", sounds);
    console.log(sounds+" Without Storage");

// Deutsch
} else if (lang == 1) {
    if (sounds == 0) {
        sounds++;
        document.getElementById("soundButton").innerHTML = "Sound <br/> an";
        document.getElementById("soundButton").style.backgroundColor = "#0bfc03";
        document.getElementById("soundButton").style.color= "black";
        sounds = 1;
        music.play();
    } else if (sounds > 0) {
        sounds--;
        document.getElementById("soundButton").innerHTML = "Sound <br/> aus";
        document.getElementById("soundButton").style.backgroundColor = "red";
        document.getElementById("soundButton").style.color= "white";
        sounds = 0;
        music.pause();
        music.currentTime = 0;
    };
    localStorage.setItem("Sound", sounds);
    console.log(sounds+" Without Storage");
};
};

function withStorage() {
        sounds = localStorage.getItem("Sound");

// Englisch
        if (lang == 0) {
        if (sounds == 0) {
            sounds++;
            localStorage.setItem("Sound", sounds);
            document.getElementById("soundButton").innerHTML = "Sound enabled";
            document.getElementById("soundButton").style.backgroundColor = "#0bfc03";
            document.getElementById("soundButton").style.color= "black";
            music.play();
        } else if (sounds == 1) {
            sounds--;
            localStorage.setItem("Sound", sounds);
            document.getElementById("soundButton").innerHTML = "Sound disabled";
            document.getElementById("soundButton").style.backgroundColor = "red";
            document.getElementById("soundButton").style.color= "white";
            music.pause();
            music.currentTime = 0;
        };
        console.log(sounds+" With Storage");

// Deutsch
    } else if (lang == 1) {
        if (sounds == 0) {
            sounds++;
            localStorage.setItem("Sound", sounds);
            document.getElementById("soundButton").innerHTML = "Sounds <br/> an";
            document.getElementById("soundButton").style.backgroundColor = "#0bfc03";
            document.getElementById("soundButton").style.color= "black";
            music.play();
        } else if (sounds == 1) {
            sounds--;
            localStorage.setItem("Sound", sounds);
            document.getElementById("soundButton").innerHTML = "Sounds <br/> aus";
            document.getElementById("soundButton").style.backgroundColor = "red";
            document.getElementById("soundButton").style.color= "white";
            music.pause();
            music.currentTime = 0;
        };
        console.log(sounds+" With Storage");
    };
    };
function setSound() {
    if (localStorage.getItem("Sound") === null) {
    withoutStorage();
    } else {
    withStorage();
    };  
    console.log(localStorage.getItem("Sound"));
    };

function loadSound() {
    if (localStorage.getItem("Sound") == 1) {
        sounds = localStorage.getItem("Sound");
        music.play();

// Englisch
        if (lang == 0) {
        document.getElementById("soundButton").innerHTML = "Sound enabled";
        } else if (lang == 1) {
            document.getElementById("soundButton").innerHTML = "Sound <br/> an";
        };
        document.getElementById("soundButton").style.backgroundColor = "#0bfc03";
        document.getElementById("soundButton").style.color= "black";
    };
    console.log("Sound loaded");
}
