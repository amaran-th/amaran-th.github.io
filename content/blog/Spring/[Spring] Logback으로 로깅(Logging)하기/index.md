---
title: "[Spring] Logback으로 로깅(Logging)하기"
date: "2023-08-17T17:53:03.284Z"
description: "Logging의 개념과 로깅 라이브러리인 Logback의 사용법에 대해 알아보자"
category: "Spring"
tags:
  - 우아한 테크코스
  - Spring
thumbnailImg: "../logback.png"
---

## Logging

---

### Logging(로깅)이란?

어떤 소프트웨어가 실행할 때 발생하는 이벤트를 추적할 수 있도록 프로그램 실행 중 기록(로그)를 남기는 것.

간단히 `System.out.println()`을 사용해 콘솔 로그를 남기는 것도 로깅에 해당한다.

Spring에서는 일련의 로깅 라이브러리를 제공하고 있다.

### Spring 로깅 라이브러리

Spring에서 사용할 수 있는 logging 관련 라이브러리는 대표적으로 log4j, logback, log4j2가 있다.

| 라이브러리 | 설명                                                                                                                                                                         |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| logback    | - 스프링 부트 환경에서 `spring-boot-starter-web` 안에 `spring-boot-starter-logging`의 logback이 기본적으로 포함되어 있기 때문에 별도의 의존성 추가 작업 없이 사용할 수 있다. |
| log4j2     | - 최신 프레임워크 <br> - Logback에 비해 멀티 스레드 환경에서 비동기 처리가 아주 빠르다는 장점이 있다.                                                                        |

<aside>
⚠️ log4j는 2015년 경 지원이 종료되었다.

</aside>

**SLF4J 라이브러리**는 이들을 통합하여 인터페이스로 제공한다.

인터페이스만 존재하기 때문에 ‘추상화 라이브러리’라고도 하는데, 구현체 라이브러리 간 전환이 자유롭다는 장점이 있다.

### 로깅 라이브러리를 사용하는 것의 장점

`System.out.println()`을 사용하는 것과 비교했을 때 얻을 수 있는 장점은 다음과 같다.

- 스레드 정보, 클래스 이름과 가튼 부가 정보를 함께 볼 수 있다.
- 출력 형식을 지정할 수 있다.
- 로그 레벨에 따라 남기고 싶은 로그를 별도로 지정할 수 있다.
- 콘솔 뿐 아니라 파일, 데이터베이스 등 로그를 별도의 위치에 남길 수 있다.
- 성능 면에서도 System.out보다 좋다.(내부 버퍼링, 멀티 스레드 등)

## Logback이란

---

### Logback 소개

Spring Boot에 내장되어 있는 로깅 라이브러리

slf4j는 로깅 추상 레이어를 제공하는 인터페이스.

⇒slf4j의 구현체 라이브러리를 사용한다면 어떤 로깅 라이브러리를 사용해도 같은 방법으로 로그를 남길 수 있다. 즉, 로그 라이브러리를 교체하는 일이 발생하더라도 애플리케이션의 코드가 변경될 필요가 없다.

### Logback의 구조

Logback은 `logback-core`, `logback-classic`, `logback-access` 세 가지 모듈로 나뉜다.

- `logback-core`: 다른 두 모듈을 위한 기반 역할을 하는 모듈. `Appender`와 `Layout` 인터페이스가 이 모듈에 포함된다.
- `logback-classic`: `logback-core`에서 확장된 모듈로, `logback-core`와 `SLF4J API 라이브러리`를 포함한다. `Logger` 클래스가 이 모듈에 포함된다.
- `logback-access`: Servlet Container와 통합되어 HTTP 액세스에 대한 로깅 기능을 제공한다. `logback-core`는 기반 기술이기 때문에 필요하지만 `logback-classic` 및 `slf4j`와는 무관하다. 웹 애플리케이션 레벨이 아닌 컨테이너 레벨에서 설치돼야 한다.

## 사전 지식

---

### Log Level(로그 레벨)

