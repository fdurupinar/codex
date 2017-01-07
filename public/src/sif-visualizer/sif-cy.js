/**
 * Created by durupina on 12/30/16.
 */



function convertSifToCytoscape(sifText, doTopologyGrouping){


    var interactions = new SifParser(sifText);



    var nodes = [];
    interactions.nodes.forEach(function (node) {
        var node = {data:{id:node.id, sites: node.sites}};
        nodes.push(node);




    });

    var edges = [];
    interactions.edges.forEach(function(edge){
        var edge = {data:{id: edge.id, source: edge.source, target: edge.target, edgeType: edge.edgeType}};
        edges.push(edge);
    });


    var cyElements = {nodes: nodes, edges: edges};

    if(doTopologyGrouping)
        return groupTopology(cyElements);
    else
        return cyElements;

}

function computeStatePositions(){


    cy.nodes().forEach(function(node) {
        node._private.data.sifStates = [];
        if(node._private.data.sites) {
            var siteLength = node._private.data.sites.length;
            for (var i = 0; i < siteLength; i++) {
                var site = node._private.data.sites[i];


                var centerX = node._private.position.x;
                var centerY = node._private.position.y;
                var width = node.width();
                var height = node.height();
                var stateCenterX;
                var stateCenterY;

                var stateWidth = 10;
                var stateHeight = 10;

                stateCenterX = centerX - width / 2 + stateWidth / 2  + width * i /siteLength;

                if(i% 2 == 0)
                    stateCenterY = centerY - height /  2;
                else
                    stateCenterY = centerY + height / 2 ;

                var state = {
                    'site': site,
                    'bbox': {'x': stateCenterX, 'y': stateCenterY, 'width': stateWidth, 'height': stateHeight}
                };
                node._private.data.sifStates.push(state);
            }
            ;
        }




    });
}

var SifCy = function(el, sifText, doTopologyGrouping) {

    var cyElements = convertSifToCytoscape(sifText, doTopologyGrouping);


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

        style: SifStyleSheet,

        elements: cyElements,

        ready: function () {

            computeStatePositions();

            cy.on('drag', 'node', function (e) {
                computeStatePositions();
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


    //update sif states



}


if (typeof module !== 'undefined' && module.exports) { // expose as a commonjs module
    module.exports = SifCy;
}