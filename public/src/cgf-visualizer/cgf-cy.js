/**
 * Created by durupina on 12/30/16.
 * Cytoscape functions for drawing causality graphs
 */


/**
 * Codes edge types by color, line type etc.
 * @param edgeType
 * @returns {{color:'', linestyle:}}
 */
function attributeMap(edgeType){
    var attributes = {color: 'gray', lineStyle: 'solid'};

    switch(edgeType){
        case "controls-state-change-of":
            attributes["color"] = "coral";
            attributes["lineStyle"]= "dashed";
            break;
        case "controls-transport-of":
            attributes["color"] = "blue";
            break;
        case "controls-phosphorylation-of":
            attributes["color"] =  "teal";
            break;
        case "controls-expression-of":
            attributes["color"] =  "deeppink";
            break;
        case "catalysis-precedes":
            attributes["color"] =  "red";
            break;
        case "in-complex-with":
            attributes["color"] =  "steelblue";
            break;
        case "interacts-with":
            attributes["color"] =  "aquamarine";
            break;
        case "neighbor-of":
            attributes["color"] =  "lime";
            break;
        case "consumption-controled-by":
            attributes["color"] =  "yellow";
            break;
        case "controls-production-of":
            attributes["color"] =  "purple";
            break;
        case "controls-transport-of-chemical":
            attributes["color"] =  "cornflowerblue";
            break;
        case "chemical-affects":
            attributes["color"] =  "darkviolet";
            break;
        case "reacts-with":
            attributes["color"] =  "deepskyblue";
            break;
        case "used-to-produce":
            attributes["color"] =  "green";
            break;
        default:
            attributes["color"] =  'gray';
            break;
    }

    return attributes;
}

var CgfStyleSheet = cytoscape.stylesheet()
    .selector('node')
    .css({
        // 'border-width':'css(border-width)',
        // 'border-color': 'css(border-color)',
        //  'background-color':'white',
        'shape': 'cgfNode',
        'text-halign': 'center',
        'text-valign':'center',

        'width': function(ele){
            var spacing =(ele.data('id').length +2) * 10;
            return  Math.min(200,spacing);
        },
        'height':30,
        'content': 'data(text)'
    })
    .selector('node:selected')
    .css({
        'overlay-color': 'FFCC66',
        'opacity': 1
    })
    .selector('edge')
    .css({
        'width': 'css(width)',
        'line-color': function(ele){
            return attributeMap(ele.data('edgeType')).color;

        },
        'line-style': function(ele){
            return attributeMap(ele.data('edgeType')).lineStyle;
        },
        'curve-style': 'bezier',

        'target-arrow-color': function(ele){
            return attributeMap(ele.data('edgeType')).color;
        },
        'target-arrow-shape': function(ele) {
            if (ele.data('edgeType') == "in-complex-with" || ele.data('edgeType') == "interacts-with" || //nondirected
                ele.data('edgeType') == "neighbor-of" || ele.data('edgeType') == "reacts-with")
                return 'none';
            return 'cgfArrow';
        },
        'arrow-size':5,
        'opacity': 0.8
    })
    .selector('edge:selected')
    .css({
        'line-color': 'black',
        'target-arrow-color': 'black',
        'source-arrow-color': 'black',
        'opacity': 1
    })
    .selector("node[children]")
    .css({
        'text-valign': 'bottom',
        'content': 'data(edgeType)',
        'font-size': 8,

    });




function convertCgfToCytoscape(cgfJson, doTopologyGrouping){

    // var nodes = [];
   //  cgfJson.nodes.forEach(function (node) {
   //      var newNode = {data:node.data};
   //
   // //     nodes.push(newNode);
   //      nodes.push(node);
   //
   //  });

     var edges = [];
    cgfJson.edges.forEach(function(edge){
        var id = edge.data.source + "-" + edge.data.target;
        var newEdge = edge;
        newEdge.data.id = id;

        edges.push(newEdge);
    });



    var cyElements = {nodes: cgfJson.nodes, edges: edges};


    if(doTopologyGrouping)
        return groupTopology(cyElements);
    else
        return cyElements;

}

function computeSitePositions(){


    cy.nodes().forEach(function(node) {
        if(node._private.data.sites) {
            var siteLength = node._private.data.sites.length;
            for (var i = 0; i < siteLength; i++) {
                var site = node._private.data.sites[i];


                var centerX = node._private.position.x;
                var centerY = node._private.position.y;
                var width = node.width();
                var height = node.height();
                var siteCenterX;
                var siteCenterY;

                var siteWidth = 10;
                var siteHeight = 10;

                siteCenterX = centerX - width / 2 + siteWidth / 2  + width * i /siteLength;

                if(i% 2 == 0)
                    siteCenterY = centerY - height /  2;
                else
                    siteCenterY = centerY + height / 2 ;


                //extend site information

                node._private.data.sites[i].bbox = {'x': siteCenterX, 'y': siteCenterY, 'w': siteWidth, 'h': siteHeight};

                node.select(); //to update the bounding boxes of sites in the viewport
                node.unselect();
            }

        }




    });
}

var CgfCy = function(el, cgfJson, doTopologyGrouping, modelManager) {

    var cyElements = convertCgfToCytoscape(cgfJson, doTopologyGrouping);


    var cy = window.cy = cytoscape({
        container: el,

        boxSelectionEnabled: true,
        autounselectify: false,


        layout: {
            animate: false,
            fit: true,
            randomize: false,
            nodeRepulsion: 4500,
            idealEdgeLength: 50,
            edgeElasticity: 0.45,
            nestingFactor: 0.1,
            gravity: 0.25,
            numIter: 2500,
            tile: true,
            tilingPaddingVertical: 5,
            tilingPaddingHorizontal: 5,
            name: 'cose-bilkent'

        },

        style: CgfStyleSheet,

        elements: cyElements,

        ready: function () {

            computeSitePositions();
       //     cy.fit(); //call for updating bounding boxes for sites

            cy.on('drag', 'node', function (e) {
                computeSitePositions();
            });

            cy.on('select', 'node', function(e){
                this.css('background-color', '#FFCC66');
            });

            cy.on('unselect', 'node', function(e){
                //get original background color
                var backgroundColor = modelManager.getModelNodeAttribute(this.id(), 'css.backgroundColor');
                this.css('background-color', backgroundColor);
            });


            cy.on('tapend', 'edge', function (e) {

                var edge = this;

                edge.qtip({
                    content: function () {
                        var contentHtml = "<b style='text-align:center;font-size:16px;'>" + edge._private.data.edgeType + "</b>";
                        return contentHtml;
                    },
                    show: {
                        ready: true
                    },
                    position: {
                        my: 'top center',
                        at: 'bottom center',
                        adjust: {
                            cyViewport: true
                        }
                    },
                    style: {
                        classes: 'qtip-bootstrap',
                        tip: {
                            width: 16,
                            height: 8
                        }
                    }
                });
            });
        }


    });


    //update cgf states



}



if (typeof module !== 'undefined' && module.exports) { // expose as a commonjs module
    module.exports = CgfCy;
}