| Level | 설명                                                                                                        |
| ----- | ----------------------------------------------------------------------------------------------------------- |
| error | 예상하지 못한 심각한 문제가 발생하는 경우, 즉시 조취를 취해야 할 수준의 레벨                                |
| warn  | 로직 상 유효성 확인, 예상 가능한 문제로 인한 예외 처리, 당장 서비스 운영에는 영향이 없지만 주의해야 할 부분 |
| info  | 운영에 참고할만한 사항, 중요한 비즈니스 프로세스가 완료됨                                                   |
| debug | 개발 단계에서 사용하며, SQL 로깅을 할 수 있음                                                               |
| trace | 모든 레벨에 대한 로깅이 추적되므로 개발 단계에서 사용함                                                     |

위로 갈수록 레벨이 높다.

debug 이하 레벨은 주로 개발 과정에서 쓰이고, 실제 환경에서는 주로 info 레벨과 warn 레벨을 사용한다.

### 출력할 로그의 Pattern 옵션(Log Pattern)

- 옵션 종류

  - `%logger` : 패키지 포함 클래스 정보
  - `%logger{0}` : 패키지를 제외한 클래스 이름만 출력
  - `%logger{length}` : Logger name을 축약할 수 있음. {length}는 최대 자리 수, ex)logger{35}
  - `%-5level` : 로그 레벨, -5는 출력의 고정폭 값(5글자), 로깅레벨이i nfo일 경우 빈칸 하나 추가
  - `${PID:-}` : 프로세스 아이디
  - `%d` : 로그 기록시간 출력
  - `%p` : 로깅 레벨 출력
  - `%F` : 로깅이 발생한 프로그램 파일명 출력
  - `%M` : 로깅이 발생한 메소드의 이름 출력
  - `%line` : 로깅이 발생한 호출지의 라인
  - `%L` : 로깅이 발생한 호출지의 라인
  - `%thread` : 현재 Thread 명
  - `%t` : 로깅이 발생한 Thread 명
  - `%c` : 로깅이 발생한 카테고리
  - `%C` : 로깅이 발생한 클래스 명 (%C{2}는 somePackage.SomeClass 가 출력됨)
  - `%m` : 로그 메시지
  - `%msg` : - 로그 메시지 (=%message)
  - `%n` : 줄바꿈(new line)
  - `%%` : %를 출력
  - `%r` : 애플리케이션 시작 이후부터 로깅이 발생한 시점까지의 시간(ms)
  - `%d{yyyy-MM-dd-HH:mm:ss:sss}` : %d는 date를 의미하며 중괄호에 들어간 문자열은 dateformat을 의미. 따라서 [2021-07-12 12:42:78]과 같은 날짜가 로그에 출력됨.
  - `%-4relative` : %relative는 초 아래 단위 시간(밀리초)을 나타냄. `-4`를하면 4칸의 출력폼을 고정으로 가지고 출력. 따라서 숫자에 따라 [2021-07-12 12:42:78:232] 혹은 [2021-07-12 12:42:78:2332]와 같이 표현됨
  - `%magenta()` : 괄호 안에 포함된 출력의 색상을 마젠타색으로 설정합니다.
  - `highlight()` - 로깅 레벨에 따라 괄호 안에 포함된 출력의 색상을 설정합니다(예: ERROR = 빨간색).
    <aside>
    💡 logback-access.xml 파일을 작성하면 HTTP 요청이 들어왔을 때 <b>자동으로</b> 로그를 출력할 수 있다.

    - 의존성 추가
      ```xml
      implementation 'net.rakugakibox.spring.boot:logback-access-spring-boot-starter:2.7.1'
      ```
    - `%fullRequest` : 들어온 HTTP 요청
      - 출력 예시
        ```xml
        ###### HTTP Request ######
        GET / HTTP/1.1
        host: localhost:8080
        connection: keep-alive
        ...생략
        ```
    - `%fullResponse` : 응답한 HTTP 응답
      - 출력 예시
        ```xml
        ###### HTTP Response ######
        HTTP/1.1 404 Not Found
        Keep-Alive: timeout=60
        Connection: keep-alive
        Vary: Origin
        Content-Length: 275
        Content-Language: ko-KR
        Date: Tue, 23 May 2023 13:16:22 GMT
        Content-Type: text/html;charset=UTF-8
        ```
    - logback-access.xml
      ```xml
      <configuration>
          <appender name="STDOUT" class="ch.qos.logback.core.ConsoleAppender">
              <encoder>
                  <pattern>%n###### HTTP Request ######%n%fullRequest%n###### HTTP Response ######%n%fullResponse%n%n</pattern>
              </encoder>
          </appender>
          <appender-ref ref="STDOUT" />
      </configuration>
      ```

    </aside>

