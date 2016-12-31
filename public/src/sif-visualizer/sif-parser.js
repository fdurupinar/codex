//private members

var _getNode = function(nodes, id){
    if(!nodes[id]) nodes[id] = {id:id};
    return nodes[id];
}
    
var _parse = function(nodes, edges, line, i){


    line = (line.split('\t').length > 1) ? line.split('\t') : line.split(' ');


    if(line[0]=="")
        return;

    if(line.length == 1){
        _getNode(nodes, line[0]);

    }
    else if(line.length == 3) {
        var source = _getNode(nodes, line[0]);
        var edgeType = line[1];

        for (var j = 2; j < line.length; j++) {
            var target = _getNode(nodes, line[j]);
            var edgeId;


            edgeId =  source.id  + "_" +  edgeType + "_" + target.id ;

            edges[edgeId] = {id: edgeId, source: source.id, target: target.id, edgeType: edgeType};

        }

    }
    else{
        console.warn('SIFJS cannot parse line ' + i + ' "' + line + '"');
        return;
    }

    return;
}

var _toArr = function(obj){
    var arr = [];
    for (var key in obj) arr.push(obj[key]);
    return arr;
}    
    
//public
function SIFJS() {};
    
SIFJS.parse = function(text){

    var nodes = {};
    var edges = {};


    var lines = text.split('\n'), i, length;
    for (i = 0, length = lines.length; i < length; i++)
        _parse(nodes, edges, lines[i], i);
    
    return {nodes:_toArr(nodes), edges:_toArr(edges)};
};

