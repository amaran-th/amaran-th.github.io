---
title: "[Spring] Spring DTO의 데이터 바인딩과 직렬화"
date: "2023-12-04T18:55:03.284Z"
description: "데이터 바인딩&직렬화 관련 기술부채 모음"
section: "지식 공유" 
category: "Spring"
tags:
  - 기술 부채
  - Spring
---

# 서론
---
커디 프로젝트의 코드리뷰를 진행하다 Json 직렬화/역직렬화 과정과 관련하여 새롭게 알게 된 개념이 좀 있었습니다. 그 개념들을 머릿속에 정리하고 기록으로 남기고자 글을 작성합니다.

기술부채 모음이어서 소제목 간 큰 흐름이 있지는 않습니다.

# 기술부채
---
## 데이터 바인딩과 직렬화
여러 자료를 찾아보다 보니 데이터 바인딩과 직렬화의 개념이 헷갈려서 한 번 개념을 확실히 짚고 넘어가기로 했습니다.

데이터 바인딩은 어떤 데이터의 값을 다른 형식의 데이터로 매핑하는 프로세스입니다. 스프링 MVC와 같은 웹 프레임워크의 맥락에서 봤을 때 데이터 바인딩은 HTTP 요청의 Parameter, Body 데이터를 Java **객체**로 변환하는 프로세스를 의미합니다.

직렬화는 객체를 Json, Xml과 같이 쉽게 전송할 수 있는 형식의 데이터로 변환하는 프로세스를 의미합니다. 역직렬화는 그 반대 프로세스를 의미합니다.

### 데이터 바인딩 == 역직렬화?
우리가 늘 작성하는 코드로 생각을 했을 때, `@RequestBody`로 받은 데이터가 DTO 객체에 매핑되는 것은 데이터 바인딩이 이루어진 결과라고 할 수도 있고, 역직렬화의 결과라고 표현할 수도 있습니다.

두 개념의 차이는, 데이터바인딩이 역직렬화의 개념을 포괄하는 더 넓은 개념이라는 것입니다.

## 데이터 바인딩 과정에서 발생할 수 있는 예외의 종류
### `MethodArgumentNotValidException`
: @Valid, @Validate 바인딩 과정에서 에러가 발생한 경우

예를 들어 다음과 같은 DTO 객체와, 해당 DTO를 파라미터로 받는 API 핸들러 메서드가 있다고 합시다.
```java
@Getter
@RequiredArgsConstructor
public class TestRequest {

	@NotBlank
	private final String name;

}
```
```java
@PostMapping("/test") 
public ResponseEntity<Void> test(@RequestBody @Valid TestRequest request) {
      ...
}
```
여기서 다음과 같이 name 값을 비워서 요청을 보내면 `MethodArgumentNotValidException` 예외가 발생합니다.
```http
POST localhost:8080/test
Content-Type: application/json

{
	name : ""
}
```
###  `BindException` 
: @ModelAttribute 바인딩 과정에서 에러가 발생한 경우
### `MethodArgumentTypeMismatchException` 
: enum 타입 불일치로 인해 바인딩 에러가 발생한 경우

예를 들어 다음과 같은 enum과 이 enum 타입의 데이터를 파라미터로 받는 API 핸들러 메서드가 있다고 합시다.
```java
public enum EventType {  
  CONFERENCE,  
  COMPETITION  
}
```
```java
@GetMapping  
public ResponseEntity<List<EventResponse>> findEvents(  
    @RequestParam(required = false) final EventType category,
    ...) {  
  ... 
}
```
여기서 다음과 같이 enum 타입과 맞지 않는 데이터(CONNNNFERENCE)를 요청으로 보냈을 때 발생하는 것이 바로 `MethodArgumentTypeMismatchException`입니다.
```http
GET http://localhost:8080/events?category=CONNNNFERENCE  
Content-Type: application/json
```