- pattern 적용 예시

  사용한 패턴 : `"%d{yyyy-MM-dd HH:mm:ss.SSS} %magenta([%thread]) %highlight([%-3level]) %logger{5} - %msg %n"`

  ```java
  2023-05-25 11:53:38.478 [http-nio-8080-exec-1] [DEBUG] o.s.j.c.JdbcTemplate - Executing prepared SQL query
  ```

### Extra(XML 기준)

- `<springProfile>` : logback 설정 파일에서 복수 개의 Profile을 설정할 수 있게 하는 속성.

  - 예시 코드 : 실행 환경이 prod가 아닌 경우 `ConsoleAppender`를 사용한다.

    ```xml
    <springProfile name="!prod">
            <appender name="CONSOLE" class="ch.qos.logback.core.ConsoleAppender">
                <encoder>
                    <pattern>${LOG_PATTERN}</pattern>
                </encoder>
            </appender>

            <root level="INFO">
                <appender-ref ref="CONSOLE"/>
            </root>
    </springProfile>

    <springProfile name="local">
            <property resource="logback-local.properties"/>
    </springProfile>
    ```

- `<Filter>` : 로그에 대한 필터링이 필요한 경우 사용하는 속성

  - 예시 코드 : 레벨 필터를 추가하여 level이 `error`인 것만 로그로 남게 한다.

    ```xml
    <configuration>
      <appender name="STDOUT" class="ch.qos.logback.core.ConsoleAppender">
        <encoder>
          <pattern>%-4relative [%thread] %-5level %logger{35} - %msg %n</pattern>
        </encoder>
            <filter class="ch.qos.logback.classic.filter.LevelFilter">
            <level>ERROR</level>
            <onMatch>ACCEPT</onMatch>
            <onMismatch>DENY</onMismatch>
        </filter>
      </appender>

      <root level="DEBUG">
        <appender-ref ref="STDOUT" />
      </root>
    </configuration>
    ```

## 알아보기

---

Logback을 사용해 로깅을 수행하기 위해서 필요한 주요 설정 요소로 다음 3가지가 있다.

- `Appender` : **어디에** 출력할지에 대해 기술(console, file, db appender)
- `Logger` : **로그의 주체**. 로그의 메세지 전달, 특정 패키지 안의 특정 레벨 이상인 것에 대해 출력
- `Layout(Encoder)` : **어떻게** 출력할지에 대해 기술

### Appender

어디에 어떤 포맷으로 로그를 남길지 설정하는 부분이다.

- Appender 종류
  | Appender | 설명 |
  | ------------------- | ------------------------------------------------------------------------------------------------------------------ |
  | ConsoleAppender | 콘솔에 로그를 어떤 포맷으로 남길지 설정할 수 있다 |
  | FileAppender | 파일에 로그를 어떤 포맷으로 남길지 설정할 수 있다 |
  | RollingFileAppender | 로그의 양이 많아지면 하나의 파일로 관리하기 어렵다. 이러한 문제 때문에 하루 단위로 로그 파일을 관리할 때 설정한다. |

위와 같은 Appender 구현체에는 출력하고 싶은 포맷(Log Pattern)을 적는데, 보통 **날짜와 시간, 로그의 레벨**을 기록한다.

<aside>
💡 RollingFileAppender의 rollingPolicy 옵션으로 파일이 언제 백업될지 설정할 수 있다. 하루 단위 로그 파일이 maxHistory 옵션의 개수만큼 생성되고 해당 개수를 초과하면 이전 로그 파일은 삭제된다.

</aside>

### Logger

