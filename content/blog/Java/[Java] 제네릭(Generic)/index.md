---
title: "[Java] 제네릭(Generic)"
date: "2023-03-05T04:14:03.284Z"
description: 제네릭의 개념과 사용 방법에 대해 알아보자.
category: "Java"
tags:
  - 우아한 테크코스
  - Java
  - 제네릭
---

### 제네릭이란

클래스 내부에서 타입을 지정하지 않고, 외부에서 사용자가 **임의로** 타입을 지정해줄 수 있도록 하는 문법을 의미한다.

`<T>`, `<K, V>`와 같이 꺽쇠(<>)를 사용하여 특정 클래스/메서드 내에서 사용될 제네릭 타입을 선언해줄 수 있다.

제네릭 타입을 선언할 때 암묵적으로 다음 문자들이 사용된다.

| 타입  | 설명    |
| ----- | ------- |
| `<T>` | Type    |
| `<E>` | Element |
| `<K>` | Key     |
| `<V>` | Value   |
| `<N>` | Number  |

위처럼 반드시 한 글자일 필요는 없고, `<Ama>`와 같이 임의의 문자로 선언해도 문제가 없다.

+) 아래와 같이 제네릭 타입을 2개 둘 수도 있다.

```java
public class HashMap <K, V> { ... }
```

- 장점
  - 잘못된 타입이 들어올 수 있는 상황을 컴파일 단계에서 방지할 수 있다.
  - 클래스 외부에서 타입을 지정해주므로 타입을 체크하고 변환해줄 필요가 없다.⇒관리하기가 편하다.
  - 코드의 재사용성 증대

### 제네릭 클래스 & 인터페이스

```java
public class 클래스명<T> { ... }
public interface 인터페이스명<T> { ... }
```

정의문에 선언된 제네릭 타입은 중괄호 블럭`{ … }` 내에서 유효하다.

- 제네릭 클래스 사용 예시
  ```java
  클래스명<String> a = new 클래스명<String>();
  ```
  타입 파라미터로 String을 넘겨준 예시.
  ⚠️주의사항 : 타입 파라미터로 명시할 수 있는 것은 참조타입(Reference Type)이다.(int, double, char과 같은 primitive type은 올 수 없다.)

### 제네릭 메서드

메소드에 한정한 제네릭도 사용할 수 있다.

아래와 같이 메서드 반환타입 앞에 메서드 내에서 사용할 제네릭 타입을 선언한다.

```java
**<T>** T 메서드명(T param){ ... }
```

- 제네릭 메서드 사용 예시
  ```java
  객체.메서드명(3)
  ```
  타입 파라미터로 Integer를 넣어준 예시

클래스에서 지정한 제네릭 유형과 별개로 메소드에서 독립적으로 제네릭 유형을 선언하여 사용할 수 있다.

### 제한된 타입 매개변수(Bounded Type Parameter)

만약 제네릭 타입을 특정 범위 내로 좁혀서 제한하고 싶은 경우, `extends`, `super`, `?`를 사용할 수 있다.

여기서 `?` 는 **와일드카드**라고 하며 알 수 없는 타입을 의미한다.

```java
<K extends T> //T와 T의 자손 타입만 허용(상한 경계)
<K super T>   //T와 T의 조상 타입만 허용(하한 경계)
```

여기서 일반적인 제네릭 타입(예시로 `<K>`라고 하겠다) K와 ?의 차이는, K는 특정 타입으로 지정이 되지만 와일드 카드는 타입이 지정되지 않는다는 것이다.

객체 혹은 메소드를 호출할 경우 K는 지정된 타입으로 변환이 되지만 와일드 카드는 타입 참조를 할 수 없다.

특정 타입의 데이터를 조작하고자 할 때는 와일드 카드가 아니라 특정한 제네릭 인수로 지정을 해주어야 한다.

### 제네릭의 변성 특징

- 공변(covariant)
  - A가 B의 하위 타입일 때, `T<A>`가 `T<B>`의 하위 타입이면 T를 공변이라고 한다.
  - ex : 배열
- 불공변(invariant)
  - A가 B의 하위 타입일 때, `T<A>`가 `T<B>`의 하위 타입이 아니면 T를 불공변이라고 한다.
  - ex : 제네릭

```java
//Number[]는 Integer[]의 부모 타입이다.
Number[] integerArray = new Integer[]{1,2,3};
//List<Integer>와 List<Object>는 상속관계가 아니라 다른 타입이다.
List<Object> integerList = Arrays.asList(1,2,3);
```

이 불공변 특성으로 인해 발생하는 문제를 해결하기 위해 PECS라는 규칙을 만들어 적절히 upper bounded wildcard(`<? super T>`)와 lower bounded wildcard(`<? extends T>`)를 사용한다.

- PECS(Produce <-> Extends / Consumer <-> Super)
  :인자가 생산자라면 extends를 사용하고 소비자라면 supper를 사용하라.

  - 사용 예시

    ```java
    public interface SimpleList<T> {
    ...
    static <T> void copy(SimpleList**<? extends T>** fromList, SimpleList<T> toList) {
            for (int i = 0; i < fromList.size(); i++) {
                toList.add(0, fromList.get(i));
            }
        }
    ---
    ```

    ```java
    final var laserPrinter = new LaserPrinter();
    final SimpleList<Printer> printers = new SimpleArrayList<Printer>();
    final SimpleList<LaserPrinter> laserPrinters = new SimpleArrayList<LaserPrinter>(laserPrinter);

    SimpleList.copy(laserPrinters, printers);
    ```

    fromList의 내용을 조회하여 저장할 데이터를 **생산**한 후 dest에 **소비**해야 한다.
    즉, fromList는 생산자인 `<? extends T>`를 사용해야 한다.

<nav>

참고한 게시글

- [https://st-lab.tistory.com/153](https://st-lab.tistory.com/153)
- [https://mangkyu.tistory.com/241](https://mangkyu.tistory.com/241)
- [https://pompitzz.github.io/blog/Java/whyCantCreateGenericsArray.html#제네릭과-배열의-차이점](https://pompitzz.github.io/blog/Java/whyCantCreateGenericsArray.html#%E1%84%8C%E1%85%A6%E1%84%82%E1%85%A6%E1%84%85%E1%85%B5%E1%86%A8%E1%84%80%E1%85%AA-%E1%84%87%E1%85%A2%E1%84%8B%E1%85%A7%E1%86%AF%E1%84%8B%E1%85%B4-%E1%84%8E%E1%85%A1%E1%84%8B%E1%85%B5%E1%84%8C%E1%85%A5%E1%86%B7)

</nav>
