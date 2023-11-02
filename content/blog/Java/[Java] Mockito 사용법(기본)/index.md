---
title: "[Java] Mockito 사용법(기본)"
date: "2023-04-23T21:42:03.284Z"
description: Java 프레임워크 Mockito를 사용하는 법을 알아보자.
section: "지식 공유" 
category: "Java"
tags:
  - 우아한 테크코스
  - 테스트
  - Java
  - String
---

💡지난 기술부채 포스팅에 있는 [Test Double](https://amaran-th.github.io/%EC%9A%B0%ED%85%8C%EC%BD%94%205%EA%B8%B0/[%EA%B8%B0%EC%88%A0%EB%B6%80%EC%B1%84]%20%EC%9A%B0%ED%85%8C%EC%BD%94%205%EA%B8%B0%20%EB%A0%88%EB%B2%A81%20-%208%EC%A3%BC%EC%B0%A8/#%ED%85%8C%EC%8A%A4%ED%8A%B8-%EB%8D%94%EB%B8%94)에 대한 정리 내용을 참고하면 도움이 될 듯 하다.

## Mockito란?

---

: Mock 객체를 쉽게 만들고 관리하고 검증할 수 있는 방법을 제공해주는 프레임워크

- `Stub` : 인터페이스or기본 클래스가 **최소한으로 구현**되어 있는 상태의 객체(상태 기반 테스트)
  - 테스트 코드에서 Mock 객체를 사용할 때 Mock의 특정 메서드를 정의하는 행위를 Stubbing한다고 한다.
- `Spy` : 실제 객체처럼 동작하면서 객체의 메서드 호출 정보를 저장하거나 사용자가 정의한 로직을 수행한다.(행위 기반 테스트)
- `Mock` : 사용자가 정의한 대로 동작하도록 프로그래밍된 객체(행위 기반 테스트)

  ⚠️실제 객체에서 부분적으로만 Stub으로서 기능하는 Spy와 달리 Mock은 가짜 오브젝트이기 때문에 사용하고자 하는 메서드를 모두 직접 구현해주어야 한다.

### Mockito를 사용하는 이유

- 애플리케이션에서 구현하지 않은 메서드를 테스트하려고 할 때, 해당 클래스가 어떻게 동작하는지 미리 생각하고 계산하며 테스트를 작성해야 한다면 매우 불편할 것이다.
- 이럴 때 미리 Mock 객체를 생성해서 사용하면 조금 더 편하게 테스트할 수 있다.
- **개발자가 컨트롤하기 힘든 부분**이나 **아직 구현되지 않은 클래스**를 사용해야 할 때 사용하는 것이 좋다.

### Mockito 의존성 추가

[Maven Repository: org.mockito » mockito-core » 2.1.0](https://mvnrepository.com/artifact/org.mockito/mockito-core/2.1.0)

gradle 파일의 dependency 단락에 다음 라인을 추가해준다.

```xml
testImplementation 'org.mockito:mockito-junit-jupiter:5.2.0'
```

⚠️스프링 부트 2.2+ 버전으로 프로젝트를 생성할 경우 자동으로 Mockito 의존성이 추가된다.

## Mockito 문법 사용하기

---

### Mock 만들기

- `@Mock` 어노테이션을 사용하는 방법
  ```java
  @Mock
  ArrayList<String> mockedList;
  ```
- 직접 선언하는 방법
  ```java
  ArrayList<String> mockedList = mock(List.class);
  ```

### Spy 만들기

- `@Spy` 어노테이션을 사용하는 방법
  ```java
  @Spy
  ArrayList<String> spyList;
  ```
- 직접 선언하는 방법
  ```java
  ArrayList<String> spyList = Mockito.spy(List.class);
  ```

### @InjectMock

해당 객체의 멤버 변수로 존재하는 의존된 다른 객체들이 mock혹은 spy로 생성된 객체라면 의존성 주입을 해준다.

다음과 같이 Car 클래스 객체가 Name이라는 객체를 컴포지션 관계로 가지고 있다.

```java
public class Car {

    private final Name name;

    public Car(Name name) {
        this.name = name;
    }

    public boolean checkCar(String name) {
        return this.name.isEqualsName(name);
    }

}
```

```java
public class Name {

    private final String name;

    public Name(String name) {
        this.name = name;
    }

    public boolean isEqualsName(String name) {
        return this.name.equals(name);
    }

}
```

- `@InjectMocks` 어노테이션을 사용하지 않는 경우

  - Mock 객체를 직접 생성자에 넣어 Mock 객체가 주입된 Car 객체를 만들어야 한다.

    ```java
    @Mock
    private Name name;

    @DisplayName("InjectMocks를 사용하지 않고 Mock 의존성을 주입받는 방법")
    @Test
    void non_inject_mocks() {
        // given
        final Car car = new Car(name);

        // when
        Mockito.when(car.checkCar("hyundai")).thenReturn(true);

        // then
        Assertions.assertThat(car.checkCar("hyundai")).isTrue();
        Assertions.assertThat(car.checkCar("kia")).isFalse();
    }
    ```

- `@InjectMocks` 어노테이션을 사용한 경우

  - Car를 생성할 때 의존성을 주입하지 않아도 Mock 또는 Spy로 생성된 객체를 주입해준다.

  ```java
  @Mock
  private Name name;

  @InjectMocks
  private Car car;

  @DisplayName("InjectMocks를 사용해서 Mock 의존성을 주입받는 방법")
  @Test
  void inject_mocks() {
      // when
      Mockito.when(car.checkCar("hyundai")).thenReturn(true);

      // then
      Assertions.assertThat(car.checkCar("hyundai")).isTrue();
      Assertions.assertThat(car.checkCar("kia")).isFalse();
  }
  ```

### Verify

테스트하고자 하는 메서드가 의도한 대로 동작하는지 검증하는 것을 말한다. (행위 검증)

- 메서드가 호출된 횟수 검증

1. mockedList 객체에 대해 add(”a”)가 2번 호출되었는지 검증

   ```java
   verify(mockedList, times(2)).add("a");
   ```

2. mockedList 객체에 대해 add(1)이 한 번도 호출되지 않았는지 검증

   ```java
   verify(mockedList, never()).get(1);
   ```

3. mockedList 객체에 대해 add(”a”)가 최소 한 번은 호출되었는지 검증

   ```java
   verify(mockedList, atLeastOnce()).add("a");
   ```

4. mockedList 객체에 대해 add(”a”)가 최소 N 번은 호출되었는지 검증

   ```java
   verify(mockedList, atLeast(3)).add("a");
   ```

### When-Then

mock 객체의 메서드를 원하는 방식으로 정의(stubbing)할 수 있다.

```java
when(mock객체.메서드(파라미터)).thenReturn(반환값);
```

위와 같이 작성해주면, `mock 객체`에 대해 `파라미터` 값을 넣고 `메서드`를 호출해주면 반환값을 반환한다.

<aside>
💡 만약 파라미터 값을 특정하지 않고 임의의 값에 대해 처리해주고 싶을 경우 파라미터 자리에 다음과 같은 값을 입력할 수 있다.

```java
anyInt()         //임의의 Integer 정수
anyString()      //임의의 문자열
anyLong()        //임의의 Long
any()            //임의의 객체
any(Car.class)   //임의의 Car 객체
```

</aside>

- 예제

  listMock 객체에 대해 `get(1)` 또는 `get(2)`…등등 임의의 정수 값을 넣어 메서드를 호출하면 STUB_RETURN_VALUE로 선언한 값이 반환된다.

  ```java
  @Test
  @DisplayName("반환값이 존재하는 메서드를 stubbing - when_thenReturn")
  void whenConfigNonVoidReturnMethodStub1() {
      List<Integer> listMock = mock(List.class);
      when(listMock.get(anyInt())).thenReturn(STUB_RETURN_VALUE);

      final Integer getValue = listMock.get(SECURE_RANDOM.nextInt());
      assertThat(getValue)
              .isEqualTo(STUB_RETURN_VALUE);
  }
  ```

## 참고 자료

---

[Mockito](https://github.com/woowacourse/prolog/wiki/Mockito)
