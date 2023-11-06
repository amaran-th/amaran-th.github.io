---
title: "[Java] 알고리즘 문제풀이를 위한 입력값 처리"
date: "2023-11-03T16:33:03.284Z"
description: Java의 기본 입력 방법과 StringTokenizer에 대해 알아보자.
section: "지식 공유" 
category: "알고리즘"
tags:
  - 우아한 테크코스
  - Java
  - 코딩 테스트
---

### 글을 작성한 이유
최근에 다시 알고리즘 문제풀이를 시작했습니다.
원래는 풀이 언어로 C++을 사용하고 있었는데요, 친한 지인의 의견을 듣고 제 주력 언어(Java)로 문제를 해결하는 역량을 키우는 게 좋을 것 같다는 생각이 들어서 이번에 자바로 바꾸게 되었습니다.

거의 스프링만 쓰다가 자바의 기본 입출력 시스템을 사용하려니 한 차례 정리가 필요하겠다 여겨진 부분이 좀 있어서, 이렇게 글을 작성하게 되었습니다.

### Scanner vs. BufferedReader
Java에서 사용자의 입력을 받는 방법은 여러가지가 있는데요, 그 중 Scanner 클래스는 널리 사용되는 입력 클래스 중 하나입니다.
그리고 다른 입력 클래스로 BufferedReader가 있습니다.
Scanner와 BufferedReader의 큰 차이는 바로 성능(처리 속도)입니다.

Scanner의 사용법은 다음과 같습니다.
```java
import java.util.Scanner;

public class Input {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);

        String input = sc.nextLine();
    }
}
```
BufferedReader의 사용법은 다음과 같습니다.
```java
public class Input {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));

        String input = br.readLine();
    }
}
```
둘 다 System.in을 인자로 받습니다.

> **System.in**
>
> ---
> System은 java.lang 패키지의 클래스이며, in은 System 내에 정의된 정적 변수이다.
> in은 InputStream의 타입을 가지는데, InputStream은 바이트 단위의 입력을 위한 최상위 입력 스트림 클래스이다.
> 사용자 입력(키보드)을 받기 위한 입력 스트림으로서 사용된다.

두 방식 중 BufferedReader가 더 높은 성능을 갖는데요, Scanner는 1kB의 버퍼를 갖기 때문에 입력 데이터가 프로그램에 바로 전달되지만, BufferedReader는 8kB의 버퍼를 가져 버퍼에 입력 데이터를 저장했다가 한 번에 전송합니다.
두 방식의 성능을 논할 때 CPU를 고려해야 하는데요, 문자가 입력될 때마다 CPU가 하나하나 입출력을 하는 것보다 버퍼에 어느정도 쌓아두고 버퍼가 가득 차거나 개행이 일어날 때마다 입출력을 처리하는 것이 훨씬 효율적이기며 속도가 더 빠릅니다.
거기에 더해 Scanner는 입력을 읽는 과정에서 정규 표현식 적용/입력값 분할/파싱 등의 과정을 추가적으로 거치기 때문에 성능이 더 저하됩니다.

코딩 테스트에서는 프로그램의 소요 시간이 중요 요소인만큼, Scanner보다는 BufferedReader를 사용하는 것이 좋을 것 같습니다.
### StringTokenizer vs. String.split()
StringTokenizer은 문자열을 특정 구분자를 기준으로 분할하는 클래스 객체입니다.
사용법은 다음과 같습니다.
```java
StringTokenizer st = new StringTokenizer("abc def ghi")
```
분할하고자 하는 문자열을 생성자 파라미터로 입력해 StringTokenizer 객체를 생성합니다.

> 이 때 구분자는 기본적으로 공백(" ")인데요, 만일 구분자를 변경하고 싶은 경우 원하는 구분자를 생성자의 두 번째 파라미터로 입력해주면 됩니다.
```java
 StringTokenizer st = new StringTokenizer("abc,def,ghi", ",")
 ```

그 다음 StringTokenizer.nextToken()을 호출하면 StringTokenizer 객체가 가지고 있는 문자열들(토큰) 중 다음 토큰을 반환합니다.
```java
String token1 = st.nextToken().   // "abc"
String token2 = st.nextToken().   // "def"
String token3 = st.nextToken().   // "ghi" 
```

String.split() 메서드는 문자열 배열을 반환하기 때문에 각 토큰에 접근하기 위해서는 반복문을 수행하거나 인덱스를 통해 직접 조회를 해야 합니다.

반면 StringTokenizer은 분할된 문자열 각각을 반환하기 때문에, nextToken() 메서드를 호출하면 바로 토큰에 접근할 수 있습니다.

문제에서 입력 데이터를 어떻게 활용하느냐에 따라 상황에 맞게 사용하면 좋을 것 같습니다.
- 입력 값을 변수로 받는 경우
```java
// split()
int a, b, c;
String[] tokens = br.readLine().split();
a = Integer.parseInt(tokens[0]);
b = Integer.parseInt(tokens[1]);
c = Integer.parseInt(tokens[2]);
```
```java
// StringTokenizer
StringTokenizer stringTokenizer = new StringTokenizer(br.readLine());  
int a = Integer.parseInt(stringTokenizer.nextToken());  
int b = Integer.parseInt(stringTokenizer.nextToken());  
int c = Integer.parseInt(stringTokenizer.nextToken());
```

-  입력 값을 배열로 받는 경우
```java
// split()
String[] tokens = br.readLine().split();
int[] houses = new int[10];
for(int i=0;i<10;i++){  
    houses[i]=Integer.parseInt(tokens[i]);
}

// StringTokenizer
StringTokenizer stringTokenizer = new StringTokenizer(br.readLine());  
int[] houses = new int[10];
for(int i=0;i<10;i++){  
    houses[i]=Integer.parseInt(stringTokenizer.nextToken());  
}

```

### 참고 자료
[백준 자바로 시작할 때 알아야 할 Point](https://zzinise.tistory.com/62)

[[Java 자바] StringTokenizer 클래스로 문자열 분리하기! split 비교](https://jhnyang.tistory.com/entry/JAVA-StringTokenizer-%ED%81%B4%EB%9E%98%EC%8A%A4%EB%A1%9C-%EB%AC%B8%EC%9E%90%EC%97%B4-%EB%B6%84%EB%A6%AC%ED%95%98%EA%B8%B0-split-%EB%B9%84%EA%B5%90)