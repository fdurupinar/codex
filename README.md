SBGNViz Collaborative Editor User Guide
=======================================

The editor allows human curators and computer agents to work on the same
pathway model, and communicate through text and images. On the server
side, we have an application server that keeps the model, handles
communication across clients, and performs operational transformation.
Model visualization and editing are handled on the client side. The
editor visualizes information about cellular processes and pathways in
SBGN (Systems Biology Graphical Notation) format. It allows for
automatic graph layout, editing and highlighting facilities.

Installation
------------

Install node.js, mongodb and redis servers first.

Node:

>curl -sL
[*https://deb.nodesource.com/setup\_0.12*](https://deb.nodesource.com/setup_0.12)
>| sudo -E bash -

>sudo apt-get install -y nodejs

Redis:

>sudo apt-get update

>sudo apt-get install build-essential

>sudo apt-get install tcl8.5

wget
[*http://download.redis.io/releases/redis-stable.tar.gz*](http://download.redis.io/releases/redis-stable.tar.gz)

>tar xzf redis-stable.tar.gz

>cd redis-stable

>make

Mongo:

>sudo apt-key adv --keyserver
hkp://[*keyserver.ubuntu.com:80*](http://keyserver.ubuntu.com/) --recv
EA312927

>echo "deb
[*http://repo.mongodb.org/apt/ubuntu*](http://repo.mongodb.org/apt/ubuntu)
trusty/mongodb-org/3.2 multiverse" | sudo tee
/etc/apt/sources.list.d/mongodb-org-3.2.list

>sudo apt-get update

>sudo apt-get install -y mongodb-org

If mongo does not work:

>sudo apt-get install upstart-sysv

Get project from github:

>git clone
[*https://github.com/fdurupinar/Sbgnviz-Collaborative-Editor.git*](https://github.com/fdurupinar/Sbgnviz-Collaborative-Editor.git)

>cd Sbgnviz-Collaborative-Editor

>sudo rm -rf node\_modules

>npm install

Run server:

>node server

In order to open a client:

Enter “http://localhost:3000” to the address bar of your browser. <span
id="_lzkutpoc5320" class="anchor"></span>

### Computer Agent API

Computer agents are connected to the node.js http server via websockets
(socket.io.js). An agent is initialized with a *name (string)* and a
unique *ID (string).*

**Constructor**: Agent (string name, string id)

#### Public Attributes:

**agentId**: (string) A unique id

**agentName**: (string) Agent name

**colorCode**: A specific color to identify the agent operations. It
should be a string in hsla format as: “hsla(*H*, *S*, *L*%, 1)”, where
*H (integer)*, *S (float)* and *L (float)* are hue, saturation and
lightness values.

**selectedNode**: The node object on which the agent is performing
operations. It has attributes such as position
={x:< posX >,y:< posY >}, width, height, borderWidth,
borderHeight, backgroundColor, sbgnLabel, sbgnStatesAndInfos =
{clazz:< className >, state =
{value:< stateValue >,variable:< stateVariable >}}.

**selectedEdge**: The edge object on which the agent is performing
operations. It has attributes such as cardinality, lineColor and width.

**opHistory**: History of operations as an array of strings in the
format: “*UserName* (*date*): *Command*”.

**chatHistory**: Chat history as an array of messages.

**userList**: List of connected user ids.

#### Private Attributes:

**room**: The document id that identifies the shared model. It is the
string after http:<ip>:3000/ in the server address.

**socket**: The web socket between the server and agent

**pageDoc**: The document that the shared model is stored.

#### Methods:


| **Name**                | **Function**                                                                                                                     |      **Parameters**              |       **Returns**                                                             |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- | ----------------------------------------------------------------------------- |
|  connectToServer        | Connects the server and returns socket.io socket                                                                                 |     url, callback                |      socket                                                                   |
|  loadModel              | Gets the model for the current room                                                                                              |     callback                     |                                                                               |
|  loadOperationHistory   | Gets history of operations from the node.js server and assigns them to opHistory                                                 |     callback                     |                                                                               |
|  loadUserList           | Gets user list from the node.js server and assigns them to userList                                                              |     callback                     |                                                                               |
|  loadChatHistory        | Gets history of chat messages from the node.js server and assigns them to chatHistory                                            |      callback                    |                                                                               |
|  getNodeList            |                                                                                                                                  |      callback                    |   The node list in the shared model as an object of node ids                  |
|  getLayoutProperties    |                                                                                                                                  |     callback                     |  Layout properties of the shared model as an object with attributes as:       |
|                         |                                                                                                                                  |                                  |   {name: < layout name >,                                                       |
|                         |                                                                                                                                  |                                  |   nodeRepulsion: < node repulsion value > ,                                     |
|                         |                                                                                                                                  |                                  |   nodeOverlap:< node overlap percentage >,                                      |
|                         |                                                                                                                                  |                                  |   idealEdgeLength:< ideal edge length value >,                                  |
|                         |                                                                                                                                  |                                  |   edgeElasticity:< edge elasticity value >,                                     |
|                         |                                                                                                                                  |                                  |   nestingFactor:< nesting factor value >,                                       |
|                         |                                                                                                                                  |                                  |   gravity:< gravity value >,                                                    |
|                         |                                                                                                                                  |                                  |   numIter:< number of iterations >,                                             |
|                         |                                                                                                                                  |                                  |     tile:< boolean value to tile disconnected >,                                |
|                         |                                                                                                                                  |                                  |   animate:< boolean value >,                                                    |
|                         |                                                                                                                                  |                                  |   randomize:< boolean value >}                                                  |
|  changeName             | Sends request to the server to change agent's name                                                                               |       newName                    |                                                                               |
|  getNodeRequest         | Requests the node with < id > from the server                                                                                      |     id, callback                 |  Node with id                                                                 |
|  getEdgeRequest         | Requests the edge with < id > from the server                                                                                      |      id, callback                |   Edge with id                                                                |
|  sendMessage            | Sends chat message < comments > as a string to < targetArr > as an array of targeted user ids \[{id: < id1 >},..., {id: < idn >}\]       |    comment, targetArr, callback  |                                                                               |
|  listen                 | Socket listener for server requests. Can get “operation”, “message”, “userList” or “imageFile” from the server.                  |   callback                       |                                                                               |
|  sendRequest            | Sends an operation request to the node.js server. Model update operations are done using this method.                            |  [*reqName, param*](#sendrequest)|                                                                               |


##### sendRequest:


|**reqName**                          |  **param**                                                                         |
| ----------------------------------- | ---------------------------------------------------- |
| “agentAddImageRequest”              | {img: < image file >,                         |
|                                     | filePath: < path of image file > }             |
| "agentSetLayoutProperties"          | {name: < layout name >,                       |
|                                     | nodeRepulsion: < node repulsion value > ,        |
|                                     | nodeOverlap:< node overlap percentage >,          |
|                                     | idealEdgeLength:< ideal edge length value >,      |
|                                     | edgeElasticity:< edge elasticity value >,    |
|                                     | nestingFactor:< nesting factor value >,      |
|                                     | gravity:< gravity value >,   |
|                                     | numIter:< number of iterations >,|
|                                     | tile:< boolean value to tile disconnected >,|
|                                     | animate:< boolean value >,    |
|                                     | randomize:< boolean value >}  |
|  “agentRunLayoutRequest”            | -                           |
|  “agentAddNodeRequest”              | {x: < position x >,           |
|                                     | y: < position y >,         |
|                                     | sbgnclass: < sbgn class >}   |
|  “agentAddEdgeRequest”              | {source: < source node id >,  |
|                                     | target: < target node id >,   |
|                                     | sbgnclass: < sbgn class >}    |
|  “agentChangeNodeAttributeRequest”  | {id: < node id >,             |
|                                     | attStr: < node attribute name in the model >             |
|                                     | attVal:< node attribute value >}                          |
|                                     | attStr takes the following values: “sbgnclass”, “highlightColor”, “backgroundColor”, “sbgnlabel”, “borderColor”, “borderWidth”, “isMultimer”, “isCloneMarker”, “parent”, “children”, “width”, “height”, “sbgnbboxW”, “sbgnbboxH”, “sbgnStatesAndInfos”   |
|  “agentChangeEdgeAttributeRequest”  | {id: < node id >,                                   |
|                                     | attStr: < edge attribute name in the model >        |
|                                     | attVal:< edge attribute value >}                     |
|                                     | attStr takes the following values: “lineColor”, “highlightColor”, “width”, “cardinality”    |
|  “agentMoveNodeRequest”             | {id: < node id >,                                                    |
|                                     | pos: {x:< new position x >, y: <  new position y >}}                   |
|  “agentAddCompoundRequest”          | {type: < compound type as “complex” or “compartment” >,              |
|                                     | selectedNodeArr: < array of node ids >}                              |
|  “agentMergeGraphRequest”           |  {graph: < graph to be added >, type: < file type as "sbgn" or "json" > }                        |


In order to set up and run an agent:

* ***agent*** = **new** *Agent*(agentName, agentId);

 * **var** socket = ***agent***.connectToServer(serverIp, **function**(){

 *  *//callback operations*

* });

- socket.on('connect', **function**(){
   - ***agent***.loadModel(**function**() {
      - ***agent***.loadOperationHistory(**function**(){
         - ***agent***.loadChatHistory(**function**(){
            - *//callback operations*
         - });
      - });
   - });

  - ***agent***.listen(**function**(){
    - socket.on('operation', **function**(data){
      -    *//callback operations*
    - });

    - socket.on('message', **function**(data){
      -    *//callback operations*
    - });

    - socket.on('userList', **function**(data){
      - *//callback operations*
    - });

    - socket.on('imageFile', **function**(data){
      - *//callback operations*
    - });

    - socket.on('processToIntegrate', **function**(data){
          - *//callback operations*
        - });
  - });
- });

An example web-based agent can be found in:

Sbgnviz-Collaborative-Editor/agent-interaction/computerAgent.html

Command History:

JSON array as:

\[

{

> userName: //name of the user who gave the command
>
> name: //name of the command
>
> id: //id of the affected element
>
> param: //operation parameters

\[

{

x: //node position x

y: //node position y

> sbgnclass: //node or edge sbgnclass

> source: //edge source

> target: //edge target

}

\]

> date: //date of the command

}

\]

History Manager
---------------

Each command is stored in the model as a part of command history.
Command structure is as follows:

opName: set | add | delete | init

opTarget: node | edge | node group | edge group

opAttr: id| position | sbgnclass | sbgnlabel | width | height |
backgroundColor | borderColor | borderWidth | parent | isCloneMarker |
isMultimer | sbgnStatesAndInfos| source| target |lineColor | lineWidth|
sbgncardinality

elId: id of the node or edge | id array of the node or edge group

elType: “node” or “edge”

param:

prevParam:

### JSON Model Structure

-   users

    -   name

-   page

    -   list

    -   room

    -   doc

        -   userIds

        -   history

        -   undoIndex

        -   Images

        -   Context

            -   name

            -   relevance

            -   confidence

        -   cy //sbgn-related

            -   sampleInd //temporary

            -   layoutProperties

            -   nodes

                -   \[nodeId\]

                    -   id

                    -   addedLater //to sync. node addition

                    -   sbgnclass

                    -   position

                    -   highlightColor

                    -   sbgnlabel

                    -   borderColor

                    -   borderWidth

                    -   backgroundColor

                    -   backgroundOpacity

                    -   isMultimer

                    -   isCloneMarker

                    -   ports

                    -   width

                    -   height

                    -   sbgnStatesAndInfos

                    -   expandCollapseStatus

                    -   highlightStatus

                    -   visibilityStatus

            -   edges

                -   \[edgeId\]

                    -   id

                    -   addedLater //to sync. edge addition

                    -   sbgnclass

                    -   source

                    -   target

                    -   portsource

                    -   porttarget

                    -   highlightColor

                    -   lineColor

                    -   width

                    -   bendPointPositions

                    -   highlightStatus

                    -   visibilityStatus

                    -   sbgnCardinality

        -   py // pysb-related

        -   //biopax-related

<span id="_obz6bh2z35gg" class="anchor"><span id="_6kwbiqf32gph" class="anchor"><span id="_w8hd3o33ow8k" class="anchor"></span></span></span>
---------------------------------------------------------------------------------------------------------------------------------------------