[참고 게시글](https://dodop-blog.tistory.com/229)
## @DateTimeFormat과 @JsonFormat
`@DateTimeFormat`은 **Spring**에서 지원하는 어노테이션으로, LocalDate, LocalDateTime과 같은 날짜 관련 타입의 직렬화를 지원하는 어노테이션입니다.
`@JsonFormat`은 **Jackson 라이브러리**에서 지원하는 어노테이션으로, LocalDate, LocalDateTime과 같은 날짜 관련 타입의 데이터를 JSON으로 직렬화할 때의 포맷을 관리하는 어노테이션입니다.

- Request
	- @ModelAttribute - @DateTimeFormat만 사용 가능
	- @RequestParameter - @DateTimeFormat만 사용 가능
	- @RequestBody - 둘 다 사용 가능
- Response Body - @JsonFormat만 사용 가능

위에서 정리한 내용에 따르면, RequestBody를 직렬화할 때는 `@DateTimeFormat`과 `@JsonFormat`를 둘 다 사용할 수 있습니다. 여기서 만약 두 어노테이션을 같이 사용할 경우, `@JsonFormat`이 우선적으로 적용됩니다.

요약하면, GET 요청의 파라미터로 날짜 데이터를 받아올 경우 `@DateTimeFormat`을 사용해야 하고, POST 요청의 Request Body나 Response Body로 날짜 데이터를 Json으로 파싱할 하는 경우 `@JsonFormat`을 사용하면 됩니다.

[참고 게시글](https://jojoldu.tistory.com/361)
## @RequestBody, @RequestParam 어노테이션 없이 DTO 객체만을 받을 때
### GET 요청의 경우
: DTO 필드 각각을 @RequestParam으로 선언한 것과 동일하게 처리됩니다.

예를 들어 DTO와 GET 요청에 대한 API 핸들러 메서드를 다음과 같이 작성했다고 합시다.
```java
public class TestDto {
	private final String name;
	private final Integer age;
}
```
```java
@GetMapping("/example") 
public String handleGetRequest(TestDto request) { 
	// Business logic 
	return "viewName"; 
}
```
이 경우, 다음과 같은 요청을 정상적으로 바인딩합니다. 
```http
GET localhost:8080/example?name=value1&age=42

```
다르게 말하자면, 앞에서 작성한 핸들러 메서드는 다음의 메서드와 동일하게 동작합니다.
```java
@GetMapping("/example") 
public String handleGetRequest(@RequestParam final String name, @RequestParam final Integer age) { 
	// Business logic 
	return "viewName"; 
}
```
### POST나 PUT 요청의 경우
: DTO 앞에 @RequestBody을 선언해준 경우와 동일하게 동작합니다.

예를 들어 앞서 작성한 DTO를 가지고 다음과 같은 POST 메서드를 작성했다고 합시다.
```java
@PostMapping("/example") 
public void handlePostRequest(TestDto request) { 
	// Business logic 
}
```
이 경우, 다음과 같은 요청을 정상적으로 바인딩합니다. 
```http
POST localhost:8080/example

{
	name: "아마란스",
	age: "23"
}
```

## DTO 직렬화/역직렬화
Spring은 ObjectMapper라는 클래스를 사용해 Json 값을 Spring의 자바 객체로 변환합니다.

Spring이 객체를 Json 데이터로 직렬화하기 위해서는 객체에 getter(또는 setter)가 선언되어 있어야 합니다.

=>**Response Dto에 getter를 작성해야 하는 이유**

반대로 Spring이 Json 데이터를 Spring 객체로 역직렬화(바인딩)하기 위해서는 객체에 기본 생성자와 getter(또는 setter)가 선언되어 있어야 합니다.

=>**Request Dto에 getter, 기본 생성자를 작성해야 하는 이유**

하지만, 실제로는 `@RequestBody`로 역직렬화를 진행하는 경우 **기본 생성자 없이도 역직렬화가 수행**됩니다. 그 이유는 `spring-boot-starter-web` 의존성에 포함된 `jackson-module-parameter-names` 모듈의 ParameterNamesModule 클래스가 JsonCreator를 사용해 기본 생성자가 없는 객체도 역직렬화될 수 있도록 설정해주기 때문입니다.

> **RequestBody DTO의 필드가 1개인 경우**
>
> ---
> 그런데 여기서, 역직렬화하려는 대상 DTO의 필드가 1개인 경우 JSON parse error가 발생합니다. 이유는 ParameterNamesModules 클래스가 해당 DTO 객체를 생성할 때 JsonCreator의 Mode를 어떤 것으로 설정해야 할 지 알 수 없기 때문입니다.
>
> 이 문제를 해결하기 위해서는 DTO 객체에 기본 생성자를 추가하거나, 정의한 생성자에 `@JsonCreator`를 붙이면 됩니다.

[참고 게시글](https://velog.io/@hgo641/Spring%EC%97%90%EC%84%9C%EC%9D%98-%EC%A7%81%EB%A0%AC%ED%99%94JSON-parse-error-%ED%95%84%EB%93%9C%EA%B0%80-%ED%95%98%EB%82%98%EB%B0%96%EC%97%90-%EC%97%86%EB%8A%94-DTO)

## `@JsonIgnore` 어노테이션 
---
```java
public class UserResponse {

	...
	@JsonIgnore
	private final LocalDateTime createAt;
}
```
Json 직렬화 시 특정 필드를 포함시키고 싶지 않을 때 사용하는 어노테이션.
해당 어노테이션을 사용하면 DTO Response에 해당 필드가 제외됩니다.