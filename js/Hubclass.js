const activityStatus = {
    inactive: 1,
    canActivate: 2,
    active: 3
};


class TriangleHub {

    constructor(canvasID, jsonresource) {

        this.canvasID = canvasID;
        this.inactiveColor = "#b9b9b9";
        this.canActivateColor = "#e7ecef";
        this.activeColor = "#0f7173";
        this.preparingColor = "#d8A47f";
        this.activities = new Map(JSON.parse(jsonresource));

        /*  this.activities.set("a1", { name: "Aktivität 1", status: activityStatus.canActivate, successors: ["a2", "a3"] });
          this.activities.set("a2", { name: "Aktivität 2", status: activityStatus.inactive, successors: ["a4"] });
          this.activities.set("a3", { name: "Aktivität 3", status: activityStatus.inactive, successors: [] });
          console.log(JSON.stringify([...this.activities]));*/
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
        var paths = svgDoc.getElementsByTagName('path');
        for (let p of paths) {
            p.setAttribute('fill', this.getColor(p.getAttribute('id')));
        }
    }
}