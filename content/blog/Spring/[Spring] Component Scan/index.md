---
title: "[Spring] Component Scan"
date: "2023-04-21T15:20:03.284Z"
description: "Component Scan과 충돌 처리 방법에 대해 알아보자"
category: "Spring"
tags:
  - 우아한 테크코스
  - Spring
  - 로드맵
---

## Component-Scan이란?

---

Bean으로 등록될 준비를 마친 클래스들을 **스캔**하여 Bean으로 등록해주는 것.

<aside>
💡 Bean으로 등록될 준비를 마친 클래스?

`@Controller`, `@Service`, `@Component`, `@Repository` 등의 어노테이션을 붙인 클래스

</aside>

> Component-Scan은 기본적으로 `@Component` 어노테이션을 Bean 등록 대상으로 포함한다.
> `@Controller`와 `@Service`가 `@Component`를 포함하고 있기 때문에 `@Controller`, `@Service`도 인식한다.

💡`@Component` 어노테이션에 Bean 이름을 명시해주지 않으면 클래스 이름의 첫 글자만 소문자로 바꾼 Bean 이름이 사용된다.

### @Bean과 @Component의 차이

- `@Bean` : 메소드 레벨에서 선언하며, 메소드에서 반환되는 객체를 개발자가 수동으로 Bean으로 등록하는 어노테이션이다.
  - 개발자가 컨트롤이 불가능한 외부 라이브러리를 직접 Bean으로 등록하고 싶을 때 사용한다.
  ```java
  @Configuration
  public class AppConfig {
     @Bean
     public MemberService memberService() {
        return new MemberServiceImpl();
     }
  }
  ```
- `@Component` : 클래스 레벨에서 선언함으로서 스프링이 런타임 시에 컴포넌트 스캔을 하여 자동으로 빈을 찾고 등록하도록 하는 어노테이션이다.
  - 개발자가 직접 컨트롤이 가능한 클래스의 경우 사용한다.
  ```java
  @Component
  public class Utility {
     // ...
  }
  ```

## Component-Scan 사용 방법

---

### xml 파일에 설정하는 방법

```xml
<context:component-scan base-package="com.rcod.lifelog"/>
```

위와 같이 xml 파일에 설정하고 base package를 적어주면 base package 기준으로 클래스들을 스캔하여 Bean으로 등록한다.

다음과 같이 여러 개의 패키지를 쓸 수도 있다.

```xml
<context:component-scan base-package="com.rcod.lifelog, com.rcod.example"/>
```

위와 같이 설정하면 base package 하위에 존재하는 `@Controller`, `@Service`, `@Component`, `@Repository` 어노테이션이 붙은 모든 클래스가 Bean으로 등록된다.

만약 특정한 객체만 Bean으로 등록하여 사용하고 싶은 경우, `include-filter`나 `exclude-filter`를 통해 설정할 수 있다.

- exclude-filter
  ```xml
  <context:component-scan base-package="com.rcod.lifelog">
      <context:exclude-filter type="annotation"
          expression="org.springframework.stereotype.Controller"/>
  </context:component-scan>
  ```
  속성 그대로, 스캔 대상에서 제외하고 싶은 어노테이션을 명시해줄 수 있다. `@Controller`를 제외하고 싶은 경우 위와 같이 `exclude-filter` 속성으로 `org.springframework.stereotype.Controller`를 명시해준다.
- include-filter
  ```xml
  <context:component-scan base-package="com.rcod.lifelog" use-default="false">
      <context:include-filter type="annotation"
          expression="org.springframework.stereotype.Controller"/>
  </context:component-scan>
  ```
  `use-default="false"`를 설정해주면 기본 어노테이션 `@Controller`, `@Component` 등을 스캔하지 않는다.
  exclude-filter와 반대로 스캔하고 싶은 어노테이션을 `include-filter` 속성으로 명시해주면 위와 같이 특정 어노테이션만 스캔할 수 있다.

### 자바 파일 안에서 설정하는 방법

```java
@Configuration
@ComponentScan(basePackages = "com.rcod.lifelog")
public class ApplicationConfig {
}
```

`@Configuration`은 이 클래스가 xml을 대체하는 **설정파일**임을 알려준다. 해당 클래스를 설정 파일로 설정하고 `@ComponentScan`을 통해 `basePackage`를 설정해줄 수 있다.

- basePackageClasses
  ```java
  @Configuration
  @ComponentScan(basePackageClasses = Application.class)
  public class ApplicationConfig {
  }
  ```
  `basePackageClasses` 속성을 사용하면 해당 클래스가 위치한 곳에서부터 어노테이션이 부여된 모든 클래스를 Bean으로 등록한다.
  클래스를 통해 기입하기 때문에 훨씬 Typesafe하다.
- excludeFilters - **pattern**
  스캔 대상에서 제외하고 싶은 대상들을 지정해줄 수 있다.
  - `@Filter` 어노테이션의 type 속성으로 `FilterType.REGEX`(정규표현식)을 선택한 예시
    ```java
    @Configuration
    @ComponentScan(basePackages = {"spring"},
        excludeFilters = @Filter(type = FilterType.REGEX, pattern = "spring\\..*Dao"))
    public class AppCtx {
        ...
    }
    ```
  - `@Filter` 어노테이션의 type 속성으로 `FilterType.ASPECTJ`를 선택한 예시
    ⚠️AspectJ 패턴을 사용하기 위해선 build.gradle 파일에 aspectjweaver 모듈을 추가해주어야 한다.
    ```java
    @Configuration
    @ComponentScan(basePackages = {"spring"},
        excludeFilters = @Filter(type = FilterType.ASPECTJ, pattern = "spring.*Dao"))
    public class AppCtx {
        ...
    }
    ```
    pattern 속성도 basePackages처럼 배열 형태를 사용해서 여러 패턴을 지정해줄 수 있다.
