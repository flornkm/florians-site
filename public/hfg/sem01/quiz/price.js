/* ZIEL: Ich wollte hier einen Generator für generative Artboards mit P5 bauen, da ja alles sozusagen einzigartig ist, bekommt der User bei einem Highscore die Möglichkeit
ein extra für ihn generiertes Bild zu downloaden. */

let SIZE = 20;
let PALETTE = [];

function setup() {
    createCanvas(windowWidth, windowHeight-SIZE*12-2);

    background("white");
    rectMode(CENTER);
    frameRate(2);
    looping();

    PALETTE = [
        color(255, 0, 0), //red
        color(0, 0, 255), // blue
        color(29, 224, 81), //green
        color(235, 228, 26), //yellow
        color(23, 255, 205), //cyan
        color(255, 23, 116) //pink
    ];
};

function draw() {
    let rndm = random(1);
    let middleX = width/2;
    let middleY = height/2;
    translate(middleX, middleY);
    
    if (rndm < 0.3) {
    backgroundSunSet();
    } else if (rndm > 0.3 && rndm < 0.6) {
    backgroundSnow();
    } else if (rndm > 0.6) {
    backgroundWorld();
    };
    bruno();
    translate(SIZE*2, SIZE*5);
    sheep();
};

// Loop
let click = 0;

function looping() {
    if (click === 0) {
        document.getElementById("loops").innerHTML = '<i class="material-icons">play_arrow</i>';
        noLoop();
        click++;
    } else {
        document.getElementById("loops").innerHTML = '<i class="material-icons">pause</i>';
        loop();
        click--;
    };
};

// Landschaft Hintergrund
function backgroundWorld() {
    push();
    noStroke();
    background("#FF742A");
    fill("#FC6DBC");
    for (let x = 0; x < 86; x++) {
        for (let y = 0; y < 6; y++) {
        rect(x*SIZE-SIZE*43, y*SIZE-SIZE*8, SIZE, SIZE);
        };
        rect(x*SIZE*2-SIZE*43, SIZE-SIZE*10, SIZE, SIZE);
        rect(x*SIZE*2-SIZE*42, SIZE-SIZE*11, SIZE, SIZE);
        rect(x*SIZE*2-SIZE*43, SIZE-SIZE*12, SIZE, SIZE);
        rect(x*SIZE*2-SIZE*42, SIZE-SIZE*13, SIZE, SIZE);
        rect(x*SIZE*2-SIZE*43, SIZE-SIZE*14, SIZE, SIZE);
    };
    fill("#B0359A");
    for (let x = 0; x < 86; x++) {
        for (let y = 0; y < 6; y++) {
        rect(x*SIZE-SIZE*43, y*SIZE-SIZE*2, SIZE, SIZE);
        };
    };
    fill("#FCC826");
    for (let x = 0; x < 86; x++) {
        for (let y = 0; y < 6; y++) {
        rect(x*SIZE-SIZE*43, y*SIZE+SIZE*10, SIZE, SIZE);
        };
    };
    fill("#C8882C");
    for (let x = 0; x < 86; x++) {
        for (let y = 0; y < 3; y++) {
        rect(x*SIZE-SIZE*43, y*SIZE+SIZE*7, SIZE, SIZE);
        };
    };
    for (let x = 0; x < 86; x++) {
        rect(x*SIZE*2-SIZE*43, SIZE+SIZE*9, SIZE, SIZE);
    };
    fill("#80E23F");
    for (let x = 0; x < 86; x++) {
        for (let y = 0; y < 3; y++) {
        rect(x*SIZE-SIZE*43, y*SIZE+SIZE*4, SIZE, SIZE);
        };
    };
    for (let x = 0; x < 86; x++) {
    rect(x*SIZE*3-SIZE*43, SIZE+SIZE*6, SIZE, SIZE);
    rect(x*SIZE*3-SIZE*42, SIZE+SIZE*6, SIZE, SIZE);
    rect(x*SIZE*2-SIZE*42, SIZE+SIZE*7, SIZE, SIZE);
    };
    pop();
};

