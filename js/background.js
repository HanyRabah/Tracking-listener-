// platformType
// cP
// ivd
// userId
// cc
// bR
// referer
// rE
// cityId
// lang
// adId
// neighborhood
// price
// imagesCount
// ads
// adsPromoted
// adsFeatured
// search_filters
// searchString
// resultSetType
// resultSetFormat
// resultSetCount
// totalPages
// pageNumber
// experiment
// call_back_request
// userpath
// category_l1_id
// category_l2_id
// category_l3_id
// category_id
// test_definition

var URI, paramObject;
(function() {
  const tabStorage = {};
  const networkFilters = {
    urls: ['https://tracking.olx-st.com/*']
  };

  chrome.webRequest.onBeforeRequest.addListener(details => {
    const { tabId, requestId } = details;
    if (!tabStorage.hasOwnProperty(tabId)) {
      return;
    }

    tabStorage[tabId].requests[requestId] = {
      requestId: requestId,
      url: details.url,
      startTime: details.timeStamp,
      status: 'pending'
    };
  }, networkFilters);

  chrome.webRequest.onCompleted.addListener(details => {
    const { tabId, requestId } = details;
    if (
      !tabStorage.hasOwnProperty(tabId) ||
      !tabStorage[tabId].requests.hasOwnProperty(requestId)
    ) {
      return;
    }

    const request = tabStorage[tabId].requests[requestId];

    Object.assign(request, {
      endTime: details.timeStamp,
      requestDuration: details.timeStamp - request.startTime,
      status: 'complete'
    });
    URI = new URL(tabStorage[tabId].requests[details.requestId].url);
    paramObject = parseQueryString(URI.search);
    nailIt(paramObject);
    //const urlParams = new URLSearchParams(URI.search);
  }, networkFilters);

  chrome.webRequest.onErrorOccurred.addListener(details => {
    const { tabId, requestId } = details;
    if (
      !tabStorage.hasOwnProperty(tabId) ||
      !tabStorage[tabId].requests.hasOwnProperty(requestId)
    ) {
      return;
    }

    const request = tabStorage[tabId].requests[requestId];
    Object.assign(request, {
      endTime: details.timeStamp,
      status: 'error'
    });
    console.log(tabStorage[tabId].requests[requestId]);
  }, networkFilters);

  chrome.tabs.onActivated.addListener(tab => {
    const tabId = tab ? tab.tabId : chrome.tabs.TAB_ID_NONE;
    if (!tabStorage.hasOwnProperty(tabId)) {
      tabStorage[tabId] = {
        id: tabId,
        requests: {},
        registerTime: new Date().getTime()
      };
    }
  });
  chrome.tabs.onRemoved.addListener(tab => {
    const tabId = tab.tabId;
    if (!tabStorage.hasOwnProperty(tabId)) {
      return;
    }
    tabStorage[tabId] = null;
  });
})();

var nailIt = function(paramObject) {
  var views = chrome.extension.getViews({
    type: 'popup'
  });
  for (var key in paramObject) {
    var listItem = document.createElement('li');
    var listItemKey = document.createElement('div');
    var listItemValue = document.createElement('div');
    listItemKey.textContent = key;
    listItemValue.textContent = paramObject[key];
    listItem.appendChild(listItemKey);
    listItem.appendChild(listItemValue);
  }
  for (var i = 0; i < views.length; i++) {
    console.log('TCL: nailIt -> listItem', listItem);
    views[i].document.getElementById('eventsList').appendChild(listItem);
  }
};

chrome.extension.onConnect.addListener(function(port) {
  port.postMessage('Hi Popup');
  port.onMessage.addListener(function(msg) {
    //port.postMessage('Hi Popup.js');
  });
});

var parseQueryString = function(str) {
  var objURL = {};
  str.replace(new RegExp('([^?=&]+)(=([^&]*))?', 'g'), function(
    $0,
    $1,
    $2,
    $3
  ) {
    objURL[$1] = $3;
  });
  return objURL;
};
