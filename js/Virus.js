function setPopulation(percHealthy, percIll, percDead) {
    var virusPanel = document.getElementById("virusPanel");
    // get the inner DOM of alpha.svg
    var svgDoc = virusPanel.contentDocument;
    // get the inner element by id
    var left1 = svgDoc.getElementById('left1');
    var left2 = svgDoc.getElementById('left2');
    var left3 = svgDoc.getElementById('left3');
    //var left4 = svgDoc.getElementById('left4');

    //left1.setAttribute('height', initialHeight * percDead);
    //left2.setAttribute('height', initialHeight * (percDead + percIll));
    //left3.setAttribute('height', initialHeight * (percDead + percIll + percHealthy));
    //left4.setAttribute('height', initialHeight * (percDead+percIll));
}

function setHospitalCapacity(perc) {
    var virusPanel = document.getElementById("virusPanel");
    // get the inner DOM of alpha.svg
    var svgDoc = virusPanel.contentDocument;
    // get the inner element by id
    var hospitalCap = svgDoc.getElementById('right2');
    //hospitalCap.setAttribute('height', initialHeight * perc);
}

function getRandomInt(min, max) {
    return Math.round(Math.random() * (max - min) + min);
}

var lastIll = 0,
    lastImm = 0,
    lastDead = 0

var pplPerPoint

function spawnPoints() {
    var svgns = "http://www.w3.org/2000/svg";

    var virusPanel = document.getElementById("virusPanel");
    var svgDoc = virusPanel.contentDocument;
    container = svgDoc.getElementById('group');
    console.log(container);

    /*  for (var i = 0; i < population / pplPerPoint; i++) {
          var circle = document.createElementNS(svgns, 'circle');
          var x = getRandomInt(75, 505);
          var y = getRandomInt(25, 625);

          circle.setAttributeNS(null, 'cx', x);
          circle.setAttributeNS(null, 'cy', y);
          circle.setAttributeNS(null, 'r', 3.5);

          circle.setAttributeNS(null, 'fill', '#8ea604');
          circle.setAttributeNS(null, 'class', 'sus');

          container.appendChild(circle);
      }*/
    var count = 0
    for (var i = 70; i < 550; i += 10) {
        for (var j = 10; j < 635; j += 10) {
            var circle = document.createElementNS(svgns, 'circle');

            circle.setAttributeNS(null, 'cx', i);
            circle.setAttributeNS(null, 'cy', j);
            circle.setAttributeNS(null, 'r', 6);

            circle.setAttributeNS(null, 'fill', '#8ea604');
            circle.setAttributeNS(null, 'class', 'sus');

            container.appendChild(circle);
            count++;
        }
    }
    pplPerPoint = population / count;
}

function getPoints() {
    var svgns = "http://www.w3.org/2000/svg";

    var virusPanel = document.getElementById("virusPanel");
    var svgDoc = virusPanel.contentDocument;
    points = svgDoc.getElementsByTagName('circle');

    /*  for (var i = 0; i < population / pplPerPoint; i++) {
          var circle = document.createElementNS(svgns, 'circle');
          var x = getRandomInt(75, 505);
          var y = getRandomInt(25, 625);

          circle.setAttributeNS(null, 'cx', x);
          circle.setAttributeNS(null, 'cy', y);
          circle.setAttributeNS(null, 'r', 3.5);

          circle.setAttributeNS(null, 'fill', '#8ea604');
          circle.setAttributeNS(null, 'class', 'sus');

          container.appendChild(circle);
      }*/
    var count = points.length;
    for (var p of points) {

        p.setAttribute('fill', '#8ea604');
        p.setAttribute('class', 'sus');
        //p.setAttribute('visibility', 'hidden');



    }
    pplPerPoint = population / count;
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
            for (let i = 0; i < newIll; i++) {
                x = getRandomInt(0, sus.length - 1);
                var ele = sus[x];
                console.log(x + ", " + sus.length);
                ele.setAttribute('class', 'ill');
                ele.setAttribute('fill', '#973535');
                //ele.setAttribute('visibility', 'visible')
            }
        } else if (newIll < 0) {
            newDead++;
        }
    }
    lastIll = ill;
    ills = pointGroup.getElementsByClassName('ill');
    //only ill can die
    if (newDead > 0) {

        for (let i = 0; i < newDead; i++) {
            x = getRandomInt(0, ills.length - 1);
            var ele = ills[x];
            console.log(x + ", " + ills.length);
            ele.setAttribute('class', 'dead');
            ele.setAttribute('fill', '#463F3A');
            //ele.setAttribute('visibility', 'visible')
        }
    }
    lastDead = d;
    ills = pointGroup.getElementsByClassName('ill');
    //only ill can get immune
    if (newImm > 0) {
        for (let i = 0; i < newImm; i++) {
            x = getRandomInt(0, ills.length - 1);
            var ele = ills[x];
            console.log(x + ", " + ills.length);
            ele.setAttribute('class', 'imm');
            ele.setAttribute('fill', '#b9b9b9');
            //ele.setAttribute('visibility', 'hidden')
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
    //initialHeight = hospitalCap.getAttribute('height');
    initialHeight = 1;
    getPoints();

}, false);