---
title: "Websocket과 STOMP"
date: "2024-06-04T15:14:03.284Z"
description: "Websocket과 STOMP에 대해 알아보자."
section: "지식 공유"
category: "JavaScript"
tags:
  - websocket
---

## WebSocket

두 프로그램 간의 메시지 교환을 위한 통신 방법 중 하나.

웹소켓의 주요 특징으로 **양방향 통신**과 **실시간 네트워킹**이 있다.

\*기존의 HTTP 통신은 클라이언트가 요청을 보내는 경우에만 서버가 응답을 하는 단방향 통신이다.

### 웹소켓 이전의 비슷한 기술

1. Polling

   서버로 일정 주기마다 요청을 송신하는 방식

   ⇒실시간 통신에서는 언제 통신이 발생할지 알 수 없다.

   ⇒불필요한 요청과 커넥션을 생성하게 된다.

2. Long Polling

   Polling의 단점을 최소화하기 위해 서버에서 조금 더 대기하여 이벤트를 받는다.

   ⇒메시지 양이 많을 경우 polling과 같은 문제를 갖게 된다.

3. Streaming

   서버에 요청을 보내고 끊기지 않은 연결 상태에서 끊임없이 데이터를 수신한다.

   ⇒클라이언트에서 서버로 데이터를 송신하기 어렵다.(사실상 단방향 통신)

### 웹 소켓 동작 과정

웹소켓도 HTTP 또는 HTTPS 프로토콜을 통해 이루어진다.

<aside> 💡 웹 소켓 Request

- HTTP 버전은 1.1 이상이어야 한다.
- GET 메서드를 사용해야 한다.
- Uprade 정보는 서버, 전송, 프로토콜 연결에서 다른 프로토콜로 업그레이드/변경하기 위한 규칙
- Sec-Websocket-Key는 클라이언트가 요청하는 여러 서브 프로토콜을 의미(ex: STOMP)

```json
GET /chat HTTP/1.1
Host: example.com:8000
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ== Sec-WebSocket-Version: 13
```

</aside>

<aside> 💡 웹 소켓 Response

\*101 Switching Protocols가 응답으로 오면 웹 소켓이 연결된 것이다.

- Sec-Websocket-Accept는 요청에서의 Key 값을 계산한 값으로 신원 인증에 필요한 헤더이다.

```sql
HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=
```

</aside>

