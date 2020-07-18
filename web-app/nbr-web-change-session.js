module.exports = function(RED) {
	//must be same with register
    function NbrWebChangeSessionNode(config) {
        RED.nodes.createNode(this,config);
		// Node parameters
		this.session = config.session;
        var node = this;
		var flowContext = this.context().flow;
        node.on('input', function(msg,send,done) {
			node.status({fill:"blue",shape:"ring",text:"Changing session"});
			flowContext.set("nbr-web-session","${"+node.session+"}");
			node.status({fill:"green",shape:"ring",text:"done"});
        });
		node.on('close', function(done) {
			done();
		});
	}
    RED.nodes.registerType("nbr-web-change-session",NbrWebChangeSessionNode);
}