const activityStatus = {
    inactive: 1,
    canActivate: 2,
    active: 3,
    activating: 4
};


class TriangleHub {

    constructor(canvasID, jsonresource) {

        this.canvasID = canvasID;
        this.inactiveColor = "#b9b9b9";
        this.canActivateColor = "#e7ecef";
        this.activeColor = "#8ea604";
        this.preparingColor = "#009af5";
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
        var element = this.activities.get(activityID);
        if (element != null) {
            if (element.status == activityStatus.canActivate) {
                element.status = activityStatus.active;
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

    getInfos(aID) {
        if (this.activities.get(aID) != null) {
            return this.activities.get(aID).name;
        } else {
            return "";
        }
    }

    redraw() {
        var triangles = document.getElementById(this.canvasID);
        // get the inner DOM of alpha.svg
        var svgDoc = triangles.contentDocument;
        // get the inner element by id
        var paths = svgDoc.getElementById("triangles").getElementsByTagName('path');
        for (let p of paths) {
            p.setAttribute('fill', this.getColor(p.getAttribute('id')));
        }
    }

    animateTriangle(id) {
        createAnimation(0.3, 0.7, 'prep');

        bulbstop1 = svgDoc.getElementById('prep-animate-stop1');
        bulbstop2 = svgDoc.getElementById('prep-animate-stop2');

        animate();

        p.setAttribute('fill', 'url(#prep)');
    }
}