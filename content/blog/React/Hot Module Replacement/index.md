---
title: "Hot Module Replacement"
date: "2024-05-12T23:22:03.284Z"
description: ""
section: "지식 공유"
category: "React"
tags:
  - webpack
  - React
---

## 들어가며

최근 내가 일하고 있는 센터에서 php로 구현된 웹 페이지의 디자인을 개선하는 작업을 하고 있는데, 변경사항이 생길 때마다 일일이 새로고침을 해야 하는 점이 매우 귀찮았다.

그러다가 떠오른 것이, 리액트로 개발을 할 때는 저장만 해도 자동으로 변경사항이 적용이 됐는데, 어떤 원리로 그럴 수 있는건지 궁금해져서 이 글을 작성하게 됐다.

## Hot Reload

일반적으로 Javascript의 개발작업은 다음과 같은 흐름으로 이루어진다.

1. 개발자가 Javascript 코드를 작성한다.
2. Javascript 런타임 환경(브라우저, node)에서 앞서 작성된 코드를 구동한다.
3. 개발자가 Javascript 코드를 수정한다.
4. 런타임 환경을 다시 로드하여 수정된 코드를 다시 구동한다.(브라우저의 경우 F5, node라면 node 재시작)

이 과정에서, 코드 수정이 이루어졌을 때 4번 작업을 자동으로 이루어지게 하는 것이 Hot Reload의 기본적인 아이디어이다.

이 아이디어를 어떻게 구현할 수 있을까? 아래와 같은 과정을 생각할 수 있다.

1. 누군가 '코드 수정'을 **감지**한다.
   - 특정 폴더를 주고, 이 폴더의 변경을 주기적으로 polling하여 파일의 변경사항을 알 수 있다.
   - 코드 수정 감지용 프로그램은 일회성이 아니라 지속적으로 실행되어야 한다.
   - 보통은 번들러에서 이러한 코드 수정 감지를 할 수 있다.
2. 코드가 수정되었음을 런타임에 **알린다(notify)**.
   - 기본적으로 코드 수정 감지 프로그램이 런타임에 수정사항을 알리거나, 거꾸로 코드 수정 감지 프로그램이 API를 제공(서버)하고 런타임이 polling 형태로 해당 api를 호출하는 등 다양한 방법이 있을 수 있다.
   - 현재 수정되는 코드가 최초 한번 런타임에서 구동될 때, '코드 수정 감지 프로그램'과 통신할 수 있는 코드(프로그램)가 이미 들어있는 상태로 구동되도록 할 수 있다.
   - 자바스크립트의 웹 소켓(web socket) 기능을 사용해 코드 수정 감지 프로그램과 런타임 간의 통신을 구현할 수 있다.
3. 런타임은 자신을 **재기동**한다.
   이러한 형태의 Hot Reload를 구현하면 개발자가 코드 수정을 했을 때 자동으로 코드가 갱신되도록 할 수 있다.

그러나 매번 새로고침이 발생하기 때문에 매번 javascript 상의 최초 코드부터 다시 실행된다. 즉, full page load가 다시 발생한다는 단점이 있다.

## HMR로의 발전

이러한 단점을 개선하여 새롭게 발전된 Reload의 개념이 바로 HMR(Hot Module Replacement)이다. HMR을 정의하면 다음과 같다.

> 특정 모듈(코드)의 변경이 발생했을 때 해당 변경 사항을 런타임에 교체하는 기능

Hot-Reload와 차별화되는 아이디어는 다음과 같다.

- F5(새로고침)로 browser을 Full Reload하지 않았으면 좋겠다.
- module이라는 개념을 기반으로 수정된 파일(module)만 교체(replace)되면 좋겠다.
- 수정된 파일(module)이 교체되고 나서 즉각적으로 반영되었으면 좋겠다.
  이 아이디어를 실제로 구현하면 다음과 같다.