![](https://i.imgur.com/v0NJ9pF.png)

위와 같이 핸드쉐이크가 완료되면 프로토콜이 ws/wss로 변경된다.

- Frame: 통신에서 가장 작은 단위의 데이터, 작은 헤더+payload로 구성된다.
  ![](https://i.imgur.com/KKhE6LZ.png)
- Message: 여러 frame이 모여서 구성하는 하나의 논리적 메시지 단위

### 웹 소켓 프로토콜의 특징

- 최초 접속 시에만 HTTP 프로토콜 위에서 핸드쉐이킹을 하기 때문에 http 헤더를 사용
- 웹 소켓을 위한 별도의 포트는 없고 기존의 포트를 그대로 사용한다.
- 메시지에 포함될 수 있는 교환 가능한 메시지는 텍스트와 바이너리 데이터 뿐이다.

### 웹 소켓의 한계

웹 소켓은 문자열을 주고받게 해줄 뿐 그 이상의 일을 하지 않는다.

주고 받은 문자열의 해독은 온전히 애플리케이션에게 맡기는데, 이 말은 즉슨 형식이 정해져있어 모두가 약속을 따르기만 하면 쉽게 해석할 수 있는 HTTP와 달리, WebSocket은 형식이 정해져 있지 않아 애플리케이션에서 쉽게 해석하기가 어렵다.

때문에 WebSocket 방식을 사용할 때 메시지의 형태를 규정한 서브 프로토콜을 사용하는 경우가 많다.

대표적인 서브 프로토콜이 바로 STOMP이다.

## STOMP(Simple/Stream Text Oriented Message Protocol)

웹 소켓 위에서 동작하는 프로토콜. 클라이언트와 서버가 전송할 메세지의 유형, 형식, 내용들을 정의하는 메커니즘.

- 규격을 갖춘 메시지를 보낼 수 있는 텍스트 기반 프로토콜
- publisher, broker, subscriber를 따로 두어 처리한다.(pub/sub 구조)
- 연결 시에 헤더 속성을 추가하여 인증 처리를 구현할 수 있다.

<aside> 💡 pub/sub

---

메시지를 공급하는 주체(publisher)와 소비하는 주체(subscriber)를 분리해 제공하는 메세징 방법.

![](https://i.imgur.com/y5jhLQE.png)

</aside>

STOMP에서는 publish-subscribe 메커니즘을 제공하는데, 즉 broker를 통해 타 사용자들에게 메세지를 보내거나 서버가 특정 작업을 수행하도록 메세지를 보낼 수 있게 된다.

### 외부 브로커

Spring에 내장된 Simple Message Broker는 스프링 부트 서버 내부 메모리에서 동작한다.

만일 서버가 다운되어 메세지 전송에 실패할 경우, In-Memory 기반의 메시지 큐의 메시지가 손실될 가능성이 높다.

추가적으로, In-Memory 기반 시스템은 메시지 모니터링이 쉽지 않다.

이를 해결하기 위해 RabbitMQ, Redis의 Pub/Sub와 같은 외부 브로커를 도입할 수 있다.

## 자바스크립트 라이브러리

웹소켓 구현을 지원해주는 라이브러리로 socket.io, sockJS가 있다.

Socket.io는 범용 실시간 메시징 솔루션을 제공하는 것을 목표로 하는 반면, SockJS는 WebSocket API를 에뮬레이션하는 것을 목표로 둔다.

<aside>

💡 **WebSocket Emulation**

먼저 웹 소켓으로 연결을 시도하고, 실패할 경우 HTTP Streaming, Long-Polling과 같은 HTTP 기반의 다른 기술로 전환해 다시 연결을 시도하는 것

</aside>

보통 node.js를 사용할 경우 Socket.io를 사용하고, Spring을 사용하면 SockJS를 사용하는 것이 일반적이다.

### socket.io

- node.js를 기반으로 구현되었다.(다른 언어에서도 사용 가능하긴 함)
- 비동기 이벤트 방식을 사용해 실시간으로 간단하게 데이터를 주고받을 수 있게 만들어준다.
- 브라우저가 웹 소켓을 지원하면 일반 web socket 방식으로 동작하고, 지원하지 않는 브라우저면 http를 사용해 web socket을 흉내내는 방식으로 통신을 지원한다.
- 보다 포괄적이고 다양한 기능을 가지고 있다.

### sockJS

- sock.JS는 socket.io에 비해 더 다양한 플랫폼/언어를 지원한다.
- Sock.js는 Socket.io보다 더 가볍다(경량화)
- Sock.js는 Socket.io만큼 기능이 다양하진 않지만 여러 브라우저에서 일관되게 동작하는 API를 제공한다.

### +) stompJS

STOMP 프로토콜의 클라이언트 구현을 제공하는 자바스크립트 라이브러리.

## 실제 구현 예제

1. 서버와 연결할 클라이언트 객체를 생성한다.

   ```javascript
   const client = new StompJs.Client({
     brokerURL: "ws://local.corsmarket.ml/api/ws",
     connectHeaders: {
       login: "user",
       passcode: "password",
     },
     debug: function (str) {
       console.log(str)
     },
     reconnectDelay: 5000,
     heartbeatIncoming: 4000,
     heartbeatOutgoing: 4000,
   })

   client.onConnect = function (frame) {
     // Do something, all subscribes must be done is this callback
     // This is needed because this will be executed after a (re)connect
   }

   client.onStompError = function (frame) {
     // Will be invoked in case of error encountered at Broker
     // Bad login/passcode typically will cause an error
     // Complaint brokers will set `message` header with a brief message. Body may contain details.
     // Compliant brokers will terminate the connection after any error
     console.log("Broker reported error: " + frame.headers["message"])
     console.log("Additional details: " + frame.body)
   }

   client.activate()
   ```

2. 메시지를 보낸다.(Publish)

   ```javascript
   client.publish({
     destination: "/topic/general",
     body: "Hello world",
     headers: { priority: "9" },
   })

   // 바이너리 데이터도 가능
   const binaryData = generateBinaryData()
   client.publish({
     destination: "/topic/special",
     binaryBody: binaryData,
     headers: { "content-type": "application/octet-stream" },
   })
   ```

3. 메시지를 받는다.(Subscribe)

   ```javascript
   const subscription = client.subscribe("/queue/test", callback)
   ```

## 참고 게시글

- [Web Socket 이란?](https://velog.io/@codingbotpark/Web-Socket-%EC%9D%B4%EB%9E%80)
- [Socket.IO vs SockJS: How they compare and which to use in 2024](https://ably.com/topic/socket-io-vs-sockjs)
- [sockJS와 stompJS](https://fgh0296.tistory.com/24)
