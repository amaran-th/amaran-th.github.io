---
title: "[Java] 함수형 인터페이스(Functional Interface)"
date: "2023-03-26T14:35:03.284Z"
description: 함수형 인터페이스를 발표해보았습니다.
category: "Java"
tags:
  - 우아한 테크코스
  - Java
  - 함수형 프로그래밍
  - 발표 스터디
---

지난 3/20(월), 우테코에서 진행 중인 발표스터디에서 함수형 인터페이스를 주제로 발표를 했다.

아래부터는 발표에 사용된 노션 페이지를 그대로 옮겨온 자료이다.

---

### 주제 선정 이유

```java
public static <T> T repeatIfError(**Supplier**<T> operation, **Consumer**<Exception> handler) {
        try {
            return **operation.get()**;
        } catch (Exception e) {
            **handler.accept(e)**;
            return repeatIfError(operation, handler);
        }
    }
```

Supplier? Consumer?

### 함수형 인터페이스가 뭔가요?

> 1개의 **추상 메서드**를 갖는 인터페이스

- 자바의 람다 표현식은 함수형 인터페이스로만 사용할 수 있다.
  [람다 표현식이란?](https://www.notion.so/ca889efaf233432ea67111a800161e29)
- Java8에서부터 인터페이스에 디폴트 메서드(default method)를 포함할 수 있게 되었는데, **디폴트 메서드의 존재 여부와 상관없이** 추상 메서드가 1개라면 함수형 인터페이스라고 할 수 있다. (정적(static) 메서드도 마찬가지)

### 함수형 인터페이스 만들기

인터페이스 선언문 앞에 `@FunctionalInterface` 어노테이션을 사용하면 해당 인터페이스가 함수형 인터페이스의 조건을 만족하는지 검사해준다.

어노테이션이 없어도 함수형 인터페이스를 사용하는 데에는 문제가 없긴 하다.

```java
@FunctionalInterface
interface CustomInterface<T>{
	T myCall();

	default void printDefault(){ ... }
	static void printStatic(){ ... }
}
```

```java
CustomInterface<String> customInterface = ()->"Hello Custom"; --- 1

// abstract method
String s = customInterface.myCall();    ---2
System.out.println(s);    //Hello Custom

// default method
customInterface.printDefault();    ---3

// static method
CustomFunctionalInterface.printStatic();    ---4
```

`1`을 보면, CutomInterface에 정의된 추상 메서드 `myCall`과 시그니처가 동일하다.(제네릭 타입으로 String을 넣어주었으므로 String 타입을 리턴하는 것이 맞다.)

\*앞서 언급하였듯이, 람다 함수는 함수가 아니라 **익명 구현 객체**이기 때문에, 함수형 인터페이스를 구현한 일회용 클래스 객체를 정의해준 것이라고 생각하면 된다.

`2`를 보면, CustomInterface에 정의해준 추상 메서드를 호출함으로써 람다식으로 정의해준 customIntterface 식의 결과를 얻고 있다.

`3`과 `4`를 보면 CustomInterface에 정의해주었던 디폴트 메서드와 정적 메서드 역시 정상적으로 호출 가능함을 알 수 있다.

- **메서드 참조**를 활용한 함수형 인터페이스(구현체) 선언
  함수형 인터페이스를 사용할 때, 꼭 람다식을 사용하지 않고, 메서드를 참조하여 선언할 수도 있다.

  > `클래스 이름::메소드 이름`과 같이 참조 가능하다.

  ```java
  // 기존의 람다식
  Function<String, Integer> function = **(str) -> str.length()**;
  function.apply("Hello World");

  // 메소드 참조로 변경
  Function<String, Integer> function = **String::length;**
  function.apply("Hello World");
  ```

  _단, 참조하려는 메서드의 반환형과 매개변수의 타입 및 개수는 함수형 인터페이스에 정의된 추상 메서드와 동일해야 한다._

### 기본 제공되는 함수형 인터페이스들(feat. Java)

자바에서 기본적으로 제공해주는 함수형 인터페이스가 몇 가지 존재한다.

사실 앵간한 형식의 함수형 인터페이스는 모두 기본적으로 제공되고 있기 때문에 사용자가 함수형 인터페이스를 별도로 커스텀 하는 경우는 거의 없다.

| 함수형 인터페이스 | 추상 메서드의 시그니처 | 추상 메서드 이름 |
| ----------------- | ---------------------- | ---------------- |
| Predicate         | T -> boolean           | test             |
| Consumer          | T -> void              | accept           |
| Supplier          | ( ) -> T               | get              |
| Function<T, R>    | T -> R                 | apply            |
| Comparator        | (T, T) -> int          | compare          |
| Runnable          | ( ) -> void            | run              |
| Callable          | ( ) -> T               | call             |

- 두 개의 인자를 받는 함수형 인터페이스
  | 함수형 인터페이스 | 추상 메서드의 시그니처 | 추상 메서드 이름 |
  | ----------------- | ---------------------- | ---------------- |
  | BiPredicate | (T, U) -> boolean | test |
  | BiConsumer | (T, U) -> void | accept |
  | BiFunction | (T, U) -> R | apply |

…다시 처음 봤던 코드를 보면

```java
public static <T> T repeatIfError(**Supplier**<T> operation, **Consumer**<Exception> handler) {
        try {
            return **operation.get()**;
        } catch (Exception e) {
            **handler.accept(e)**;
            return repeatIfError(operation, handler);
        }
    }
```

Supplier 인터페이스에는 get() 메서드가, Consumer 인터페이스에는 accept() 메서드가 정의되어 있기 때문에 각 매개변수에 대해 알맞은 메서드를 호출하고 있는 것.

- Supplier vs Callable

  `Supplier`와 `Callable`의 시그니처는 `() -> T` 로 완전히 동일한데, 이 둘은 거의 차이가 없다. 다만 `Callable`은 `Runnable`과 함께 **병렬 처리**를 위해 등장했던 개념으로서 ExecutorService.submit같은 함수는 인자로 Callable을 받도록 구현되어 있다.

### 기본형 특화 인터페이스

> 잠시 자바에서 타입 변환이 이루어지는 메커니즘에 대해 알아보자.

자바의 타입은 크게 참조형과 기본형으로 나뉜다.

- **참조형 (Reference Type)** : Byte, Integer, Object, List
- **기본형 (Primitive Type)** : int, double, byte, char

자바에서 제네릭 타입은 **참조형**만 사용할 수 있는데, 만약 기본형 데이터를 사용하고 싶을 때는 어떻게 해야할까?

```java
Supplier<*???*> customInterface = ()->3+8;
```

- 이를테면 `()->3+8`와 같은 람다식을 Supplier 인터페이스로 선언하고자 한다면?

  사실…**사용자가 별도로 타입을 변환하지 않아도 문제가 없다!**
  Java에서는 오토 박싱 기능을 제공하는데, 오토 박싱을 간단히 소개하자면 다음과 같다.

  - **박싱(Boxing)** : 기본형→참조형(int→Integer)으로 이루어지는 형변환
  - **언박싱(Unboxing)** : 참조형→기본형(Integer→int)으로 이루어지는 형변환
  - **오토박싱(AutoBoxing)** : 개발자가 박싱/언박싱을 신경쓰지 않고 개발할 수 있도록 참조형↔기본형 타입 변환을 자동으로 수행하는 기능

  ***

  📦오토박싱의 예

  `List<Integer> list`에서 `list.add(3)`과 같이 기본형 데이터를 바로 넣을 수 있는 것도 연산 과정에서 오토박싱이 일어나기 때문.

  - **하지만…**

    오토박싱은 **비용이 소모**되기 때문에, 함수형 인터페이스에서는 오토박싱 없이 사용할 수 있는 **기본형 특화 인터페이스**를 제공한다.
    ex ) `IntPredicate`, `LongPredicate` , …
    특정 타입만 받는 것이 확실한 경우 이러한 기본형 특화 인터페이스를 사용하는 것이 좋다.