- excludeFilters - **classes**
  특정 어노테이션을 붙이고 있는 Bean들을 제외하고 싶을 때 `FilterType.ANNOTATION`을 사용할 수 있다.
  ```java
  @Configuration
  @ComponentScan(basePackages = {"spring"},
      excludeFilters = @Filter(type = FilterType.ANNOTATION,
      classes = {NoProduct.class, ManualBean.class})
  public class AppCtx {
      ...
  }
  ```
  특정 클래스나 그 하위 클래스를 스캔 대상에서 제외하고 싶을 때 `FilterType.ASSIGNABLE_TYPE`을 사용할 수 있다.
  ```java
  @Configuration
  @ComponentScan(basePackages = {"spring"},
      excludeFilters = @Filter(type = FilterType.ASSIGNABLE_TYPE,
      classes = MemberDao.class})
  public class AppCtx {
      ...
  }
  ```
- 여러 개의 `@Filter`를 등록하고 싶을 땐 아래처럼 `@Filter` 어노테이션을 여러 번 붙이면 된다.
  ```java
  @Configuration
  @ComponentScan(basePackages = {"spring"},
      excludeFilters = {
          @Filter(type = FilterType.ANNOTATION, classes = ManualBean.class)
          @Filter(type = FilterType.ASSIGNABLE_TYPE, classes = MemberDao.class)
      })
  public class AppCtx {
      ...
  }
  ```

만약 Component-Scan을 사용하지 않으면 Bean으로 설정할 클래스들을 일일이 xml 파일에 등록해주어야 한다.

```xml
<bean id="mssqlDAO" class="com.test.spr.MssqlDAO"></bean>

		<!-- MemberList 객체에 대한 정보 전달 및 의존성 주입 -->
		<bean id="member" class="com.test.spr.MemberList">

			<!-- 속성의 이름을 지정하여 주입 -->
			<property name="dao">
				<ref bean="mssqlDAO"/>
			</property>

		</bean>
```

위 코드는 MssqlDAO와 MemberList 클래스를 Bean으로 등록하고 MemberList 객체에 Mssql 객체를 주입하는 코드이다.

## Component Scan의 동작 과정

---

1. ConfigurationClassParser가 Configuration 클래스를 파싱한다.

   : `@Configuration` 어노테이션 클래스를 파싱

2. ComponentScan 설정을 파싱한다.

   : base package에 설정한 패키지를 기준으로 ComponentScanAnnotationParser가 스캔하기 위한 설정들을 파싱한다.

3. base package 설정을 바탕으로 모든 클래스를 로딩한다.
4. ClassLoader가 로딩한 클래스들을 Bean Definition으로 정의한다.

   : 생성할 Bean에 대해 정의한다.

5. 생성할 Bean에 대한 정의를 토대로 Bean을 생성한다.

## Component Scan 충돌 처리

---

### Bean 이름이 충돌하는 경우

```java
@Configuration
@ComponentScan(basePackages = {"spring", "spring2"})
public class AppCtx {
    ...
}
```

서로 다른 패키지에 같은 이름을 가진 Bean 클래스가 2개 이상 존재할 경우 Exception이 발생한다.

이 경우 `@Component` 어노테이션에 이름을 지정하는 등의 방법으로 해결할 수 있다.

### @Configuration 클래스에 수동 등록한 Bean과 충돌하는 경우

```java
@Component
public class MemberDao {
    ...
}
```

```java
@Configuration
@ComponentScan(basePackages = {"spring"})
public class AppCtx {

    @Bean
    public MemberDao memberDao() {
        return new MemberDao();
    }
}
```

스캔할 때 사용하는 Bean의 이름과 수동으로 등록한 Bean의 이름이 같은 경우에도 충돌이 발생한다. 이 때는 Exception이 발생하지 않고 `@Configuration`으로 수동으로 등록한 Bean이 우선권을 갖는다.

💡Bean 주입에서는 `@Autowired`가 수동보다 우선권을 가졌지만 Bean 등록에서는 반대의 양상을 보인다.

### ❗4/25 추가 내용

제보를 받고 직접 확인해보니 @Component로 등록한 빈과 @Configuration으로 등록한 빈이 충돌하면 애플리케이션이 실행되지 않고 예외가 발생했다.

```
Description:

The bean 'car2', defined in class path resource [racingcar/AppCtx.class], could not be registered. A bean with that name has already been defined in file [C:\Github_projects\jwp-racingcar\out\production\classes\racingcar\Car2.class] and overriding is disabled.

Action:

Consider renaming one of the beans or enabling overriding by setting spring.main.allow-bean-definition-overriding=true
```

[ComponentScan - 중복 등록과 충돌](https://velog.io/@hyun6ik/ComponentScan-중복-등록과-충돌)

이에 대해서 찾아보니, 스프링부트에서는 `@Component`로 자동 등록한 Bean과 수동 등록한 Bean이 충돌했을 때 충돌 오류가 발생하도록 기본값이 설정되어 있다고 한다.

이 경우 Bean 이름이 충돌하는 경우와 마찬가지로 Bean 이름을 바꾸거나, application.properties 파일에 아래 코드를 추가해주는 것으로 해결할 수 있다.

```
spring.main.allow-bean-definition-overriding=true
```

💡후자의 경우 Bean 충돌이 나지 않고 수동 Bean 등록이 우선적으로 적용된다.

## 참고 게시글

---

[스프링 component-scan 개념 및 동작 과정](https://velog.io/@hyun-jii/스프링-component-scan-개념-및-동작-과정)

[component scan](https://hyeon9mak.github.io/component-and-component-scan/)
