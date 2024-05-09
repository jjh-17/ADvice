function sleep(sec) {

  return new Promise((resolve) => setTimeout(resolve, sec));
}

let goodOption = [];
let badOption = [];
let urlList = [];
let level = [];
let keyword = "마라샹궈";
let cnt = 0;
let apiCnt = 0;
const maxLevel = 100;
const minLevel = 0;
let topList = []; // 현재 화면에서 가장 유용한 게시글 top5 -> 유용도 계산하는 API 호출할때마다 갱신 -> top5중 가장 낮은 유용도보다 낮으면 update
const url = window.location.href;
let modalTextList = []; // 요약 모달 텍스트 최초 호출 후 저장

// ------- 호버 모달 설정 함수
const makeModal = (index) => {
  const modalHTML = `
  <div id="myModal${index}" class="modal" style="position: absolute; display: none; z-index: 1000;">
    <div class="modal-content" style="word-wrap : break-word;">
      <p id="modalText${index}">로 딩 중 . . . 🙏</p>
    </div>
  </div>
  `;
  document.body.insertAdjacentHTML("beforeend", modalHTML);
}

if (!(url.includes("tab.blog") || url.includes("tab.cafe"))) {
  (async () => {
    await sleep(100);
    console.log("sleep end");
    let content = document.querySelectorAll(".desktop_mode");
    let checkInterval = setInterval(function () {
      let checkflag = true;
      content.forEach((node) => {
        console.log(node);
        let contentAttr = node.parentNode.getAttribute("data-slog-container");
        console.log(contentAttr);
        if (contentAttr.endsWith("R")) {
          let contentDetail = node.getElementsByClassName("fds-keep-group");
          console.log(contentDetail);
          console.log(contentDetail.length);
          if (contentDetail.length == 0) {
            checkflag = false;
          }
        }
      });
      if (checkflag) {
        clearInterval(checkInterval);
        console.log("clearInterval");
        setting("all");
      }
    }, 100);
  })();
} else {
  setting("tab");
}

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  console.log(message);
  if (message.action === "updateCheck") {
    console.log("message receive");
    if (message.isChecked) {
      console.log("Checkbox is checked. Perform specific action.");
      // 체크박스가 체크되었을 때 실행할 코드
      const url = window.location.href;
      if (url.includes("tab.nx.all")) {
        setting("all");
      } else {
        setting("tab");
      }
    } else {
      console.log("Checkbox is not checked. Perform alternative action.");
      unsetting();
      // 체크박스가 체크되지 않았을 때 실행할 코드
    }
  }
});


// const modalHTML = `
//   <div id="myModal" class="modal" style="position: absolute; display: none; z-index: 1000;">
//     <div class="modal-content" style="word-wrap : break-word;">
//       <p id="modalText">로 딩 중 . . . 🙏</p>
//     </div>
//   </div>
// `;
// document.body.insertAdjacentHTML("beforeend", modalHTML);

// const modal = document.getElementById("myModal");
// const modalText = document.getElementById("modalText");

// window.onclick = function (event) {
//   if (event.target == modal) {
//     modal.style.display = "none";
//   }
// };

function updateTopList() {
  // topList에 있는 각 URL에 대해서만 title과 description 추가
  topList.forEach((item) => {
    // .desktop_mode .fds-comps-right-image-text-title, .desktop_mode .fds-comps-right-image-text-title-wrap
    const linkElement = document.querySelector(`a[href="${item.url}"]`);
    if (linkElement) {
      const titleText = linkElement
        .closest(".view_wrap, .desktop_mode")
        .querySelector(
          ".title_area, .fds-comps-right-image-text-title, .fds-comps-right-image-text-title-wrap"
        )
        .textContent.trim()
        .slice(0, 19);
      const descriptionText = linkElement
        .closest(".view_wrap, .desktop_mode")
        .querySelector(
          ".dsc_area, .fds-comps-right-image-text-content, .fds-comps-right-image-text-content-wrap"
        )
        .textContent.trim()
        .slice(0, 30);
      console.log(titleText + " " + descriptionText);
      item.title = titleText;
      item.desc = descriptionText;
    }
  });
  console.log("topList", topList);
  chrome.runtime.sendMessage({ action: "saveTopList", topList: topList });
}

