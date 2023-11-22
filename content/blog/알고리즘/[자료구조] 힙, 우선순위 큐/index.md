---
title: "[자료구조] 힙, 우선순위 큐"
date: "2023-11-22T10:09:03.284Z"
description: "힙과 우선순위 큐에 대해 알아보자."
section: "지식 공유" 
category: "알고리즘"
tags:
  - Java
  - 코딩 테스트
thumbnailImg: './heap.png'
---

## 힙(Heap)
---
### 개념
힙은 **완전 이진트리**의 일종으로, 여러 개의 값들 중에서 **최댓값이나 최솟값을 빠르게 찾아내도록** 만들어진 자료구조입니다.

<br/>

우리가 어떤 리스트에 값을 넣고, 우선순위가 높은 것부터 빼내려면 어떻게 해야할까요?

쉬운 방법은 리스트에 **새로운 값이 들어올 때마다 리스트를 정렬**하고 가장 앞에 오는 요소를 제거해주는 것입니다. 하지만 이 방법은 매우 비효율적입니다.

그래서 우리는 완전 이진 트리 구조에 '**부모노드는 자식노드보다 우선순위가 높다**'는 조건을 붙여, 우선순위가 높은 요소를 효율적으로 얻을 수 있게 하였습니다. 이것이 바로 힙의 의의입니다.

