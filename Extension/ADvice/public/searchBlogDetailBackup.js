var iframe = document.getElementById("mainFrame");
var checkInterval = setInterval(function () {
  var iframeDoc = iframe.contentWindow.document;
  var iframeElements = iframeDoc.getElementsByClassName("se-main-container");

  var elementsArray = Array.from(iframeElements);

  if (iframeElements.length > 0) {
    clearInterval(checkInterval); // 요소가 발견되면 setInterval 종료

    // 모달 시작
    const elements = iframeDoc.querySelectorAll(
      ".se-main-container img, .se-main-container span, .se-main-container a"
    );

    function showModal(id, event) {
      let modal = iframeDoc.getElementById("hover-modal");

      if (!modal) {
        modal = iframeDoc.createElement("div");
        modal.id = "hover-modal";
        modal.style.position = "absolute";
        modal.style.padding = "10px";
        modal.style.background = "white";
        modal.style.border = "1px solid black";
        modal.style.zIndex = "1000";
        iframeDoc.body.appendChild(modal);
      }
      modal.textContent = "ID: " + id;
      modal.style.display = "block"; // 먼저 보이게 하여 높이를 측정할 수 있도록 함

      const rect = event.target.getBoundingClientRect();
      const scrollY =
        iframe.contentWindow.pageYOffset ||
        iframe.contentWindow.document.documentElement.scrollTop;
      const scrollX =
        iframe.contentWindow.pageXOffset ||
        iframe.contentWindow.document.documentElement.scrollLeft;

      // Adjust modal position to show above the element
      modal.style.top = rect.top + scrollY - modal.offsetHeight - 10 + "px"; // 위치 조정
      modal.style.left = rect.left + scrollX + "px";

      modal.style.display = "block"; // Display the modal
    }

    function hideModal() {
      const modal = iframeDoc.getElementById("hover-modal");
      if (modal) {
        modal.style.display = "none";
      }
    }

    elements.forEach((element) => {
      element.addEventListener("mouseover", function (event) {
        event.stopPropagation();
        var id = "";
        if (event.target.tagName.toLowerCase() === "img") {
          var dataLinkData =
            event.target.parentNode.getAttribute("data-linkdata");
          if (dataLinkData) {
            var linkData = JSON.parse(dataLinkData);
            id = linkData.id;
          }
        } else {
          id = event.target.parentNode.id;
        }
        console.log(id);
        showModal(id, event);
      });

      element.addEventListener("mouseout", function (event) {
        hideModal();
      });
    });
    // 모달 end

    // goodList - badList 출력
    var divArray = Array.from(elementsArray[0].children);
    var crawlResults = []; // 결과를 저장할 배열

    // 각 div 요소를 순회하면서 이미지와 텍스트 데이터 추출
    divArray.forEach(function (div) {
      var imgTags = div.getElementsByTagName("img");
      var spanTags = div.getElementsByTagName("span");

      Array.from(imgTags).forEach(function (img) {
        var dataLinkData = img.parentNode.getAttribute("data-linkdata");
        if (dataLinkData) {
          try {
            var linkData = JSON.parse(dataLinkData);
            var id = linkData.id;
            if (id == null) return;
            var src = linkData.src;
            if (!src.includes("gif")) {
              crawlResults.push({
                type: "img",
                data: src,
                id: id,
              });
            }
          } catch (e) {
            console.error("JSON parsing error", e);
          }
        }
      });

      Array.from(spanTags).forEach(function (span) {
        var textContent = span.textContent || span.innerText;
        var id = span.getAttribute("id");
        if (id == null) return;
        crawlResults.push({
          type: "txt",
          data: textContent,
          id: id,
        });
      });
    });
    console.log(crawlResults);

    // 크롬 익스텐션에 메시지 전송 및 응답 처리
    chrome.runtime.sendMessage(
      { action: "detail", crawlResults: crawlResults },
      function (response) {
        var listData = response.data.adDetection;
        console.log(listData);

        // goodList의 각 항목에 대해서 스타일 변경
        listData.goodList.forEach(function (item) {
          var element = document
            .getElementById("mainFrame")
            .contentWindow.document.getElementById(item.id);

          if (element) {
            var html = element.innerHTML;
            item.data.forEach(function (data) {
              if (data !== " ") {
                html = html.replace(
                  data,
                  '<span style="background-color: rgba(66, 189, 101, 0.3)">' +
                    data +
                    "</span>"
                );
              }
            });
            element.innerHTML = html;
          }
        });

        // badList의 각 항목에 대해서 스타일 변경
        listData.badList.forEach(function (item) {
          var element = document
            .getElementById("mainFrame")
            .contentWindow.document.getElementById(item.id);

          if (element) {
            var html = element.innerHTML;
            item.data.forEach(function (data) {
              html = html.replace(
                data,
                '<span style="background-color: rgba(241, 43, 67, 0.3)">' +
                  data +
                  "</span>"
              );
            });
            element.innerHTML = html;
          }
        });
      }
    );
  }
}, 100); // 100ms 마다 확인
