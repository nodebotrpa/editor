# Flow Editor
You can use Node-red flow editor to automate processes with NodeBot RPA

## Installation
1. Download [Node.js](https://nodejs.org/en/download/) and install it
2. Install WebSocket module
~~~
npm install ws
~~~
3. [Install Node-Red](https://nodered.org/docs/getting-started/local#installing-with-npm)
~~~
npm install -g --unsafe-perm node-red
~~~
4. Download node files and copy under node_modules directory
5. Start command line as administrator
6. Run command
~~~
cd <node-red location>
npm install <nodebot module>
~~~

## Run
1. Start Node-red
~~~
node-red
~~~
You can access the editor by your browser at http://localhost:1880

2. Run BotConnect
~~~
cd <BotConnect location>
node ws-ssl.js
~~~
3. Run NodeBot Worker (nbWorker.exe)