// Schnnee Hintergrund
function backgroundSnow() {
    let numbers = [4, 7, 10];
    
    push();
    noStroke();
    background("#00AEEF");
    blendMode(OVERLAY);
    for (let x = 0-width/SIZE; x < width/SIZE; x++) {
        for (let y = 0-width/SIZE; y < width/SIZE; y++) {
        fill(getRandomFromPalette());
        let rndm = random(numbers);
        rect(x*SIZE*rndm, y*SIZE*rndm, SIZE, SIZE);
        };
    };
    pop();
};

// Sonnenuntergang Hintergrund
function backgroundSunSet() {
    push();
    noStroke();
    fill("#ffc94d");
    for (let x = 0-(width/2); x < width; x++) {
        for (let y = 0; y < 13; y++) {
        rect(x*SIZE, y*SIZE+SIZE*3, SIZE, SIZE);
        };
    };
    fill("#ff8e51");
    for (let x = 0-(width/2); x < width; x++) {
        for (let y = 0; y < 10; y++) {
        rect(x*SIZE, y*SIZE-SIZE*4, SIZE, SIZE);
        };
    };
    for (let x = 0; x < 30; x++) {
        rect(x*SIZE+SIZE*30, SIZE+SIZE*5, SIZE, SIZE);
        rect(x*SIZE, SIZE+SIZE*6, SIZE, SIZE);
        rect(x*SIZE-SIZE*30, SIZE+SIZE*7, SIZE, SIZE);
        rect(x*SIZE-SIZE*60, SIZE+SIZE*8, SIZE, SIZE);
    };
    fill("#ff6a4f");
    for (let x = 0-(width/2); x < width; x++) {
        for (let y = 0; y < 6; y++) {
        rect(x*SIZE, y*SIZE-SIZE*10, SIZE, SIZE);
        };
    };
    for (let x = 0; x < 50; x++) {
    rect(x*SIZE-SIZE*20, SIZE-SIZE*4, SIZE, SIZE);
    rect(x*SIZE-SIZE*70, SIZE-SIZE*3, SIZE, SIZE);
    rect(x*SIZE-SIZE*70, SIZE-SIZE*3, SIZE, SIZE);
    rect(x*SIZE+SIZE*30, SIZE-SIZE*5, SIZE, SIZE);
    };
    fill("#ef4374");
    for (let x = 0-(width/2); x < width; x++) {
        for (let y = 0; y < 6; y++) {
        rect(x*SIZE, y*SIZE-SIZE*15, SIZE, SIZE);
        };
    };
    fill("#ef4374");
    for (let x = 0; x < 50; x++) {
        rect(x*SIZE-SIZE*42, SIZE-SIZE*9, SIZE, SIZE);
        rect(x*SIZE+SIZE*8, SIZE-SIZE*10, SIZE, SIZE);
        };
    pop();
};

