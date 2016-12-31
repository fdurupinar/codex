/**
 * Created by durupina on 12/30/16.
 */



function convertSifToCytoscape(sifText, doTopologyGrouping){

    var interactions = SIFJS.parse(sifText);

    console.log(interactions);
    console.log(doTopologyGrouping);

    var nodes = [];
    interactions.nodes.forEach(function (node) {
        var node = {data:{id:node.id}};
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

var sifCy = function(el, sifText, doTopologyGrouping) {

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
            cy.on('tapend', 'node', function (e) {
                console.log(this);
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
}


if (typeof module !== 'undefined' && module.exports) { // expose as a commonjs module
    module.exports = sifCy;
}