---
title: "[Java] Thread(스레드)"
date: "2023-09-10T18:07:03.284Z"
description: Java 스레드와 관련된 기술 지식을 정리해보았다.
section: "지식 공유" 
category: "Java"
tags:
  - 우아한 테크코스
  - Java
  - 학습 테스트
---

## Thread(스레드)

---

### 데몬 스레드

: 주 스레드의 작업을 돕는 보조적인 역할을 수행하는 스레드

주 스레드가 종료되면 데몬 스레드는 자동 종료된다.

- 데몬 스레드를 만드는 법
    
    주 스레드가 데몬이 될 스레드의 setDaemon(true)를 호출해주면 된다.
    
    <aside>

    ⚠️ start()를 호출하기 전에 호출해야 함.
    
    </aside>
    
    ```java
    public void start() {
        var thread = new Thread(this);
        thread.setDaemon(true);
        thread.start();
        stopped = false;
        log.info("Web Application Server started {} port.", serverSocket.getLocalPort());
    }
    ```
    

[Java - 데몬 스레드 (Daemon Thread)](https://widevery.tistory.com/32)

### Runnable

: Thread 클래스를 확장한 인터페이스.

run() 메소드만을 추상 메서드로 가지고 있다.

- Runnable로 스레드를 실행하는 방법
    1. 먼저 Runnable의 구현체를 만들어 run() 메서드를 구현한다.
        
        ```java
        public class MyRunnable implements Runnable {
        
          @Override
          public void run() {
            System.out.println("hello");
          }
        
        }
        ```
        
    2. Runnable형 인자를 받는 생성자를 통해 별도의 Thread 객체를 생성하고 start() 메서드를 호출한다.
        
        ```java
        Runnable runnable = new MyRunnable();
        
        Thread thread = new Thread(runnable);
        
        thread.start();
        ```
        
    
    그러면 Runnable의 구현체에서 오버라이딩한 run() 메서드가 호출된다.
    

```java
public class Tomcat {
		public void start() {
        var connector = new Connector();
        connector.start();    // 1

        try {
            // make the application wait until we press any key.
            System.in.read();
        } catch (IOException e) {
            log.error(e.getMessage(), e);
        } finally {
            log.info("web server stop.");
            connector.stop();
        }
    }

// ----------------------------

public class Connector implements Runnable {
		public void start() {
        var thread = new Thread(this);    // 2
        thread.setDaemon(true);
        thread.start();    // 3
        stopped = false;
        log.info("Web Application Server started {} port.", serverSocket.getLocalPort());
    }

    @Override
    public void run() {
        // 클라이언트가 연결될때까지 대기한다.
        while (!stopped) {
            connect();
        }
    }
```

1. connector의 start() 실행
2. 자신(Runnable 구현체)으로 thread 생성
3. 자신의 run() 메서드 호출



## Thread-Safe(스레드 안전성)

---

멀티 스레드 프로그래밍에서 여러 스레드가 어떤 동일한 자원(객체 등)에 동시에 접근하더라도 프로그램 실행에 문제가 없는 것을 의미한다.

- 스레드 안전을 지키기 위한 4가지 방법
    - Mutual Exclusion(상호 배제)
        
        : 공유 자원에 하나의 Thread만 접근할 수 있도록 락을 통제하는 방법
        
    - Atomic Operation(원자 연산)
        
        : 공유 자원 변경에 필요한 연산을 원자적으로 분리한 뒤에 실제로 데이터의 변경이 이루어지는 시점에 Lock을 걸고, 데이터를 변경하는 시간동안 다른 스레드의 접근이 불가능하도록 하는 방법.
        
    - Thread-Local Storage(스레드 지역 저장소)
        - 공유 자원의 사용을 최대한 줄이고 각각의 스레드에서만 접근할 수 있는 저장소를 사용함으로써 동시 접근을 막는 방법.(공유 상태를 피할 수 없을 때 사용하는 방식)
    - Re-Entrancy(재진입성)
        - 스레드 호출과 상관 없이 프로그램에 문제가 없도록 작성하는 방법.
        - 스레드끼리 독립적으로 동작할 수 있도록 코드를 작성하는 것.

[스레드 안전(Thread-Safety)란?](https://developer-ellen.tistory.com/205)

### Synchronized 키워드

여러 개의 스레드가 하나의 공유 자원에 동시에 접근하지 못하도록 막는다.

해당 키워드가 붙은 영역(메서드 등)의 작업이 끝나기 전까지 다른 스레드는 해당 자원에 접근할 수 없다.

⇒스레드 작업을 동기화시킬 수 있다.

예제 )

```java
class SynchronizationTest {

		@Test
    void testSynchronized() throws InterruptedException {
        var executorService = Executors.newFixedThreadPool(3);   // 1
        var synchronizedMethods = new SynchronizedMethods();

        IntStream.range(0, 1000)
                .forEach(count -> executorService.submit(synchronizedMethods::calculate));    // 2
        executorService.awaitTermination(500, TimeUnit.MILLISECONDS);

        assertThat(synchronizedMethods.getSum()).isEqualTo(1000);
    }

    private static final class SynchronizedMethods {

        private int sum = 0;

        synchronized public void calculate() {
            setSum(getSum() + 1);
        }

        public int getSum() {
            return sum;
        }

        public void setSum(int sum) {
            this.sum = sum;
        }
    }
}
```

1. 3개의 스레드를 가진 스레드 풀 객체를 생성
2. SynchronizedMethods의 calculate() 메서드를 1000번 실행하도록 스레드 풀에 명령

여기서 공유 자원은 SynchronnizedMethods 메서드의 sum 필드이며, 만약 calculate() 메서드에 synchronized 키워드가 없다면 동시성 이슈가 발생해 2번 동작 후 sum 값이 1000이 아니게 되어 테스트가 실패한다.

[🧶 Java 에서 스레드 풀(Thread Pool) 을 사용해 보자](https://tecoble.techcourse.co.kr/post/2021-09-18-java-thread-pool/)

### Concurrent Collection(병렬 컬렉션)

| 컬렉션 종류 | 컬렉션 |
| --- | --- |
| List | CopyOnWriteArrayList |
| Map | ConcurrentMap, ConcurrentHashMap |
| Set | CopyOnWriteArraySet |
| SortedMap | ConcurrentSkipListMap |
| SortedSet | ConcurrentSkipListSet |
| Queue | ConcurrentLinkedQueue |

Thread-safe(스레드 안정성)를 보장하며, 여러 스레드가 한 객체에 동시에 접근할 수 있는 자료구조이다.

- 보관하고 있는 데이터를 여러 부분으로 나누어 락을 걸 수 있기 때문에 여러 스레드가 동시에 컬렉션에 접근할 수 있다.
- 더 높은 확장성과 동시성을 보장한다.
- 여러 스레드가 한 번에 접근할 수 있기 때문에 스레드 대기시간이 적다.

함께 비교되는 컬렉션으로 Synchronized Collection이 있다.

### Synchronized Collection

| 컬렉션 종류 | 컬렉션 |
| --- | --- |
| List | Vector |
| Map | HashTable |
| synchronizedXXX | synchronized HashMap, HashSet, ArrayList, … |

한 번에 하나의 스레드만 객체에 접근할 수 있는 자료구조이다. 한 Synchronized Collection에 여러 스레드가 동시에 접근할 수 없다.

- Collection의 전체 객체에 락을 건다.
- public 메서드에 synchronized 키워드를 사용하여 내부의 값을 한 스레드만 사용할 수 있도록 제어한다.
    
    ```java
    public class Vector<E> extends AbstractList<E>
        implements List<E>, RandomAccess, Cloneable, java.io.Serializable {
        ...
    
        public synchronized boolean add(E e) {
            modCount++;
            add(e, elementData, elementCount);
            return true;
        }
    
    		public synchronized int size() {
            return elementCount;
        }
    
        ...
    }
    ```
    
- 컬렉션 전반에 락을 걸기 때문에 확장성이 낮다.
- 스레드 대기 시간이 길다.

[동기화, 비동기화, 컨커런트 컬랙션](https://wms0603.tistory.com/53)

## application.yml의 스레드 관련 설정

---

```yaml
handlebars:
  suffix: .html

server:
  tomcat:
    accept-count: 1
    max-connections: 1
    threads:
      max: 2
```

- `server.tomcat.accept-count`: Connection의 수가 max connection 개수에 도달했을 때, 추가적인 Connection을 대기시킬 수 있는데, 대기시킬 Connection의 최대 개수를 의미한다.
- `server.tomcat.max-connections`: 서버가 요청을 처리할 수 있는 Connection의 최대 개수
- `server.tomcat.thread.max`: 요청을 처리하는 스레드의 최대 개수. 기본 값은 200이다.

예시처럼 설정을 맞춰준 뒤 다음의 테스트를 실행시켜보면 총 10개의 커넥션을 생성하게 되는데, 

```java
		@Test
    void test() throws Exception {
        final var NUMBER_OF_THREAD = 10;
        var threads = new Thread[NUMBER_OF_THREAD];

        for (int i = 0; i < NUMBER_OF_THREAD; i++) {
            threads[i] = new Thread(() -> incrementIfOk(TestHttpUtils.send("/test")));
        }

        for (final var thread : threads) {
            thread.start();
            Thread.sleep(50);
        }

        for (final var thread : threads) {
            thread.join();
        }

        assertThat(count.intValue()).isEqualTo(2);
    }

    private static void incrementIfOk(final HttpResponse<String> response) {
        if (response.statusCode() == 200) {
            count.incrementAndGet();
        }
    }
```

실제로 처리되는 커넥션 요청은 1개 뿐이며, 이 요청이 처리될 때까지 나머지 9개 요청 중 1개가 size가 1인 queue에 대기하게 되고 나머지 8개 요청은 time out 처리된다.

![Untitled](Untitled.png)

총 2개의 요청이 최종적으로 처리된 것을 확인할 수 있다.

이 경우 스레드를 여러 개 사용할 수 있더라도 한 번에 처리할 수 있는 요청의 개수가 1개이기 때문에, 동기적으로 작업이 수행된다.

[max-connections, accept-count, threads.max](https://velog.io/@byeongju/max-connections-accept-count-threads.max)

## Thread Pool

---

생성/수거 요청이 올 때마다 스레드를 새로 생성/수거하지 않고 스레드 사용자가 설정해둔 개수만큼 스레드를 먼저 생성해두는 방법이다.

- 용어 정리
    - 스레드 : 어떤 프로그램 내에서 실행되는 흐름의 단위
    - 풀 : 필요할 때마다 개체를 할당하고 해제하는 대신 사용준비된 상태로 초기화된 개체를 모아둔 집합.
- 장점
    - 비용적인 측면에서 이득을 볼 수 있다.
    - 컨텍스트 스위칭이 발생하는 상황에서 딜레이를 줄일 수 있다.
- 단점
    - 스레드 풀에 너무 많은 스레드를 만들어둘 경우 메모리 낭비가 심해질 수 있다.
- 사용법
    - Executors 클래스의 세 가지 메소드 중 하나를 이용해 스레드 풀을 쉽게 생성할 수 있다.
        - `Executors.newFixedThreadPool(nThreads)`
            - nThreads : 생성할 스레드 풀의 개수
        - `Executors.newCachedThreadPool()`
            
            : 초기 스레드 개수가 0개로 설정되며 스레드 개수보다 많은 양의 작업이 요청되면 새로운 스레드를 생성해 작업을 처리한다. 작업이 끝난 스레드가 60초 이상 새로운 작업 요청이 없으면 스레드가 종료되고 풀에서 제거된다.
            
        - `Executors.newScheduledThreadPool(corePoolSize)`
            - corePoolSize : 생성할 스레드의 개수
            
            : 일정 시간 후 스레드를 실행시키도록 하는 스케줄링 스레드 기능.
            
    - 스레드 풀 객체(ThreadPoolExecutor)의 생성자를 사용해서 스레드 풀을 생성해줄 수도 있다.
        - `new ThreadPoolExecutor(corePoolSize, maximumPoolSize, keepAliveTime, ...)`
            - corePoolSize : 생성할 스레드의 개수
            - maximumPoolSize : 생성할 스레드의 최대 개수
            - keepAliveTime : 유지 시간
    
    스레드 풀의 초기 스레드 개수는 corePoolSize의 값이고, 모든 스레드가 사용중일 때 스레드가 요청되면 스레드의 개수는 maximumPoolSize만큼 많아질 수 있다. 스레드 풀이 corePoolSize보다 많은 스레드를 가지고 있을 때, 초과한 스레드에 대해 keepAliveTime보다 오래 할 일이 없으면 제거된다.
    
    ⇒자원 절약
    
    스레드 풀에 작업 요청을 하는 방식은 `execute()`, `submit()` 두 가지 방식이 있다.
    - `execute()` 방식은 작업 처리 중 예외가 발생하면 해당 스레드가 종료되고 스레드 풀에서 제거한 뒤, 새로운 스레드를 생성하여 다른 작업을 처리한다.
    
    - `submit()`은 작업 처리 중 예외가 발생하더라도 스레드가 종료되지 않고 다음 작업에 사용된다. `execute()`와 달리 처리 결과를 `Future<?>` 객체로 반환한다.
    

예제 ) 

```java
class ThreadPoolsTest {

    private static final Logger log = LoggerFactory.getLogger(ThreadPoolsTest.class);

    @Test
    void testNewFixedThreadPool() {
        final var executor = (ThreadPoolExecutor) Executors.newFixedThreadPool(2);
        executor.submit(logWithSleep("hello fixed thread pools"));
        executor.submit(logWithSleep("hello fixed thread pools"));
        executor.submit(logWithSleep("hello fixed thread pools"));

        final int expectedPoolSize = 2;
        final int expectedQueueSize = 1;

        assertThat(expectedPoolSize).isEqualTo(executor.getPoolSize());
        assertThat(expectedQueueSize).isEqualTo(executor.getQueue().size());
    }

    @Test
    void testNewCachedThreadPool() {
        final var executor = (ThreadPoolExecutor) Executors.newCachedThreadPool();
        executor.submit(logWithSleep("hello cached thread pools"));
        executor.submit(logWithSleep("hello cached thread pools"));
        executor.submit(logWithSleep("hello cached thread pools"));

        final int expectedPoolSize = 3;
        final int expectedQueueSize = 0;

        assertThat(expectedPoolSize).isEqualTo(executor.getPoolSize());
        assertThat(expectedQueueSize).isEqualTo(executor.getQueue().size());
    }

    private Runnable logWithSleep(final String message) {
        return () -> {
            try {
                Thread.sleep(1000);
            } catch (InterruptedException e) {
                throw new RuntimeException(e);
            }
            log.info(message);
        };
    }
}
```

Fixed Thread Pool에서는 Thread의 개수가 2개로 고정되어 있기 때문에, 3개의 작업 요청이 들어오면 2개의 요청이 처리되고 1개의 요청이 Queue에 남아있게 된다.

newCachedThreadPool에서는 Thread의 개수가 0으로 시작해서 요청에 따라 늘어나기 떄문에, 3개의 작업 요청이 들어오면 스레드 풀에는 3개의 스레드가 있게 되고 Queue는 비어있게 된다.