// Bruno der Schäfer
function bruno() {
    push();
    noStroke();
    
    
    // Farbe
    fill("#FEC6AB");
    for (let x = 0; x < 11; x++) {
        for (let y = 0; y < 7; y++) {
        rect(x*SIZE-SIZE*5, y*SIZE-SIZE*11, SIZE, SIZE);
        };
    };
    
    fill("#F67822");
    for (let x = 0; x < 17; x++) {
        for (let y = 0; y < 15; y++) {
        rect(x*SIZE-SIZE*8, y*SIZE+SIZE, SIZE, SIZE);
        };
    };

    for (let x = 0; x < 15; x++) {
        rect(x*SIZE-SIZE*7, 0, SIZE, SIZE);
        rect(x*SIZE-SIZE*7, 0-SIZE, SIZE, SIZE);
        for (let y = 0; y < 3; y++) {
        rect(x*SIZE-SIZE*7, y*SIZE-SIZE*15, SIZE, SIZE);
        };
    };

    for (let x = 0; x < 4; x++) {
        rect(x*SIZE-SIZE*7, 0, SIZE, SIZE);
        rect(x*SIZE-SIZE, 0-SIZE*2, SIZE, SIZE);
        rect(x*SIZE-SIZE, 0-SIZE*3, SIZE, SIZE);
    };

    fill("black");
    rect(0-SIZE*8, 0, SIZE, SIZE);
    rect(0+SIZE*8, 0, SIZE, SIZE);

    // 2 Pixel
    for (let x = 0; x < 2; x++) {
    rect(0-SIZE*2, x*SIZE-SIZE*3, SIZE, SIZE);
    rect(0+SIZE*2, x*SIZE-SIZE*3, SIZE, SIZE);
    rect(0+SIZE*7, x*SIZE-SIZE*15, SIZE, SIZE);
    rect(0-SIZE*7, x*SIZE-SIZE*15, SIZE, SIZE);
    rect(x*SIZE-SIZE*9, 0-SIZE*13, SIZE, SIZE);
    rect(x*SIZE+SIZE*8, 0-SIZE*13, SIZE, SIZE);
    };

    for (let x = 0; x < 3; x++) {
    rect(0-SIZE*3, x*SIZE-SIZE*10, SIZE, SIZE);
    rect(0+SIZE*3, x*SIZE-SIZE*10, SIZE, SIZE);
    };

    // 5 Pixel
    for (let x = 0; x < 5; x++) {
    rect(x*SIZE-SIZE*7, 0-SIZE, SIZE, SIZE);
    rect(x*SIZE+SIZE*3, 0-SIZE, SIZE, SIZE);
    };

    // 7 Pixel
    for (let x = 0; x < 7; x++) {
    rect(0-SIZE*6, x*SIZE-SIZE*11, SIZE, SIZE);
    rect(0+SIZE*6, x*SIZE-SIZE*11, SIZE, SIZE);
    };

    // 11 Pixel
    for (let x = 0; x < 11; x++) {
    rect(x*SIZE-SIZE*5, 0-SIZE*4, SIZE, SIZE);
    };

    // 15 Pixel
    for (let x = 0; x < 15; x++) {
    rect(x*SIZE-SIZE*7, 0-SIZE*12, SIZE, SIZE);
    };

    // 14 Pixel
    for (let x = 0; x < 14; x++) {
    rect(0, x*SIZE+SIZE*4, SIZE, SIZE);
    };

    // 17 Pixel
    for (let x = 0; x < 17; x++) {
    rect(0-SIZE*9, x*SIZE+SIZE, SIZE, SIZE);
    rect(0+SIZE*9, x*SIZE+SIZE, SIZE, SIZE);
    };

}

