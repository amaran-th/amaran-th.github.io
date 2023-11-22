---
title: "[자료구조] 스택, 큐"
date: "2023-11-22T10:07:03.284Z"
description: "스택과 큐에 대해 알아보자."
section: "지식 공유" 
category: "알고리즘"
tags:
  - Java
  - 코딩 테스트
thumbnailImg: './stack.png'
---


## 글 작성 이유
제가 생각하기에 저는 컴공과를 다니고 있지만 자료구조와 알고리즘에 대한 지식이 체화되지 않아서, 언젠가 한 번 제대로 개념 정리를 하고 가야겠다는 생각을 하고 있었습니다.

그리고 이번에 매일 알고리즘 문제를 한 개씩 풀기 시작하면서, 알고리즘 문제풀이에 필요한 개념을 정리할 필요성을 절실히 느꼈습니다.

그래서 자료구조의 기본중의 기본이라고 할 수 있는 스택과 큐의 개념, 그리고 Java에서 제공하는 Collection을 사용하는 방법을 정리해보려고 합니다.

# 스택과 큐
스택과 큐는 **선형 자료구조**에 해당하는 대표적인 자료구조입니다.

<aside>

 **선형 자료 구조**
 
 ---
- 선형 자료구조란 하나의 요소 뒤에 하나의 요소가 오는 자료구조입니다.(1:1)

    **배열,** **리스트**, **스택**, **큐** 등이 이에 해당됩니다.

- 반면 비 선형 구조는 하나의 요소 뒤에 여러 개의 요소가 올 수 있습니다.(1:N)

    대표적인 예시로 **그래프**와 **트리**가 있습니다.

![](https://i.imgur.com/ViR8CHn.png)
</aside>

## 스택(Stack)
### 개념
스택은 나중에 들어간 요소가 가장 먼저 나오는 **후입선출(Last In First Out, LIFO)** 방식의 자료구조입니다.

입구와 출구가 동일한, 한 쪽이 막힌 통로를 생각하면 쉽습니다.

![](https://i.imgur.com/v1JLR8P.png)

- 관련 용어
	- **top** : 스택의 맨 위를 가리키며, 가장 최근에 입력한 데이터가 존재하는 위치입니다.
	- **push** : top에 데이터를 입력하는(추가하는) 작업을 의미합니다.
	- **pop** : top에서 데이터를 꺼내는(삭제하는) 작업을 의미합니다.
![](https://i.imgur.com/BJXydu9.png)

- 활용 사례
	- DFS(깊이 우선 탐색) 구현
### Java에서 사용하기
자바의 `java.util` 패키지에서 `Stack`이라는 자료구조 구현체 클래스를 제공하고 있습니다.
```java
public class Stack<E> extends Vector<E> { ... }
```
`Stack`이 제공하는 주요 메서드는 다음과 같습니다.

| 메서드  |  리턴 값  |  분류  |  설명  | 
| ----- | ------ | ----- | ----  |
| push(E item) | void | 요소 추가 | 스택에 새 요소를 추가한다. |
| pop() | E | 요소 삭제 | 스택의 top에 위치하는 요소를 삭제하고 반환한다. |
| peek() | E | 조회 | 스택의 top에 위치하는 요소를 조회하여 반환한다. |
| empty() | boolean | 조회 | 스택이 비어있는지 여부를 반환한다. |
| search(Object o) | int | 조회 | 스택에 매개변수로 입력받은 요소를 찾아 인덱스(1부터 시작)를 반환한다. 찾지 못한 겨우 -1을 반환한다. |

- 사용 예시
	```java
	import java.util.Stack;

	Stack<String> stack = new Stack<>();

	// 요소 추가
	stack.push("Apple");
	stack.push("Banana");
	stack.push("Strawberry");
	stack.push("Grape");

	// 스텍의 요소 출력
	log.debug("stack :: " + stack);

	// 스택의 요소 제거
	stack.pop();            // "Grape" 요소 제거
	stack.pop();            // "Strawberry" 요소 제거

	// 스텍의 요소 출력
	log.debug("stack :: " + stack); // [Apple, Banana]
	```
	> 예시 코드 출처: [Contributor9:티스토리](https://adjh54.tistory.com/135)

## 큐(Queue)
### 개념
큐는 처음 들어간 요소가 가장 먼저 나오는 **선입선출(First In First Out, FIFO)** 방식의 자료구조입니다.

입구와 출구가 양 끝에 따로 존재하는 통로를 생각하면 쉽습니다.

![](https://i.imgur.com/UonMjeR.png)

- 관련 용어
	- **front** : 큐의 출구에 해당하며, 처음 입력한 데이터가 존재하는 위치입니다.
	- **rear** :  큐의 입구에 해당하며, 마지막으로 입력한 데이터가 존재하는 위치입니다.
	- **enqueue** : rear에 새로운 데이터를 삽입하는 작업을 의미합니다.
	- **dequeue** : front에서 데이터를 꺼내는 작업을 의미합니다.
![](https://i.imgur.com/TQV2M9v.png)

- 활용 사례
	- BFS(너비 우선 탐색) 구현
### Java에서 사용하기
자바의 `java.util` 패키지에서 `Queue`라는 자료구조 인터페이스를 제공하고 있습니다.
```java
public interface Queue<E> extends Collection<E> { ... }
```
`Queue`가 제공하는 주요 메서드는 다음과 같습니다.

| 메서드  |  리턴 값  |  분류  |  설명  | 
| ----- | ------ | ----- | ----  |
| offer(E e) | boolean | 요소 추가 | 큐에 새 요소를 추가한다. 큐가 가득 차서 요소를 추가할 수 없는 경우 false를 반환한다. |
| add(E e) | boolean | 요소 추가 | 큐에 새 요소를 추가한다. 큐가 가득 차서 요소를 추가할 수 없는 경우 예외를 반환한다. |
| poll() | E | 요소 삭제 | 큐의 front에 위치하는 요소를 삭제하고 반환한다. 큐가 비어있는 경우 null을 반환한다. |
| peek() | E | 조회 | 큐의 front에 위치하는 요소를 조회하여 반환한다. 큐가 비어있는 경우 null을 반환한다. |
| clear() | void | 요소 삭제 | 큐의 모든 요소를 제거한다.(Queue가 상속하고 있는 Collection의 메서드) |

- 사용 예시
	```java
	import java.util.LinkedList;
	import java.util.Queue;

	Queue<String> queue = new LinkedList<>();

	// 큐의 요소를 넣어줍니다.
	queue.offer("Apple");
	queue.offer("Banana");
	queue.offer("Strawberry");
	queue.offer("Grape");

	// 큐의 값을 출력합니다.
	log.debug("queue :: " + queue);

	// 큐의 첫번째 요소를 제거합니다.(Apple 제거)
	queue.poll();

	// 큐의 값을 출력합니다.
	log.debug("queue :: " + queue);     // ["Banana", "Strawberry", "Grape"]
	```
	> 예시 코드 출처: [Contributor9:티스토리](https://adjh54.tistory.com/135)


