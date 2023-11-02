---
title: "[Spring] Actuator"
date: "2023-05-27T22:44:03.284Z"
description: "Health Check의 개념과 Actuator를 사용해 Health Check하는 방법을 알아보자."
section: "지식 공유" 
category: "Spring"
tags:
  - 우아한 테크코스
  - Spring
  - 라이브러리
thumbnailImg: "./ex1.png"
---

### Actuator 소개

애플리케이션의 모니터링, 메트릭과 같은 기능을 HTTP(또는 JMX) 엔드포인트를 통해 제공하는 라이브러리.

액추에이터는 실행중인 애플리케이션의 내부를 볼 수 있게 하고, 어느 정도까지는 애플리케이션의 작동 방법을 제어할 수 있게 한다.

대표적으로 다음과 같은 정보를 제공한다.

- 애플리케이션 환경에서 사용할 수 있는 구성 속성들
- 애플리케이션에 포함된 다양한 패키지의 로깅 레벨(logging level)
- 애플리케이션이 사용 중인 메모리
- 지정된 엔드포인트가 받은 요청 횟수
- 애플리케이션의 건강 상태 정보
- …

### Actuator가 제공하는 Endpoint(엔드 포인트)

좀 더 구체적으로 액추에이터 라이브러리가 제공하는 endpoint의 종류는 다음과 같다.

| HTTP 메서드     | 경로            | 설명                                                                                                                            | 디폴트 활성화(O, X) |
| --------------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| GET             | /auditevents    | 호출된 감사(audit) 이벤트 리포트를 생성한다.                                                                                    | O                   |
| GET             | /beans          | 스프링 애플리케이션 컨텍스트의 모든 빈을 알려준다.                                                                              | X                   |
| GET             | /conditions     | 성공 또는 실패했던 자동-구성 조건의 내역을 생성한다.                                                                            | X                   |
| GET             | /configprop     | 모든 구성 속성들을 현재 값과 같이 알려준다.                                                                                     | X                   |
| GET,POST,DELETE | /env            | 스프링 애플리케이션에 사용할 수 있는 모든 속성 근원과 이 근원들의 속성을 알려준다.                                              | X                   |
| GET             | /env/{toMatch}  | 특정 환경 속성의 값을 알려준다.                                                                                                 | X                   |
| GET             | /health         | 애플리케이션의 건강 상태 정보를 반환한다.                                                                                       | O                   |
| GET             | /heapdump       | 힙(heap) 덤프를 다운로드한다.                                                                                                   | X                   |
| GET             | /httptrace      | 가장 퇴근의 100개 요청에 대한 추적 기록을 생성한다.                                                                             | X                   |
| GET             | /info           | 개발자가 정의한 애플리케이션에 관란 정보를 반환한다.                                                                            | O                   |
| GET             | /loggers        | 애플리케이션의 패키지 리스트(각 패키지의 로깅 레벨이 포함된)를 생성한다.                                                        | X                   |
| GET,POST        | /loggers/{name} | 지정된 로거의 로깅 레벨(구성된 로깅 레벨과 유효 로깅 레벨 모두)을 반환한다. 유효 로깅 레벨은 HTTP POST 요청으로 설정될 수 있다. | X                   |
| GET             | /mappings       | 모든 HTTP 매핑과 이 매핑들을 처리하는 핸들러 메서드들의 내역을 제공한다.                                                        | X                   |
| GET             | /metrics        | 모든 메트릭 리스트를 반환한다.                                                                                                  | X                   |
| GET             | /metrics/{name} | 지정된 메트릭의 값을 반환한다.                                                                                                  | X                   |
| GET             | /scheduledtasks | 스케줄링된 모든 태스크의 내역을 제공한다.                                                                                       | X                   |
| GET             | /threaddump     | 모든 애플리케이션 스레드의 내역을 반환한다.                                                                                     | X                   |

### 의존성 설치

```jsx
dependencies {
    implementation 'org.springframework.boot:spring-boot-starter-actuator'
}
```

`/actuator` 경로에 접속하면 현재 제공되는 엔드 포인트의 종류를 확인할 수 있다.

```jsx
GET /actuator HTTP/1.1
```

```jsx
{
    "_links": {
        "self": {
            "href": "http://13.125.255.118:8080/actuator",
            "templated": false
        },
        "health": {
            "href": "http://13.125.255.118:8080/actuator/health",
            "templated": false
        },
        "health-path": {
            "href": "http://13.125.255.118:8080/actuator/health/{*path}",
            "templated": true
        }
    }
}
```

### Actuator Contiguration

