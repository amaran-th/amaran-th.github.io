---
title: "[Java] Reflection"
date: "2023-11-08T19:07:03.284Z"
description: Java Reflection에 대해 알아보자.
section: "지식 공유" 
category: "Java"
tags:
  - 우아한 테크코스
  - 테스트
  - Java
---

컴파일한 **클래스를 동적으로 프로그래밍** 가능하도록 자바에서 지원하는 기능

ex) Java 클래스의 모든 필드, 메서드 이름을 가져와 표시할 수 있다.

### 할 수 있는 것
- JUnit과 같이 @Test 어노테이션을 표시한 메서드를 찾아 실행할 수 있다.
- 런타임 객체의 클래스, 필드, 메서드 정보를 알 수 있다.
- IDE가 자동으로 getter, setter 메서드를 생성 할 수 있다.
- 자바 객체와 데이터베이스 테이블을 매핑 할 때 사용한다.

*Java Reflection은 주로 라이브러리, 프레임워크를 만들 때 사용하기 때문에, 실무에서는 잘 쓰이지 않는다.

## 실습
---
### 메소드 이름 활용하기
다음과 같은 클래스가 있다고 하자.
```java
public class Junit3Test {
    public void test1() throws Exception {
        System.out.println("Running Test1");
    }

    public void test2() throws Exception {
        System.out.println("Running Test2");
    }

    public void three() throws Exception {
        System.out.println("Running Test3");
    }
}
```
Junit3Test 클래스에 구현되어 있는 3개의 메서드 중, ‘test’로 시작하는 이름의 메서드만 실행하도록 학습 테스트를 작성해보자.
```java
@Test
void run() throws Exception {
    Class<Junit3Test> clazz = Junit3Test.class;
    Arrays.stream(clazz.getMethods())
            .filter(method ->
                    method.getName().startsWith("test"))
            .forEach(method -> {
                try {
                    method.invoke(new Junit3Test());
                } catch (IllegalAccessException | InvocationTargetException e) {
                    throw new RuntimeException(e);
                }
            });
}
```
- 사용된 메서드
	- `java.lang.Class<T>`
		- `public Method[] getMethods() throws SecurityException` - 클래스에구현된 public 메서드 목록을 불러온다.
	- `java.lang.reflect.Method`
		- `public String getName()` - 메서드의 이름을 불러온다.
	        - `public Object invoke(Object obj, Object... args) throws IllegalAccessException, IllegalArgumentException, InvocationTargetException` - 메서드를 실행한다.

### 어노테이션 활용하기

다음과 같은 클래스가 있다고 하자.

```java
public class Junit4Test {

    @MyTest
    public void one() throws Exception {
        System.out.println("Running Test1");
    }

    @MyTest
    public void two() throws Exception {
        System.out.println("Running Test2");
    }

    public void testThree() throws Exception {
        System.out.println("Running Test3");
    }
}
```

@MyTest 어노테이션은 다음과 같이 정의되어 있다.

```java
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.METHOD})
public @interface MyTest {
}
```

이 때, Junit4Test에 구현된 3개의 메서드 중 @MyTest 어노테이션이 붙은 테스트만 실행하도록 학습 테스트를 작성해보자.

```java
@Test
void run() throws Exception {
    Class<Junit4Test> clazz = Junit4Test.class;
    Arrays.stream(clazz.getMethods())
            .filter(method -> method.isAnnotationPresent(MyTest.class))
            .forEach(method -> {
                try {
                    method.invoke(new Junit4Test());
                } catch (IllegalAccessException | InvocationTargetException e) {
                    throw new RuntimeException(e);
                }
            });
}
```

- 사용된 메서드
    
    - java.lang.reflect.AccessibleObject
        - `public boolean isAnnotationPresent(Class<? extends Annotation> annotationClass)` - 특정 어노테이션이 포함되어 있는지 여부를 반환한다.
    
    <aside> 💡 java.lang.reflect.Method는 AccessibleObject를 상속하는 클래스이다.
    
    </aside>
    

### 클래스의 어노테이션 활용하기

클래스 레벨에 @Controller, @Service, @Repository 어노테이션이 붙은 클래스들을 찾아 이름을 로그로 출력하는 학습 테스트를 작성해보자.

```java
class ReflectionsTest {

    private static final Logger log = LoggerFactory.getLogger(ReflectionsTest.class);

    @Test
    void showAnnotationClass() throws Exception {
        Reflections reflections = new Reflections("reflection.examples");
        Set<Class<?>> classes = reflections.getTypesAnnotatedWith(Controller.class);
        classes.addAll(reflections.getTypesAnnotatedWith(Service.class));
        classes.addAll(reflections.getTypesAnnotatedWith(Repository.class));

        classes.forEach(clazz -> log.info(clazz.getName()));
    }
}
```

- 사용된 메서드
    - org.reflections.Reflections
        - `public Set<Class<?>> getTypesAnnotatedWith(Class<? extends Annotation> annotation)` - 특정 어노테이션이 포함된 클래스의 Set을 반환한다.
        - `java.lang.Class<T>`
            - `public String getName()` - 클래스의 이름을 반환한다.
            
            
> **getName()과 getSimpleName(), getCanonicalName()의 차이**
>
>---
>
> - getName() : 전체 경로를 포함한 클래스명(ex: reflection.Question)
> - getCanonicalName() : 전체 경로를 포함한 클래스명(ex: reflection.Question)
> - getSimpleName() : 패키지 명을 제외한 순수 클래스명(ex : Question)
> 
> getName()의 경우 Class 객체에 의해 표현되는 이름을 반환하고, getCanonicalName()은 자바 언어 스펙에서 제공하는 이름을 반환한다.
>
> 배열 객체의 경우, getName()은 인코딩된 문자열을 반환하고 getCanonicalName()은 이름 그대로 문자열을 반환한다.
>
> 익명 클래스, 로컬 클래스의 경우 getCanonicalName()은 null, getSimpleName()은 빈 스트링 값을 반환하지만 getName()은 자바 스펙에 정의된 값을 반환한다.(ex: {해당 메서드가 호출되는 클래스명}$1)
            

