//select the people tree
var triangles = document.getElementById("peopleTree");
triangles.addEventListener("load", function() {
    // get the inner DOM of alpha.svg
    var svgDoc = triangles.contentDocument;
    // get the inner element by id
    var t1 = svgDoc.getElementById("t1");
    // add behaviour
    t1.addEventListener("mousedown", function() {
        console.log(t1);
        t1.setAttribute('fill', 'red');
    }, false);
}, false);