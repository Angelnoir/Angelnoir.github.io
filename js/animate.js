function createAnimation(startPerc, endPerc, id) {
    var svgns = "http://www.w3.org/2000/svg";

    var virusPanel = document.getElementById("govTree");
    var svgDoc = virusPanel.contentDocument;
    container = svgDoc.getElementById('gradientdefs');

    var linGrad = document.createElementNS(svgns, 'linearGradient');
    linGrad.setAttributeNS(null, 'x1', "0.5");
    linGrad.setAttributeNS(null, 'x2', "0.5");
    linGrad.setAttributeNS(null, 'y1', "0.99");
    linGrad.setAttributeNS(null, 'y2', '0');
    linGrad.setAttributeNS(null, 'id', id);

    var stop = document.createElementNS(svgns, 'stop');
    stop.setAttributeNS(null, 'id', "stop1");
    stop.setAttributeNS(null, 'stop-color', "#FFC809");
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
    stop2.setAttributeNS(null, 'stop-color', "#FFCF06");
    stop2.setAttributeNS(null, 'offset', endPerc);

    var stop3 = document.createElementNS(svgns, 'stop');
    stop3.setAttributeNS(null, 'id', "stop3");
    stop3.setAttributeNS(null, 'stop-color', "#6CB31D");
    stop3.setAttributeNS(null, 'offset', endPerc);


    stop2.appendChild(animate);
    linGrad.appendChild(stop2);

    stop3.appendChild(animate2)
    linGrad.appendChild(stop3);

    container.appendChild(linGrad);
}