### 그 외

```java
@Test
void givenClassName_whenCreatesObject_thenCorrect() throws ClassNotFoundException {
    final Class<?> clazz = Class.forName("reflection.Question");

    assertThat(clazz.getSimpleName()).isEqualTo("Question");
    assertThat(clazz.getName()).isEqualTo("reflection.Question");
    assertThat(clazz.getCanonicalName()).isEqualTo("reflection.Question");
}
```

- `java.lang.Class<T>`
    - `public static Class<T> forName(String className)``throws ClassNotFoundException` - 클래스명(패키지 경로 포함)으로 클래스를 찾아 불러온다.

```java
@Test
void givenObject_whenGetsFieldNamesAtRuntime_thenCorrect() {
    final Object student = new Student();
    final Field[] fields = student.getClass().getDeclaredFields();
    final List<String> actualFieldNames = Arrays.stream(fields)
            .map(Field::getName)
            .collect(Collectors.toList());

    assertThat(actualFieldNames).contains("name", "age");
}

@Test
void givenClass_whenGetsMethods_thenCorrect() {
    final Class<?> animalClass = Student.class;
    final Method[] methods = animalClass.getDeclaredMethods();
    final List<String> actualMethods = Arrays.stream(methods)
            .map(Method::getName)
            .collect(Collectors.toList());

    assertThat(actualMethods)
            .hasSize(3)
            .contains("getAge", "toString", "getName");
}
```

- `java.lang.Class<T>`
    - `public Field[] getDeclaredFields() throws SecurityException` - 클래스가 가진 모든 필드(private 포함)를 불러온다.  
    - `public Method[] getDeclaredMethods() throws SecurityException` - 클래스가 가진 모든 메서드(private 포함)를 불러온다.
> getFields(), getMethods는 각각 public으로 선언된 필드/메서드만을 가져온다.

```java
@Test
void givenClass_whenGetsAllConstructors_thenCorrect() {
    final Class<?> questionClass = Question.class;
    final Constructor<?>[] constructors = questionClass.getConstructors();

    assertThat(constructors).hasSize(2);
}

@Test
void givenClass_whenInstantiatesObjectsAtRuntime_thenCorrect() throws Exception {
    final Class<?> questionClass = Question.class;

    final Constructor<?> firstConstructor = questionClass.getConstructors()[0];
    final Constructor<?> secondConstructor = questionClass.getConstructors()[1];

    final Question firstQuestion = (Question) firstConstructor.newInstance("gugu", "제목1", "내용1");
    final Question secondQuestion = (Question) secondConstructor.newInstance(1L, "gugu", "제목2", "내용2", new Date(), 1);

    assertThat(firstQuestion.getWriter()).isEqualTo("gugu");
    assertThat(firstQuestion.getTitle()).isEqualTo("제목1");
    assertThat(firstQuestion.getContents()).isEqualTo("내용1");
    assertThat(secondQuestion.getWriter()).isEqualTo("gugu");
    assertThat(secondQuestion.getTitle()).isEqualTo("제목2");
    assertThat(secondQuestion.getContents()).isEqualTo("내용2");
}
```

- `java.lang.Class<T>`
    - `public Constructor<?>[] getConstructors() throws SecurityException` - 클래스가 가진 모든 public 생성자들을 불러온다.
- `java.lang.reflect.Constructor<T>`
    - `public T newInstance(Object ... initargs) throws InstantiationException, IllegalAccessException, IllegalArgumentException, InvocationTargetException` - 생성자를 사용해 객체를 생성한다.

```java
@Test
void givenClass_whenGetsFieldsByName_thenCorrect() throws Exception {
    final Class<?> questionClass = Question.class;
    final Field field = questionClass.getDeclaredField("questionId");

    assertThat(field.getName()).isEqualTo("questionId");
}

@Test
void givenClassField_whenGetsType_thenCorrect() throws Exception {
    final Field field = Question.class.getDeclaredField("questionId");
    final Class<?> fieldClass = field.getType();

    assertThat(fieldClass.getSimpleName()).isEqualTo("long");
}
```

- `java.lang.reflect.Field`
    - `public String getName()` - 필드의 이름을 가져온다.
    - `public Class<?> getType()` - 필드의 타입을 가져온다.

```java
@Test
void givenClassField_whenSetsAndGetsValue_thenCorrect() throws Exception {
    final Class<?> studentClass = Student.class;
    final Student student = new Student();
    final Field field = studentClass.getDeclaredField("age");

    field.setAccessible(true);

    assertThat(field.getInt(student)).isZero();
    assertThat(student.getAge()).isZero();

    field.set(student, 99);

    assertThat(field.getInt(student)).isEqualTo(99);
    assertThat(student.getAge()).isEqualTo(99);
}
```

- `java.lang.reflect.Field`
    - `public void setAccessible(boolean flag)` - 접근 가능 여부를 설정한다.
        ⇒ private field에 접근해서 값을 얻고 수정할 수 있도록 할 수 있다.
    - `public int getInt(Object obj) throws IllegalArgumentException, IllegalAccessException` - (필드가 integer 타입이라면) 필드를 가진 클래스 객체의 필드 값을 조회한다.
    - `public void set(Object obj, Object value) throws IllegalArgumentException, IllegalAccessException` - 필드를 가진 클래스 객체의 필드 값을 변경한다.
