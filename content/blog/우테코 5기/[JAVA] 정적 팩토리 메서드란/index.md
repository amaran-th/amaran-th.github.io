---
title: "[Java] 정적 팩토리 메서드란"
date: "2023-03-07T18:53:03.284Z"
description: 정적 팩토리 메서의 개념과 사용방법에 대해 알아보자
category: "우테코 5기"
tags:
  - 우아한 테크코스
  - Java
---

<nav>

목차

- 정적 팩토리 메서드란?
- 왜 쓰는 건가요?
- 주의할 점
- 사용 TIP

</nav>

### 정적 팩토리 메서드란?

: **객체 생성의 역할을 하는 클래스 메서드**

- 예시 - java.time 패키지에 포함된 LocalTime 클래스 내에 구현되어 있는 정적 팩토리 메서드

  ```java
  // LocalTime.class
  ...
  **public static LocalTime of(int hour, int minute) {**
    ChronoField.HOUR_OF_DAY.checkValidValue((long)hour);
    if (minute == 0) {
      return HOURS[hour];
    } else {
      ChronoField.MINUTE_OF_HOUR.checkValidValue((long)minute);
      return new LocalTime(hour, minute, 0, 0);
    }
  }
  ...

  // hour, minutes을 인자로 받아서 9시 30분을 의미하는 LocalTime 객체를 반환한다.
  LocalTime openTime = LocalTime.of(9, 30);
  ```

  `of` 메서드와 같이 직접적으로 생성자를 통해 객체를 생성하는 것이 아니라,
  **메서드를 통해서 객체를 생성**하는 것을 정적 팩토리 메서드 패턴이라고 칭한다.

### _왜_ 쓰는 건가요?

- 생성자와 정적 팩토리 메서드는 같은 기능(객체 생성)을 하지만 활용도는 엄연히 차이가 난다.

1. **이름을 가질 수 있다.**

생성자는 내부 구조를 잘 알고 있어야 목적에 맞게 객체를 생성할 수 있다.

정적 팩토리 메서드를 사용하면 **메서드 이름에 객체의 생성 목적을 담아**낼 수 있다.

2. **호출할 때마다 새로운 객체를 생성할 필요가 없다.**

enum과 같이 자주 사용되는 요소의 개수가 정해져 있다면 해당 개수만큼 미리 생성해놓고 **조회**할 수 있는 구조로 만들 수 있다.

- 예시

```java
public class LottoNumber {
  private static final int MIN_LOTTO_NUMBER = 1;
  private static final int MAX_LOTTO_NUMBER = 45;

  private static Map<Integer, LottoNumber> lottoNumberCache = new HashMap<>();

  static {
    IntStream.range(MIN_LOTTO_NUMBER, MAX_LOTTO_NUMBER)
                .forEach(i -> lottoNumberCache.put(i, new LottoNumber(i)));
  }

  private int number;

  private LottoNumber(int number) {
    this.number = number;
  }

  **public LottoNumber of(int number) {  // LottoNumber를 반환하는 정적 팩토리 메서드
    return lottoNumberCache.get(number);
  }**

  ...
}
```

- 미리 생성된 로또 번호 객체를 조회(캐싱)함으로써 새로운 객체 생성의 부담을 덜 수 있다.
- 생성자의 접근 제한자를 private로 설정함으로써 객체 생성을 정적 팩토리 메서드로만 가능하도록 제한할 수 있다.
  ⇒정해진 범위를 벗어나는 로또 번호의 생성을 막을 수 있다.(유효성 검증)

3. **하위 자료형 객체를 반환할 수 있다.**

정적 팩토리 메서드는 **반환값**을 가지고 있기 때문에, 다음과 같이 분기처리를 통해 하위 타입의 객체를 반환할 수 있다.

```java
//Basic, Intermediate, Advanced 클래스가 Level이라는 상위 클래스를 상속받고 있는 구조
public class Level {
  ...
  public static Level of(int score) {
    if (score < 50) {
      return new Basic();
    } else if (score < 80) {
      return new Intermediate();
    } else {
      return new Advanced();
    }
  }
  ...
}
```

