/**
 * Created by durupina on 12/30/16.
 */



function convertSifToCytoscape(sifText, doTopologyGrouping){


    var interactions = new SifParser(sifText);



    var nodes = [];
    interactions.nodes.forEach(function (node) {

        nodes.push({data:{id:node.id, sites: node.sites}});




    });

    var edges = [];
    interactions.edges.forEach(function(edge){
        edges.push({data:{id: edge.id, source: edge.source, target: edge.target, edgeType: edge.edgeType}});
    });


    var cyElements = {nodes: nodes, edges: edges};

    if(doTopologyGrouping)
        return groupTopology(cyElements);
    else
        return cyElements;

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


            cy.on('select', 'node', function (e) {
                console.log(this.data());
                console.log(this.css());
            });

            cy.on('select', 'edge', function (e) {
                console.log(this.data());
                console.log(this.css());
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