### 함수형 인터페이스를 사용하는 이유?

- 자바의 람다식은 함수형 인터페이스로만 접근할 수 있다.

  ⇒ 람다식의 장점과 연결된다.

- 제네릭으로 타입을 정하고 기본 제공되는 함수를 사용하기 때문에 **일관성** 있고 **편리**한 함수형 프로그래밍이 가능해진다.
- 앞서 예제로 나온 repeatIfError() 메서드처럼, 함수 구현을 파라미터로 받을 수 있게 되면 원하는 동작을 전달해줄 수 있으므로 제네릭을 사용 했을 때와 같이 코드의 **확장성**과 **재사용성**이 증대된다.

### 💡TIP

적어도 어떤 종류가 있는지라도 함수형 인터페이스에 대해 알고 있다면 아래와 같이 Given-When-Then 규칙에 따라 **메서드 동작을 검증**할 때, 메서드 동작을 람다식으로 선언하여 가독성을 높일 수 있다.

- (체스 미션) ChessBoard의 테스트 코드 중 일부

```java
@Test
void should_폰을_이동시킨다_when_폰이_공격가능할때() {
		//given
    Position startPosition = Position.of(Rank.C, File.TWO);
    Position middlePosition = Position.of(Rank.C, File.FOUR);
    Position enemyStartPosition = Position.of(Rank.D, File.SEVEN);
    Position enemyEndPosition = Position.of(Rank.D, File.FIVE);

    chessBoard.move(startPosition, middlePosition);
    chessBoard.move(enemyStartPosition, enemyEndPosition);

     //when
     **final Executable executable = () -> chessBoard.move(middlePosition, enemyEndPosition);**

      //then
      assertDoesNotThrow(executable);
}
```

