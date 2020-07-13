const WebSocket = require('ws');

module.exports = function(RED) {
	//must be same with register
    function NbrSetVariableNode(config) {
        RED.nodes.createNode(this,config);
		// Node parameters
		this.variable = config.variable;
		this.value = config.value;
		this.waitbefore = config.waitbefore;
		this.waitafter = config.waitafter;

		var ws;
        var node = this;
        node.on('input', function(msg,send,done) {
			node.status({fill:"green",shape:"ring",text:"Setting"});
			//prepare action parameters
			var t = {user:"admin",module:"System",action:"SETVARIABLE",variable:"",value:"",waitbefore:500,waitafter:500};
			if (node.variable != "")
			    t.variable = node.variable;
			if (node.value != "")
			    t.value = node.value;
			if (node.waitbefore != "")
			    t.waitbefore = parseInt(node.waitbefore);
			if (node.waitafter != "")
			    t.waitafter = parseInt(node.waitafter);

			ws = new WebSocket('wss://127.0.0.1:7000',{
			  rejectUnauthorized: false
			});
			
			ws.onopen = () => {
				console.log('Sending data'+JSON.stringify(t));
				msg.payload = "Seting variable "+node.variable;
				ws.send(JSON.stringify(t));
			}
			
			ws.on('message', function incoming(data){
				var d = JSON.parse(data);
				msg.payload = d.value;
				if (d.status=="SUCCESS") {
					node.send(msg);
					node.status({fill:"green",shape:"ring",text:"done"});
				} else {
				    node.status({fill:"red",shape:"ring",text:"error"});
				    node.error(new Error(msg.payload));
				    done(new Error(msg.payload))
				}
			});
			
			ws.on('error', function(err) {
				console.error("WebSocket error:", err);
				node.status({fill:"red",shape:"ring",text:"error"});
				node.error(new Error(err));
				done(new Error(err))
			});
        });
		node.on('close', function(done) {
			done();
		});
	}
    RED.nodes.registerType("nbr-set-variable",NbrSetVariableNode);
}
