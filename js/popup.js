'use strict';

var port = chrome.extension.connect({
  name: 'Sample Communication'
});

port.onMessage.addListener(function(msg) {
  console.log('message recieved ' + msg);
  port.postMessage('Hi BackGround');
});
