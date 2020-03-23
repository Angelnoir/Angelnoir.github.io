function loadJSON(ressource, callback) {
    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', ressource, true);
    xobj.onreadystatechange = function() {
        if (xobj.readyState == 4 && xobj.status == "200") {
            // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
            callback(xobj.responseText);
        }
    };
    xobj.send(null);
}

function loadJSONSynchronous(ressource, callback) {
    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', ressource, false);
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
    updateGUI();
}

function addDataIll(chart, data) {
    chart.data.datasets[0].data.push(data);
}

function addDataDead(chart, data) {
    chart.data.datasets[1].data.push(data);

}

function addDataIm(chart, data) {
    chart.data.datasets[2].data.push(data);

}

function addDataCapa(chart, data) {

    chart.data.datasets[3].data.push(data);

}


function updateGUI() {
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

    var txt_days = document.getElementById("txt_days");
    txt_days.innerHTML = stepNumber;

    var txt_ill = document.getElementById("txt_ill");
    txt_ill.innerHTML = allInfected();

    var txt_dead = document.getElementById("txt_dead");
    txt_dead.innerHTML = dead;

    var txt_imm = document.getElementById("txt_imm");
    txt_imm.innerHTML = immune;

    var txt_bed = document.getElementById("txt_bed");
    txt_bed.innerHTML = normalBeds;

    var txt_icu = document.getElementById("txt_icu");
    txt_icu.innerHTML = icu_capacity;

    myChart.data.labels.push(stepNumber);
    addDataIll(myChart, allInfected());
    addDataIm(myChart, immune);
    addDataDead(myChart, dead);
    addDataCapa(myChart, 1 - capa);

    myChart.update();

}

function initGUI() {
    //init peopleTree (not much to do here)
    peopleTree = new TriangleHub("peopleTree", peopleJson);
    //init govTree 
    govTree = new TriangleHub("govTree", govJson);
    //initSim
    init(govTree.activities);

    var govGui = document.getElementById("govTree");
    // get the inner DOM of alpha.svg
    var svgDoc = govGui.contentDocument;
    // get the inner element by id
    var paths = svgDoc.getElementById("triangles").getElementsByTagName('path');
    // add behaviour
    for (let p of paths) {
        p.addEventListener("mousedown", function() {
            govTree.activateActivity(p.getAttribute('id'));
            govTree.redraw();
        }, false);
        p.addEventListener("mouseover", function() {
            var tooltip = document.getElementById("TooltipGovernmentTitle");
            tooltip.innerHTML = govTree.getTitle(p.getAttribute('id'));
            var tooltip2 = document.getElementById("TooltipGovernment");
            tooltip2.innerHTML = govTree.getInfos(p.getAttribute('id'));
        });
    }

    //ausblenden des Tooltips wenn die Maus alle Dreiecke verlässt
    govGui.addEventListener("mouseout", function() {
        var tooltip = document.getElementById("TooltipGovernment");
        tooltip.innerHTML = "";
        var tooltip2 = document.getElementById("TooltipGovernmentTitle");
        tooltip2.innerHTML = "";
    });

    //add Event Listeners to Buttons
    document.getElementById('Advance').addEventListener("mousedown", function() {
        stepAndGUI();
    });
    document.getElementById('Auto').addEventListener("mousedown", function() {
        init(govTree.activities);
        for (let j = 0; j < simulationTimeInDays; j++) {
            stepAndGUI();
        }
    });

    //init chart
    var ctx = document.getElementById('myChart');
    myChart = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [{
                    label: 'Kranke',
                    data: [],
                    borderColor: '#973535',
                    fill: false,
                    yAxisID: 'people'
                },
                {
                    label: 'Tote',
                    data: [],
                    borderColor: '#463F3A',
                    fill: false,
                    yAxisID: 'people'
                },
                {
                    label: 'Immune',
                    data: [],
                    borderColor: '#b9b9b9',
                    fill: false,
                    yAxisID: 'people'
                },
                {
                    label: 'Kapazität',
                    data: [],
                    borderColor: '#8ea604',
                    fill: false,
                    yAxisID: 'percentage'
                }
            ]
        },
        options: {
            scales: {
                yAxes: [{
                        id: 'people',
                        type: 'linear',
                        ticks: {
                            beginAtZero: true
                        },
                        position: 'left'
                    },
                    {
                        id: 'percentage',
                        type: 'linear',
                        ticks: {
                            beginAtZero: true
                        },
                        position: 'right'
                    }
                ]
            },
            elements: { point: { radius: 0 } }
        }
    });

    updateGUI();
    document.getElementById('loader').style.display = "none";
}

function waitForLoad() {
    if (!(hasLoadedGov && hasLoadedPeople)) {
        setTimeout(waitForLoad, 300);
    } else {
        initGUI();
    }
}

var govTree, peopleTree, virusPanel, myChart, peopleJson, govJson

var hasLoadedPeople = false,
    hasLoadedGov = false
$(function() {

    //to load: SVG for people, svg for Gov, svg for virus, json response, chart
    loadJSON("ressources/people.json", function(response) {
        peopleJson = response;
        hasLoadedPeople = true;
    });

    loadJSON("ressources/gov.json", function(response) {
        govJson = response;
        hasLoadedGov = true;
    });

    window.addEventListener("load", function() {
        waitForLoad();
    });


});