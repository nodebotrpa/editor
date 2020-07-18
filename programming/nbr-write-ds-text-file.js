const WebSocket = require('ws');

module.exports = function(RED) {
	//must be same with register
    function NbrWriteDsTextFileNode(config) {
        RED.nodes.createNode(this,config);
		// Node parameters
		this.filename = config.filename;
		this.data = config.data;
		this.overwrite = config.overwrite;
		this.append = config.append;
		this.header = config.header;
		this.delimeter = config.delimeter;
		this.quote = config.quote;
		this.waitbefore = config.waitbefore;
		this.waitafter = config.waitafter;

		var ws;
        var node = this;
        node.on('input', function(msg,send,done) {
			node.status({fill:"blue",shape:"ring",text:"Writing"});
			//prepare action parameters
			var t = {user:"admin",module:"Dataset",action:"WRITETEXTFILE",filename:"",data:"",overwrite:false,append:false,quote:false,header:false,delimeter:"",waitbefore:500,waitafter:500};
		    t.filename = node.filename;
		    t.data = node.data;
			if (node.overwrite != "")
			    t.overwrite = node.overwrite;
			if (node.append != "")
			    t.append = node.append;
			if (node.header != "")
			    t.header = node.header;
			if (node.quote != "")
			    t.quote = node.quote;
			t.delimeter = node.delimeter;
			if (node.waitbefore != "")
			    t.waitbefore = parseInt(node.waitbefore);
			if (node.waitafter != "")
			    t.waitafter = parseInt(node.waitafter);

			ws = new WebSocket('wss://127.0.0.1:7000',{
			  rejectUnauthorized: false
			});
			
			ws.onopen = () => {
				//console.log('Sending data '+JSON.stringify(t));
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
				node.status({fill:"red",shape:"circle",text:"error"});
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
    RED.nodes.registerType("nbr-write-ds-text-file",NbrWriteDsTextFileNode);
}