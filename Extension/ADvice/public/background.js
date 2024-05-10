url = "";
options = [];
checkflag = true;
topList = [];

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
    // on/off 버튼 토글
    sendResponse({ check: checkflag });
  } else if (request.action === "searchAPI") {
    // 검색 전체 화면 - 유용도 계산
    console.log("searchAPI 호출");
    console.log(request.urlList);
    console.log(request.goodOption);
    console.log(request.badOption);
    fetch("http://k10a403.p.ssafy.io:8000/full-option", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        urlList: request.urlList,
        goodOption: request.goodOption,
        badOption: request.badOption,
        keyword : request.keyword
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("receive data", data);
        sendResponse({ success: true, data: data })
      })
      .catch((error) =>
        sendResponse({ success: false, error: error.toString() })
      );
  } else if (request.action == "hoverAPI") {
    // 검색 전체 화면 - 링크 호버 시
    console.log(request.url);
    const apiURL = new URL("http://k10a403.p.ssafy.io:8000/summary");
    apiURL.search = new URLSearchParams({
      url : request.url
    }).toString();
    fetch(apiURL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => sendResponse({ success: true, data: data }))
      .catch((error) =>
        sendResponse({ success: false, error: error.toString() })
      );
  } else if (request.action === "detail") {
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
  } else if (request.action === "saveCheck") {
    checkflag = request.isChecked;
    // 현재 활성 탭을 찾아 해당 탭의 Content Script로 메시지를 전달
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: "updateCheck",
        isChecked: request.isChecked,
      });
    });
  } else if (request.action === "saveTopList") {
    // 유용도 top 5 전달
    topList = request.topList;
  } else if (request.action === "loadTopList") {
    sendResponse({ topList: topList });
  }
  return true; // Keep the messaging channel open for the response
});
