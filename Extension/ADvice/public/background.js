url = "";
options = [];
checkflag = true;
topList = [];
blogScore = [];
cafeScore = [];

// IndexedDB 설정
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("db_summary", 1);
    console.log("db open");
    request.onerror = (event) => {
      console.error("Database error: ", event.target.errorCode);
      reject(event.target.errorCode);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains("responses")) {
        db.createObjectStore("responses", { keyPath: "url" });
        console.log("object store open");
      }
    };

    request.onsuccess = (event) => {
      console.log("db onsuccess");
      resolve(event.target.result);
    };
  });
}
openDB();

function saveResponseToDB(url, data) {
  openDB().then((db) => {
    const transaction = db.transaction(["responses"], "readwrite");
    const store = transaction.objectStore("responses");
    const request = store.put({ url: url, data: data });

    request.onsuccess = () => {
      console.log("Data saved to DB successfully.");
    };

    request.onerror = (event) => {
      console.error("Error saving data: ", event.target.errorCode);
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
}

function getResponseFromDB(url) {
  return new Promise((resolve, reject) => {
    openDB().then((db) => {
      const transaction = db.transaction(["responses"], "readonly");
      const store = transaction.objectStore("responses");
      const request = store.get(url);

      request.onsuccess = (event) => {
        if (request.result) {
          resolve(request.result.data);
        } else {
          resolve(null);
        }
      };

      request.onerror = (event) => {
        console.error("Error fetching data: ", event.target.errorCode);
        reject(event.target.errorCode);
      };

      transaction.oncomplete = () => {
        db.close();
      };
    });
  });
}

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
        keyword: request.keyword,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("receive data", data);
        sendResponse({ success: true, data: data });
      })
      .catch((error) =>
        sendResponse({ success: false, error: error.toString() })
      );
  } else if (request.action == "hoverAPI") {
    // 검색 전체 화면 - 링크 호버 시
    console.log(request.url);
    const apiURL = new URL("http://k10a403.p.ssafy.io:8000/summary");
    apiURL.search = new URLSearchParams({
      url: request.url,
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
  } else if (request.action === "detail-textad") {
    fetch("http://k10a403.p.ssafy.io:8000/detail/text-ad", {
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
  } else if (request.action === "detail-imagead") {
    fetch("http://k10a403.p.ssafy.io:8000/detail/image-ad", {
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
  } else if (request.action === "detail-objective") {
    fetch("http://k10a403.p.ssafy.io:8000/detail/objective-info", {
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
  } else if (request.action === "checkDB") {
    getResponseFromDB(request.url).then((data) => {
      sendResponse(data);
    });
    return true; // 비동기 응답을 위해 true 반환
  } else if (request.action === "saveToDB") {
    console.log("saveToDB 호출");
    saveResponseToDB(request.url, request.data);
  } else if (request.action === "toBlogDetail") {
    console.log("blogdetail in background");
    console.log(request.data);
    blogScore = request.data;
    console.log("blogScore : ", blogScore);
  } else if (request.action === "toCafeDetail") {
    console.log("cafedetail in background");
    console.log(request.data);
    cafeScore = request.data;
    console.log("cafeScore : ", cafeScore);
  } else if (request.action === "analysis") {
    // on/off 버튼 토글
    sendResponse({ score: blogScore, url: url });
  }
  return true; // Keep the messaging channel open for the response
});