const APIsend = (userInfoElements, position) => {
  console.log("APIsend", cnt);
  if (cnt == 2) {
    // 5개씩 끊어서 보내기 -> urlList 5개씩 잘라서 sendMessage 호출 -> 
    // background.js로 메시지 보내기
    let urlIndex = -1;
    const chunksize = 2;
    for(let i = 0; i < urlList.length; i += chunksize){
      const urlChunk = urlList.slice(i, i + chunksize);
      chrome.runtime.sendMessage(
        {
          action: "searchAPI",
          urlList: urlChunk,
          goodOption: goodOption,
          badOption: badOption,
          keyword : keyword
        },
        function (response) {
          console.log("API 호출 결과 받음:", response);
          const sortLevel = [];
          Object.keys(response.data.scoreList).forEach((index) => { // index -> chunkURL 안에서의 위치
            console.log(response.data.scoreList[index].url);
            urlIndex = urlList.indexOf(response.data.scoreList[index].url); // urlIndex -> urlList 안에서의 위치
            console.log(urlIndex);
            // console.log(response.data.scoreList[urlIndex].url)
            if (urlIndex !== -1) {
              const curLevel = { url: response.data.scoreList[index].url, level: response.data.scoreList[index].score };
              sortLevel.push(curLevel);
              level[urlIndex] = response.data.scoreList[index].score; //{index : urlIndex, level : response.data[url]};// 각 url-level쌍 object로 저장
              console.log(level[urlIndex]);
            }
          });
          
          if(topList.length < 5){
            sortLevel.forEach((element) => {
              topList.push(element)
            })
            console.log("1111", topList);
            topList.sort((a, b) => b.level - a.level)
            topList = topList.slice(0, 5);
          }else{
            sortLevel.sort((a, b) => b.level - a.level);
            sortLevel.forEach((element) => {
              if (element.score > topList[topList.length - 1]) {
                // top 5 유용도 중 가장 낮은 유용도보다 큰 경우
                topList[topList.length - 1] = {
                  url: element.url,
                  level: element.score,
                };
                topList.sort((a, b) => b.level - a.level);
              }
            })
          }
          console.log("topList", topList);
          updateTopList();

          console.log(level);

          Array.from(userInfoElements).forEach((element, index) => {
            // console.log("ui setting", element);
            if (
              element
                .querySelector(
                  `.view_wrap .title_area a, .desktop_mode .fds-comps-right-image-text-title, .desktop_mode .fds-comps-right-image-text-title-wrap`
                )
                .href.includes("post.naver.com")
            ) {
              return;
            }
            if (element.classList.contains("view_wrap")) {
              position = "tab";
            }
            // 이번에 부른 chunklist에 대해서만 setui 실행 -> url 일치 여부 확인하기
            const curURL = element.querySelector(".view_wrap .title_area a, .desktop_mode .fds-comps-right-image-text-title, .desktop_mode .fds-comps-right-image-text-title-wrap").href
            // console.log(curURL, "setUI 호출 전 확인")
            if(urlChunk.includes(curURL)){
              console.log("setUI 호출하는 element : ", element)
              setUI(element, urlIndex, position);
            }
          });
        }
      );
    }
    if(apiCnt == urlList.length){
      for(let i = 0; i < urlList.length; i++){
        
    chrome.runtime.sendMessage(
      { action: "hoverAPI", url: urlList[i] },
      function (response) {
        console.log("API 호출 결과 받음 - setting:", response);
        modalTextList[i] = `<strong style='font-size : 1.1em;'>📌본문 요약 결과📌</strong>
        <br><br>😊 : ${response.data.positive.length > 50 ? response.data.positive.substring(0, 50) + '...' : response.data.positive}<br><br> 
        😐 : ${response.data.neutral.length > 50 ? response.data.neutral.substring(0, 50) + '...' : response.data.neutral}<br><br> 
        🙁 : ${response.data.negative.length > 50 ? response.data.negative.substring(0, 50) + '...' : response.data.negative} `;
      }
    );
      }
    }
  }
};