: 실제 로깅을 수행하는 객체로, 각 Logger마다 name 값을 통해 구분한다.

- 최상위 로거인 Root Logger를 설정하면 이를 계층적으로 어떤 패키지 이하의 클래스에서는 어떤 레벨 이상의 로그만 출력할지 설정할 수 있다.
- class에서 로그를 출력하는데 사용되는 logger가 존재하지 않을 경우 부모 로거를 찾는다.
- Level 속성을 통해 어떤 레벨의 로그를 출력할지를 설정할 수 있다.
- 지정된 레벨 이하의 메서드는 로깅되지 않는다.(기본 설정된 레벨은 DEBUG)
  > TRACE < DEBUG < INFO < WARN < ERROR
  >
  > ex) INFO 레벨로 지정한 로거는 INFO, WARN, ERROR 로그만 기록하게 된다.
- 사용법

  - LoggerFactory 클래스에서 로거 객체를 불러온 후, 로거 객체를 이용해 코드의 원하는 부분에 상황에 맞는 레벨의 로그를 작성해주면 된다.

  ```java
  package lab;

  import org.slf4j.Logger;
  import org.slf4j.LoggerFactory;

  public class LabApplication {
      public static void main(String[] args) {
          Logger logger = LoggerFactory.getLogger(LabApplication.class);

          for (int count = 1; count <= 10; count++) {
              logger.trace("trace 로깅이야!!! {}", count);
              logger.debug("debug 로깅이야!!! {}", count);
              logger.info("info 로깅이야!!! {}", count);
              logger.warn("warn 로깅이야!!! {}", count);
              logger.error("error 로깅이야!!! {}", count);
          }
      }
  }
  ```

### Encoder(Layout)

로그 이벤트를 byte[]로 변환하고 해당 바이트 배열을 Output Stream에 쓰는 역할을 담당한다.

즉, Appender에 포함되어 로그 메세지를 사용자가 지정한 포맷으로 변환한다.

## 설정하기

---

### Configure 파일에서 설정하기

Logging 관련 설정을 위해 xml 파일로 설정하는 방법과 java code로 설정하는 방법이 있다.

