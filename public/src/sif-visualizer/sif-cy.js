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

/**
 * Created by durupina on 9/6/16.
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
var SifStyleSheet = cytoscape.stylesheet()
    .selector('node')
    .css({
        'border-width':1,
        'border-color': 'gray',
        'background-color': 'white',
        'shape': 'roundrectangle',
        'text-halign': 'center',
        'text-valign':'center',


        'width': function(ele){
            var spacing =(ele.data('id').length +2) * 10;
            return  Math.min(200,spacing);
        },
        'height':30,
        'content': 'data(id)'
    })
    .selector('edge')
    .css({
        'width': 1,
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

    .selector("node[children]")
    .css({
        'text-valign': 'bottom',
        'content': 'data(edgeType)',
        'font-size': 8,

    })
    .selector('edge:selected')
    .css({
        'line-color': 'black',
        'target-arrow-color': 'black',
        'source-arrow-color': 'black',
        'opacity': 1
    })
    .selector('node:selected')
    .css({
        'background-color': 'orange',
        'opacity': 1
    });



if (typeof module !== 'undefined' && module.exports) { // expose as a commonjs module
    module.exports = SifCy;
}