const WebSocket = require('ws');

module.exports = function(RED) {
	//must be same with register
    function NbrWebCreateSessionNode(config) {
        RED.nodes.createNode(this,config);
		// Node parameters
		this.browser = config.browser;
		this.implicit = config.implicit;
		this.script = config.script;
		this.pageLoad = config.pageLoad;
		this.maximize = config.maximize;
		this.variable = config.variable;
		this.waitbefore = config.waitbefore;
		this.waitafter = config.waitafter;

		var ws;
        var node = this;
		var flowContext = this.context().flow;
        node.on('input', function(msg,send,done) {
			node.status({fill:"blue",shape:"ring",text:"Opening browser"});
			//prepare action parameters
			var t = {user:"admin",module:"WebDriver",action:"CREATESESSION",implicit:0,script:0,pageLoad:0,maximize:false,variable:"",waitbefore:500,waitafter:500};
			t.browser = node.browser;
			if (node.implicit != "")
			    t.implicit = parseInt(node.implicit);
			if (node.script != "")
			    t.script = parseInt(node.script);
			if (node.pageLoad != "")
			    t.pageLoad = parseInt(node.pageLoad);
			if (node.maximize != "")
			    t.maximize = node.maximize;
			if (node.variable != "")
			    t.variable = node.variable;
			if (node.waitbefore != "")
			    t.waitbefore = parseInt(node.waitbefore);
			if (node.waitafter != "")
			    t.waitafter = parseInt(node.waitafter);
			ws = new WebSocket('wss://127.0.0.1:7000',{
			  rejectUnauthorized: false
			});
			
			ws.onopen = () => {
				msg.payload = node.executable+" starting";
				ws.send(JSON.stringify(t));
			}
			
			ws.on('message', function incoming(data){
				var d = JSON.parse(data);
				msg.payload = d.status;
				if (d.status=="SUCCESS") {
					if (node.variable != "") {
						flowContext.set("nbr-web-session","${"+node.variable+"}");
						msg.payload = "Session created";
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
					node.error(new Error("Proxy server is not running. Please check if BotConnect and NodeBot Worker are running" ));
				else 
					node.error(new Error(err));
				done(new Error(err))
			});
        });
		node.on('close', function(done) {
			done();
		});
	}
    RED.nodes.registerType("nbr-web-new-session",NbrWebCreateSessionNode);
}
