---
title: "웹페이지 빌드 과정(Critical Rendering Path, CRP)"
date: "2024-04-28T20:47:03.284Z"
description: 브라우저에서 웹페이지가 빌드되는 과정에 대해 알아보자.
section: "지식 공유"
category: JavaScript
tags:
  - 프론트엔드
  - 브라우저
---

# CRP(Critical Rendering Path)

<aside>

**CRP란?**

---

브라우저가 서버로부터 받은 페이지에 대한 HTML 응답을 화면에 표시하기까지의 과정

</aside>

CRP는 다음의 5단계를 거치게 된다.

1. DOM 트리 생성
2. Render 트리 생성
3. Layout 구성
4. Painting
5. Composite
   ![](https://i.imgur.com/4u5wm0T.png)

# 1. DOM 트리 생성

![](https://i.imgur.com/PSCQ1hT.png)

Render 엔진이 문서를 읽어들여 파싱한 뒤, 어떤 내용을 페이지에 렌더링할 것인지를 결정하는 단계.

브라우저가 서버로부터 HTML 코드를 응답받으면 가장먼저 `<html>`, `<body>`, `<p>`와 같은 html 태그들을 읽기 시작한다.
브라우저는 이들을 Node라는 자바스크립트 객체로 바꾸고, 이렇게 만들어진 Node들은 다음 이미지과 같은 계층 구조를 가진 DOM 트리를 구축하게 된다.
![](https://i.imgur.com/XLrONiG.png)

<aside>

**DOM(Document Object Model)이란?**

---

웹 페이지를 이루는 요소(Element)들을 자바스크립트가 이용할 수 있게끔 브라우저가 트리구조로 만든 객체 모델.

</aside>

브라우저는 DOM 트리를 구축한 후, CSS 파일을 읽어 **CSSOM 트리**를 구축한다.
![](https://i.imgur.com/8kXbEh7.png)

<aside>

**CSSOM(CSS Object Model)이란?**

---

브라우저가 CSS 내용을 파싱하여 구조화한 CSS 객체 모델

- HTML 대신 CSS가 대상인 DOM이라고 할 수 있다.
- CSSOM의 노드들은 각 DOM 요소에 어떤 CSS 스타일링이 들어갈지에 대한 정보들을 가지고 있다.
- 사용자가 CSS 스타일을 동적으로 읽고 수정할 수 있게 해준다.
- `<meta>`, `<title>`과 같이 화면에 그려지지 않는 요소는 CSSOM에 포함되지 않는다.

</aside>

# 2. Render 트리 생성

![](https://i.imgur.com/GrKgqvG.png)

브라우저가 DOM과 CSSOM을 결합하는 단계.

이 과정은 화면에 보이는 모든 컨텐츠와 스타일 정보를 모두 포함하는 최종 Render 트리를 출력한다.
=> 즉, Render 트리는 화면에 표시되는 모든 노드의 컨텐츠 및 스타일 정보를 포함한다.

# 3. Layout 구성

![](https://i.imgur.com/B7XRKYr.png)

브라우저가 페이지에 표시되는 각 요소의 크기와 위치를 계산하는 단계.

브라우저는 Render Tree의 각 노드에 대해 layout을 생성하는데, 이 layout에는 해당 노드의 position 값, 사이즈와 픽셀 값 등의 배치 정보를 가지고 있다.

# 4. Painting

![](https://i.imgur.com/HVqrm4U.png)

실제 화면에 요소를 그리는 단계.

이제 브라우저는 화면에 그려져야 할 요소를 모두 알고 있다. 브라우저는 이 요소들을 효율적으로 그리기 위해 각 요소들의 Layer(레이어)를 생성한다.

# 5. Composite

![](https://i.imgur.com/XR8Zl24.png)
앞 과정에서 만든 Layer들을 하나의 평면으로 합치는 단계.

브라우저는 레이어 간 순서를 고려하여 하나의 평면으로 합치고, 이 모든 과정이 끝나면 각 레이어들의 정보 값이 GPU에 전송되어 페이지가 구현된다.
