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

function spawnPoint(container) {
    var svgns = "http://www.w3.org/2000/svg";
    for (var i = 0; i < 100; i++) {
        var circle = document.createElementNS(svgns, 'circle');
        var x = getRandomInt(52, 550);
        var y = getRandomInt(0, 651)

        color = getRandomInt(0, 3);
        circle.setAttributeNS(null, 'cx', x);
        circle.setAttributeNS(null, 'cy', y);
        circle.setAttributeNS(null, 'r', 3);
        console.log(color);
        switch (color) {
            case 0:
                circle.setAttributeNS(null, 'fill', '#009af5');
                break;
            case 1:
                circle.setAttributeNS(null, 'fill', '#8ea604');
                break;
            case 2:
                circle.setAttributeNS(null, 'fill', '#a70b10');
                break;
            case 3:
                circle.setAttributeNS(null, 'fill', '#463F3A');
                break;
        }
        container.appendChild(circle);
    }
}

var initialHeight

var virusPanel = document.getElementById("virusPanel");
virusPanel.addEventListener("load", function() {
    // get the inner DOM of alpha.svg
    var svgDoc = virusPanel.contentDocument;
    // get the inner element by id
    var hospitalCap = svgDoc.getElementById('right2');
    // add behaviour
    initialHeight = hospitalCap.getAttribute('height');

}, false);