1. xml 방식

   src/main/resources 하단에 xml 파일을 생성하여 Logback을 설정할 수 있다. xml 파일의 이름은 `logback.xml` 으로 해도 되고 `logback-spring.xml`을 사용할 수도 있는데, Spring boot에서는 `logback.xml`로 설정하면 스프링 부트 설정 전에 로그백이 설정되기 때문에 제어하기가 어렵다.

   그래서 `logback-spring.xml`으로 사용하기를 권장한다.

    <br>
    
   **[예제 코드1]**

   ```xml
   <configuration scan="true" scanPeriod="30 seconds">
       <appender name="console" class="ch.qos.logback.core.ConsoleAppender">
   	    <encoder class="ch.qos.logback.classic.encoder.PatternLayoutEncoder">
   	        <pattern>[%d{HH:mm:ss.SSS}][%-5level][%logger{36}.%method:line%line] - %msg%n</pattern>
   	    </encoder>
       </appender>
       <logger name="org.springframework" level="info" additivity="false">
   	    <appender-ref ref="console" />
       </logger>
   </configuration>
   ```

   간단한 예시이다.

   `<appender>`을 통해 console에 로그를 출력할 것을 설정하고,

   `<encoder>`를 통해 출력할 로그의 패턴을 지정해주었다.

   `<logger>`를 통해 info level 이상의 log를 console에 출력할 것이라고 설정하였다.

    <br>

   **[예제 코드2]**

   ```xml
   <?xml version="1.0" encoding="UTF-8" ?>
   <configuration>
       <conversionRule conversionWord="clr" converterClass="org.springframework.boot.logging.logback.ColorConverter" />

       <springProperty name="SLACK_WEBHOOK_URI" source="logging.slack.webhook-uri"/>
       <appender name="SLACK" class="com.github.maricn.logback.SlackAppender">
           <webhookUri>${SLACK_WEBHOOK_URI}</webhookUri>
           <layout class="ch.qos.logback.classic.PatternLayout">
               <pattern>%d{yyyy-MM-dd HH:mm:ss.SSS} %msg %n</pattern>
           </layout>
           <username>Sslc-Server-log</username>
           <iconEmoji>:stuck_out_tongue_winking_eye:</iconEmoji>
           <colorCoding>true</colorCoding>
       </appender>

       <!-- Console appender 설정 -->
       <appender name="Console" class="ch.qos.logback.core.ConsoleAppender">
           <encoder>
               <Pattern>%d %-5level %logger{35} - %msg%n</Pattern>
           </encoder>
       </appender>

       <appender name="ASYNC_SLACK" class="ch.qos.logback.classic.AsyncAppender">
           <appender-ref ref="SLACK"/>
           <filter class="ch.qos.logback.classic.filter.ThresholdFilter">
               <level>ERROR</level>
           </filter>
       </appender>

       <root level="INFO">
           <appender-ref ref="Console"/>
           <appender-ref ref="ASYNC_SLACK"/>
       </root>
   </configuration>
   ```

   크게 콘솔 로그 패턴을 설정하는 부분과 slack-appender 라이브러리를 사용해 슬랙으로 에러 로그만 필터링해서 보내기 위한 설정 부분으로 나뉘어져 있다.

    <br>
    
   **[예제 코드 3]**

   HTTP 요청/응답에 대한 로깅을 위해 `logback-access.xml`을 다음과 같이 작성하면, 콘솔에 HTTP 요청/응답이 출력되고 `targt/http-access.log` 파일에 요청/응답과 처리된 시간을 기록한다.(rollingPolicy는 아직 어떻게 동작하는 건지 잘 모르겠다.)

   ```xml
   <configuration>
     <property name="LOG_DIR" value="./target"/>
     <property name="LOG_PATH_NAME" value="${LOG_DIR}/http-access.log"/>

     <appender name="FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
       <file>${LOG_PATH_NAME}</file>
       <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
         <fileNamePattern>${LOG_PATH_NAME}.%d{yyyyMMdd}</fileNamePattern>
         <maxHistory>1</maxHistory> <!-- 보관기간(개월) -->
       </rollingPolicy>
       <encoder>
         <pattern>%t{yyyy-MM-dd HH:mm:ss}\t%a\t%r\t%s\t%i{Referer}\t%i{User-Agent}\t%D\t%I
           %fullRequest%n%fullResponse
         </pattern>
       </encoder>
     </appender>

     <appender name="STDOUT" class="ch.qos.logback.core.ConsoleAppender">
       <encoder>
         <pattern>%n###### HTTP Request ######%n%fullRequest%n###### HTTP Response
           ######%n%fullResponse%n%n
         </pattern>
       </encoder>
     </appender>

     <appender-ref ref="FILE"/>
     <appender-ref ref="STDOUT"/>
   </configuration>
   ```