function setUI(node, index, position) {
  console.log("setUI 실행");
  const userInfoElements = node.querySelectorAll(
    // ".fds-keep-group"
    ".api_save_group, .fds-keep-group"
  );
  console.log("in SetUI", userInfoElements);

  console.log(index);
  console.log("before", userInfoElements.parentNode);
  const levelValue = level[index];
  const percentage = (levelValue / 100) * 100; // 최대 단계에 대한 현재 단계의 백분율
  console.log(index + " " + levelValue + " " + percentage);
  if (userInfoElements.length != 0) {
    console.log(userInfoElements);
    const progressBarHTML = `
    <div class="progress" style="float: right; display: flex; padding: 1% 2%; border-radius: 15px 15px; border: 1px solid lightgray;
    box-shadow: 1px 1px 2px lightgray; width: ${position === "all" ? "25%" : "20%"}; margin-top: ${position === "all" ? "0%" : "-1%"}">
    <div style="width: 30%; white-space: nowrap; font-size: 13px; text-align: right; margin-right: 10%">유용도</div>
    <div class="progress-container" style="width:70%; position: relative; background-color: #e0e0e0; height: 20px; border-radius: 10px; overflow: hidden;">
        ${[...Array(maxLevel - 1)].map((_, i) => `
            <div class="progress-divider" style="position: absolute; left: ${(i + 1) * (100)}%; width: 1px; height: 100%; background-color: #fff;"></div>
        `).join("")}
        <div class="progress-bar" style="width: ${levelValue}%; background-color: #03C75A; height: 100%;"></div>
    </div>
</div>
  `;
    if (position == "all") {
      userInfoElements[0].insertAdjacentHTML("beforebegin", progressBarHTML);
    } else {
      userInfoElements[0].insertAdjacentHTML("afterend", progressBarHTML);
    }
    userInfoElements[0].style.display = "flex";
    console.log("after", userInfoElements.parentNode);
    apiCnt++;
  }

  Array.from(userInfoElements).forEach((element, index) => {
    // 프로그레스 바를 fds-keep-group 요소 이전에 추가
    console.log(index);
    console.log("before", element.parentNode);
    const levelValue = level[index];
    const percentage = (levelValue / maxLevel) * 100; // 최대 단계에 대한 현재 단계의 백분율
    console.log(index + " " + levelValue + " " + percentage);
    console.log(element.parentNode.querySelector(".progress"));
    if (!element.parentNode.querySelector(".progress")) {
      // 진행 상태 표시
    }
  });
}

function hoverHandler(link, index) {
  return function () {
    console.log("hoverHandler", link.href);
    const Indexedmodal = document.getElementById(`myModal${index}`);
    const IndexedmodalText = document.getElementById(`modalText${index}`);
    modalTextList[0] = "<strong style='font-size : 1.1em;'>📌본문 요약 결과📌</strong><br><br>😊 : 롯데시티호텔 대전점 바로 건너편에 있어서 위치가 꿀이었던 성심당 DCC점!<br><br> 😐 : 하지만 재구매(?)까지는 살짝 아쉬운 평범한 맛 ㅎ초코메론빵은 먹어봤으니 그냥 메론빵도 ...<br><br> 🙁 : 아그리고 참고로 오후에 가서 그런진 모르겠으나 김치찹쌀 주먹밥은 없어서 아쉬웠다 ㅠ";
    // background.js로 메시지 보내기
    if(modalTextList[index] == null || modalTextList[index] == undefined){
      IndexedmodalText.textContent = 'ADvice가 요약 중입니다 . . . 🙏'
      chrome.runtime.sendMessage(
        { action: "hoverAPI", url: link.href },
        function (response) {
          console.log("API 호출 결과 받음:", response);
          IndexedmodalText.innerHTML = `<strong style='font-size : 1.1em;'>📌본문 요약 결과📌</strong>
          <br><br>😊 : ${response.data.positive.length > 50 ? response.data.positive.substring(0, 50) + '...' : response.data.positive}<br><br> 
          😐 : ${response.data.neutral.length > 50 ? response.data.neutral.substring(0, 50) + '...' : response.data.neutral}<br><br> 
          🙁 : ${response.data.negative.length > 50 ? response.data.negative.substring(0, 50) + '...' : response.data.negative} `;
          modalTextList[index] = IndexedmodalText.innerHTML;
        }
      );
    }else{
      IndexedmodalText.innerHTML = modalTextList[index];
    }


    const linkRect = link.getBoundingClientRect();
    Indexedmodal.style.left = `${linkRect.left + window.scrollX}px`;
    Indexedmodal.style.top = `${linkRect.bottom + window.scrollY}px`;
    Indexedmodal.style.display = "block";
    Indexedmodal.style.position = "absolute";
  };
}

