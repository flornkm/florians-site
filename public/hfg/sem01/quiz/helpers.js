// Hier sind wie im quiz.js Dokument schon beschrieben die ganzen Codes drinne die bei price.js nur Chaos verursacht haben.
let clickPoints = 0;
let loopPoints = 0;

function hexagon (posX, posY, radius) {
    const rotAngle = 360 / 6;
    beginShape();
    for (let i = 0; i < SIDES; i++) {
        const thisVertex = pointOnCircle(posX, posY, radius, i * rotAngle);
        vertex(thisVertex.x, thisVertex.y);
    };
    endShape(CLOSE);
};

function pointOnCircle (posX, posY, radius, angle) {
    const x = posX + radius * cos(angle);
    const y = posY + radius * sin(angle);
    return createVector(x, y);
};

function randomSelector() {
    const rndm = random(1);
    if (rndm > 0.5) {
        return true;
    } else {
        return false;
    };
};

function getRandomFromPalette() {
    const rndm2 = floor(random(0, PALETTE.length));
    return PALETTE[rndm2];
};

function goBack() {
    window.open('quiz.html','_self')
};

function downloadArtwork() {
    saveCanvas('price', 'jpg');
};

function disableText() {
    if (clickPoints === 0) {
        clickPoints++;
    } else {
        clickPoints--;
    }
    draw();
}

function looping() {
    if (loopPoints === 0) {
        loopPoints++;
    } else {
        loopPoints--;
    } 
    setup();
};
