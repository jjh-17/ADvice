// 테스트 url : https://cafe.naver.com/specup/7458685

setInterval(1000); // 로딩 기다리기
var iframe = document.getElementById("cafe_main");

if (iframe) {
  iframe.addEventListener("load", function () {
    var iframeDoc = iframe.contentWindow.document;
    var checkExist = setInterval(function () {
      var iframeElements =
        iframeDoc.getElementsByClassName("se-main-container");
      if (iframeElements.length > 0) {
        clearInterval(checkExist); // 요소를 찾았으면 인터벌을 중지합니다.

        var divArray = Array.from(iframeElements[0].children);
        var crawlResults = []; // 결과를 저장할 배열

        divArray.forEach(function (div) {
          var imgTags = div.getElementsByTagName("img");
          var spanTags = div.getElementsByTagName("span");

          Array.from(imgTags).forEach(function (img) {
            var dataLinkData = img.parentNode.getAttribute("data-linkdata");
            if (dataLinkData) {
              try {
                var linkData = JSON.parse(dataLinkData);
                var id = linkData.id;
                var src = linkData.src;
                crawlResults.push({
                  type: "img",
                  data: src,
                  id: id,
                });
              } catch (e) {
                console.error("JSON parsing error", e);
              }
            }
          });

          Array.from(spanTags).forEach(function (span) {
            var textContent = span.textContent || span.innerText;
            var id = span.getAttribute("id");
            crawlResults.push({
              type: "txt",
              data: textContent,
              id: id,
            });
          });
        });

        var listData = {};

        chrome.runtime.sendMessage(
          { action: "detailCafe" },
          function (response) {
            listData = response.data;

            // goodList의 각 항목에 대해서
            listData.goodList.forEach(function (item) {
              var element = iframeDoc.getElementById(item.id);

              if (element) {
                var html = element.innerHTML;
                item.data.forEach(function (data) {
                  html = html.replace(
                    data,
                    '<span style="background-color: rgba(66, 189, 101, 0.3)">' +
                      data +
                      "</span>"
                  );
                });
                element.innerHTML = html;
              }
            });

            // badList의 각 항목에 대해서
            listData.badList.forEach(function (item) {
              var element = iframeDoc.getElementById(item.id);

              var html = element.innerHTML;
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
    }, 100); // 100밀리초 간격으로 체크합니다.
  });
}
