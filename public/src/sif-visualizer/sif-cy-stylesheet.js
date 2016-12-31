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
        'border-width':2,
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
        'width': 3,
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
            return 'triangle';
        },
        'arrow-size':50,
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