---

## ❓Q&A

- Consumer의 accept 메서드는 어떤식으로 사용되는지 궁금합니다.

  Consumer 인터페이스는 accept()라는 추상메서드를 가지고 있는데요, 제네릭 타입 T 인자를 받고 리턴 값이 없는(void) 메서드입니다.

  > 인자를 먹어서(consume) 버리는 인터페이스
  > 라고 표현하고 있네요!
  > 특정 타입의 파라미터를 받고 연산을 수행하는 메서드를 참조하여 사용합니다.

  ```java
  Consumer<String> c = (exp) -> System.out.println("I am" + exp);
  c.accept("June");
  ```

- 추상 메서드 1개여야 하는 이유 정리점 ㅎㅎ

  함수형 인터페이스의 주 활용법은 다른 메서드를 빌려쓰는, 즉 참조하는 것입니다. 만일 여러 개의 추상 메서드를 갖고 있는 인터페이스가 다른 클래스의 메서드를 빌려 쓴다면 **(매개변수/반환값의)타입의 혼란을 야기할 수 있어** 한 개의 추상 메서드를 가져야만 한다고 하네요!
  [[JAVA] 자바 메소드 참조](https://komas.tistory.com/69)

- 람다식을 위해서만 함수형 인터페이스가 존재하는 것인가?

  대부분의 게시글에서

  > **★** 즉, **함수형 인터페이스를 사용하는 이유**는 **람다식은 함수형 인터페이스로만 접근이 가능하기 때문**에 사용합니다! **★**

  라고 설명하고 있는데, 일단 람다식 자체가 사용했을 때의 강점이 있는데(코드 간결성 등) 함수형 인터페이스가 자바에서 람다식을 사용할 수 있게 해주는 템플릿같은거라서 ‘람다식을 사용하기 위해 함수형 인터페이스가 존재한다’가 완전히 틀린말은 아니라고 생각해요.

  아래 문장이 힌트가 되어줄 수 있을 것 같네요!

  > 변하지 않고 내는 OOP임! 할 거 같던 자바는 Java 8로 엄청난 변신을 시도했다. Optional, Stream, Lambda Expression .. 즉 함수형 프로그래밍 패러다임을 도입한 것이다. 애초에 설계에 포함되어 있지 않은 패러다임을 어떻게 도입하냐고? 함수 자료형을 가져오는 과정을 객체로 바꿔버렸다.

  [자바 8의 함수형 인터페이스는 뭐에요](https://juneyr.dev/2018-12-18/java8-functional-interface)

  정확히는 람다식에 한정하지 않고, 함수형 프로그래밍의 패러다임을 도입하기 위해 만들어진 인터페이스라고 볼 수 있을 것 같아요!

- 그럼 평상시에는 Callable은 잘 안쓰고 Supplier를 쓰는게 국룰?

  > Supplier와 Callable은 완전히 동일하다고 볼 수 있다.
  > 아무런 인자없이 특정 타입을 반환해줍니다.
  > 단지 Callable은 Runnable과 함께 병렬 처리를 위해 등장했던 개념으로서 ExecutorService.submit 과 같은 함수는 인자로 Callable를 받는다.

  대부분의 인터넷 글에서 위와 같이 설명하고 있어서 Supplier와 Callable은 형식적인 차이만 있는 것이라고 생각했는데, 좀 더 찾아보니 둘은 만들어진 목적에 차이가 있더라구요!

  Callable 인터페이스는 **예외가 발생할 수 있는 구현**을 위해 존재하고, 다른 스레드에서 수행될 수 있는 클래스의 인스턴스를 위해 디자인 되었다고 합니다.

  반면 Supplier 인터페이스는 **값을 제공하는 목적**에 충실한 인터페이스입니다!

  물론 말씀드렸듯이 둘 사이에 기능상의 큰 차이는 없고, 단지 코드 상으로 의미를 부여하고 이해하기 쉽도록 구분해서 사용하는 게 좋다고 권장하고 있네요!
  발표 자료에 사용된 예제 코드는 Supplier을 Callable로 바꿔주는 게 의미적으로 좀 더 적합할 것 같네요~

  [Dongho Sim's dev story|Effective Java 07 - 람다와 스트림](https://dhsim86.github.io/java/2019/02/20/effective_java_07-post.html)

<nav>

📎참고 게시글

- [https://bcp0109.tistory.com/313](https://bcp0109.tistory.com/313)
- [https://mangkyu.tistory.com/113](https://mangkyu.tistory.com/113)
- [https://makecodework.tistory.com/entry/Java-람다식Lambda-익히기](https://makecodework.tistory.com/entry/Java-%EB%9E%8C%EB%8B%A4%EC%8B%9DLambda-%EC%9D%B5%ED%9E%88%EA%B8%B0)

</nav>