1. 누군가 '코드 수정'을 **감지**한다.
   - 단순 파일 변경 감지 이외, 모듈 변경 형태로 감지해야 한다.
   - 특정 모듈을 사용한 dependency을 감지해야 한다.(해당 파일(module)을 사용하는 dependency 파일도 다 알아야 한다.)
   - 따라서, 프로젝트의 전체적인 계층 구조를 알고 있어야 하고 이를 어딘가에서 계속 가지고 있어야 한다.
2. 코드가 수정되었음을 런타임에 **알린다(notify)**.
   - Hot Reload에서와 동일
3. 런타임은 자신을 **재기동**한다.
   - 기존이 단순 page reload였다면, 이제는 페이지가 그대로 유지되어야 한다.
   - 런타임은 현재 구동중인 javascript의 전체적인 module 구조를 알고 있어야 하며, '코드 수정' 감지가 알려준 정보(변경된 module, dep 파일)를 알아야 한다.
   - 런타임은 '코드 수정' 감지가 알려준 정보만을 replace해야 한다. 즉 나의 소스코드(javascript)에 통신 프로그램(web socket) 뿐만 아니라, 모듈의 계층 구조를 알고, 특정 부분만 교체하는 프로그램도 있어야 한다.

## HMR 구현체로 이해하기

### Webpack

webpack은 대표적인 bundler 프로그램 중 하나로, 여러 개의 javascript 파일을 하나로 합쳐준다.

기본적으로 webpack을 수행하면 즉시 실행되고 종료되는데, 이 프로그램은 config 설정을 기반으로 module 계층 구조를 분석(파싱)하고 각 파일(module)에 맞는 컴파일을 수행한다. 이후 컴파일이 종료되고 최종 결과물(bundle.js)을 생성한다.

webpack은 incremental build도 지원한다. incremental build란 매번 full build를 하는 경우, build->parsing->compile->bundle 생성까지 오랜 시간이 걸리기 때문에, 변경된 파일(module)만 감지해서 해당 부분만 build하고 반영하는 기능이다.

이에 따라 HMR 관점에서 다음의 기능들을 구현하는 것이 가능하다.

- 특정 코드 수정(module) 감지 가능 => incremental build
- module 형태의 계층을 관리하고 있음
- 특정 코드 수정(module) 감지 시 특정 코드만 빌드해서 특정 영역(module)만 새로운 코드로 빌드 결과물(bundle)을 만들어낼 수 있음
- webpack 자체가 daemon처럼 계속 떠서 파일 변경을 polling할 수 있음.

=>즉, '코드 수정 감지'의 기능을 충분히 하고 있음을 알 수 있다.

### webpack-dev-server

webpack-dev-server는 간략하게 webpack+dev(express.js(node.js)) 서버라고 생각하면 된다.

webpack-dev-server의 서버는 express.js로 구현되어 있는데, 이는 middleware 기능을 제공하고 있다.

webpack-dev-server는 이러한 middleware를 사용하여 webpack build 기능을 제공하고 있다.

### webpack-dev-server HOT

webpack-dev-server의 hot 기능을 켜면 아주 간단하게 HMR 설정이 완료된다.

이 때 내부적으로 구동되는 webpack은 'watch' 모드이다. 그리고 내부 구동되는 webpack 빌드 과정에서, 런타임에 구동될 최종 bundle.js 코드에 통신&재기동 코드를 삽입한다. 이후 빌드가 완료되면 "통신"(notify)을 한다. 이후 클라이언트(런타임)는 통신을 받으면 브라우저를 재기동하거나 module replacement를 수행한다.

## 결론

이번 학습을 통해 리액트 개발환경에서의 HMR 기능은 Webpack에서 제공하고 있다는 걸 알게 되었다.

## 참고 자료

- [HMR 이해하기](https://gseok.github.io/tech-talk-2022/2022-01-24-what-is-HMR/)
- [Hot Module Replacement](https://webpack.kr/concepts/hot-module-replacement/)