- **액추에이터의 기본 경로 설정하기**

  `management.endpoint.web.base-path` 속성을 설정하여 바꿀 수 있다. 기본 값은 `/actuator`이다.

  ```jsx
  management.endpoint.web.base-path = "/management"
  ```

- **액추에이터 엔드포인트 활성화/비활성화 설정하기**

  대부분의 액추에이터 엔드 포인트는 민감한 정보를 제공하기 때문에 보안 처리를 해주어야 한다.
    <aside>
    💡 Spring security를 사용해 액추에이터에 대해 보안 처리를 해줄 수 있다.
    
    </aside>
    
    다른 엔드 포인트가 노출되는 것을 방지하기 위해 `management.endpoints.enabled-by-default` 속성을 false로 설정하여 default로 열려있는 엔드 포인트들을 모두 비활성화하고, 원하는 기능만 `management.endpoint.{기능}.enable = true`로 설정한다.
    
    ```jsx
    management.endpoints.enabled-by-default=false
    management.endpoint.health.enabled=true
    ```

- **액추에이터 엔드포인트 노출 설정하기**

  엔드포인트가 활성화되어있다고 해도 노출 설정이 되어있지 않다면 엔드포인트에 접근할 수 없다.
  `management.endpoints.web.exposure.include`와 `management.endpoints.web.exposure.exclude` 속성을 설정하여 엔드포인트의 노출 여부를 제어할 수 있다.(기본적으로 Web 환경에서는 health, info 엔드포인트가 제공된다.)

  ```jsx
  ;(management.endpoints.web.exposure.include = health), logfile
  management.endpoints.web.exposure.exclude = info
  ```

## Actuator Endpoint 사용해보기

---

### Health Checking

`/health`

[이전 게시글](https://amaran-th.github.io/Spring/[Spring]%20Server%20Health%20Checking/#actuator-%EB%9D%BC%EC%9D%B4%EB%B8%8C%EB%9F%AC%EB%A6%AC-%EC%82%AC%EC%9A%A9%ED%95%B4%EB%B3%B4%EA%B8%B0)을 참고하길 바란다.

### Log File

`/logfile`

: 로그 파일의 내용을 반환한다.

해당 기능을 사용하기 위해서는 다음 2개의 조건을 만족해야 한다.

- 서비스가 웹 애플리케이션이어야 한다.
- `logging.file` 또는 `logging.path` 속성을 이용해 로그 파일 출력이 활성화되어야 한다.

  ```jsx
  logging.file.name = target / application.log
  ```

    <aside>
    💡 만약 다른 방법으로 로그 파일을 관리하는 경우 `management.endpoint.logfile.external-file` 속성을 사용하면 된다.
    
    </aside>

### Info

`/info`

기본적으로 info 엔드포인트에는 내용이 없다 ⇒ 개발자가 구성해야 함

info 엔드포인트에 내용을 추가하는 방법은 크게 2가지가 있다.

1. application.properties 파일에 환경 변수를 추가한다.

   ```jsx
   info.app.name = actuator - levle1
   info.app.version = 1.0
   info.app.corporation = nhnent
   ```

   위와 같이 info 데이터를 선언해주면 엔드포인트 조회 시 다음과 같이 JSON 데이터가 반환된다.

   ```json
   {
     "app": {
       "name": "actuator-levle1",
       "version": "1.0",
       "corporation": "nhnent"
     }
   }
   ```

2. 빌드 정보를 활용한다.

   (gradle의 경우) 다음과 같은 구성을 추가하면 빌드 산출물 jar 파일 내에 `META-INF/build-info.properties`가 생성되고, 이 정보를 바탕으로 info 엔드포인트의 내용이 작성된다.

   ```json
   springBoot {
       buildInfo()
   }
   ```

   <aside>
   ⚠️ 빌드 산출물에 포함되기 때문에 IDE에서는 확인할 수 없다.

   </aside>

   ```json
   {
     "build": {
       "version": "0.0.1-SNAPSHOT",
       "artifact": "spring-boot-actuator-level1",
       "name": "spring-boot-actuator-level1",
       "group": "com.nhnent.forward",
       "time": "2018-10-25T05:18:50.466Z"
     }
   }
   ```

## 참고 게시글

[CHAP 16. 스프링 부트 액추에이터 사용하기](https://incheol-jung.gitbook.io/docs/study/srping-in-action-5th/chap-16.#undefined)

[3. 엔드포인트 구성 — spring-boot-actuator documentation](http://forward.nhnent.com/hands-on-labs/java.spring-boot-actuator/03-configuration.html)
