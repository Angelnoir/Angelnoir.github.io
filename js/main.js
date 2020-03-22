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

function stepAndGUI() {

    simulateStep();
    stepNumber++;

    //update the graphics
    var percdead = dead / population;
    var percIll = allInfected() / population;
    var percHealthy = susceptible / population;
    setPopulation(percHealthy, percIll, percdead);
    var capa = allHospital() / (icu_capacity + normalBeds);
    setHospitalCapacity(1 - capa);
    changePoints(allInfected(), immune, dead);
    peopleTree.redraw();
    govTree.redraw();

}

var govTree, peopleTree

$(function() {

    loadJSON("ressources/people.json", function(response) {
        peopleTree = new TriangleHub("peopleTree", response);
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

    //We have to do absoluteley everything only when the JSON has been loaded!!!
    loadJSON("ressources/gov.json", function(response) {
        //select the government tree
        govTree = new TriangleHub("govTree", response);
        init(govTree.activities);

        var trianglesG = document.getElementById("govTree");
        trianglesG.addEventListener("load", function() {
            govTree.redraw();
            // get the inner DOM of alpha.svg
            var svgDoc = trianglesG.contentDocument;
            // get the inner element by id
            var paths = svgDoc.getElementById("triangles").getElementsByTagName('path');
            // add behaviour
            for (let p of paths) {
                p.addEventListener("mousedown", function() {
                    govTree.activateActivity(p.getAttribute('id'));
                    stepAndGUI();
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

        document.getElementById('Advance').addEventListener("mousedown", function() {
            stepAndGUI();
        });
        document.getElementById('Auto').addEventListener("mousedown", function() {
            init(govTree.activities);
            for (let j = 0; j < simulationTimeInDays; j++) {
                stepAndGUI();
            }
        });

    });
});