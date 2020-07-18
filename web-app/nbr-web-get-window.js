const WebSocket = require('ws');

module.exports = function(RED) {
	//must be same with register
    function NbrWebGetWindowNode(config) {
        RED.nodes.createNode(this,config);
		// Node parameters
		this.action = config.action;
		this.variable = config.variable;
		this.waitbefore = config.waitbefore;
		this.waitafter = config.waitafter;

		var ws;
        var node = this;
		var flowContext = this.context().flow;
        node.on('input', function(msg,send,done) {
			node.status({fill:"blue",shape:"ring",text:"Getting"});
			//prepare action parameters
			var t = {user:"admin",module:"WebDriver",action:"GETWINDOW",browser:"",actionType:0,variable:"",waitbefore:500,waitafter:500};
			t.browser = flowContext.get("nbr-web-session");
			if (node.action != "")
			    t.actionType = parseInt(node.action);
			if (node.variable != "")
			    t.variable = node.variable;
			if (node.waitbefore != "")
			    t.waitbefore = parseInt(node.waitbefore);
			if (node.waitafter != "")
			    t.waitafter = parseInt(node.waitafter);
			//console.log(JSON.stringify(t));
			ws = new WebSocket('wss://127.0.0.1:7000',{
			  rejectUnauthorized: false
			});
			
			ws.onopen = () => {
				//console.log('Sending data'+JSON.stringify(t));
				msg.payload = "Executing";
				ws.send(JSON.stringify(t));
			}
			
			ws.on('message', function incoming(data){
				var d = JSON.parse(data);
				msg.payload = d.status;
				if (d.status=="SUCCESS") {
					console.log("var:#"+node.variable+"#");
					if (node.variable != "") {
						msg.payload = "Read";
					}
					node.send(msg);
					node.status({fill:"green",shape:"ring",text:"done"});
				} else {
				    node.status({fill:"red",shape:"ring",text:"error"});
				    msg.payload = d.value;
					node.error(new Error(msg.payload));
				    done(new Error(msg.payload))
				}
			});
			
			ws.on('error', function(err) {
				console.error("WebSocket error:", err);
				node.status({fill:"red",shape:"ring",text:"error"});
				if (err.code == "ECONNREFUSED")
					node.error(new Error("Proxy server is not running"));
				else 
					node.error(new Error(err));
				done(new Error(err))
			});
        });
		node.on('close', function(done) {
			done();
		});
	}
    RED.nodes.registerType("nbr-web-get-window",NbrWebGetWindowNode);
}