// Schaf
function sheep() {
    let sheepColor = "white";

    push();
    noStroke();
    // Farbe
    fill(sheepColor);
    // 20 Pixel 
    for (let x = 0; x < 20; x++) {
        for (let y = 0; y < 10; y++) {
        rect(x*SIZE+SIZE*2, y*SIZE+SIZE*6, SIZE, SIZE);
        };
    };
    // 17 Pixel
    for (let x = 0; x < 17; x++) {
        rect(x*SIZE-SIZE*8, 0-SIZE*8, SIZE, SIZE);
        rect(x*SIZE-SIZE*8, 0-SIZE*7, SIZE, SIZE);
    };
    // 12 Pixel
    for (let x = 0; x < 12; x++) {
    rect(x*SIZE+SIZE*2, 0+SIZE*5, SIZE, SIZE);
    };
    // 10 Pixel
    for (let x = 0; x < 10; x++) {
        rect(x*SIZE-SIZE*4, 0-SIZE*9, SIZE, SIZE);
        for (let y = 0; y < 5; y++) {
        rect(x*SIZE-SIZE*4, y*SIZE-SIZE*6, SIZE, SIZE);
        };
    };
    // 8 Pixel
    for (let x = 0; x < 8; x++) {
        rect(x*SIZE-SIZE*4, 0-SIZE*10, SIZE, SIZE);
    };
    // 4 Pixel 
    for (let x = 0; x < 4; x++) {
        rect(x*SIZE+SIZE*2, 0+SIZE*4, SIZE, SIZE);
    };
    // 3 Pixel 
    for (let x = 0; x < 3; x++) {
        for (let y = 0; y < 17; y++) {
        rect(x*SIZE-SIZE, y*SIZE-SIZE*1, SIZE, SIZE);
        };
    };

    fill("black");
    // 10 Pixel aneinander
    for (let x = 0; x < 10; x++) {
        rect(0+SIZE*22, x*SIZE+SIZE*6, SIZE, SIZE);
    };
    // 8 Pixel aneinander
    for (let x = 0; x < 8; x++) {
        rect(0-SIZE*2, x*SIZE, SIZE, SIZE);
        rect(0-SIZE*1, x*SIZE+SIZE*8, SIZE, SIZE);
        rect(x*SIZE+SIZE*6, 0+SIZE*4, SIZE, SIZE);
        rect(x*SIZE+SIZE*14, 0+SIZE*5, SIZE, SIZE);
        };
    for (let x = 0; x < 7; x++) {
        rect(x*SIZE-SIZE*3, 0-SIZE*11, SIZE, SIZE);
    };
    // 4 Pixel aneinander
    for (let x = 0; x <4; x++) {
        rect(x*SIZE+SIZE*5, 0-SIZE*9, SIZE, SIZE);
        rect(x*SIZE-SIZE*8, 0-SIZE*9, SIZE, SIZE);
        rect(x*SIZE+SIZE*2, 0+SIZE*3, SIZE, SIZE);
    };
    // 3 Pixel aneinander
    for (let x = 0; x < 3; x++) {
        rect(0+SIZE*2, x*SIZE, SIZE, SIZE);
        rect(0+SIZE*5, x*SIZE-SIZE*5, SIZE, SIZE);
        rect(0-SIZE*5, x*SIZE-SIZE*5, SIZE, SIZE);
        rect(x*SIZE-SIZE*4, 0-SIZE, SIZE, SIZE);
        rect(x*SIZE+SIZE*2, 0-SIZE, SIZE, SIZE);
        rect(x*SIZE+SIZE*5, 0-SIZE*6, SIZE, SIZE);
        rect(x*SIZE-SIZE*7, 0-SIZE*6, SIZE, SIZE);
        rect(x*SIZE-SIZE, 0-SIZE*3, SIZE, SIZE);
        };
    // 2 Pixel aneinander
    for (let x = 0; x < 2; x++) {
        rect(x*SIZE-SIZE*5, 0-SIZE*2, SIZE, SIZE);
        rect(x*SIZE+SIZE*4, 0-SIZE*2, SIZE, SIZE);
        rect(0-SIZE*9, x*SIZE-SIZE*9, SIZE, SIZE);
        rect(0+SIZE*9, x*SIZE-SIZE*9, SIZE, SIZE);
        rect(0+SIZE*6, x*SIZE+SIZE*14, SIZE, SIZE);
        rect(0+SIZE*6, x*SIZE+SIZE*12, SIZE, SIZE);
        // Auge rechts
        rect(0+SIZE*3, x*SIZE-SIZE*6, SIZE, SIZE);
        rect(0+SIZE*2, x*SIZE-SIZE*6, SIZE, SIZE);
        // Auge links 
        rect(0-SIZE*3, x*SIZE-SIZE*6, SIZE, SIZE);
        rect(0-SIZE*2, x*SIZE-SIZE*6, SIZE, SIZE);
        fill("#FEA6A6");
        // Backe rechts
        rect(0+SIZE*4, x*SIZE-SIZE*4, SIZE, SIZE);
        rect(0+SIZE*3, x*SIZE-SIZE*4, SIZE, SIZE);
        // Backe links
        rect(0-SIZE*4, x*SIZE-SIZE*4, SIZE, SIZE);
        rect(0-SIZE*3, x*SIZE-SIZE*4, SIZE, SIZE);
        fill("black");
    };
    // 1 Pixel
    rect(SIZE-SIZE*9, 0-SIZE*7, SIZE, SIZE);
    rect(SIZE+SIZE*7, 0-SIZE*7, SIZE, SIZE);
    rect(SIZE+SIZE*3, 0-SIZE*10, SIZE, SIZE);
    rect(SIZE-SIZE*5, 0-SIZE*10, SIZE, SIZE);
    rect(SIZE-SIZE, 0-SIZE*4, SIZE, SIZE);

    pop();
}

function getRandomFromPalette() {
    const rndm2 = floor(random(0, PALETTE.length));
    return PALETTE[rndm2];
};

// Einstellungen

function goBack() {
    window.location.href = "quiz.html";
};

function downloadArtwork () {
    saveCanvas('quiz_artwork', 'jpg');
}