4. **객체 생성을 캡슐화할 수 있다.**

생성자를 클래스의 메서드 안으로 숨기면서 내부 상태를 외부에 드러낼 필요 없이 객체 생성 인터페이스를 단순화시킬 수 있다.

- 예시

```java
public class CarDto {
  private String name;
  private int position;

  pulbic static CarDto from(Car car) {
    return new CarDto(car.getName(), car.getPosition());
  }
}

// Car -> CatDto 로 변환
CarDto carDto = CarDto.from(car);
```

```java
Car carDto = CarDto.from(car); // 정적 팩토리 메서드를 쓴 경우
CarDto carDto = new CarDto(car.getName(), car.getPosition); // 생성자를 쓴 경우
```

DTO와 Entity 간에는 자유롭게 형 변환이 가능해야 하는데, 정적 팩토리 메서드를 사용하면 내부 구현을 모르더라도 손쉽게 변환이 가능하다.

### ⚠️주의할 점

1. 팩토리 메서드만 존재하는 클래스를 생성할 경우 **상속이 불가능**하다!

⇒상속을 위해서는 public, protected 생성자가 필요하기 때문에 정적 팩토리 메서드만 제공할 경우 상속이 불가능하다.(private로 선언된 인스턴스에 접근할 수 없으므로)

⇒이런 제약은 상속보다 조합을 사용하도록 유도하고 불변 타입으로 만들기 위해선 이 제약을 지켜야 한다는 점에서 오히려 장점이 될 수도 있다.

2. 다른 정적 메서드와 잘 구분이 되지 않아 문서만으로 확인하기 어려울 수 있다.

### 사용 TIP

- 사용하기 좋은 상황
  - 객체 간 **형변환**이 필요한 경우
  - **여러 번의 객체 생성**이 필요한 경우
- 활용 예시

  - 기존 코드
    ```java
    public class CardPool{
    ...
    		private static void addAllCardByPattern(Pattern pattern) {
            ....
            cards.add(new CourtCard(pattern,"J"));    //값을 하드코딩해서 넣어주는 모습
    				cards.add(new CourtCard(pattern,"Q"));
    				cards.add(new CourtCard(pattern,"K"));
        }
    ...
    ```
  - 정적 팩토리 메서드를 적용한 코드

    ```java
    public class CourtCard extends Card{
    		private static final List<String> **symbols** = List.of("J", "Q", "K");

    		**public static List<CourtCard> createCourtCards(Pattern pattern) {
            return symbols.stream().map((symbol) -> new CourtCard(pattern, symbol))
                .collect(Collectors.toList());
        }**

        public CourtCard(Pattern pattern, String symbol) {
            super(pattern, symbol);
        }
    ...
    ```

    ```java
    public class CardPool{
    ...
    		private static void addAllCardByPattern(Pattern pattern) {
            cards.add(new AceCard(pattern));
            cards.addAll(**StandardCard.createStandardCards(pattern)**);
            cards.addAll(CourtCard.createCourtCards(pattern));
        }
    ...
    ```

- 네이밍 컨벤션(feat. 이펙티브 자바)
  - `from` : 하나의 매개 변수를 받아서 객체를 생성
  - `of` : 여러 개의 매개 변수를 받아서 객체를 생성
  - `getInstance` | `instance` : 인스턴스를 생성. 이전에 반환했던 것과 같을 수 있음.
  - `newInstance` | `create` : 새로운 인스턴스를 생성
  - `get[OtherType]` : 다른 타입의 인스턴스를 생성. 이전에 반환했던 것과 같을 수 있음.
  - `new[OtherType]` : 다른 타입의 새로운 인스턴스를 생성.

<nav>

참고 자료

- [https://tecoble.techcourse.co.kr/post/2020-05-26-static-factory-method/](https://tecoble.techcourse.co.kr/post/2020-05-26-static-factory-method/)

</nav>
