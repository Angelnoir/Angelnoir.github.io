function checkActicity(activityID) {
    var element = activities.get(activityID);
    if (element != null) {
        if (element.status == activityStatus.canActivate) {
            return true;
        } else {
            return false;
        }
    }
    return false;
}

function activateActivity(activityID) {
    var element = activities.get(activityID);
    if (element != null) {
        if (element.status == activityStatus.canActivate) {
            element.status = activityStatus.active;
            element.successors.forEach(e => {
                var succ = activities.get(e);
                if (succ != null) {
                    if (succ.status == activityStatus.inactive) {
                        succ.status = activityStatus.canActivate;
                    }
                }
            });
        }
    }
}

var inactiveColor = "#b9b9b9";
var canActivateColor = "#e7ecef";
var activeColor = "#0f7173";
var preparingColor = "#d8A47f";

function getColor(aID) {
    if (activities.get(aID) != null) {
        var s = activities.get(aID).status;
        switch (s) {
            case activityStatus.inactive:
                return inactiveColor;
            case activityStatus.canActivate:
                return canActivateColor;
            case activityStatus.active:
                return activeColor;
            default:
                return inactiveColor;
        }
    } else {
        console.log(aID);
        return inactiveColor;
    }
}

function redraw() {
    var triangles = document.getElementById("peopleTree");
    // get the inner DOM of alpha.svg
    var svgDoc = triangles.contentDocument;
    // get the inner element by id
    var paths = svgDoc.getElementsByTagName('path');
    for (let p of paths) {
        p.setAttribute('fill', getColor(p.getAttribute('id')));
    }
}

const activityStatus = {
    inactive: 1,
    canActivate: 2,
    active: 3
};



//TODO: do this in json
var activities = new Map();
activities.set("a1", { status: activityStatus.canActivate, successors: ["a2", "a3"] });
activities.set("a2", { status: activityStatus.inactive, successors: ["a4"] });
activities.set("a3", { status: activityStatus.inactive, successors: [] });



//select the people tree
var triangles = document.getElementById("peopleTree");
triangles.addEventListener("load", function() {
    redraw();
    // get the inner DOM of alpha.svg
    var svgDoc = triangles.contentDocument;
    // get the inner element by id
    var paths = svgDoc.getElementsByTagName('path');
    // add behaviour
    for (let p of paths) {
        p.addEventListener("mousedown", function() {
            console.log(p.getAttribute('id'));
            //p.setAttribute('fill', 'red');
            activateActivity(p.getAttribute('id'));
            redraw();
        }, false);
    }
}, false);