힙은 크게 최대 힙, 최소 힙 두 종류가 있는데요, 각각의 특징은 다음과 같습니다.
- **최대 힙(max heap)** : 부모 노드의 키 값이 자식 노드의 키 값보다 크거나 같은 완전 이진트리
- **최소 힙(min heap)** : 부모 노드의 키 값이 자식 노드의 키 값보다 작거나 같은 완전 이진트리
![](https://i.imgur.com/Kp61ooK.png)

- 힙의 특징
	- 힙은 주로 **배열**을 통해 구현됩니다.
	- 이진 탐색 트리와 달리 **중복 값이 허용**됩니다.
	- **반 정렬 상태**가 유지됩니다.
### 구현(이론)
- 일반적으로 구현을 쉽게 하기 위해 배열의 첫 번째 인덱스인 0은 사용되지 않습니다.
- 특정 위치의 노드 번호(인덱스)는 새로운 노드가 추가되어도 변하지 않습니다.
- 힙 트리에서 부모노드와 자식노드 인덱스의 관계는 다음과 같이 표현됩니다.
	- 왼쪽 자식의 인덱스 = (부모 인덱스)x2
	- 오른쪽 자식의 인덱스 = (부모 인덱스)x2+1
	- 부모의 인덱스 = (자식의 인덱스)/2
![](https://i.imgur.com/nxXm5vk.png)

- 힙의 삽입(insert)

	*최대 힙 기준
	1. 새로운 요소가 힙에 들어오면 새로운 노드를 가장 말단에 있는 노드의 자식 노드로 추가합니다.(마지막 index)
	2. 추가된 노드와 부모 노드의 값을 비교해서 추가된 노드의 값이 더 크면 두 노드를 교환합니다. 이 과정을 부모 노드의 값이 더 커질 때까지 반복합니다.
- 힙의 삭제(delete)

	*최대 힙 기준
	1. 최대 힙에서 최댓값은 루트노드이기 때문에, **루트노드부터(우선순위가 높은 값부터) 삭제**됩니다.
	2. 루트 노드 자리에는 가장 밑단의 노드(마지막 index)를 둡니다.
	3. 루트노드와 자식 노드의 값을 비교해서 루트 노드(부모 노드)의 값이 더 작으면 두 노드를 교환합니다. 이 과정을 처음의 루트노드가 말단 노드가 될 때까지 반복합니다.

### Java에서 사용하기
Java에서는 Collection으로 Heap을 제공하고 있지 않습니다.
### 직접 구현하기
```java
import java.util.Comparator;  
import java.util.NoSuchElementException;  
  
public class Heap<E> {  
    private final Comparator<? super E> comparator; //비교 기준  
    private static final int DEFAULT_CAPACITY = 10;  
  
    private int size;  
    private Object[] array;  
  
    public Heap(Comparator<? super E> comparator) {  
        this.array = new Object[DEFAULT_CAPACITY];  
        this.size = 0;  
        this.comparator = comparator;  
    }  
  
    private int getParent(int index) {  
        return index / 2;  
    }  
  
    private int getLeftChild(int index) {  
        return index * 2;  
    }  
  
    private int getRightChild(int index) {  
        return index * 2 + 1;  
    }  
  
    private void resize(int newSize) {  //용적의 크기를 재할당한다.  
        Object[] copy = new Object[newSize];  
        for (int i = 1; i <= size; i++) {  
            copy[i] = array[i];   // 배열 복사  
        }  
        this.array = null;    // GC 처리를 위함  
        this.array = copy;  
    }  
  
    public void add(E e) {  
        if (size + 1 == array.length) {   // 현재 합의 요소 개수가 배열의 용적과 같아지면 배열의 크기를 2배로 키운다.  
            resize(array.length * 2);  
        }  
        array[size + 1] = e;    // 힙 말단에 새로운 요소를 추가한다.  
        int currentIndex = size + 1;    // 새로 추가된 요소가 존재하는 index        while (currentIndex > 1) {  // 새로 추가된 요소가 루트 노드가 되면 반복문은 종료된다.  
            if (comparator.compare((E) array[getParent(currentIndex)], (E) array[currentIndex]) >= 0)  
                break;    // 새로 추가된 요소가 그 부모 노드보다 우선순위가 작으면, 최대 힙의 규칙을 지키게 되므로 반복문을 종료한다.  
            array[currentIndex] = array[getParent(currentIndex)];   // 새로 추가된 요소와 그 부모 노드를 교환  
            currentIndex = getParent(currentIndex);  
            array[currentIndex] = e;  
        }  
        size++; // 힙의 요소 개수를 1 늘린다.  
    }  
  
    public E remove() {  
        if (size < 1) throw new NoSuchElementException();   // 요소 개수가 0개면 예외 반환  
        E result = (E) array[1];    // 루트 노드를 제거 및 반환할 것이므로 변수로 할당해둔다.  
        array[1] = array[size]; // 마지막 노드를  루트 노드로 가져온다.  
        array[size] = null;  
  
        int currentIndex = 1;   // (구) 마지막 노드가 존재하는 index        while (getLeftChild(currentIndex) <= size) {    // (구) 마지막 노드의 왼쪽 자식 노드가 요소 개수보다 커진다는 것은 (구) 마지막 노드가 말단에 존재한다는 의미다.  
            int toSwapIndex;    // 왼쪽 자식 노드와 오른쪽 자식 노드 중 값이 우선순위가 더 높은 노드의 index(최소 힙의 경우 더 작은 노드와 교환해야 함)  
            if (comparator.compare((E) array[getLeftChild(currentIndex)], (E) array[getRightChild(currentIndex)]) >= 0) {  
                toSwapIndex = getLeftChild(currentIndex);  
            } else {  
                toSwapIndex = getRightChild(currentIndex);  
            }  
            Object temp = array[currentIndex];  // (구) 마지막 노드와 자식 노드의 값을 교환  
            array[currentIndex] = array[toSwapIndex];  
            array[toSwapIndex] = temp;  
            currentIndex = toSwapIndex;  
        }  
        size--; // 힙의 요소 개수를 1 줄인다.  
        if (array.length > DEFAULT_CAPACITY && size < array.length / 4) {   // 힙의 노드 개수가  배열 용적의 1/4보다 적다면 용적을 반으로 줄인다.  
            resize(Math.max(DEFAULT_CAPACITY, array.length / 2));   // 단, 용적은 최소 용적보다 작아질 수 없다.  
        }  
        return result;  // 처음 변수로 할당해둔 루트노드를 반환한다.  
    }  
  
    public int size() {  
        return this.size;  
    }  
  
    public E peek() {  
        if (size < 1) throw new NoSuchElementException();  
        return (E) array[1];  
    }  
  
    public boolean isEmpty() {  
        return size == 0;  
    }  
}
```
> 코드 참고 게시글 : [자바[JAVA] - 배열을 이용한 Heap(힙) 구현하기](https://st-lab.tistory.com/205)

## 우선순위 큐(Priority Queue)
---
### 개념
우선순위 큐란 우선순위의 개념을 큐에 도입한 자료구조입니다.

기본적으로 우선순위가 높은 데이터를 먼저 꺼내게 됩니다.

우선순위 큐는 주로 배열, 연결리스트, 힙 등으로 구현할 수 있는데, 이 중에서도 **힙으로 구현하는 것이 가장 효율적**입니다.

사실상 동일한 메커니즘으로 사용할 수 있기 때문에 `우선순위 큐 = 힙`이라고도 할 수 있습니다.

> - 최대 값이 우선순위인 큐 = 최대 힙
> - 최소 값이 우선순위인 큐 = 최소힙

<aside> 

**Heap Sort(힙 정렬)**

---
힙/우선순위 큐를 통해 데이터를 정렬하는 것을 heap sort라고 합니다.

</aside>

### Java에서 사용하기
자바의 `java.util` 패키지에서 `PriorityQueue`라는 자료구조 클래스를 제공하고 있습니다.
```java
public class PriorityQueue<E> extends AbstractQueue<E>  
    implements java.io.Serializable {
```
`PriorityQueue`가 제공하는 주요 메서드는 다음과 같습니다.

| 메서드  |  리턴 값  |  분류  |  설명  | 
| ----- | ------ | ----- | ----  |
| offer(E e) | boolean | 요소 추가 | 우선순위 큐에 새 요소를 추가한다. 우선순위 큐가 가득 차서 요소를 추가할 수 없는 경우 false를 반환한다. |
| add(E e) | boolean | 요소 추가 | 우선순위 큐에 새 요소를 추가한다. 우선순위 큐가 가득 차서 요소를 추가할 수 없는 경우 예외를 던진다. |
| remove(Object o) | boolean | 요소 삭제 | 우선순위 큐의 특정 요소를 삭제하고 성공적으로 삭제되었는지 여부를 반환한다. |
| peek() | E | 조회 | Queue와 동일 |
| clear() | void | 요소 삭제 | 우선순위 큐의 모든 요소를 제거한다.(PriorityQueue가 상속하고 있는 Collection의 메서드) |

### 직접 구현하기
사실상 힙의 구현과 차이가 없기 때문에 생략하겠습니다.