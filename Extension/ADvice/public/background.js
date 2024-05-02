url = "";
options = [];
checkflag = true;

// url 확인 할 때
chrome.webNavigation.onCommitted.addListener(function (details) {
  if (details.frameId === 0) {
    if (
      details.url !==
      "devtools://devtools/bundled/devtools_app.html?remoteBase=https://chrome-devtools-frontend.appspot.com/serve_file/@8771130bd84f76d855ae42fbe02752b03e352f17/&panel=elements&targetType=tab&veLogging=true"
    ) {
      url = details.url;
    }
    console.log("URL 변경됨:", url);
  }
});

chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, function (tab) {
    if (
      tab.url !==
      "devtools://devtools/bundled/devtools_app.html?remoteBase=https://chrome-devtools-frontend.appspot.com/serve_file/@8771130bd84f76d855ae42fbe02752b03e352f17/&panel=elements&targetType=tab&veLogging=true"
    ) {
      url = tab.url;
    }
  });
});

// modal 요청이 왔을 때
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "checkUrl") {
    sendResponse({ url: url });
  } else if (request.action === "changeOption") {
    options = request.options;
    console.log(options);
  } else if (request.action === "updateCheck") {
    sendResponse({ check: checkflag });
  } else if (request.action === "searchAPI") {
    console.log(request.urlList);
    fetch("http://127.0.0.1:8000/process_urls", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ urls: request.urlList }),
    })
      .then((response) => response.json())
      .then((data) => sendResponse({ success: true, data: data }))
      .catch((error) =>
        sendResponse({ success: false, error: error.toString() })
      );
  } else if (request.action == "hoverAPI") {
    console.log(request.url);
    fetch("http://127.0.0.1:8000/hover_urls", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url: request.url }),
    })
      .then((response) => response.json())
      .then((data) => sendResponse({ success: true, data: data }))
      .catch((error) =>
        sendResponse({ success: false, error: error.toString() })
      );
  } else if (request.action === "detailBlog") {
    fetch("http://k10a403.p.ssafy.io:8000/detail", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        script: request.crawlResults,
      }),
    })
      .then((response) => response.json())
      .then((data) => sendResponse({ success: true, data: data }))
      .catch((error) =>
        sendResponse({ success: false, error: error.toString() })
      );
  } else if (request.action === "detailCafe") {
    fetch("http://127.0.0.1:8000/cafe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request.crawlResults),
    })
      .then((response) => response.json())
      .then((data) => sendResponse({ success: true, data: data }))
      .catch((error) =>
        sendResponse({ success: false, error: error.toString() })
      );
  } else if (request.action === "saveCheck") {
    checkflag = request.isChecked;
    // 현재 활성 탭을 찾아 해당 탭의 Content Script로 메시지를 전달
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: "updateCheck",
        isChecked: request.isChecked,
      });
    });
  }
  return true; // Keep the messaging channel open for the response
});
