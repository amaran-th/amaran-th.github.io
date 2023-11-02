---
title: "JMeter 사용해보기"
date: "2023-10-16T00:03:03.284Z"
description: "서버 배포를 편리하게 할 수 있는 쉘 스크립트를 작성해보자"
section: "지식 공유" 
category: "인프라"
tags:
  - 우아한 테크코스
  - 성능 테스트
thumbnailImg: "./thumbnail.webp"
---


우테코 6차 데모데이 요구사항에 다음과 같은 요구사항이 있었다.

> **hikariCP 커넥션풀 설정**
>
> - 수치를 설정하고 정한 이유를 발표한다.
> - hikariCP configuration 보고 필요한 값을 설정한다.

우리 팀은 적정한 hikariCP의 커넥션 풀 크기가 얼마인지 확인하기 위해 Jmeter를 사용해 부하테스트를 하기로 했다.
백엔드 팀원들과 다같이 부하테스트를 진행하기 전에 각자 Jmeter의 간단한 조작법을 익히고 관련 개념을 습득하고 오기로 해서, 이번에는 Jmeter를 다룬 내용을 정리해보려고 한다.

### JMeter 설치
```bash
brew install jmeter
```
나는 Mac을 사용하고 있고 HomeBrew라는 패키지 매니저를 사용하고 있어 위 명령어로 JMeter를 설치해주었다.
### JMeter 실행
설치가 완료된 후, 터미널에 jmeter를 입력해 JMeter 프로그램을 실행시킨다.
![](https://i.imgur.com/JUZ7nQn.png)
처음 JMeter를 실행시키면 위와 같은 화면이 나온다.
먼저 JMeter를 사용하는 데 도움이 될 플러그인을 설치해주자.
우측 상단의 깃털 모양 아이콘을 클릭한다.
![](https://i.imgur.com/gHU3fY3.png)
그럼 다음과 같이 플러그인을 설정할 수 있는 창이 뜬다.
![](https://i.imgur.com/0U7n6ir.png)
Available Plugins에서 다음 세 가지의 플러그인을 찾아 선택해준 뒤, `Apply Changes and Restart JMeter`를 클릭해준다.
![](https://i.imgur.com/i1hM6Xy.png)

이제 테스트 환경을 셋팅해보자.

`Test Plan(우클릭) > Add > ThreadsGroup` 을 눌러 새 Thread Group을 추가한다.
이후 ThreadGroup을 우클릭 하여 다음의 3개 항목을 추가한다.
1. `ThreadGroup(우클릭) -> Add -> Sampler -> Http Request`  
2. `ThreadGroup(우클릭) -> Add -> Listener -> View Results Tree`  
3. `ThreadGroup(우클릭) -> Add -> Listener -> Summary Report`
4. `ThreadGroup(우클릭) -> Add -> Listener -> Transaction Per Second`

이들을 모두 추가해주고 난 뒤, Thread Group을 클릭하면 아래와 같은 설정 화면이 뜬다.
![](https://i.imgur.com/hehaDfb.png)
여기서 Thread Properties의 속성들을 각각 소개해보자면
![](https://i.imgur.com/DOA1K0r.png)
1. **Number of Threads(users)**
	: 가상의 사용자(vUser)를 몇 명으로 설정할 것인지에 대한 값이다.(몇 개의 스레드를 생성할 것인지)
	- 이 값이 커질수록 서버는 많은 부하를 받게 된다.
2. **Ramp-up Period(in seconds)**
	: Number of Threads만큼의 스레드를 몇 초에 걸쳐서 만들지에 대한 설정 값.
3. **Loop Count**
	: 한 유저가 한 번에 보내고자 하는 요청의 개수. Infinite를 누르면 무제한으로 실행한다.

다음으로 Http Request를 클릭해보자.
![](https://i.imgur.com/6fbZQ1U.png)
Basic의 WebServer에 보이는 옵션들은 어떤 URL에 부하를 줄 것인지 설정하는 옵션이다.

### 사용해보기
이제 localhost에 우리 Kerdy 애플리케이션 서버를 띄우고, Jmeter로 부하 테스트를 해보겠다.
![](https://i.imgur.com/aCEF44a.png)
localhost:8080에 애플리케이션 서버를 띄운다.

Thread Group의 Thread Properties를 다음과 같이 설정해준다.
한 사용자가 300개의 요청을 보내는 상황이고, 유저 수는 1초에 걸쳐서 10명까지 늘어난다.
![](https://i.imgur.com/nPxmQcb.png)

http://localhost:8080/events로 GET 요청이 가게끔 셋팅한다.
![](https://i.imgur.com/QmCQh5p.png)

이제 실행 버튼을 눌러 부하 테스트를 실행한다.

![](https://i.imgur.com/npUZKkh.png)

- **View Results Tree**
	![](https://i.imgur.com/ShPzEpd.png)
	보낸 HTTP 요청들의 상세 정보를 확인할 수 있다.
- **Summary Report**
	![](https://i.imgur.com/4iOPWrL.png)
	부하 테스트 결과 통계를 확인할 수 있다.
- **jp@gc - Transactions per Second**
	![](https://i.imgur.com/AIapUEq.png)
	Trasactions per Second(TPS)는 초당 트랜잭션의 개수로, 서비스 성능을 측정하는 지표 중 하나이다.
	이를 계산하는 원리를 설명하자면, 일정 기간동안 실행된 트랜잭션의 개수를 구하고, 이를 1초 구간에 대한 값으로 변경한다.
	그림으로 표현하면 다음과 같다.
	![tps_example_01](https://www.whatap.io/ko/blog/14/img/tps_example_01.webp)
	그래프를 통해 최대 TPS는 280정도가 나오는 것을 알 수 있다.


## 참고 자료
- [[성능 테스트 도구] Apache Jmeter 설치부터 간단한 사용까지](https://velog.io/@ehdrms2034/%EC%84%B1%EB%8A%A5-%ED%85%8C%EC%8A%A4%ED%8A%B8-%EB%8F%84%EA%B5%AC-Apache-Jmeter-%EC%84%A4%EC%B9%98%EB%B6%80%ED%84%B0-%EA%B0%84%EB%8B%A8%ED%95%9C-%EC%82%AC%EC%9A%A9%EA%B9%8C%EC%A7%80)
- [TPS 지표 이해하기](https://www.whatap.io/ko/blog/14/)