2. 자바 코드 방식

   - console Appender로 콘솔 로그 패턴 지정하기

     ```java
     @Configuration
     public class LogBackConfig {

         // 공통 필드, 어펜더 별 설정을 달리 할 경우 지역변수로 변경 하면 됨
         private final LoggerContext logCtx = (LoggerContext) LoggerFactory.getILoggerFactory();

         private final String pattern = "%d{yyyy-MM-dd HH:mm:ss.SSS} %magenta([%thread]) %highlight([%-3level]) %logger{5} - %msg %n";

         // 어펜더 목록, 다른 어펜더가 필요할 경우 추가하면 됨
         private ConsoleAppender<ILoggingEvent> consoleAppender;

         @Bean
         public void logConfig() {
             consoleAppender = getLogConsoleAppender();
             createLoggers();
         }

         private void createLogger(String loggerName, Level logLevel, Boolean additive) {
             Logger logger = logCtx.getLogger(loggerName);

             logger.setAdditive(additive);
             logger.setLevel(logLevel);
             logger.addAppender(consoleAppender);
         }

         private void createLoggers() {
             // 로거 이름, 로깅 레벨, 상위 로깅 설정 상속 여부 설정
             createLogger("root", INFO, true);
             createLogger("jdbc", OFF, false);
             createLogger("jdbc.sqlonly", DEBUG, false);
             createLogger("jdbc.sqltiming", DEBUG, false);
             createLogger("{패키지 경로}", INFO, false);
             createLogger("{패키지 경로}.*.controller", DEBUG, false);
             createLogger("{패키지 경로}.*.service", WARN, false);
             createLogger("{패키지 경로}.*.repository", INFO, false);
             createLogger("{패키지 경로}.*.security", DEBUG, false);
         }

         /**
          * 콘솔 로그 어펜더 생성
          * @return 콘솔 로그 어펜더
          */
         private ConsoleAppender<ILoggingEvent> getLogConsoleAppender() {
             final String appenderName = "STDOUT";

             PatternLayoutEncoder consoleLogEncoder = createLogEncoder(pattern);
             return createLogConsoleAppender(appenderName, consoleLogEncoder);
         }

         private PatternLayoutEncoder createLogEncoder(String pattern) {
             PatternLayoutEncoder encoder = new PatternLayoutEncoder();
             encoder.setContext(logCtx);
             encoder.setPattern(pattern);
             encoder.start();
             return encoder;
         }

         private ConsoleAppender<ILoggingEvent> createLogConsoleAppender(String appenderName, PatternLayoutEncoder consoleLogEncoder) {
             ConsoleAppender<ILoggingEvent> logConsoleAppender = new ConsoleAppender<>();
             logConsoleAppender.setName(appenderName);
             logConsoleAppender.setContext(logCtx);
             logConsoleAppender.setEncoder(consoleLogEncoder);
             logConsoleAppender.start();
             return logConsoleAppender;
         }
     }
     ```

     @Configuration 설정 클래스를 생성해주고, logger에 로깅 레벨을 지정한 뒤 인코더에 로깅 패턴을 지정해주고 빈으로 등록한다.
     `createLogger("root", INFO, true);`
     root 로거를 상속받았기 때문에 spring boot에서 기본적으로 출력하는 로그를 그대로 출력한다.

   - Rolling Appender
     이 로그들을 RollingAppender를 통해 일 단위로 로그 파일로 저장해보자.
     (추후 작성 예정)

### 사용하기

- 로그 출력하기
  로그를 출력하고자 하는 코드에 직접 Logger 객체를 불러온 뒤, 다음과 같이 로깅 메서드를 호출하면 로그를 출력할 수 있다.

```java
package lab;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class LabApplication {
    public static void main(String[] args) {
        Logger logger = LoggerFactory.getLogger(LabApplication.class);

        for (int count = 1; count <= 10; count++) {
            logger.trace("trace 로깅이야!!! {}", count);
            logger.debug("debug 로깅이야!!! {}", count);
            logger.info("info 로깅이야!!! {}", count);
            logger.warn("warn 로깅이야!!! {}", count);
            logger.error("error 로깅이야!!! {}", count);
        }
    }
}
```

<aside>
⚠️ 문자열을 연결하기 위해 ‘+’를 사용하면 문자열 연산으로 인해 성능이 악화될 수 있다.

</aside>

## Lombok 사용하기(@Slf4j)

lombok에서 제공하는 `@Slf4j` 어노테이션을 사용하면 더 간편하게 로깅을 할 수 있다.

로깅을 하고 싶은 클래스/메서드에 어노테이션을 붙여주면 로거를 불러오지 않아도 log 변수를 사용해 바로 로깅 메서드를 호출할 수 있다.

```java
@Controller
@Slf4j
public class TestController {
    @GetMapping("/")
    public String String(String str){
        try {
            str.toString();
        } catch (NullPointerException e){
            log.trace("가장 디테일한 로그");
            log.warn("경고");
            log.info("정보성 로그");
            log.debug("디버깅용 로그");
            log.error("에러",e);
        }
        return "test";
    }
}
```

## 참고 자료

---

[Logback 사용하기 -1-](https://velog.io/@ssol_916/Logback)

[[Logging] Logback이란?](https://livenow14.tistory.com/64)

[Logback 이란? 설정방법 및 사용방법](https://oingdaddy.tistory.com/78)
