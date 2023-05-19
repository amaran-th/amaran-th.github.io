---
title: "[Mockito] verify()로 행위 검증하기"
date: "2023-05-19T21:46:03.284Z"
description: "verify() 메소드를 활용해 mock 객체의 행위(메서드 동작)를 검증해보자"
category: "Java"
tags:
  - 우아한 테크코스
  - Java
  - Mockito
---

`verify()` : mock 객체에 대해 원하는 메서드가 특정 조건으로 실행되었는지 여부를 검증할 수 있다.

- 시그니쳐
  ```java
  verify(T mock, VerificationMode mode)
  ```
  - mock: 행위를 검증하고자 하는 mock 객체
  - mode: 검증할 값을 정의하는 메소드. 옵션이다.

### 기본

메서드가 호출 되었는지 호출되지 않았는지 검증

```java
// mock 객체
List mockedList = mock(List.class);

...

verify(mockedList).add("one");    //mockedList에 대해 .add("one")이 호출되었는지 검증
verify(mockedList).clear();       //mockedList에 대해 .clear()이 호출되었는지 검증
```

<aside>
💡 매개변수를 요구하는 메서드의 경우, 어떤 매개변수가 오든 검증하고 싶다면 when() 메서드에서와 같이 파라미터로 any() 또는 anyString(), anyLong(), … 등을 넘겨주면 된다.

```java
verify(mockedList).add(anyString());
```

</aside>

### 횟수 검증

: `verify()`의 매개변수(옵션)로 다음과 같은 메서드를 넣어주면 된다

- `time(int n)` : 호출 횟수 검증
- `atLeastOnce()` : 최소 한번 이상 호출되었는지
- `atLeast(int n)` : 최소 n번 이상 호출되었는지
- `atMost(int n)` : 최대 n번 이하로 호출되었는지
- `never()` : 호출되지 않았는지 여부

```java
// add()가 최소한 1번 이상 호출되었는지 검증
verify(testMock, atLeastOnce()).add(anyString());

// add()가 최소한 3번 이상 호출되었는지 검증
verify(testMock, atLeast(3)).add(anyString());

// add()가 최대한 3번 이하 호출되었는지 검증
verify(testMock, atMost(3)).add(anyString());

// add()가 3번 호출되었는지 검증
verify(testMock, times(3)).add(anyString());

verify(testMock, times(1)).add("1"); // add("1")가 1번 호출되었는지 검증

verify(testMock, times(1)).add("2"); // add("2")가 1번 호출되었는지 검증

verify(testMock, times(1)).add("3"); // add("3")가 1번 호출되었는지 검증

verify(testMock, never()).add("4");  // add("4")가 수행되지 않았는지를 검증
```

### 순서 검증

InOrder 객체를 inOrder(”mock 객체명”)으로 생성한 후, 검증하고 싶은 순서에 맞게 verify()를 작성해주면 된다.

```java
InOrder inOrder = inOrder(testMock); //mock 메서드를 호출하는 순서와 다르게 verify를 정의하면 오류가 발생한다.

inOrder.verify(testMock).add("1");
inOrder.verify(testMock).add("2");
inOrder.verify(testMock).add("3");
```

위와 같이 코드를 작성했을 때, 아래와 같은 순서로 메서드를 호출하면 검증이 실패한다.

```java
testMock.add("1");
testMock.add("3");
testMock.add("2");
```

- InOrder를 사용할 경우, 옵션으로 `calls()` 메서드를 줄 수 있다.
  ```java
  inOrder.verify(testMock, calls(2)).add("1");
  inOrder.verify(testMock).add("2");
  ```
  아래와 같은 순서로 실행되지 않는다면 검증이 실패한다.
  ```java
  testMock.add("1");
  testMock.add("1");
  testMock.add("2");
  ```
- `verifyNoMoreInteractions(T mock)` : 선언한 verify 후 해당 mock을 실행하면 검증이 실패한다.
  ```java
  InOrder inOrder = inOrder(userService);
  inOrder.verify(userService).getUser();
  verifyNoMoreInteractions(userService); //앞의 verify 이후 userService의 메서드를 더 호출하면 fail
  ```
- `verifyNoInteractions(T mock)` : 테스트 내에서 mock을 실행하면 검증이 실패한다.
  ```java
  verifyNoMoreInteractions(userService); //userService의 메서드를 호출하면 fail
  ```
  여러 mock 객체가 존재하고, 그 중의 특정 객체들에 대해서만 메서드가 호출될 때 호출되지 않는 다른 mock 객체에 대해 검증하기 위해 사용한다.

### 그 외 옵션들

- `only()` : 해당 검증 메서드만 실행됐는지 검증
- `timeout(long mills)` : n ms 이상 걸리면 검증이 실패하고 바로 검증이 종료된다.
- `after(long mills)` : n ms 이상 걸리는지 확인. timeout과 달리 시간이 지나도 검증이 종료되지 않는다.
- `description` : 실패할 경우 나올 문구를 설정할 수 있다.

### 참고 자료

[[java]Mockito 기본 설명](https://softarchitecture.tistory.com/64)
