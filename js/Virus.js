function setPopulation(percHealthy, percIll, percDead) {
    var virusPanel = document.getElementById("virusPanel");
    // get the inner DOM of alpha.svg
    var svgDoc = virusPanel.contentDocument;
    // get the inner element by id
    var left1 = svgDoc.getElementById('left1');
    var left2 = svgDoc.getElementById('left2');
    var left3 = svgDoc.getElementById('left3');
    //var left4 = svgDoc.getElementById('left4');

    left1.setAttribute('height', initialHeight * percDead);
    left2.setAttribute('height', initialHeight * (percDead + percIll));
    left3.setAttribute('height', initialHeight * (percDead + percIll + percHealthy));
    //left4.setAttribute('height', initialHeight * (percDead+percIll));
}

function setHospitalCapacity(perc) {
    var virusPanel = document.getElementById("virusPanel");
    // get the inner DOM of alpha.svg
    var svgDoc = virusPanel.contentDocument;
    // get the inner element by id
    var hospitalCap = svgDoc.getElementById('right2');
    hospitalCap.setAttribute('height', initialHeight * perc);
}

function getRandomInt(min, max) {
    return Math.round(Math.random() * (max - min) + min);
}

var lastIll = 0,
    lastImm = 0,
    lastDead = 0

var pplPerPoint = 100000

function spawnPoints() {
    var svgns = "http://www.w3.org/2000/svg";

    var virusPanel = document.getElementById("virusPanel");
    var svgDoc = virusPanel.contentDocument;
    container = svgDoc.getElementById('group');
    console.log(container);

    for (var i = 0; i < population / pplPerPoint; i++) {
        var circle = document.createElementNS(svgns, 'circle');
        var x = getRandomInt(75, 505);
        var y = getRandomInt(20, 630);

        circle.setAttributeNS(null, 'cx', x);
        circle.setAttributeNS(null, 'cy', y);
        circle.setAttributeNS(null, 'r', 3.5);

        circle.setAttributeNS(null, 'fill', '#8ea604');
        circle.setAttributeNS(null, 'class', 'sus');

        container.appendChild(circle);
    }
}

//something is still fishy here, even when there are no longer infected, the red points will stay
function changePoints(ill, im, d) {
    im = Math.round(im / pplPerPoint);
    d = Math.round(d / pplPerPoint);
    var newDead = d - lastDead;
    var newImm = im - lastImm;

    ill = Math.round(ill / pplPerPoint);


    if (ill > 0) {
        var newIll = ill - lastIll + newDead + newImm;
        //only sus can get ill
        if (newIll > 0) {
            sus = pointGroup.getElementsByClassName('sus');
            conv = 0;
            for (let i of sus) {
                i.setAttribute('class', 'ill');
                i.setAttribute('fill', '#a70b10');
                conv++;
                if (conv == newIll) {
                    break;
                }
            }
        } else if (newIll < 0) {
            newDead++;
        }
    }
    lastIll = ill;

    //only ill can die
    if (newDead > 0) {
        ills = pointGroup.getElementsByClassName('ill');
        var conv = 0;
        for (let i of ills) {
            i.setAttribute('class', 'dead');
            i.setAttribute('fill', '#463F3A');
            conv++;
            if (conv == newDead) {
                break;
            }
        }
    }
    lastDead = d;

    //only ill can get immune
    if (newImm > 0) {
        ills = pointGroup.getElementsByClassName('ill');
        conv = 0;
        for (let i of ills) {
            i.setAttribute('class', 'imm');
            i.setAttribute('fill', '#009af5');
            conv++;
            if (conv == newImm) {
                break;
            }
        }
    }
    lastImm = im;

    print('ill ' + newIll + ", im: " + newImm + "d: " + newDead);
}

var initialHeight
var pointGroup

var virusPanel = document.getElementById("virusPanel");
virusPanel.addEventListener("load", function() {
    // get the inner DOM of alpha.svg
    var svgDoc = virusPanel.contentDocument;
    pointGroup = svgDoc.getElementById('group');
    // get the inner element by id
    var hospitalCap = svgDoc.getElementById('right2');
    // add behaviour
    initialHeight = hospitalCap.getAttribute('height');
    spawnPoints();

}, false);