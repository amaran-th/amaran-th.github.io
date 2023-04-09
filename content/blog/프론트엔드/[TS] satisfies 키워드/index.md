---
title: "[TS] satisfies 키워드"
date: "2023-03-03T21:47:03.284Z"
description: TypeScript 4.9에서 추가된 satisfies 키워드에 대해 알아보자.
category: 프론트엔드
tags:
  - 프론트엔드
  - typescript
---

<nav>

목차

- 들어가며
- satisfies 키워드의 필요성
- 타입스크립트의 type을 업캐스팅하는 방법
  - 방법 1 : variable의 type을 미리 정의한다.
  - 방법 2 : “as” 키워드를 사용한다.
  - 방법 3 : “satisfies” 키워드를 사용한다.

</nav>

## 들어가며

프론트엔드 프로젝트 진행 중, 코드리뷰로 객체 property 뒤에 `satisfies [타입]`을 붙이는 게 좋다는 말을 들었는데, satisfies 키워드는 어떨 때, 왜 사용하는 것인지 궁금해져 알아보았다.

---

## satisfies 키워드의 필요성

`satisfies` 키워드는 `Typescript 4.9`부터 추가된 문법으로, 리터럴 값이나 변수를 **안전하게 upcast하는 기능**을 수행한다.

- upcast란?(feat. 자바, 다형성)
  서브타입(자식)의 객체를 수퍼타입(부모)의 변수로 접근하는 것.
  상속/구현 관계의 객체가 있을 때 흔히 볼 수 있다.

  ```java
  //Animal>Bird>Eagle로 상속관계가 있을 때
  Animal bird=new Bird();
  ```

  ❗TypeScript에선 **한 타입이 다른 타입의 값을 모두 소유하고 있을 때** 상속관계를 이룬다.

  ```tsx
  type TExample1 = {
    x: number
    y: number
  }

  type TExample2 = TExample2 & {
    z: number
  }
  ```

  위 코드에서 TExample1은 TExample2의 부모타입이다.

---

## 타입스크립트의 type을 업캐스팅하는 방법

### 방법 1 : variable의 type을 미리 정의한다.

```tsx
// 안전하지만 번거롭게 타입정의 해야함 (타입정의)
const object: { a: number; b: { a: number } } = {
  a: 10,
  b: { a: 10, b: 20 }, // no error
  // b: {} // error
}
```

```tsx
const variable1: { grade: string } = { grade: "a", score: 90 }
// error
const variable2: { grade: string; score: number; attribute: object } = {
  grade: "a",
  score: 90,
}
const variable3 = {
  // no way to force type { grade: string }
  key: { grade: "a", score: 90 },
}
type Variable4 = { key: { grade: string } }
const variable4: Variable4 = {
  key: { grade: "a", score: 90 },
}
type Variable5 = { key: { grade: string; score: number; attribute: object } }
const variable5: Variable5 = {
  // error
  key: { grade: "a", score: 90 },
}
```

variable1의 경우 올바르게 업캐스팅된 경우이다.

variable2의 경우, 올바르게 업캐스팅되지 않은 경우이기 때문에 에러가 발생한다.

⇒지정해준 타입이 부모 타입이며, 실제 초기화된 객체의 타입은 자식타입으로 이해하면 된다.

- 한계

variable3의 경우와 같이 만일 object의 key-value를 정의할 때는 사용할 수 없다.

variable4, variable5의 경우처럼 type을 새로 정의하면 문제를 해결할 수 있지만 type이 크고 복잡해질수록 이에 대한 관리 비용이 증가한다는 문제가 있다.

### 방법 2 : “as” 키워드를 사용한다.

```tsx
// 편리하지만 안전하지 않음 (as)
const object = {
  a: 10,
  b: { a: 10, b: 20 } as { a: number }, // no error
  // b: {} as { a: number } // no error (!!!)
}
```

```tsx
const variable1 = { grade: "a", score: 90 } as { grade: string }
// no error (!!!)
const variable2 = { grade: "a", score: 90 } as {
  grade: string
  score: number
  attribute: object
}
const variable3 = {
  key: { grade: "a", score: 90 } as { grade: string },
}
const variable4 = {
  key: { grade: "a", score: 90 } as { grade: string },
}
const variable5 = {
  // no error (!!!)
  key: { grade: "a", score: 90 } as {
    grade: string
    score: number
    attribute: object
  },
}
```

이 방법은 key-value 형식의 object를 정의할 때에도 사용할 수 있다.

variable3, variable4 유형을 보면 원하는 type으로 지정이 가능한 것을 볼 수 있다.

- 한계

as는 엄밀히 말하면 업캐스팅이 아니라 다운캐스팅 키워드이기 때문에 안전하지 않다.

variable2, variable5 유형을 보면 안전하게 type이 변환될 수 있는 경우가 아님에도 에러가 발생하지 않는다.

⇒버그의 원인이 될 수 있다.

### 방법 3 : “satisfies” 키워드를 사용한다.

```tsx
// 편리하고 안전함
const object = {
    a: 10,
    b: { a: 10, b: 20 } satisfies { a: number } // no error
    // b: {} satisfies { a: number } // error
}
```

```tsx
const variable1 = { grade: "a", score: 90 } satisfies { grade: string }
// error
const variable2 = { grade: "a", score: 90 } satisfies { grade: string, score: number, attribute: object }
const variable3 = {
    key: { grade: "a", score: 90 } satisfies { grade: string }
}
const variable4 = {
    key: { grade: "a", score: 90 } satisfies { grade: string }
}
const variable5 = {
    // error
    key: { grade: "a", score: 90 } satisfies { grade: string, score: number, attribute: object }
}
```

**“satisfies” 키워드를 사용하면 type을 안전하게 제한할 수 있고, 객체의 key-value도 제한할 수 있다.**

satisfies 는 as 키워드처럼 expression에 사용할 수 있기 때문에 object key-value 의 type을 제한하는 경우에도 사용이 가능하다. 또한, satisfies 는 as 키워드와 달리 안전한 type 제한을 지원하기 때문에 위험한 variable2, variable5와 같은 유형에 대해 컴파일 에러를 발생시켜 개발자가 더욱 안전한 코드를 작성할 수 있도록 돕는다.

<nav>

참고 게시글

- [https://engineering.ab180.co/stories/satisfies-safe-upcasting](https://engineering.ab180.co/stories/satisfies-safe-upcasting)
- [https://velog.io/@josworks27/interface-type-상속](https://velog.io/@josworks27/interface-type-%EC%83%81%EC%86%8D)
- [https://news.hada.io/topic?id=7395](https://news.hada.io/topic?id=7395)

</nav>
