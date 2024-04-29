url = "";

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

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete") {
    console.log("업데이트된 탭의 URL:", tab.url);
    if (
      tab.url !==
      "devtools://devtools/bundled/devtools_app.html?remoteBase=https://chrome-devtools-frontend.appspot.com/serve_file/@8771130bd84f76d855ae42fbe02752b03e352f17/&panel=elements&targetType=tab&veLogging=true"
    ) {
      url = tab.url;
    }
  }
});

// modal 요청이 왔을 때
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "checkUrl") {
    sendResponse({ url: url });
  } else if (request.action === "detailBlog") {
    fetch("http://127.0.0.1:8000/blog", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Response:", data);
        sendResponse({ success: true, data: data });
      })
      .catch((error) => {
        console.error("Error:", error);
        sendResponse({ success: false, error: error.toString() });
      });
  } else if (request.action === "detailCafe") {
    fetch("http://127.0.0.1:8000/cafe", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Response:", data);
        sendResponse({ success: true, data: data });
      })
      .catch((error) => {
        console.error("Error:", error);
        sendResponse({ success: false, error: error.toString() });
      });
  }
  return true; // Keep the messaging channel open for the response
});
