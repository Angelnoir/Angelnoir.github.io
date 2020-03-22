const activityStatus = {
    inactive: 1,
    canActivate: 2,
    active: 3,
    activating: 4,
    processed: 5
};

function createAnimation(startPerc, endPerc, id) {
    var svgns = "http://www.w3.org/2000/svg";

    var virusPanel = document.getElementById("govTree");
    var svgDoc = virusPanel.contentDocument;
    container = svgDoc.getElementById('gradientdefs');

    var node = svgDoc.getElementById(id);
    if (node != null) {
        container.removeChild(node);
    }

    var linGrad = document.createElementNS(svgns, 'linearGradient');
    linGrad.setAttributeNS(null, 'x1', "0.5");
    linGrad.setAttributeNS(null, 'x2', "0.5");
    linGrad.setAttributeNS(null, 'y1', "0.99");
    linGrad.setAttributeNS(null, 'y2', '0');
    linGrad.setAttributeNS(null, 'id', id);

    var stop = document.createElementNS(svgns, 'stop');
    stop.setAttributeNS(null, 'id', "stop1");
    stop.setAttributeNS(null, 'stop-color', "#8ea604");
    stop.setAttributeNS(null, 'offset', startPerc);

    var animate = document.createElementNS(svgns, 'animate');
    animate.setAttributeNS(null, 'attributeName', "offset");
    animate.setAttributeNS(null, 'dur', "2s");
    animate.setAttributeNS(null, 'values', "" + startPerc + "; " + endPerc + ";");
    animate.setAttributeNS(null, 'repeatCount', '1');
    animate.setAttributeNS(null, 'begin', 'indefinite');
    animate.setAttributeNS(null, 'id', id + '-animate-stop1');

    var animate2 = document.createElementNS(svgns, 'animate');
    animate2.setAttributeNS(null, 'attributeName', "offset");
    animate2.setAttributeNS(null, 'dur', "2s");
    animate2.setAttributeNS(null, 'values', "" + startPerc + "; " + endPerc + ";");
    animate2.setAttributeNS(null, 'repeatCount', '1');
    animate2.setAttributeNS(null, 'begin', 'indefinite');
    animate2.setAttributeNS(null, 'id', id + '-animate-stop2');

    linGrad.appendChild(stop);

    var stop2 = document.createElementNS(svgns, 'stop');
    stop2.setAttributeNS(null, 'id', "stop2");
    stop2.setAttributeNS(null, 'stop-color', "#8ea604");
    stop2.setAttributeNS(null, 'offset', endPerc);

    var stop3 = document.createElementNS(svgns, 'stop');
    stop3.setAttributeNS(null, 'id', "stop3");
    stop3.setAttributeNS(null, 'stop-color', "#b9b9b9");
    stop3.setAttributeNS(null, 'offset', endPerc);


    stop2.appendChild(animate);
    linGrad.appendChild(stop2);

    stop3.appendChild(animate2)
    linGrad.appendChild(stop3);

    container.appendChild(linGrad);
}


class TriangleHub {

    constructor(canvasID, jsonresource) {

        this.canvasID = canvasID;
        this.inactiveColor = "#b9b9b9";
        this.canActivateColor = "#e7ecef";
        this.activeColor = "#8ea604";
        this.activities = new Map(JSON.parse(jsonresource));
    }

    checkActicity(activityID) {
        var element = this.activities.get(activityID);
        if (element != null) {
            if (element.status == activityStatus.canActivate) {
                return true;
            } else {
                return false;
            }
        }
        return false;
    }

    activateActivity(activityID) {
        if (this.checkActicity(activityID)) {
            this.activities.get(activityID).status = activityStatus.activating;
            this.activateSuccessors(activityID);
        }
    }

    activateSuccessors(activityID) {
        var element = this.activities.get(activityID);
        if (element != null) {
            element.successors.forEach(e => {
                var succ = this.activities.get(e);
                if (succ != null) {
                    if (succ.status == activityStatus.inactive) {
                        succ.status = activityStatus.canActivate;
                    }
                }
            });
        }
    }

    getColor(aID) {
        if (this.activities.get(aID) != null) {
            var s = this.activities.get(aID).status;
            switch (s) {
                case activityStatus.inactive:
                    return this.inactiveColor;
                case activityStatus.canActivate:
                    return this.canActivateColor;
                case activityStatus.active:
                    return this.activeColor;
                default:
                    return this.inactiveColor;
            }
        } else {
            return this.inactiveColor;
        }
    }

    getTitle(aID) {
        if (this.activities.get(aID) != null) {
            return this.activities.get(aID).name;
        } else {
            return "";
        }
    }

    getInfos(aID) {
        if (this.activities.get(aID) != null) {
            return this.activities.get(aID).desc + "<br/>" + this.activities.get(aID).descImprove + "<br/>" + this.activities.get(aID).descHarm;
        } else {
            return "";
        }
    }

    /*   processActivities() {
           for (var activity of this.activities) {

               if (activity[1].status == activityStatus.active) {
                   //it was active through the sim, now we have to do the last gui things
                   activity[1].status = activityStatus.processed;
                   this.activateSuccessors(activity[0]);
               }
           }
       }*/

    redraw() {
        var triangles = document.getElementById(this.canvasID);
        // get the inner DOM of alpha.svg
        var svgDoc = triangles.contentDocument;
        // get the inner element by id
        var paths = svgDoc.getElementById("triangles").getElementsByTagName('path');
        //this.processActivities();
        for (let p of paths) {
            p.setAttribute('fill', this.getColor(p.getAttribute('id')));
            this.animateTriangle(p.getAttribute('id'));
        }

    }

    animateTriangle(aID) {
        var activity = this.activities.get(aID);
        if (activity != null) {
            if (activity.status == activityStatus.activating) {
                console.log(activity);
                var dur = activity.activationDuration;
                var prog = activity.activationAlreadyProgressed
                var endperc = prog / dur;
                var startperc = 0;
                if (prog != 1) {
                    startperc = (prog - 1) / dur;
                }
                createAnimation(startperc, endperc, 'prep-' + aID);

                var virusPanel = document.getElementById("govTree");
                var svgDoc = virusPanel.contentDocument;
                var bulbstop1 = svgDoc.getElementById('prep-' + aID + '-animate-stop1');
                var bulbstop2 = svgDoc.getElementById('prep-' + aID + '-animate-stop2');

                svgDoc.getElementById(aID).setAttribute('fill', 'url(#prep-' + aID + ')');

                bulbstop1.beginElement();
                bulbstop2.beginElement();
            }
        }
    }
}
