QUnit = require('qunitjs');
module.exports = function(){


    QUnit.module( "modelManager Tests" );

    QUnit.test('modelManager.setName()', function(assert) {
        ModelManager.setName("abc");
          assert.equal(ModelManager.getName(), "abc", "User name is correctly set.");
    });

    QUnit.test('modelManager.setSampleInd()', function(assert) {

        for(var i = 0; i < 5; i++) {
            ModelManager.setSampleInd(i);
            assert.equal(ModelManager.getSampleInd(), i, ("Sample index " + i + " is correctly set" ));
        }

    });


    //Node is not initialized here
    function addModelNodeTest(id){
        QUnit.test('modelManager.addModelNode()', function(assert) {

            ModelManager.addModelNode(id, {x: 100, y: 200, sbgnclass: "macromolecule", sbgnlabel:"tmpLabel" });


            assert.ok(cy.getElementById(id),"Node added to cytoscape");
            assert.equal(ModelManager.getModelNode(id).id, cy.getElementById(id).id() , "Node is equal in model and cytoscape");

            assert.equal(cy.getElementById(id)._private.data.sbgnclass, "macromolecule", "Node sbgnclass is correct.");
            assert.equal(cy.getElementById(id)._private.data.sbgnclass, ModelManager.getModelNode(id).sbgnclass, "Node sbgnclass is equal in model and cytoscape.");

            assert.equal(cy.getElementById(id)._private.data.sbgnlabel, "tmpLabel", "Node sbgnlabel is correct.");
            assert.equal(cy.getElementById(id)._private.data.sbgnlabel, ModelManager.getModelNode(id).sbgnlabel, "Node sbgnlabel is equal in model and cytoscape.");

            assert.equal(cy.getElementById(id)._private.position.x, 100, "Node position x is correct.");
            assert.equal(cy.getElementById(id).position().x, ModelManager.getModelNode(id).position.x, "Node position x is equal in model and cytoscape.");

            assert.equal(cy.getElementById(id)._private.position.y, 200, "Node position y is correct.");
            assert.equal(cy.getElementById(id).position().y, ModelManager.getModelNode(id).position.y, "Node position y is equal in model and cytoscape.");

        });
    }

    function initModelNodeTest(id){
        QUnit.test('modelManager.initNode()', function(assert) {

            ModelManager.initModelNode(cy.getElementById(id));

            var node = cy.getElementById(id);
            var modelNode = ModelManager.getModelNode(id);


            assert.equal(modelNode.sbgnclass, node.data('sbgnclass'), "Node sbgnclass correctly initialized.");
            assert.equal(modelNode.sbgnlabel, node.data('sbgnlabel'), "Node sbgnlabel correctly initialized.");
            assert.equal(modelNode.backgroundOpacity, node.data('backgroundOpacity'), "Node backgroundOpacity correctly initialized.");
            assert.equal(modelNode.backgroundColor, node.css('background-color'), "Node backgroundColor correctly initialized.");
            assert.equal(modelNode.borderColor, node.css('border-color'), "Node borderColor correctly initialized.");
            assert.equal(modelNode.borderWidth, node.css('border-width'), "Node borderWidth correctly initialized.");
            assert.equal(modelNode.isCloneMarker, node.data('sbgnclonemarker'), "Node isCloneMarker correctly initialized.");
            assert.equal(modelNode.isMultimer, node.data('sbgnclass').indexOf(' multimer') > 0, "Node isMultimer correctly initialized.");
            assert.equal(modelNode.sbgnStatesAndInfos.length, 0, "Node sbgnStatesAndInfos correctly initialized.");
            assert.equal(modelNode.parent, node.data('parent'), "Node parent correctly initialized.");
            assert.equal(modelNode.children, node.data('children'), "Node children correctly initialized.");
            assert.equal(modelNode.ports.length, 0, "Node ports correctly initialized.");
            assert.equal(modelNode.height, node._private.data.sbgnbbox.h, "Node height correctly initialized.");
            assert.equal(modelNode.width, node._private.data.sbgnbbox.w, "Node width correctly initialized.");

        });
    }

    function addModelEdgeTest(id1, id2, firstTime){
        QUnit.test('modelManager.addModelEdge()', function(assert) {


            var id = (id1 + "-"+ id2);
            ModelManager.addModelEdge(id, {source: id1, target: id2, sbgnclass: "consumption"});

            assert.ok(cy.getElementById(id),"Edge added to cytoscape");
            assert.equal(cy.getElementById(id)._private.data.sbgnclass, "consumption", "Edge sbgnclass is correct.");
            assert.equal(cy.getElementById(id)._private.data.sbgnclass, ModelManager.getModelEdge(id).sbgnclass, "Edge sbgnclass is equal in model and cytoscape.");
            assert.equal(cy.getElementById(id)._private.data.source, id1, "Edge source is correct.");
            assert.equal(cy.getElementById(id)._private.data.source, ModelManager.getModelEdge(id).source, "Edge source is equal in model and cytoscape.");
            assert.equal(cy.getElementById(id)._private.data.target, id2, "Edge target is correct.");
            assert.equal(cy.getElementById(id)._private.data.target, ModelManager.getModelEdge(id).target, "Edge target is equal in model and cytoscape.");

        });
    }

    function initModelEdgeTest(id) {
        QUnit.test('modelManager.initEdge()', function (assert) {

            ModelManager.initModelEdge(cy.getElementById(id));

            var edge = cy.getElementById(id);
            var modelEdge = ModelManager.getModelEdge(id);


            assert.equal(modelEdge.sbgnclass, edge._private.data.sbgnclass, "Edge sbgnclass correctly initialized.");
            assert.equal(modelEdge.sbgncardinality, edge._private.data.sbgncardinality, "Edge sbgncardinality correctly initialized.");
            assert.equal(modelEdge.bendPointPositions.length, edge._private.data.bendPointPositions.length, "Edge sbgncardinality correctly initialized.");
            assert.equal(modelEdge.lineColor, edge.css('line-color'), "Edge lineColor correctly initialized.");
            assert.equal(modelEdge.width, edge.css('width'), "Edge width correctly initialized.");
            assert.equal(modelEdge.portsource, edge.data('portsource'), "Edge portsource correctly initialized.");
            assert.equal(modelEdge.porttarget, edge.data('porttarget'), "Edge porttarget correctly initialized.");

        });
    }

    function deleteModelNodeTest(id){
        QUnit.test('modelManager.deleteModelNode()', function(assert){
            ModelManager.deleteModelNode(id);
            assert.equal(ModelManager.getModelNode(id), null, "Node removed from model.");
            assert.equal(cy.getElementById(id).length,0, "Node removed from cytoscape.");

        });
    }

    function deleteModelEdgeTest(id){
        QUnit.test('modelManager.deleteModelEdge()', function(assert){
            ModelManager.deleteModelEdge(id);
            assert.equal(ModelManager.getModelEdge(id), null, "Edge removed from model.");
            assert.equal(cy.getElementById(id).length,0, "Edge removed from cytoscape.");

        });
    }



    function selectModelNodeTest(id){
        QUnit.test('modelManager.selectModelNode()', function(assert){
            var node = cy.getElementById(id);
            var originalBackgroundColor = ModelManager.getModelNode(id).backgroundColor;
            ModelManager.selectModelNode(node);
            assert.equal(node.css('background-color'), ModelManager.getModelNode(id).highlightColor, "Cytoscape backgroundColor correctly updated.");
            assert.equal(ModelManager.getModelNode(id).backgroundColor, originalBackgroundColor, "Model backgroundColor does not change.");
        });
    }


    function selectModelEdgeTest(id){
        QUnit.test('modelManager.selectModelEdge()', function(assert){
            var edge = cy.getElementById(id);
            var originalBackgroundColor = ModelManager.getModelEdge(id).lineColor;
            ModelManager.selectModelEdge(edge);
            assert.equal(edge.css('line-color'), ModelManager.getModelEdge(id).highlightColor, "Cytoscape lineColor correctly updated.");
            assert.equal(ModelManager.getModelEdge(id).lineColor, originalBackgroundColor, "Model lineColor does not change.");
        });
    }

    function unselectModelNodeTest(id){
        QUnit.test('modelManager.unselectModelNode()', function(assert){
            var node = cy.getElementById(id);
            var originalBackgroundColor = ModelManager.getModelNode(id).backgroundColor;
            ModelManager.unselectModelNode(node);
            assert.equal(node.css('background-color'), originalBackgroundColor, "Cytoscape backgroundColor correctly reverted.");
            assert.equal(ModelManager.getModelNode(id).highlightColor, null, "Model highlight color is removed.");
        });
    }



    function unselectModelEdgeTest(id){
        QUnit.test('modelManager.unselectModelEdge()', function(assert){
            var edge = cy.getElementById(id);
            var originalLineColor = ModelManager.getModelEdge(id).lineColor;
            ModelManager.unselectModelEdge(edge);
            assert.equal(edge.css('line-color'), originalLineColor, "Cytoscape lineColor correctly reverted.");
            assert.equal(ModelManager.getModelEdge(id).highlightColor, null, "Model highlight color is removed.");
        });
    }


    function changeModelNodeAttributeTest(id){
        QUnit.test('modelManager.changeModelNodeAttribute()', function(assert) {
            
            ModelManager.changeModelNodeAttribute("position", id, {x: 300, y: 400});
            assert.equal(300, cy.getElementById(id).position().x,  "Node position x is correct in cytoscape.");
            assert.equal(ModelManager.getModelNode(id).position.x,cy.getElementById(id).position().x,  "Node position x is equal in model and cytoscape.");

            assert.equal(400, cy.getElementById(id).position().y,  "Node position y is correct in cytoscape.");
            assert.equal(ModelManager.getModelNode(id).position.y, cy.getElementById(id).position().y,  "Node position y is equal in model and cytoscape.");


            ModelManager.changeModelNodeAttribute("sbgnclass", id, "phenotype");
            assert.equal("phenotype", cy.getElementById(id).data('sbgnclass'),  "Node sbgnclass is correct in cytoscape.");
            assert.equal(ModelManager.getModelNode(id).sbgnclass, cy.getElementById(id).data('sbgnclass'),  "Node sbgnclass is equal in model and cytoscape.");

            ModelManager.changeModelNodeAttribute("sbgnlabel", id, "label2");
            assert.equal("label2", cy.getElementById(id).data('sbgnlabel'),  "Node sbgnlabel is correct in cytoscape.");
            assert.equal(ModelManager.getModelNode(id).sbgnlabel, cy.getElementById(id).data('sbgnlabel'),  "Node sbgnlabel is equal in model and cytoscape..");

            ModelManager.changeModelNodeAttribute("backgroundOpacity", id, 1);
            assert.equal(1, cy.getElementById(id).data('backgroundOpacity'),  "Node backgroundOpacity is correct in cytoscape.");
            assert.equal(ModelManager.getModelNode(id).backgroundOpacity, cy.getElementById(id).data('backgroundOpacity'),  "Node backgroundOpacity is equal in model and cytoscape..");

            ModelManager.changeModelNodeAttribute("backgroundColor", id, '#333343');
            assert.equal('#333343', cy.getElementById(id).css('background-color'), "Node backgroundColor is correct in cytoscape.");
            assert.equal(ModelManager.getModelNode(id).backgroundColor, cy.getElementById(id).css('background-color'), "Node backgroundColor is equal in model and cytoscape..");

            ModelManager.changeModelNodeAttribute("borderColor", id, '#222222');
            assert.equal('#222222', cy.getElementById(id).css('border-color'), "Node borderColor is correct in cytoscape.");
            assert.equal(ModelManager.getModelNode(id).borderColor, cy.getElementById(id).css('border-color'), "Node borderColor is equal in model and cytoscape..");

            ModelManager.changeModelNodeAttribute("borderWidth", id, "3px");
            assert.equal("3px", cy.getElementById(id).css('border-width'), "Node borderWidth is correct in cytoscape.");
            assert.equal(ModelManager.getModelNode(id).borderWidth, cy.getElementById(id).css('border-width'), "Node borderWidth is equal in model and cytoscape..");

            ModelManager.changeModelNodeAttribute("isCloneMarker", id, true);
            assert.equal(true, cy.getElementById(id).data('sbgnclonemarker'), "Node isCloneMarker is correct in cytoscape.");
            assert.equal(ModelManager.getModelNode(id).isCloneMarker, cy.getElementById(id).data('sbgnclonemarker'), "Node isCloneMarker is equal in model and cytoscape..");

            ModelManager.changeModelNodeAttribute("isMultimer", id, true);
            assert.equal(true, cy.getElementById(id).data('sbgnclass').indexOf(' multimer') > 0, "Node isMultimer is correct in cytoscape.");
            assert.equal(ModelManager.getModelNode(id).isMultimer, cy.getElementById(id).data('sbgnclass').indexOf(' multimer') > 0, "Node isMultimer is equal in model and cytoscape..");

            ModelManager.changeModelNodeAttribute("sbgnStatesAndInfos", id, [{clazz:"unit of information", label:{text:"uoi"}}]);
            assert.equal("unit of information", cy.getElementById(id).data('sbgnstatesandinfos')[0].clazz, "Node sbgnStatesAndInfos are correct in cytoscape.");
            assert.equal(ModelManager.getModelNode(id).sbgnStatesAndInfos[0].clazz, cy.getElementById(id).data('sbgnstatesandinfos')[0].clazz, "Node sbgnStatesAndInfos are equal in model and cytoscape..");

            ModelManager.changeModelNodeAttribute("parent", id, "glyph2");
            assert.equal("glyph2", cy.getElementById(id).data('parent'), "Node parent is correct in cytoscape.");
            assert.equal(ModelManager.getModelNode(id).parent, cy.getElementById(id).data('parent'), "Node parent is equal in model and cytoscape..");


            // ModelManager.changeModelNodeAttribute("children", id, ["glyph3"]);
            // assert.equal("glyph3", cy.getElementById(id)._private.children[0].id(), "Node children are correct in cytoscape.");
            // assert.equal(ModelManager.getModelNode(id).children[0], cy.getElementById(id)._private.children[0].id(), "Node children are equal in model and cytoscape..");

            ModelManager.changeModelNodeAttribute("ports", id, ["glyph4"]);
            assert.equal(ModelManager.getModelNode(id).ports[0], cy.getElementById(id).data('ports')[0], "Node ports are correct in cytoscape.");
            assert.equal(ModelManager.getModelNode(id).ports[0], cy.getElementById(id).data('ports')[0], "Node ports are equal in model and cytoscape..");

            ModelManager.changeModelNodeAttribute("height", id, 4);
            assert.equal(4, cy.getElementById(id)._private.data.sbgnbbox.h, "Node height is correct in cytoscape.");
            assert.equal(ModelManager.getModelNode(id).height, cy.getElementById(id)._private.data.sbgnbbox.h, "Node height is equal in model and cytoscape..");

            ModelManager.changeModelNodeAttribute("width", id, 5);
            assert.equal(5, cy.getElementById(id)._private.data.sbgnbbox.w, "Node width is correct in cytoscape.");
            assert.equal(ModelManager.getModelNode(id).width, cy.getElementById(id)._private.data.sbgnbbox.w, "Node width is equal in model and cytoscape..");


        });
    }



    function changeModelEdgeAttributeTest(id){
        QUnit.test('modelManager.changeModelEdgeAttribute()', function(assert){
            ModelManager.changeModelEdgeAttribute("sbgnclass", id, "catalysis");
            assert.equal("catalysis", cy.getElementById(id).data('sbgnclass'),  "Edge sbgnclass is correct in cytoscape.");
            assert.equal(ModelManager.getModelEdge(id).sbgnclass, cy.getElementById(id).data('sbgnclass'),  "Edge sbgnclass is equal in model and cytoscape.");

            ModelManager.changeModelEdgeAttribute("source", id, "glyph14");
            assert.equal("glyph14", cy.getElementById(id).data("source"),  "Edge source is correct in cytoscape.");
            assert.equal(ModelManager.getModelEdge(id).source, cy.getElementById(id).data("source"),  "Edge source is equal in model and cytoscape.");

            ModelManager.changeModelEdgeAttribute("target", id, "glyph5");
            assert.equal("glyph5", cy.getElementById(id)._private.data.target,  "Edge target is correct in cytoscape.");
            assert.equal(ModelManager.getModelEdge(id).target, cy.getElementById(id)._private.data.target,  "Edge target is equal in model and cytoscape.");


            ModelManager.changeModelEdgeAttribute("sbgncardinality", id, 5);
            assert.equal(5, cy.getElementById(id)._private.data.sbgncardinality,  "Edge sbgncardinality is correct in cytoscape.");
            assert.equal(ModelManager.getModelEdge(id).sbgncardinality, cy.getElementById(id)._private.data.sbgncardinality,  "Edge sbgncardinality is equal in model and cytoscape.");

            ModelManager.changeModelEdgeAttribute("portsource", id, "glyph14");
            assert.equal("glyph14", cy.getElementById(id).data('portsource'),  "Edge portsource is correct in cytoscape.");
            assert.equal(ModelManager.getModelEdge(id).portsource, cy.getElementById(id).data('portsource'),  "Edge portsource is equal in model and cytoscape.");

            ModelManager.changeModelEdgeAttribute("porttarget", id, "glyph5");
            assert.equal("glyph5", cy.getElementById(id).data('porttarget'),  "Edge porttarget is correct in cytoscape.");
            assert.equal(ModelManager.getModelEdge(id).porttarget, cy.getElementById(id).data('porttarget'),  "Edge porttarget is equal in model and cytoscape.");


            ModelManager.changeModelEdgeAttribute("lineColor", id, "#411515");
            assert.equal("#411515", cy.getElementById(id).css("line-color"),  "Edge lineColor is correct in cytoscape.");
            assert.equal(ModelManager.getModelEdge(id).lineColor, cy.getElementById(id).css("line-color"),  "Edge lineColor is equal in model and cytoscape.");

            ModelManager.changeModelEdgeAttribute("width", id, "8px");
            assert.equal("8px", cy.getElementById(id).css("width"),  "Edge width is correct in cytoscape.");
            assert.equal(ModelManager.getModelEdge(id).width, cy.getElementById(id).css("width"),  "Edge width is equal in model and cytoscape.");


            ModelManager.changeModelEdgeAttribute("bendPointPositions", id, [{x: 300, y: 400}]);
            assert.equal(300, cy.getElementById(id)._private.data.bendPointPositions[0].x,  "Edge bendPointPositions are correct in cytoscape.");
            assert.equal(ModelManager.getModelEdge(id).bendPointPositions[0].x,cy.getElementById(id)._private.data.bendPointPositions[0].x,  "Edge bendPointPositions are equal in model and cytoscape.");


        });
    }
    

    addModelNodeTest(1000);
    addModelNodeTest(1000); //already added
    initModelNodeTest(1000);
    selectModelNodeTest(1000);
    unselectModelNodeTest(1000);

    changeModelNodeAttributeTest(1000);
    deleteModelNodeTest(1000);
    deleteModelNodeTest(1000); //already deleted

    addModelEdgeTest("glyph2", "glyph6");
    addModelEdgeTest("glyph2", "glyph6"); //already added
    initModelEdgeTest("glyph2-glyph6");
    selectModelEdgeTest("glyph2-glyph6");
    unselectModelEdgeTest("glyph2-glyph6");
     changeModelEdgeAttributeTest(("glyph2-glyph6"));
    deleteModelEdgeTest("glyph2-glyph6");
    deleteModelEdgeTest("glyph2-glyph6"); //already deleted





};