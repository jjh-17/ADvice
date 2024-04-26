// 테스트 url : https://blog.naver.com/cindy7928/223401462569

var iframeElements = document
  .getElementById("mainFrame")
  .contentWindow.document.getElementsByClassName("se-main-container");

var elementsArray = Array.from(iframeElements);
var divArray = Array.from(elementsArray[0].children);
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

var listData = {
  badList: [
    {
      data: [
        "오늘은 동네 스타벅스에서, 2주마다 책 한 권을 읽고 만나는 독서 모임이 있는 날이다. ",
      ],
      id: "SE-80b0e665-ef6b-11ee-b3a5-09cbc8bc88db",
    },
    {
      data: ["책 이야기 반으로 편안하게 이야기한다."],
      id: "SE-80b0e666-ef6b-11ee-b3a5-f113d835b88a",
    },
    {
      data: [
        "그동안 멤버 교체 없이, 참여율 100%를 유지하며 즐겁게 만나고 있다.",
      ],
      id: "SE-80b0e667-ef6b-11ee-b3a5-058454c0be21",
    },
  ],
  goodList: [
    {
      data: [
        "수다도 즐겁지만 책 이야기를 하는 것도 즐겁다.",
        "왜 그렇게 생각하는지를 이야기하다 보면 다양한 시각으로 볼 수 있는 능력도 키워지고 역시 사람들 생각하는 것은 비슷비슷하구나라는 생각도 들고 작지만 많은 것을 느끼고 배우게 된다.",
      ],
      id: "SE-80b10d82-ef6b-11ee-b3a5-03f88dca99fd",
    },
    { data: [""], id: "SE-80b10d83-ef6b-11ee-b3a5-590cc5050f6a" },
    {
      data: [
        "일요일 오전의 이런 힐링 시간이 고맙고 즐겁다. 또 이런 시간을 유지하기 위해 서로 노력하고 배려해 주는 우리 멤버분들께도 감사하다.",
      ],
      id: "SE-80b10d84-ef6b-11ee-b3a5-c7101037312e",
    },
  ],
};

// goodList의 각 항목에 대해서
listData.goodList.forEach(function (item) {
  var element = document
    .getElementById("mainFrame")
    .contentWindow.document.getElementById(item.id);

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
  var element = document
    .getElementById("mainFrame")
    .contentWindow.document.getElementById(item.id);

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