function setting(position) {

  const userInfoElements = document.querySelectorAll(
    ".view_wrap, .fds-ugc-block-mod"
  );

  Array.from(userInfoElements).forEach((element, index) => {
    saveURL(element);
    makeModal(index);
    modalTextList = new Array(urlList.length);
  });


  const links = document.querySelectorAll(
    ".title_area a, .fds-comps-right-image-text-title, .total_tit a"
  );

  links.forEach((link, index) => {

    // 호버 -> API로 링크 전송 -> 요약문 return
    const handler = hoverHandler(link, index);
    link.addEventListener("mouseover", handler);

    const curModal = document.getElementById(`myModal${index}`)
    console.log("curModal", curModal);
    link.addEventListener("mouseout", function () {
      curModal.style.display = "none";
    });

    link.handler = handler;
  });

  // ---------- hover modal 등록


  level = new Array(urlList.length);
  console.log("urlList", urlList);
  console.log(level);

  // const APIsend = () => {
  //   console.log("APIsend", cnt);
  //   if (cnt == 2) {
  //     // 5개씩 끊어서 보내기 -> urlList 5개씩 잘라서 sendMessage 호출 -> 
  //     // background.js로 메시지 보내기
  //     let urlIndex = -1;
  //     const chunksize = 2;
  //     for(let i = 0; i < urlList.length; i += chunksize){
  //       const urlChunk = urlList.slice(i, i + chunksize);
  //       chrome.runtime.sendMessage(
  //         {
  //           action: "searchAPI",
  //           urlList: urlChunk,
  //           goodOption: goodOption,
  //           badOption: badOption,
  //           keyword : keyword
  //         },
  //         function (response) {
  //           console.log("API 호출 결과 받음:", response);
  //           const sortLevel = [];
  //           Object.keys(response.data.scoreList).forEach((index) => { // index -> chunkURL 안에서의 위치
  //             console.log(response.data.scoreList[index].url);
  //             urlIndex = urlList.indexOf(response.data.scoreList[index].url); // urlIndex -> urlList 안에서의 위치
  //             console.log(urlIndex);
  //             // console.log(response.data.scoreList[urlIndex].url)
  //             if (urlIndex !== -1) {
  //               const curLevel = { url: response.data.scoreList[index].url, level: response.data.scoreList[index].score };
  //               sortLevel.push(curLevel);
  //               level[urlIndex] = response.data.scoreList[index].score; //{index : urlIndex, level : response.data[url]};// 각 url-level쌍 object로 저장
  //               console.log(level[urlIndex]);
  //             }
  //           });
            
  //           if(topList.length < 5){
  //             sortLevel.forEach((element) => {
  //               topList.push(element)
  //             })
  //             console.log("1111", topList);
  //             topList.sort((a, b) => b.level - a.level)
  //             topList = topList.slice(0, 5);
  //           }else{
  //             sortLevel.sort((a, b) => b.level - a.level);
  //             sortLevel.forEach((element) => {
  //               if (element.score > topList[topList.length - 1]) {
  //                 // top 5 유용도 중 가장 낮은 유용도보다 큰 경우
  //                 topList[topList.length - 1] = {
  //                   url: element.url,
  //                   level: element.score,
  //                 };
  //                 topList.sort((a, b) => b.level - a.level);
  //               }
  //             })
  //           }
  //           // sortLevel.sort((a, b) => b.level - a.level);
  //           // topList = sortLevel.slice(0, 5);
  //           console.log("topList", topList);
  //           updateTopList();
  
  //           console.log(level);
  
  //           Array.from(userInfoElements).forEach((element, index) => {
  //             // console.log("ui setting", element);
  //             if (
  //               element
  //                 .querySelector(
  //                   `.view_wrap .title_area a, .desktop_mode .fds-comps-right-image-text-title, .desktop_mode .fds-comps-right-image-text-title-wrap`
  //                 )
  //                 .href.includes("post.naver.com")
  //             ) {
  //               return;
  //             }
  //             if (element.classList.contains("view_wrap")) {
  //               position = "tab";
  //             }
  //             // 이번에 부른 chunklist에 대해서만 setui 실행 -> url 일치 여부 확인하기
  //             const curURL = element.querySelector(".view_wrap .title_area a, .desktop_mode .fds-comps-right-image-text-title, .desktop_mode .fds-comps-right-image-text-title-wrap").href
  //             // console.log(curURL, "setUI 호출 전 확인")
  //             if(urlChunk.includes(curURL)){
  //               console.log("setUI 호출하는 element : ", element)
  //               setUI(element, urlIndex);
  //             }
  //           });
  //         }
  //       );
  //     }

  //   }
  // };

  cnt = 0;
  chrome.storage.sync.get(["goodOption"], (result) => {
    if (result.goodOption) {
      goodOption = Object.values(result.goodOption).map(
        (option) => option.index
      );
      console.log("goodOption : ", goodOption);
    }
    cnt++;
    APIsend(userInfoElements, position)
  });
  
  chrome.storage.sync.get(["badOption"], (result) => {
    if (result.badOption) {
      badOption = Object.values(result.badOption).map((option) => option.index);
      console.log("badOption : ", badOption);
    }
    cnt++;
    APIsend(userInfoElements, position)
  });

  const searchAllresult = Array.from(
    document.querySelectorAll(".api_subject_bx")
  );

  searchAllresult.forEach((result) => {
    console.log("result", result);
  });

  function saveURL(node) {
    const links = node.querySelectorAll(
      ".view_wrap .title_area a, .desktop_mode .fds-comps-right-image-text-title, .desktop_mode .fds-comps-right-image-text-title-wrap"
    );
    links.forEach((link, index) => {
      // console.log(link.href);
      if (link.href != undefined && !link.href.includes("post.naver.com")) {
        // post 글 제외
        urlList.push(link.href);
      }
    });
  }


  // ------------ 처음 검색 결과에 ui 씌우기

  // MutationObserver 콜백 함수 정의
  const callback = function (mutationsList, observer) {
    for (const mutation of mutationsList) {
      if (mutation.type === "childList") {
        mutation.addedNodes.forEach((node) => {
          if (node.tagName === "LI" && node.classList.contains("bx")) {
            console.log(
              "새로운 LI 태그가 추가됨:",
              node.querySelector(".view_wrap")
            );
            const addNode = node.querySelector(".view_wrap");
            if (addNode != null) {
              const urlElement = addNode.querySelector(".title_area a");
              const url = urlElement.href;
              makeModal(level.length);
              const handler = hoverHandler(urlElement, level.length);
              urlElement.addEventListener("mouseover", handler);
          
              const curModal = document.getElementById(`myModal${level.length}`)
              console.log("curModal", curModal);
              urlElement.addEventListener("mouseout", function () {
                curModal.style.display = "none";
              });
          
              urlElement.handler = handler;


              // 새로 추가된 url을 갖고 background.js로 메시지 보내기
              // urlList.push(node.querySelector(".title_area a").href);
              chrome.runtime.sendMessage(
                {
                  action: "searchAPI",
                  urlList: [url],
                  goodOption: goodOption,
                  badOption: badOption,
                  keyword : keyword
                },
                function (response) {
                  console.log("API 호출 결과 받음:", response);
                  level.push(response.data.scoreList[0].score);
                  console.log(level);
                  if (response.data.scoreList[0].score > topList[topList.length - 1]) {
                    // top 5 유용도 중 가장 낮은 유용도보다 큰 경우
                    topList[topList.length - 1] = {
                      url: url,
                      level: response.data.scoreList[0].score,
                    };
                    topList.sort((a, b) => b.level - a.level);
                    updateTopList();
                  }
                  setUI(addNode, level.length - 1);
                }
              );
            }
          }
        });
      }
    }
  };

  const url = window.location.href;
  if ((url.includes("tab.blog") || url.includes("tab.cafe"))) {
    // MutationObserver 인스턴스 생성
    const observer = new MutationObserver(callback);

    // 관찰 설정: 자식 요소의 변화를 관찰
    const config = { childList: true, subtree: true };
    const targetNode = document.body; //document.querySelector(".lst_view");

    // 변화 관찰 시작
    observer.observe(targetNode, config);
    // 페이지가 언로드될 때 옵저버를 해제
    window.addEventListener("unload", () => observer.disconnect());
  }
}
// --- end setting function

// 체크박스 해제할 때 화면에 있던 유용도/호버 모달 같이 해제하기
function unsetting() {
  const userInfoElements = document.querySelectorAll(
    ".view_wrap .progress,  .fds-ugc-block-mod .progress"
  );
  Array.from(userInfoElements).forEach((element) => {
    if (element.parentNode) {
      element.parentNode.removeChild(element);
    }
  });

  const links = document.querySelectorAll(
    ".view_wrap .title_area a, .fds-comps-right-image-text-title"
  );
  console.log("unsetting", links);
  links.forEach((link) => {
    link.removeEventListener("mouseover", link.handler);
    if (link.handler) {
      link.removeEventListener("mouseover", link.handler);
    }
  });
}
