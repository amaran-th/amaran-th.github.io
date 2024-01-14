---
title: "[Test] Test Fixture"
date: "2024-01-14T14:14:03.284Z"
description: "Test Fixture의 개념과 활용 사례"
section: "지식 공유" 
category: "Java"
tags:
  - Java
  - Test
  - JUnit5
---

### 📌 Test Fixture란?

> 중복적으로 수행하는 행위를 **고정**시켜 한 곳에서 관리하는 개념

<aside> 

💡 Test Fixture는 어떤 한 가지 방법을 가리키는 것이 아니라 **개념**에 해당하기 때문에, Fixture를 구성하는 방법은 다양하게 나올 수 있다.

</aside>

### 🙌 Test Fixture 메서드 사용

Test Fixture를 구성하는 대표적인 사례는, JUnit에서 제공하는 메서드를 사용하는 방법이다.

```java
private Money f12CHF_fixture;
private Money f14CHF_fixture;
private Money f28USD_fixture;

@BeforeAll
public void setUp() {
    f12CHF_fixture= new Money(12, "CHF");
    f14CHF_fixture= new Money(14, "CHF");
    f28USD_fixture= new Money(28, "USD");
}
```

`@BeforeAll`, `@AfterAll`, `@BeforeEach`, `@AfterEach`를 사용해 여러 메서드에서 공통적으로 수행되는 작업을 한 곳에서 관리할 수 있다.

### 🌱 별도 파일에 Fixture 객체를 모아두기

내가 참여했던 프로젝트(Kerdy)에서는 동일한 정보를 가진 객체를 여러 테스트 클래스에서 참조하는 경우가 있었는데, 서비스의 핵심 도메인이었던 Event, Member가 바로 그런 케이스였다.

이들의 생성자 매개변수가 많아질수록 객체를 생성하는 코드는 길어졌고, 테스트 코드의 가독성이 떨어지는 문제가 발생했다.

아래는 Event 객체의 생성 코드이다. 생성자 파라미터가 11개나 되는 바람에 단순히 생성자를 호출하는 코드일 뿐인데도 많은 코드 줄을 차지했다.
```java
final Event event = new Event(
        "인프콘 2023",
        "코엑스",
        LocalDateTime.of(2023, 8, 15, 15, 0),
        LocalDateTime.of(2023, 8, 15, 15, 0),
        LocalDateTime.of(2023, 8, 15, 15, 0),
        LocalDateTime.of(2023, 8, 15, 15, 0),
        "<http://infcon.com>",
        EventType.CONFERENCE,
        PaymentType.PAID,
        EventMode.OFFLINE,
        "인프런"
);
```

이러한 객체를 여러 테스트 클래스에서 일일이 생성하는 경우 수많은 중복 코드가 발생했고 이는 코드 가독성을 해치는 원인이 되었다.

또한, 객체의 명세가 변경되는 경우엔 객체를 사용하는 모든 테스트 클래스를 찾아 생성 코드를 일일이 수정해주어야 한다는 단점도 있었다.

그래서 우리는 이 객체를 각각의 테스트 클래스에서 일일이 생성하지 않고, 별도의 Fixture 클래스를 만들어 이러한 객체들을 하나의 클래스 파일에서 관리할 수 있도록 하였다.

```java
public class EventFixture {

  public static Event 인프콘_2023() {
    return new Event("인프콘 2023", "코엑스", LocalDateTime.parse("2023-06-01T12:00:00"),
        LocalDateTime.parse("2023-09-01T12:00:00"), LocalDateTime.parse("2023-05-01T12:00:00"),
        LocalDateTime.parse("2023-06-01T12:00:00"), "<https://~~~>", EventType.CONFERENCE,
        PaymentType.FREE_PAID, EventMode.ON_OFFLINE, "인프런"
    );
  }

  public static Event AI_컨퍼런스() {
    return new Event("AI 컨퍼런스", "코엑스", LocalDateTime.parse("2023-07-22T12:00:00"),
        LocalDateTime.parse("2023-07-30T12:00:00"), LocalDateTime.parse("2023-07-01T12:00:00"),
        LocalDateTime.parse("2023-07-22T12:00:00"), "<https://~~~>", EventType.CONFERENCE,
        PaymentType.FREE_PAID, EventMode.ON_OFFLINE, "행사기관"
    );
  }

  public static Event 모바일_컨퍼런스() {
    return new Event("모바일 컨퍼런스", "코엑스", LocalDateTime.parse("2023-08-03T12:00:00"),
        LocalDateTime.parse("2023-09-03T12:00:00"), LocalDateTime.parse("2023-08-01T12:00:00"),
        LocalDateTime.parse("2023-08-02T12:00:00"), "<https://~~~>", EventType.CONFERENCE,
        PaymentType.FREE_PAID, EventMode.ON_OFFLINE, "행사기관"
    );
  }

  ...
}
```

이렇게 하면, 해당 Fixture 객체를 필요로 하는 테스트 클래스에서는 단순히 해당 Fixture 객체를 참조하기만 하면 되었다.

```java
class EventCommandServiceTest extends ServiceIntegrationTestHelper {

		@BeforeEach
		void init() {
		    final Event 인프콘_2023 = eventRepository.save(인프콘_2023());
		    final Event AI_컨퍼런스 = eventRepository.save(AI_컨퍼런스());
		    final Event 모바일_컨퍼런스 = eventRepository.save(모바일_컨퍼런스());
				...
		}
		...
}
```

요약하면 이 방법은 여러 테스트 클래스에서 공통적으로 사용되는 객체의 **생성 코드**를 별도의 파일에 모아두는 방식이라고 할 수 있겠다.

이 방식의 장점을 정리해보면 다음과 같다.

1. 테스트에서 사용하는 객체들의 **관리 포인트를 하나로 줄일 수 있다**.
2. 테스트 코드에서 복잡한 객체 생성 코드를 작성하지 않아도 되므로 **테스트 코드의 가독성이 향상**된다.

이 방식을 적용할 때 주의할 점은 다음과 같이 정리할 수 있겠다.

1. 여럿이서 협업하는 경우, 사전에 Fixture 생성과 관리에 대한 논의가 이루어지지 않을 경우 테스트 코드에 중복 코드가 남아있거나 여러 개의 동일한 Fixture 객체가 만들어질 수 있다. 즉, **의사소통 비용이 증가**한다.
2. 만약 적절한 기준을 정하지 않고 모든 테스트 객체를 Fixture 객체로 만들 경우, 오히려 코드가 방대해지고 이해하기 어려워질 수가 있다. 때문에 재사용성이 높고, 생성 코드가 복잡한 객체 위주로 Fixture를 구성하는 것이 좋다.

## 참고 게시글

---
[Test Fixture 에 대해서](https://velog.io/@pood/Test-Fixture-%EC%97%90-%EB%8C%80%ED%95%B4%EC%84%9C)