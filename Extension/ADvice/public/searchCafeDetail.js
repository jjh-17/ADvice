// 테스트 url : https://cafe.naver.com/specup/7458685

var listData = {
  goodList: [
    {
      data: ["▶지원기업 : 삼성"],
      id: "SE-f85507c1-012e-11ef-b6c8-91ec2d9681b8",
    },
    {
      data: ["▶ 지원부서 : SDI"],
      id: "SE-f85507c3-012e-11ef-b6c8-6f2e6d81a952",
    },
    {
      data: ["▶ 시험시간 : 60분"],
      id: "SE-f85507c5-012e-11ef-b6c8-fb22bdb5f7fb",
    },
    {
      data: ["▶ 난이도 : 중"],
      id: "SE-f85507c7-012e-11ef-b6c8-ad8ba401c970",
    },
  ],
  badList: [
    {
      data: [
        "선지가 후반부에 있는 경우가 많았어서 뒤에서부터 검토한다면 시간을 많이 단축할 수 있을거 같습니다.",
      ],
      id: "SE-93fc83f8-bd53-477e-a00e-4093836e2c99",
    },
    {
      data: ["이번시험 추리영역은 계산이 많았는데", "깔끔했고"],
      id: "SE-fd35381d-b2b9-4a61-9432-6a612ba54c25",
    },
  ],
};

setInterval(1000); // 로딩 기다리기
var iframe = document.getElementById("cafe_main");

if (iframe) {
  iframe.addEventListener("load", function () {
    console.log("hi!");
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
    }, 100); // 100밀리초 간격으로 체크합니다.
  });
}
