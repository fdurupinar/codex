(function ($$) {
    var sbgnShapes = $$.sbgnShapes = {
        'source and sink': true,
        'nucleic acid feature': true,
        'complex': true,
        'dissociation': true,
        'macromolecule': true,
        'simple chemical': true,
        'unspecified entity': true,
        'necessary stimulation': true,
        'process': true,
        'uncertain process': true,
        'omitted process': true,
        'association': true,
        'sifNode': true,
        'sifArrow': true
    };

    var totallyOverridenNodeShapes = $$.totallyOverridenNodeShapes = {
        'macromolecule': true,
        'nucleic acid feature': true,
        'simple chemical': true,
        'complex': true,
        'unspecified entity': true,
        'process': true,
        'uncertain process': true,
        'omitted process': true,
        'dissociation': true,
        'association': true,
        // 'sifNode': true

    };

    $$.sbgn = {
    };

    $$.sbgn.addPortReplacementIfAny = function (node, edgePort) {
        var posX = node.position().x;
        var posY = node.position().y;
        if (typeof node._private.data.ports != 'undefined') {
            for (var i = 0; i < node._private.data.ports.length; i++) {
                var port = node._private.data.ports[i];
                if (port.id == edgePort) {
                    posX = posX + port.x * node.width() / 100;
                    posY = posY + port.y * node.height() / 100;
                    break;
                }
            }
        }
        return {'x': posX, 'y': posY};
    }
    ;

    $$.sbgn.drawPortsToPolygonShape = function (context, node, points) {
        var width = node.width();
        var height = node.height();
        var centerX = node._private.position.x;
        var centerY = node._private.position.y;
        var padding = parseInt(node.css('border-width')) / 2;

        for (var i = 0; i < node._private.data.ports.length; i++) {
            var port = node._private.data.ports[i];
            var portX = port.x * width / 100 + centerX;
            var portY = port.y * height / 100 + centerY;
            var closestPoint = window.cyMath.polygonIntersectLine(portX, portY,
                points, centerX, centerY, width / 2, height / 2, padding);
            context.beginPath();
            context.moveTo(portX, portY);
            context.lineTo(closestPoint[0], closestPoint[1]);
            context.stroke();
            context.closePath();


            //add a little black circle to ports
            var oldStyle = context.fillStyle;
            context.fillStyle = $$.sbgn.colors.port;
            $$.sbgn.drawEllipse(context, portX, portY, 2, 2);
            context.fillStyle = oldStyle;
            context.stroke();
        }
    };

    var unitOfInfoRadius = 4;
    var stateVarRadius = 15;
    $$.sbgn.drawComplexStateAndInfo = function (context, node, stateAndInfos,
                                                centerX, centerY, width, height) {

        //This is a temporary workaround
        $$.sbgn.drawEllipse(context, centerX, centerY, 0, 0);

        var upWidth = 0, downWidth = 0;
        var boxPadding = 10, betweenBoxPadding = 5;
        var beginPosY = height / 2, beginPosX = width / 2;

        stateAndInfos.sort($$.sbgn.compareStates);

        for (var i = 0; i < stateAndInfos.length; i++) {
            var state = stateAndInfos[i];
            var stateWidth = state.bbox.w;
            var stateHeight = state.bbox.h;
//      var stateLabel = state.state.value;
            var relativeYPos = state.bbox.y;
            var stateCenterX, stateCenterY;

            if (relativeYPos < 0) {
                if (upWidth + stateWidth < width) {
                    stateCenterX = centerX - beginPosX + boxPadding + upWidth + stateWidth / 2;
                    stateCenterY = centerY - beginPosY;

                    var textProp = {'centerX': stateCenterX, 'centerY': stateCenterY,
                        'opacity': node.css('text-opacity') * node.css('opacity'),
                        'width': stateWidth, 'height': stateHeight};

                    if (state.clazz == "state variable") {//draw ellipse
                        window.cyRenderer.drawRoundRectanglePath(context,
                            stateCenterX, stateCenterY,
                            stateWidth, stateHeight, Math.min(stateWidth / 2, stateHeight / 2, stateVarRadius));
                        context.fill();

                        textProp.state = state.state;
                        $$.sbgn.drawStateText(context, textProp);
                    } else if (state.clazz == "unit of information") {//draw rectangle
                        window.cyRenderer.drawRoundRectanglePath(context,
                            stateCenterX, stateCenterY,
                            stateWidth, stateHeight,
                            Math.min(stateWidth / 2, stateHeight / 2, unitOfInfoRadius));
                        context.fill();

                        textProp.label = state.label.text;
                        $$.sbgn.drawInfoText(context, textProp);
                    }
                }
                upWidth = upWidth + width + boxPadding;
            } else if (relativeYPos > 0) {
                if (downWidth + stateWidth < width) {
                    stateCenterX = centerX - beginPosX + boxPadding + downWidth + stateWidth / 2;
                    stateCenterY = centerY + beginPosY;

                    var textProp = {'centerX': stateCenterX, 'centerY': stateCenterY,
                        'opacity': node.css('text-opacity') * node.css('opacity'),
                        'width': stateWidth, 'height': stateHeight};

                    if (state.clazz == "state variable") {//draw ellipse
                        window.cyRenderer.drawRoundRectanglePath(context,
                            stateCenterX, stateCenterY,
                            stateWidth, stateHeight, Math.min(stateWidth / 2, stateHeight / 2, stateVarRadius));
                        context.fill();

                        textProp.state = state.state;
                        $$.sbgn.drawStateText(context, textProp);
                    } else if (state.clazz == "unit of information") {//draw rectangle
                        window.cyRenderer.drawRoundRectanglePath(context,
                            stateCenterX, stateCenterY,
                            stateWidth, stateHeight,
                            Math.min(stateWidth / 2, stateHeight / 2, unitOfInfoRadius));
                        context.fill();

                        textProp.label = state.label.text;
                        $$.sbgn.drawInfoText(context, textProp);
                    }
                }
                downWidth = downWidth + width + boxPadding;
            }
            context.stroke();

            //This is a temporary workaround
            $$.sbgn.drawEllipse(context, centerX, centerY, 0, 0);

            //update new state and info position(relative to node center)
            state.bbox.x = (stateCenterX - centerX) * 100 / node.width();
            state.bbox.y = (stateCenterY - centerY) * 100 / node.height();
        }
    };

    $$.sbgn.drawStateText = function (context, textProp) {
        var stateValue = textProp.state.value || '';
        var stateVariable = textProp.state.variable || '';

        var stateLabel = stateValue + (stateVariable
                ? "@" + stateVariable
                : "");

        var fontSize = parseInt(textProp.height / 1.5);

        textProp.font = fontSize + "px Arial";
        textProp.label = stateLabel;
        textProp.color = "#0f0f0f";
        $$.sbgn.drawText(context, textProp);
    };

    $$.sbgn.drawInfoText = function (context, textProp) {
        var fontSize = parseInt(textProp.height / 1.5);
        textProp.font = fontSize + "px Arial";
        textProp.color = "#0f0f0f";
        $$.sbgn.drawText(context, textProp);
    };

    $$.sbgn.drawText = function (context, textProp, truncate) {
        var oldFont = context.font;
        context.font = textProp.font;
        context.textAlign = "center";
        context.textBaseline = "middle";
        var oldStyle = context.fillStyle;
        context.fillStyle = textProp.color;
        var oldOpacity = context.globalAlpha;
        context.globalAlpha = textProp.opacity;
        var text;

        textProp.label = textProp.label || '';

        if (truncate == false) {
            text = textProp.label;
        } else {
            text = truncateText(textProp, context.font);
        }

        context.fillText(text, textProp.centerX, textProp.centerY);
        context.fillStyle = oldStyle;
        context.font = oldFont;
        context.globalAlpha = oldOpacity;
        //context.stroke();
    };

    window.cyMath.calculateDistance = function (point1, point2) {
        var distance = Math.pow(point1[0] - point2[0], 2) + Math.pow(point1[1] - point2[1], 2);
        return Math.sqrt(distance);
    };

    $$.sbgn.colors = {
        clone: "#a9a9a9",
        association: "#6B6B6B",
        port: "#6B6B6B"
    };


    $$.sbgn.drawStateAndInfos = function (node, context, centerX, centerY) {
        var stateAndInfos = node._private.data.sbgnstatesandinfos;

        for (var i = 0; i < stateAndInfos.length && i < 4; i++) {
            var state = stateAndInfos[i];
            var stateWidth = state.bbox.w;
            var stateHeight = state.bbox.h;
            var stateCenterX = state.bbox.x * node.width() / 100 + centerX;
            var stateCenterY = state.bbox.y * node.height() / 100 + centerY;

            var textProp = {'centerX': stateCenterX, 'centerY': stateCenterY,
                'opacity': node.css('text-opacity') * node.css('opacity'),
                'width': stateWidth, 'height': stateHeight};

            if (state.clazz == "state variable") {//draw ellipse
                //var stateLabel = state.state.value;
                window.cyRenderer.drawRoundRectanglePath(context, stateCenterX, stateCenterY,
                    stateWidth, stateHeight, Math.min(stateWidth / 2, stateHeight / 2, stateVarRadius));

                context.fill();
                textProp.state = state.state;
                $$.sbgn.drawStateText(context, textProp);

                context.stroke();

            } else if (state.clazz == "unit of information") {//draw rectangle
                window.cyRenderer.drawRoundRectanglePath(context,
                    stateCenterX, stateCenterY,
                    stateWidth, stateHeight,
                    Math.min(stateWidth / 2, stateHeight / 2, unitOfInfoRadius));

                context.fill();

                textProp.label = state.label.text || '';
                $$.sbgn.drawInfoText(context, textProp);

                context.stroke();
            }
        }
        //This is a temporary workaround
        $$.sbgn.drawEllipse(context, centerX, centerY, 0, 0);
    };

    $$.sbgn.nucleicAcidCheckPoint = function (x, y, centerX, centerY, node, threshold, points, cornerRadius) {
        var width = node.width();
        var height = node.height();
        var padding = parseInt(node.css('border-width')) / 2;

        //check rectangle at top
        if (window.cyMath.pointInsidePolygon(x, y, points,
                centerX, centerY - cornerRadius / 2, width, height - cornerRadius / 3, [0, -1],
                padding)) {
            return true;
        }

        //check rectangle at bottom
        if (window.cyMath.pointInsidePolygon(x, y, points,
                centerX, centerY + height / 2 - cornerRadius / 2, width - 2 * cornerRadius, cornerRadius, [0, -1],
                padding)) {
            return true;
        }

        //check ellipses
        var checkInEllipse = function (x, y, centerX, centerY, width, height, padding) {
            x -= centerX;
            y -= centerY;

            x /= (width / 2 + padding);
            y /= (height / 2 + padding);

            return (Math.pow(x, 2) + Math.pow(y, 2) <= 1);
        }

        // Check bottom right quarter circle
        if (checkInEllipse(x, y,
                centerX + width / 2 - cornerRadius,
                centerY + height / 2 - cornerRadius,
                cornerRadius * 2, cornerRadius * 2, padding)) {

            return true;
        }

        // Check bottom left quarter circle
        if (checkInEllipse(x, y,
                centerX - width / 2 + cornerRadius,
                centerY + height / 2 - cornerRadius,
                cornerRadius * 2, cornerRadius * 2, padding)) {

            return true;
        }

        return false;
    };

    //we need to force opacity to 1 since we might have state and info boxes.
    //having opaque nodes which have state and info boxes gives unpleasent results.
    $$.sbgn.forceOpacityToOne = function (node, context) {
        var parentOpacity = node.effectiveOpacity();
        if (parentOpacity === 0) {
            return;
        }

        context.fillStyle = "rgba("
            + node._private.style["background-color"].value[0] + ","
            + node._private.style["background-color"].value[1] + ","
            + node._private.style["background-color"].value[2] + ","
            + (1 * node.css('opacity') * parentOpacity) + ")";
    };

    $$.sbgn.drawSimpleChemicalPath = function (
        context, x, y, width, height) {

        var halfWidth = width / 2;
        var halfHeight = height / 2;
        //var cornerRadius = $$.math.getRoundRectangleRadius(width, height);
        var cornerRadius = Math.min(halfWidth, halfHeight);
        context.translate(x, y);

        context.beginPath();

        // Start at top middle
        context.moveTo(0, -halfHeight);
        // Arc from middle top to right side
        context.arcTo(halfWidth, -halfHeight, halfWidth, 0, cornerRadius);
        // Arc from right side to bottom
        context.arcTo(halfWidth, halfHeight, 0, halfHeight, cornerRadius);
        // Arc from bottom to left side
        context.arcTo(-halfWidth, halfHeight, -halfWidth, 0, cornerRadius);
        // Arc from left side to topBorder
        context.arcTo(-halfWidth, -halfHeight, 0, -halfHeight, cornerRadius);
        // Join line
        context.lineTo(0, -halfHeight);

        context.closePath();

        context.translate(-x, -y);
    };

    $$.sbgn.drawSimpleChemical = function (
        context, x, y, width, height) {
        $$.sbgn.drawSimpleChemicalPath(context, x, y, width, height);
        context.fill();
    };

    function simpleChemicalLeftClone(context, centerX, centerY,
                                     width, height, cloneMarker, opacity) {
        if (cloneMarker != null) {
            var oldGlobalAlpha = context.globalAlpha;
            context.globalAlpha = opacity;
            var oldStyle = context.fillStyle;
            context.fillStyle = $$.sbgn.colors.clone;

            context.beginPath();
            context.translate(centerX, centerY);
            context.scale(width / 2, height / 2);

            var markerBeginX = -1 * Math.sin(Math.PI / 3);
            var markerBeginY = Math.cos(Math.PI / 3);
            var markerEndX = 0;
            var markerEndY = markerBeginY;

            context.moveTo(markerBeginX, markerBeginY);
            context.lineTo(markerEndX, markerEndY);
            context.arc(0, 0, 1, 3 * Math.PI / 6, 5 * Math.PI / 6);

            context.scale(2 / width, 2 / height);
            context.translate(-centerX, -centerY);
            context.closePath();

            context.fill();
            context.fillStyle = oldStyle;
            context.globalAlpha = oldGlobalAlpha;
        }
    }
    ;

    function simpleChemicalRightClone(context, centerX, centerY,
                                      width, height, cloneMarker, opacity) {
        if (cloneMarker != null) {
            var oldGlobalAlpha = context.globalAlpha;
            context.globalAlpha = opacity;
            var oldStyle = context.fillStyle;
            context.fillStyle = $$.sbgn.colors.clone;

            context.beginPath();
            context.translate(centerX, centerY);
            context.scale(width / 2, height / 2);

            var markerBeginX = 0;
            var markerBeginY = Math.cos(Math.PI / 3);
            var markerEndX = 1 * Math.sin(Math.PI / 3);
            var markerEndY = markerBeginY;

            context.moveTo(markerBeginX, markerBeginY);
            context.lineTo(markerEndX, markerEndY);
            context.arc(0, 0, 1, Math.PI / 6, 3 * Math.PI / 6);

            context.scale(2 / width, 2 / height);
            context.translate(-centerX, -centerY);
            context.closePath();

            context.fill();
            context.fillStyle = oldStyle;
            context.globalAlpha = oldGlobalAlpha;
        }
    }
    ;

    $$.sbgn.drawEllipsePath = function (context, x, y, width, height) {
        window.cyNodeShapes['ellipse'].drawPath(context, x, y, width, height);
    };

    $$.sbgn.drawNucAcidFeature = function (context, width, height,
                                           centerX, centerY, cornerRadius) {
        var halfWidth = width / 2;
        var halfHeight = height / 2;

        context.translate(centerX, centerY);
        context.beginPath();

        context.moveTo(-halfWidth, -halfHeight);
        context.lineTo(halfWidth, -halfHeight);
        context.lineTo(halfWidth, 0);
        context.arcTo(halfWidth, halfHeight, 0, halfHeight, cornerRadius);
        context.arcTo(-halfWidth, halfHeight, -halfWidth, 0, cornerRadius);
        context.lineTo(-halfWidth, -halfHeight);

        context.closePath();
        context.translate(-centerX, -centerY);
        context.fill();
    };

    $$.sbgn.isMultimer = function (node) {
        var sbgnClass = node._private.data.sbgnclass;
        if (sbgnClass && sbgnClass.indexOf("multimer") != -1)
            return true;
        return false;
    };

    //this function is created to have same corner length when
    //complex's width or height is changed
    $$.sbgn.generateComplexShapePoints = function (cornerLength, width, height) {
        //cp stands for corner proportion
        var cpX = cornerLength / width;
        var cpY = cornerLength / height;

        var complexPoints = [-1 + cpX, -1, -1, -1 + cpY, -1, 1 - cpY, -1 + cpX,
            1, 1 - cpX, 1, 1, 1 - cpY, 1, -1 + cpY, 1 - cpX, -1];

        return complexPoints;
    };

    $$.sbgn.drawPortsToEllipseShape = function (context, node) {
        var width = node.width();
        var height = node.height();
        var centerX = node._private.position.x;
        var centerY = node._private.position.y;
        var padding = parseInt(node.css('border-width')) / 2;

        for (var i = 0; i < node._private.data.ports.length; i++) {
            var port = node._private.data.ports[i];
            var portX = port.x * width / 100 + centerX;
            var portY = port.y * height / 100 + centerY;
            var closestPoint = window.cyMath.intersectLineEllipse(
                portX, portY, centerX, centerY, width / 2, height / 2);
            context.moveTo(portX, portY);
            context.lineTo(closestPoint[0], closestPoint[1]);
            context.stroke();

            //add a little black circle to ports
            var oldStyle = context.fillStyle;
            context.fillStyle = $$.sbgn.colors.port;
            $$.sbgn.drawEllipse(context, portX, portY, 2, 2);
            context.fillStyle = oldStyle;
            context.stroke();
        }
    };

    window.cyStyfn.types.nodeShape.enums.push('source and sink');
    window.cyStyfn.types.nodeShape.enums.push('nucleic acid feature');
    window.cyStyfn.types.nodeShape.enums.push('complex');
    window.cyStyfn.types.nodeShape.enums.push('dissociation');
    window.cyStyfn.types.nodeShape.enums.push('macromolecule');
    window.cyStyfn.types.nodeShape.enums.push('simple chemical');
    window.cyStyfn.types.nodeShape.enums.push('unspecified entity');
    window.cyStyfn.types.nodeShape.enums.push('process');
    window.cyStyfn.types.nodeShape.enums.push('omitted process');
    window.cyStyfn.types.nodeShape.enums.push('uncertain process');
    window.cyStyfn.types.nodeShape.enums.push('association');

    window.cyStyfn.types.nodeShape.enums.push('sifNode');

    window.cyStyfn.types.arrowShape.enums.push('necessary stimulation');
    window.cyStyfn.types.arrowShape.enums.push('sifArrow');

    $$.sbgn.registerSbgnArrowShapes = function () {
        window.cyArrowShapes['necessary stimulation'] = jQuery.extend({}, window.cyArrowShapes['triangle-tee']);
        window.cyArrowShapes['necessary stimulation'].pointsTee = [
            -0.18, -0.43,
            0.18, -0.43
        ];


        window.cyArrowShapes['sifArrow'] = jQuery.extend({}, window.cyArrowShapes['triangle']);
        window.cyArrowShapes['sifArrow'].points = [
            -0.08, -0.12,
            0, 0,
            0.08, -0.12

        ];
    };

    $$.sbgn.registerSbgnNodeShapes = function () {
        // window.cyArrowShapes['sifArrow'] = window.cyArrowShapes['diamond'];

        window.cyNodeShapes['sifNode'] = {
            draw: function (context, node) {

                var centerX = node._private.position.x;
                var centerY = node._private.position.y;
                var width = node.width() ;
                var height = node.height();




                //      window.cyNodeShapes['roundrectangle'].draw(context, centerX, centerY, width, height);
                window.cyRenderer.drawRoundRectanglePath(context,  centerX, centerY, width, height);


              //  context.fill();
                 context.stroke();



                if(node._private.data.sifStates){
                    node._private.data.sifStates.forEach(function(state){

                        var stateWidth = state.bbox.width;
                        var stateHeight = state.bbox.height;

                        var stateCenterX = state.bbox.x;
                        var stateCenterY = state.bbox.y;



                        window.cyRenderer.drawEllipsePath(context,  stateCenterX, stateCenterY, stateWidth, stateHeight);
                        context.fill();



                        var textProp ={};
                        var fontSize =  parseInt(stateHeight / 1.5);
                        textProp.font = fontSize + "px Arial";
                        textProp.color = "black";
                        textProp.label = "p";
                        textProp.centerX = stateCenterX;
                        textProp.centerY = stateCenterY;
                        textProp.opacity = 1;
                        $$.sbgn.drawText(context, textProp, false);


                        context.stroke();


                    });
                }






                //FIXME
                //This is a temporary workaround for drawing order
                $$.sbgn.drawEllipse(context, centerX, centerY, 0, 0);



            },

            intersectLine: window.cyNodeShapes["roundrectangle"].intersectLine,
            checkPoint: window.cyNodeShapes["roundrectangle"].checkPoint,
            // intersectLine:function (node, x, y){
            //     // //TODO: consider p sites
            //     //
            //     var nodeX = node._private.position.x;
            //     var nodeY = node._private.position.y;
            //
            //
            //     var width = node.width();
            //     var height = node.height();
            //     var padding = 1;
            //
            //     var cornerRadius = window.cyMath.getRoundRectangleRadius(width, height);
            //
            //
            //     var nodeIntersectLines = $$.sbgn.roundRectangleIntersectLine(
            //         x, y,
            //         nodeX, nodeY,
            //         nodeX, nodeY,
            //         width, height,
            //         cornerRadius, padding);
            //
            //
            //     var stateIntersectLines = $$.sbgn.intersectLineStateBoxes(
            //         node, x, y);
            //
            //     var intersections = stateIntersectLines.concat(nodeIntersectLines);
            //
            //     return $$.sbgn.closestIntersectionPoint([x, y], intersections);
            //
            //
            // },


            // checkPoint: function (x, y, node, threshold) {
            //
            //
            //
            //     var centerX = node._private.position.x;
            //     var centerY = node._private.position.y;
            //     var width = node.width() + threshold;
            //     var height = node.height() + threshold ;
            //     var padding = 1;
            //     var nodeCheckPoint = window.cyNodeShapes["roundrectangle"].checkPoint(x, y, padding, width, height, centerX, centerY);
            //
            //
            //     return nodeCheckPoint;
            // },
            points: window.cyNodeShapes["roundrectangle"].points

        };
    }
    //TODO: correct later
    $$.sbgn.intersectLineStateBoxes = function (node, x, y) {
        var centerX = node._private.position.x;
        var centerY = node._private.position.y;
        var padding = 1;

        var states = node._private.data.sifStates;

        var stateCount = 0;

        var intersections = [];


        node._private.data.sifStates.forEach(function(state){
            var stateWidth = state.bbox.width;
            var stateHeight = state.bbox.height;
            var stateCenterX = state.bbox.x * node.width() / 100 + centerX;
            var stateCenterY = state.bbox.y * node.height() / 100 + centerY;

            if (stateCount < 2) {//draw ellipse
                var stateIntersectLines = $$.sbgn.intersectLineEllipse(x, y, centerX, centerY,
                    stateCenterX, stateCenterY, stateWidth, stateHeight, padding);

                if (stateIntersectLines.length > 0)
                    intersections = intersections.concat(stateIntersectLines);

                stateCount++;
            }

        });
        if (intersections.length > 0)
            return intersections;
        return [];
    };

    $$.sbgn.drawEllipse = function (context, x, y, width, height) {
        //$$.sbgn.drawEllipsePath(context, x, y, width, height);
        //context.fill();
        window.cyNodeShapes['ellipse'].draw(context, x, y, width, height);
    };

    $$.sbgn.cloneMarker = {
        unspecifiedEntity: function (context, centerX, centerY,
                                     width, height, cloneMarker, opacity) {
            if (cloneMarker != null) {
                var oldGlobalAlpha = context.globalAlpha;
                context.globalAlpha = opacity;
                var oldStyle = context.fillStyle;
                context.fillStyle = $$.sbgn.colors.clone;

                context.beginPath();
                context.translate(centerX, centerY);
                context.scale(width / 2, height / 2);

                var markerBeginX = -1 * Math.sin(Math.PI / 3);
                var markerBeginY = Math.cos(Math.PI / 3);
                var markerEndX = 1 * Math.sin(Math.PI / 3);
                var markerEndY = markerBeginY;

                context.moveTo(markerBeginX, markerBeginY);
                context.lineTo(markerEndX, markerEndY);
                context.arc(0, 0, 1, Math.PI / 6, 5 * Math.PI / 6);

                context.scale(2 / width, 2 / height);
                context.translate(-centerX, -centerY);
                context.closePath();

                context.fill();
                context.fillStyle = oldStyle;
                context.globalAlpha = oldGlobalAlpha;
            }
        },
        sourceAndSink: function (context, centerX, centerY,
                                 width, height, cloneMarker, opacity) {
            $$.sbgn.cloneMarker.unspecifiedEntity(context, centerX, centerY,
                width, height, cloneMarker, opacity);
        },
        simpleChemical: function (context, centerX, centerY,
                                  width, height, cloneMarker, isMultimer, opacity) {
            if (cloneMarker != null) {
                var cornerRadius = Math.min(width / 2, height / 2);

                var firstCircleCenterX = centerX - width / 2 + cornerRadius;
                var firstCircleCenterY = centerY;
                var secondCircleCenterX = centerX + width / 2 - cornerRadius;
                var secondCircleCenterY = centerY;

                simpleChemicalLeftClone(context, firstCircleCenterX, firstCircleCenterY,
                    2 * cornerRadius, 2 * cornerRadius, cloneMarker, opacity);

                simpleChemicalRightClone(context, secondCircleCenterX, secondCircleCenterY,
                    2 * cornerRadius, 2 * cornerRadius, cloneMarker, opacity);

                var oldStyle = context.fillStyle;
                context.fillStyle = $$.sbgn.colors.clone;
                var oldGlobalAlpha = context.globalAlpha;
                context.globalAlpha = opacity;

                var recPoints = window.cyMath.generateUnitNgonPointsFitToSquare(4, 0);
                var cloneX = centerX;
                var cloneY = centerY + 3 / 4 * cornerRadius;
                var cloneWidth = width - 2 * cornerRadius;
                var cloneHeight = cornerRadius / 2;

                window.cyRenderer.drawPolygonPath(context, cloneX, cloneY, cloneWidth, cloneHeight, recPoints);
                context.fill();
                context.fillStyle = oldStyle;
                context.globalAlpha = oldGlobalAlpha;
            }
        },
        perturbingAgent: function (context, centerX, centerY,
                                   width, height, cloneMarker, opacity) {
            if (cloneMarker != null) {
                var cloneWidth = width;
                var cloneHeight = height / 4;
                var cloneX = centerX;
                var cloneY = centerY + height / 2 - height / 8;

                var markerPoints = [-5 / 6, -1, 5 / 6, -1, 1, 1, -1, 1];

                var oldStyle = context.fillStyle;
                context.fillStyle = $$.sbgn.colors.clone;
                var oldGlobalAlpha = context.globalAlpha;
                context.globalAlpha = opacity;

                renderer.drawPolygon(context,
                    cloneX, cloneY,
                    cloneWidth, cloneHeight, markerPoints);

                context.fill();

                context.fillStyle = oldStyle;
                context.globalAlpha = oldGlobalAlpha;
                //context.stroke();
            }
        },
        nucleicAcidFeature: function (context, centerX, centerY,
                                      width, height, cloneMarker, isMultimer, opacity) {
            if (cloneMarker != null) {
                var cloneWidth = width;
                var cloneHeight = height / 4;
                var cloneX = centerX;
                var cloneY = centerY + 3 * height / 8;

                var oldStyle = context.fillStyle;
                context.fillStyle = $$.sbgn.colors.clone;
                var oldGlobalAlpha = context.globalAlpha;
                context.globalAlpha = opacity;

                var cornerRadius = window.cyMath.getRoundRectangleRadius(width, height);

                $$.sbgn.drawNucAcidFeature(context, cloneWidth, cloneHeight,
                    cloneX, cloneY, cornerRadius, opacity);

                context.fillStyle = oldStyle;
                context.globalAlpha = oldGlobalAlpha;
                //context.stroke();
            }
        },
        macromolecule: function (context, centerX, centerY,
                                 width, height, cloneMarker, isMultimer, opacity) {
            $$.sbgn.cloneMarker.nucleicAcidFeature(context, centerX, centerY,
                width, height, cloneMarker, isMultimer, opacity);
        },
        complex: function (context, centerX, centerY,
                           width, height, cornerLength, cloneMarker, isMultimer, opacity) {
            if (cloneMarker != null) {
                var cpX = cornerLength / width;
                var cpY = cornerLength / height;
                var cloneWidth = width;
                var cloneHeight = height * cpY / 2;
                var cloneX = centerX;
                var cloneY = centerY + height / 2 - cloneHeight / 2;

                var markerPoints = [-1, -1, 1, -1, 1 - cpX, 1, -1 + cpX, 1];

                var oldStyle = context.fillStyle;
                context.fillStyle = $$.sbgn.colors.clone;
                var oldGlobalAlpha = context.globalAlpha;
                context.globalAlpha = opacity;

                window.cyRenderer.drawPolygonPath(context,
                    cloneX, cloneY,
                    cloneWidth, cloneHeight, markerPoints);
                context.fill();

                context.fillStyle = oldStyle;
                context.globalAlpha = oldGlobalAlpha;

//                context.stroke();
            }
        }
    };

    $$.sbgn.intersectLinePorts = function (node, x, y, portId) {
        var ports = node._private.data.ports;
        if (ports.length < 0)
            return [];

        var nodeX = node._private.position.x;
        var nodeY = node._private.position.y;
        var width = node.width();
        var height = node.height();
        var padding = parseInt(node.css('border-width')) / 2;

        for (var i = 0; i < node._private.data.ports.length; i++) {
            var port = node._private.data.ports[i];
            if (portId == port.id) {
                return window.cyMath.intersectLineEllipse(
                    x, y, port.x * width / 100 + nodeX, port.y * height / 100 + nodeY, 1, 1);
            }
        }
        return [];
    };

    $$.sbgn.closestIntersectionPoint = function (point, intersections) {
        if (intersections.length <= 0)
            return [];

        var closestIntersection = [];
        var minDistance = Number.MAX_VALUE;

        for (var i = 0; i < intersections.length; i = i + 2) {
            var checkPoint = [intersections[i], intersections[i + 1]];
            var distance = window.cyMath.calculateDistance(point, checkPoint);

            if (distance < minDistance) {
                minDistance = distance;
                closestIntersection = checkPoint;
            }
        }

        return closestIntersection;
    };

    $$.sbgn.nucleicAcidIntersectionLine = function (node, x, y, nodeX, nodeY, cornerRadius) {
        var nodeX = node._private.position.x;
        var nodeY = node._private.position.y;
        var width = node.width();
        var height = node.height();
        var padding = parseInt(node.css('border-width')) / 2;

        var halfWidth = width / 2;
        var halfHeight = height / 2;

        var straightLineIntersections;

        // Top segment, left to right
        {
            var topStartX = nodeX - halfWidth - padding;
            var topStartY = nodeY - halfHeight - padding;
            var topEndX = nodeX + halfWidth + padding;
            var topEndY = topStartY;

            straightLineIntersections = window.cyMath.finiteLinesIntersect(
                x, y, nodeX, nodeY, topStartX, topStartY, topEndX, topEndY, false);

            if (straightLineIntersections.length > 0) {
                return straightLineIntersections;
            }
        }

        // Right segment, top to bottom
        {
            var rightStartX = nodeX + halfWidth + padding;
            var rightStartY = nodeY - halfHeight - padding;
            var rightEndX = rightStartX;
            var rightEndY = nodeY + halfHeight - cornerRadius + padding;

            straightLineIntersections = window.cyMath.finiteLinesIntersect(
                x, y, nodeX, nodeY, rightStartX, rightStartY, rightEndX, rightEndY, false);

            if (straightLineIntersections.length > 0) {
                return straightLineIntersections;
            }
        }

        // Bottom segment, left to right
        {
            var bottomStartX = nodeX - halfWidth + cornerRadius - padding;
            var bottomStartY = nodeY + halfHeight + padding;
            var bottomEndX = nodeX + halfWidth - cornerRadius + padding;
            var bottomEndY = bottomStartY;

            straightLineIntersections = window.cyMath.finiteLinesIntersect(
                x, y, nodeX, nodeY, bottomStartX, bottomStartY, bottomEndX, bottomEndY, false);

            if (straightLineIntersections.length > 0) {
                return straightLineIntersections;
            }
        }

        // Left segment, top to bottom
        {
            var leftStartX = nodeX - halfWidth - padding;
            var leftStartY = nodeY - halfHeight - padding;
            var leftEndX = leftStartX;
            var leftEndY = nodeY + halfHeight - cornerRadius + padding;

            straightLineIntersections = window.cyMath.finiteLinesIntersect(
                x, y, nodeX, nodeY, leftStartX, leftStartY, leftEndX, leftEndY, false);

            if (straightLineIntersections.length > 0) {
                return straightLineIntersections;
            }
        }

        // Check intersections with arc segments, we have only two arcs for
        //nucleic acid features
        var arcIntersections;

        // Bottom Right
        {
            var bottomRightCenterX = nodeX + halfWidth - cornerRadius;
            var bottomRightCenterY = nodeY + halfHeight - cornerRadius
            arcIntersections = window.cyMath.intersectLineCircle(
                x, y, nodeX, nodeY,
                bottomRightCenterX, bottomRightCenterY, cornerRadius + padding);

            // Ensure the intersection is on the desired quarter of the circle
            if (arcIntersections.length > 0
                && arcIntersections[0] >= bottomRightCenterX
                && arcIntersections[1] >= bottomRightCenterY) {
                return [arcIntersections[0], arcIntersections[1]];
            }
        }

        // Bottom Left
        {
            var bottomLeftCenterX = nodeX - halfWidth + cornerRadius;
            var bottomLeftCenterY = nodeY + halfHeight - cornerRadius
            arcIntersections = window.cyMath.intersectLineCircle(
                x, y, nodeX, nodeY,
                bottomLeftCenterX, bottomLeftCenterY, cornerRadius + padding);

            // Ensure the intersection is on the desired quarter of the circle
            if (arcIntersections.length > 0
                && arcIntersections[0] <= bottomLeftCenterX
                && arcIntersections[1] >= bottomLeftCenterY) {
                return [arcIntersections[0], arcIntersections[1]];
            }
        }
        return []; // if nothing
    };

    //this function gives the intersections of any line with a round rectangle
    $$.sbgn.roundRectangleIntersectLine = function (
        x1, y1, x2, y2, nodeX, nodeY, width, height, cornerRadius, padding) {

        var halfWidth = width / 2;
        var halfHeight = height / 2;

        // Check intersections with straight line segments
        var straightLineIntersections = [];

        // Top segment, left to right
        {
            var topStartX = nodeX - halfWidth + cornerRadius - padding;
            var topStartY = nodeY - halfHeight - padding;
            var topEndX = nodeX + halfWidth - cornerRadius + padding;
            var topEndY = topStartY;

            var intersection = window.cyMath.finiteLinesIntersect(
                x1, y1, x2, y2, topStartX, topStartY, topEndX, topEndY, false);

            if (intersection.length > 0) {
                straightLineIntersections = straightLineIntersections.concat(intersection);
            }
        }

        // Right segment, top to bottom
        {
            var rightStartX = nodeX + halfWidth + padding;
            var rightStartY = nodeY - halfHeight + cornerRadius - padding;
            var rightEndX = rightStartX;
            var rightEndY = nodeY + halfHeight - cornerRadius + padding;

            var intersection = window.cyMath.finiteLinesIntersect(
                x1, y1, x2, y2, rightStartX, rightStartY, rightEndX, rightEndY, false);

            if (intersection.length > 0) {
                straightLineIntersections = straightLineIntersections.concat(intersection);
            }
        }

        // Bottom segment, left to right
        {
            var bottomStartX = nodeX - halfWidth + cornerRadius - padding;
            var bottomStartY = nodeY + halfHeight + padding;
            var bottomEndX = nodeX + halfWidth - cornerRadius + padding;
            var bottomEndY = bottomStartY;

            var intersection = window.cyMath.finiteLinesIntersect(
                x1, y1, x2, y2, bottomStartX, bottomStartY, bottomEndX, bottomEndY, false);

            if (intersection.length > 0) {
                straightLineIntersections = straightLineIntersections.concat(intersection);
            }
        }

        // Left segment, top to bottom
        {
            var leftStartX = nodeX - halfWidth - padding;
            var leftStartY = nodeY - halfHeight + cornerRadius - padding;
            var leftEndX = leftStartX;
            var leftEndY = nodeY + halfHeight - cornerRadius + padding;

            var intersection = window.cyMath.finiteLinesIntersect(
                x1, y1, x2, y2, leftStartX, leftStartY, leftEndX, leftEndY, false);

            if (intersection.length > 0) {
                straightLineIntersections = straightLineIntersections.concat(intersection);
            }
        }

        // Check intersections with arc segments
        var arcIntersections;

        // Top Left
        {
            var topLeftCenterX = nodeX - halfWidth + cornerRadius;
            var topLeftCenterY = nodeY - halfHeight + cornerRadius
            arcIntersections = window.cyMath.intersectLineCircle(
                x1, y1, x2, y2,
                topLeftCenterX, topLeftCenterY, cornerRadius + padding);

            // Ensure the intersection is on the desired quarter of the circle
            if (arcIntersections.length > 0
                && arcIntersections[0] <= topLeftCenterX
                && arcIntersections[1] <= topLeftCenterY) {
                straightLineIntersections = straightLineIntersections.concat(arcIntersections);
            }
        }

        // Top Right
        {
            var topRightCenterX = nodeX + halfWidth - cornerRadius;
            var topRightCenterY = nodeY - halfHeight + cornerRadius
            arcIntersections = window.cyMath.intersectLineCircle(
                x1, y1, x2, y2,
                topRightCenterX, topRightCenterY, cornerRadius + padding);

            // Ensure the intersection is on the desired quarter of the circle
            if (arcIntersections.length > 0
                && arcIntersections[0] >= topRightCenterX
                && arcIntersections[1] <= topRightCenterY) {
                straightLineIntersections = straightLineIntersections.concat(arcIntersections);
            }
        }

        // Bottom Right
        {
            var bottomRightCenterX = nodeX + halfWidth - cornerRadius;
            var bottomRightCenterY = nodeY + halfHeight - cornerRadius
            arcIntersections = window.cyMath.intersectLineCircle(
                x1, y1, x2, y2,
                bottomRightCenterX, bottomRightCenterY, cornerRadius + padding);

            // Ensure the intersection is on the desired quarter of the circle
            if (arcIntersections.length > 0
                && arcIntersections[0] >= bottomRightCenterX
                && arcIntersections[1] >= bottomRightCenterY) {
                straightLineIntersections = straightLineIntersections.concat(arcIntersections);
            }
        }

        // Bottom Left
        {
            var bottomLeftCenterX = nodeX - halfWidth + cornerRadius;
            var bottomLeftCenterY = nodeY + halfHeight - cornerRadius
            arcIntersections = window.cyMath.intersectLineCircle(
                x1, y1, x2, y2,
                bottomLeftCenterX, bottomLeftCenterY, cornerRadius + padding);

            // Ensure the intersection is on the desired quarter of the circle
            if (arcIntersections.length > 0
                && arcIntersections[0] <= bottomLeftCenterX
                && arcIntersections[1] >= bottomLeftCenterY) {
                straightLineIntersections = straightLineIntersections.concat(arcIntersections);
            }
        }

        if (straightLineIntersections.length > 0)
            return straightLineIntersections;
        return []; // if nothing
    };

    $$.sbgn.intersectLineEllipse = function (
        x1, y1, x2, y2, centerX, centerY, width, height, padding) {

        var w = width / 2 + padding;
        var h = height / 2 + padding;
        var an = centerX;
        var bn = centerY;

        var d = [x2 - x1, y2 - y1];

        var m = d[1] / d[0];
        var n = -1 * m * x2 + y2;
        var a = h * h + w * w * m * m;
        var b = -2 * an * h * h + 2 * m * n * w * w - 2 * bn * m * w * w;
        var c = an * an * h * h + n * n * w * w - 2 * bn * w * w * n +
            bn * bn * w * w - h * h * w * w;

        var discriminant = b * b - 4 * a * c;

        if (discriminant < 0) {
            return [];
        }

        var t1 = (-b + Math.sqrt(discriminant)) / (2 * a);
        var t2 = (-b - Math.sqrt(discriminant)) / (2 * a);

        var xMin = Math.min(t1, t2);
        var xMax = Math.max(t1, t2);

        var yMin = m * xMin - m * x2 + y2;
        var yMax = m * xMax - m * x2 + y2;

        return [xMin, yMin, xMax, yMax];
    };

    $$.sbgn.intersectLineStateAndInfoBoxes = function (node, x, y) {
        var centerX = node._private.position.x;
        var centerY = node._private.position.y;
        var padding = parseInt(node.css('border-width')) / 2;

        var stateAndInfos = node._private.data.sbgnstatesandinfos;

        var stateCount = 0, infoCount = 0;

        var intersections = [];

        for (var i = 0; i < stateAndInfos.length; i++) {
            var state = stateAndInfos[i];
            var stateWidth = state.bbox.w;
            var stateHeight = state.bbox.h;
            var stateCenterX = state.bbox.x * node.width() / 100 + centerX;
            var stateCenterY = state.bbox.y * node.height() / 100 + centerY;

            if (state.clazz == "state variable" && stateCount < 2) {//draw ellipse
                var stateIntersectLines = $$.sbgn.intersectLineEllipse(x, y, centerX, centerY,
                    stateCenterX, stateCenterY, stateWidth, stateHeight, padding);

                if (stateIntersectLines.length > 0)
                    intersections = intersections.concat(stateIntersectLines);

                stateCount++;
            } else if (state.clazz == "unit of information" && infoCount < 2) {//draw rectangle
                var infoIntersectLines = $$.sbgn.roundRectangleIntersectLine(x, y, centerX, centerY,
                    stateCenterX, stateCenterY, stateWidth, stateHeight, 5, padding);

                if (infoIntersectLines.length > 0)
                    intersections = intersections.concat(infoIntersectLines);

                infoCount++;
            }

        }
        if (intersections.length > 0)
            return intersections;
        return [];
    };

    $$.sbgn.checkPointStateAndInfoBoxes = function (x, y, node, threshold) {
        var centerX = node._private.position.x;
        var centerY = node._private.position.y;
        var padding =parseInt(node.css('border-width')) / 2;
        var stateAndInfos = node._private.data.sbgnstatesandinfos;

        var stateCount = 0, infoCount = 0;
//    threshold = parseFloat(threshold);

        for (var i = 0; i < stateAndInfos.length; i++) {
            var state = stateAndInfos[i];
            var stateWidth = parseFloat(state.bbox.w) + threshold;
            var stateHeight = parseFloat(state.bbox.h) + threshold;
            var stateCenterX = state.bbox.x * node.width() / 100 + centerX;
            var stateCenterY = state.bbox.y * node.height() / 100 + centerY;

            if (state.clazz == "state variable" && stateCount < 2) {//draw ellipse
                var stateCheckPoint = window.cyNodeShapes["ellipse"].checkPoint(
                    x, y, padding, stateWidth, stateHeight, stateCenterX, stateCenterY);

                if (stateCheckPoint == true)
                    return true;

                stateCount++;
            } else if (state.clazz == "unit of information" && infoCount < 2) {//draw rectangle
                var infoCheckPoint = window.cyNodeShapes["roundrectangle"].checkPoint(
                    x, y, padding, stateWidth, stateHeight, stateCenterX, stateCenterY);

                if (infoCheckPoint == true)
                    return true;

                infoCount++;
            }

        }
        return false;
    };

//  $$.sbgn.intersetLineSelection = function (render, node, x, y, portId) {
//    //TODO: do it for all classes in sbgn, create a sbgn class array to check
//    if (tempSbgnShapes[render.getNodeShape(node)]) {
//      return window.cyNodeShapes[render.getNodeShape(node)].intersectLine(
//          node, x, y, portId);
//    }
//    else {
//      return window.cyNodeShapes[render.getNodeShape(node)].intersectLine(
//          node._private.position.x,
//          node._private.position.y,
//          node.outerWidth(),
//          node.outerHeight(),
//          x, //halfPointX,
//          y, //halfPointY
//          node._private.style["border-width"].pxValue / 2
//          );
//    }
//  };

    $$.sbgn.isNodeShapeTotallyOverriden = function (render, node) {
        if (totallyOverridenNodeShapes[render.getNodeShape(node)]) {
            return true;
        }

        return false;
    };
})(cytoscape);

//TODO: use CSS's "text-overflow:ellipsis" style instead of function below?
function truncateText(textProp, font) {
    var context = document.createElement('canvas').getContext("2d");
    context.font = font;

    var fitLabelsToNodes = sbgnStyleRules['fit-labels-to-nodes'];

    var text = (typeof textProp.label === 'undefined') ? "" : textProp.label;
    //If fit labels to nodes is false do not truncate
    if (fitLabelsToNodes == false) {
        return text;
    }
    var width;
    var len = text.length;
    var ellipsis = "..";

    //if(context.measureText(text).width < textProp.width)
    //	return text;
    var textWidth = (textProp.width > 30) ? textProp.width - 10 : textProp.width;

    while ((width = context.measureText(text).width) > textWidth) {
        --len;
        text = text.substring(0, len) + ellipsis;
    }
    return text;
}