const WebSocket = require('ws');

module.exports = function(RED) {
    function NbrKeybMouseTypeNode(config) {
        RED.nodes.createNode(this,config);
		this.keys = config.keys;
		this.speed = config.speed;
		this.pressEnter = config.pressEnter;
		this.pressTab = config.pressTab;
		this.waitbefore = config.waitbefore;
		this.waitafter = config.waitafter;
		var ws;
        var node = this;
        node.on('input', function(msg,send,done) {
			node.status({fill:"blue",shape:"ring",text:"typing"});
            //TODO Send https req to localhost
			var t = {user:"admin",module:"KeyboardMouse",action:"TYPE",text:"",waitbefore:5000,waitafter:1000,speed:100,pressTab:false,pressEnter:false};
			t.text = node.keys;
			if (node.speed != "")
			    t.speed = parseInt(node.speed);
			if (node.pressTab != "")
			    t.pressTab = node.pressTab;
			if (node.pressEnter != "")
			    t.pressEnter = node.pressEnter;
			if (node.waitbefore != "")
			    t.waitbefore = parseInt(node.waitbefore);
			if (node.waitafter != "")
			    t.waitafter = parseInt(node.waitafter);
			
			ws = new WebSocket('wss://127.0.0.1:7000',{
			  rejectUnauthorized: false
			});
			
			ws.onopen = () => {
				msg.payload = node.keys+" typed";
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
    RED.nodes.registerType("nbr-km-type",NbrKeybMouseTypeNode);
}