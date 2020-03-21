function loadJSON(ressource, callback) {
    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', ressource, true); // Replace 'my_data' with the path to your file
    xobj.onreadystatechange = function() {
        if (xobj.readyState == 4 && xobj.status == "200") {
            // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
            callback(xobj.responseText);
        }
    };
    xobj.send(null);
}

loadJSON("ressources/people.json", function(response) {
    const peopleTree = new TriangleHub("peopleTree", response);
    console.log(response);
    var triangles = document.getElementById("peopleTree");
    triangles.addEventListener("load", function() {
        peopleTree.redraw();
        // get the inner DOM of alpha.svg
        var svgDoc = triangles.contentDocument;
        // get the inner element by id
        var paths = svgDoc.getElementsByTagName('path');
        // add behaviour
        for (let p of paths) {
            p.addEventListener("mouseover", function() {
                var tooltip = document.getElementById("TooltipPeople");
                tooltip.innerHTML = peopleTree.getInfos(p.getAttribute('id'));
            });
        }
    }, false);
    //ausblenden des Tooltips wenn die Maus alle Dreiecke verlässt
    triangles.addEventListener("mouseout", function() {
        var tooltip = document.getElementById("TooltipPeople");
        tooltip.innerHTML = "";
    });
});


loadJSON("ressources/gov.json", function(response) {
    //select the government tree
    const govTree = new TriangleHub("govTree", response);
    var trianglesG = document.getElementById("govTree");
    trianglesG.addEventListener("load", function() {
        govTree.redraw();
        // get the inner DOM of alpha.svg
        var svgDoc = trianglesG.contentDocument;
        // get the inner element by id
        var paths = svgDoc.getElementsByTagName('path');
        // add behaviour
        for (let p of paths) {
            p.addEventListener("mousedown", function() {
                govTree.activateActivity(p.getAttribute('id'));
                govTree.redraw();
            }, false);
            p.addEventListener("mouseover", function() {
                var tooltip = document.getElementById("TooltipGovernment");
                tooltip.innerHTML = govTree.getInfos(p.getAttribute('id'));
            });
        }
    }, false);
    //ausblenden des Tooltips wenn die Maus alle Dreiecke verlässt
    trianglesG.addEventListener("mouseout", function() {
        var tooltip = document.getElementById("TooltipGovernment");
        tooltip.innerHTML = "";
    });
});

var i = 100;

function stepAndGUI() {

    simulateStep(i);
    i++;

    var percdead = dead / population;
    var percIll = allInfected() / population;
    var percHealthy = susceptible / population;
    var percImmune = immune / population;
    print("Dead: " + percdead + "\tInfected: " + percIll + "\tSusceptible: " + percHealthy + "\tImmune: " + percImmune);
    setPopulation(percHealthy, percIll, percdead);

    var capa = allHospital() / (icu_capacity + normalBeds);
    print("Hospital Capacity: " + capa);
    setHospitalCapacity(1 - capa);

}


$(function() {
    //this should be executed as soon as the document is ready
    init();
    for (var j = 0; j < 100; j++) {
        simulateStep(j);
    }
    document.getElementById('Advance').addEventListener("mousedown", function() {
        stepAndGUI();
    });
});