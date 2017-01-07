/***
 * @param text: sif file
 * @returns {{nodes: *, edges: *}}
 * @constructor
 */
function SifParser(text){

    var self = this;
    this.nodes = {};
    this.edges = {};



    /***
     * @param id
     * @returns {a node with id}
     */
    this.getNode = function (id){
        if(!this.nodes[id])
            this.nodes[id] = {id:id};
        return this.nodes[id];
    };

    /***
     * Method to parse one line of a sif file
     * @param line
     * @param i : line number
     */
    this.parse = function(line, i){

        var self = this;
        line = (line.split('\t').length > 1) ? line.split('\t') : line.split(' ');


        if(line[0]=="")
            return;

        if(line.length == 1){
            self.getNode(line[0]);

        }
        else if(line.length >=3 ) {
            var source = self.getNode( line[0]);
            var edgeType = line[1];


            var target = self.getNode(line[2]);
            var edgeId;


            edgeId =  source.id  + "_" +  edgeType + "_" + target.id ;

            self.edges[edgeId] = {id: edgeId, source: source.id, target: target.id, edgeType: edgeType};

            if(line.length == 5){
                target.sites = line[4].split(';');

            }

        }

        else{
            console.warn('SIFJS cannot parse line ' + i + ' "' + line + '"');
            return;
        }

        return;
    }


    /***
     * Private method that converts an object into an array
     * @param obj
     * @returns {Array}
     */
    function toArr(obj){
        var arr = [];
        for (var key in obj) arr.push(obj[key]);
        return arr;
    };



    var lines = text.split('\n'), i, length;
    for (i = 0, length = lines.length; i < length; i++)
        self.parse(lines[i], i);

    return {nodes:toArr(self.nodes), edges:toArr(self.edges)};


}


if (typeof module !== 'undefined' && module.exports) { // expose as a commonjs module
    module.exports = SifParser;
}