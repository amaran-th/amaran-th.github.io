---
title: "[기술부채] 우테코 5기 레벨2 - 2주차"
date: "2023-04-30T19:02:03.284Z"
description: "우테코 2주차 기술 부채"
category: "우테코 5기"
tags:
  - 기술 부채
  - Spring
  - 우아한 테크코스
---

## 코드 리뷰

---

### 웹 자동차 경주 미션 2단계(1)

- 같은 클래스에 대해 여러 개의 생성자를 구현할 경우 생성자 체인 기법을 사용하자.
- DAO(또는 레포지토리)는 도메인 혹은 업무 단위로 분리하는게 좋다.
  - DAO의 명명 규칙
    - 현업업무에서 사용하는 용어를 사용한다.
    - 약어를 사용하지 않는다.
    - 단수명사를 사용한다.
    - 모든 엔터티에서 유일하게 이름이 부여되어야 한다.
    - 엔터티 생성의미대로 이름을 부여한다.
      [Relational table naming convention](https://stackoverflow.com/questions/4702728/relational-table-naming-convention/4703155#4703155)
- DTO와 Entity는 엄연히 다른 개념이다.
  - DTO
  - Entity
- RacingGame에서 run하는 것은 비즈니스 로직이기 때문에 서비스에 있는 게 맞을 것 같다. 스프링의 컨트롤러와 서비스가 어떤 역할을 맡는지 정리해보라.
- 콘솔 컨트롤러 내 비즈니스 로직과 RacingService의 비즈니스 로직의 흐름이 비슷하니 인터페이스를 활용해서 콘솔 서비스와 웹 서비스로 나누는 편이 좋을 듯 하다.

### 웹 자동차 경주 미션 2단계(2)

- 정적 팩토리 메서드가 권장되긴 하지만 단점도 있다.
  - 상속이 불가능해져 확장성이 떨어지고, 다른 정적 메서드(utils에 들어가는 메서드)와 구분하기 어렵다.
  - 다른 개발자들이 헷갈리지 않게 네이밍 컨벤션을 따르는 것이 좋다.

## 자잘한 기술부채

---

### ✅@Valid와 @Validate

- `@Valid` : Bean Validator를 이용해 객체의 제약 조건을 검증하는 어노테이션

  - 객체의 필드에 달린 어노테이션으로 편리하게 검증을 할 수 있다.
  - 사용하기 위해서 아래 의존성을 추가해주어야 한다.
    ```java
    implementation 'org.springframework.boot:spring-boot-starter-validation'
    ```
  - 예시 : @NotNull 어노테이션은 필드의 값이 null이 아님을 확인하도록 하는데, 사용법은 다음과 같다.

    1. 검증하고자 하는 필드에 @NotNull 어노테이션을 붙여준다

       ```java
       public class AddUserRequest {

       	@NotNull
       	private final UserRole userRole;

       	...
       }
       ```

    2. 해당 DTO를 사용하는 컨트롤러 메소드에 @Valid를 붙여주면 해당 메서드가 호출될 때 유효성 검증이 진행된다.

       ```java
       @PostMapping("/user/add")
       public ResponseEntity<Void> addUser(@RequestBody @Valid AddUserRequest addUserRequest) {
             ...
       }
       ```

    3. 검증 과정에서 오류가 있다면 `MethodArgumentNotValidException` 예외가 발생한다.
    <aside>
    💡 **Valid의 동작 원리**
    모든 HTTP 요청은 DispatcherSevlet을 통해 컨트롤러로 전달된다. 전달 과정에서 컨트롤러 메소드의 객체를 만들어주는 ArgumentResolver가 동작하는데, @Valid 역시 이 ArgumentResolver에 의해 처리가 된다.
    @RequestBody 어노테이션이 Json 메세지를 객체로 변환해주는 작업도 ArgumentResolver의 구현체인 RequestResponseBodyMethodProcessor에서 처리된다. 여기서 @Valid 어노테이션이 있을 경우 유효성 검사가 진행된다.
    (만약 @ModelAttribute를 사용할 경우 ModelAttributeMethodProcessor에 의해 @Valid가 처리된다)

      </aside>

  ⇒`@Valid`는 기본적으로 **컨트롤러에서만 동작**한다. 다른 계층에서 파라미터를 검증하기 위해서는 `@Validated`와 결합되어야 한다.

- `@Validated` : AOP 기반으로 메소드의 요청을 가로채서 유효성을 검증하는 어노테이션
  ⚠️`@Validated`는 `@Valid`와 달리 JSR 표준 기술이 아니며 Spring 프레임워크에서 제공하는 어노테이션이다.

  1. 다음과 같이 클래스에 `@Validated`를 붙여주고 유효성을 검증할 메소드의 파라미터에 `@Valid`를 붙여주면 사용 가능하다.

     ```java
     @Service
     @Validated
     public class UserService {

     	public void addUser(@Valid AddUserRequest addUserRequest) {
     		...
     	}
     }
     ```

  2. 검증 과정에서 예외가 있다면 `ConstraintViolationException` 예외가 발생한다.
  <aside>
  💡 **@Validated의 동작 원리**
  @Validated를 클래스에 선언해주면, 해당 클래스에 유효성 검증을 위한 AOP의 Advice 또는 MethodValidationInterceptor가 등록된다.
  그리고 해당 클래스의 메소드들이 호출될 때 AOP의 포인트 컷으로써 요청을 가로채서 유효성 검증을 진행한다.

    </aside>
    
    @Validated를 사용하면 컨트롤러, 서비스, 레파지토리 등 계층에 무관하게 **스프링 Bean이라면 유효성 검증을 진행할 수 있다.**
    
    - @Validated의 또다른 기능 : **유효성 검증 그룹**의 지정
        
        동일한 클래스에 대해 제약조건이 요청에 따라 달라질 수 있다.
        
        이 경우 제약 조건이 적용될 검증 그룹을 지정할 수 있는데, 검증 그룹을 지정하기 위해 (내용이 없는) 마커 인터페이스를 간단히 정의해야 한다.
        
        1. 요청의 주체가 사용자인 경우와 관리자인 경우로 분류된다고 하고, 다음과 같이 마커 인터페이스를 정의해준다.
            
            ```java
            public interface UserValidationGroup {} 
            public interface AdminValidationGroup {}
            ```
            
        2. 그리고 해당 제약 조건이 적용될 그룹을 `groups` 속성으로 지정해준다.(그룹을 여러 개 넣어줄 수도 있다)
            
            ```java
            @NotEmpty(groups = {UserValidationGroup.class, AdminValidationGroup.class} ) 
            private String name; 
            
            @NotEmpty(groups = UserValidationGroup.class) 
            private String userId; 
            
            @NotEmpty(groups = AdminValidationGroup.class) 
            private String adminId;
            ```
            
        3. 이후 컨트롤러에서도 다음과 같이 제약 조건 검증을 적용할 클래스를 지정해주면 된다.
            
            ```java
            @PostMapping("/users") 
            public ResponseEntity<Void> addUser(
                @RequestBody @Validated(UserValidationGroup.class) AddUserRequest addUserRequest) {
                
                  ...
            }
            ```
            
            - @Validated에 특정 클래스를 지정하지 않는 경우: groups가 없는 속성들만 처리
            - @Valid or @Validated에 특정 클래스를 지정한 경우: 지정된 클래스를 groups로 가진 제약사항만 처리

- 제약 조건 어노테이션의 종류
  | 어노테이션 | 설명 |
  | ----------- | ------------------------------------------------------------------------------------------ |
  | @NotNull | 해당 값이 null이 아닌지 검증함 |
  | @NotEmpty | 해당 값이 null이 아니고, 빈 스트링("") 아닌지 검증함(" "은 허용됨) |
  | @NotBlank | 해당 값이 null이 아니고, 공백(""과 " " 모두 포함)이 아닌지 검증함 |
  | @AssertTrue | 해당 값이 true인지 검증함 |
  | @Size | 해당 값이 주어진 값 사이에 해당하는지 검증함(String, Collection, Map, Array에도 적용 가능) |
  | @Min | 해당 값이 주어진 값보다 작지 않은지 검증함 |
  | @Max | 해당 값이 주어진 값보다 크지 않은지 검증함 |
  | @Pattern | 해당 값이 주어진 패턴과 일치하는지 검증함 |

[[Spring] @Valid와 @Validated를 이용한 유효성 검증의 동작 원리 및 사용법 예시 - (1/2)](https://mangkyu.tistory.com/174)

### ✅Dirty Checking(JPA에서 Entity를 업데이트하기)

```java
@Transactional
public Long updateProduct(ProductUpdateRequestDto productUpdateRequestDto, Long id){
		Optional<Category> updateCategory=this.categoryRepository.findByName(productUpdateRequestDto.getCategoryName());
		Optional<Product> item=this.productRepository.findById(id);

		...    //검증 로직

		item.get().update(productUpdateRequestDto.getName(), updateCategory.get(), productUpdateRequestDto.getPrice());

		return item.get().getId()
}
```

위 코드에서처럼 쿼리를 날리지 않고 repository로부터 불러온 엔티티 정보를 업데이트하면 데이터베이스에 해당 변경사항이 적용된다. 왜일까?

바로 JPA의 Dirty Checking(더티 체킹) 때문이다.

Dirty란 상태에 변화가 생긴 것을 의미하고, 그러니 Dirty Checking은 상태 변경 검사 정도로 이해하면 된다.

JPA에서는 트랜잭션이 끝나는 시점에 최초 조회 상태를 기준으로 **변화가 있는 모든 엔티티 객체**를 데이터베이스에 자동으로 반영해준다.

JPA는 엔티티를 조회하면 해당 엔티티의 조회 상태 그대로 스냅샷을 만들어두고, 트랜잭션이 끝나는 시점에서 이 스냅샷과 비교해서 다른 점이 있다면 Update Query를 데이터베이스에 전달한다.

이러한 상태 변경 검사의 대상은 영속성 컨텍스트가 관리하는 엔티티에만 적용된다.

<aside>
❓ **영속성 컨텍스트** : 엔티티를 영구 저장하는 환경

</aside>

detach된 엔티티(준영속)와 DB에 반영되기 전 처음 생성된 엔티티(비영속)는 Dirty Checking 대상에 포함되지 않기 때문에, 값을 변경해도 데이터베이스에 반영되지 않는다.

- 만일 변경사항이 있는 필드만 쿼리문에 포함시키고 싶은 경우 엔티티 최상단에 `@DynamicUpdate`를 선언해주면 된다.(Dirty Checking으로 생성되는 update 쿼리는 기본적으로 모든 필드를 업데이트하게 되어 있다.)

[[JPA] JPA를 통해 업데이트를 할 경우 왜 쿼리를 안날려도 될까?](https://easybrother0103.tistory.com/85)

[더티 체킹 (Dirty Checking)이란?](https://jojoldu.tistory.com/415)

### ✅@EnableScheduling

: 서버 어플리케이션 실행 시 등록된 스케줄링을 자동 실행하도록 설정하는 어노테이션

- 프로젝트 애플리케이션 클래스에 `@EnableScheduling` 어노테이션을 추가한다
  ```java
  @SpringBootApplication
  @EnableScheduling
  public class SolutionPackageApplication{
  		public static void main(String[] args){
  				SpringApplication.run(SolutionPackageApplication.class, args);
  		}
  }
  ```
- 스케줄링할 메서드에 `@Scheduled` 어노테이션을 추가한다.(스프링 빈으로 등록된 클래스에서만 사용 가능)
  ⚠️schedule method는 void를 반환하고 매개변수가 있어서는 안된다.
  ```java
  //1초 후 5초마다 반복 실행 스케줄링
  @Scheduled(fixedDelay = 5000, initialDelay = 1000)
  public void fiveRepeatJob(){
  		...
  }
  ```
- 스프링에서는 스케줄링 작업이 한 개의 스레드 풀에서 실행되기 때문에 **여러 개의 스케줄링 작업을 동시에 실행시키기 위해서**는 어플리케이션 클래스와는 별개로 Configuration 파일에서 스레드 풀에 대한 설정을 추가해주어야 한다.

  ```java
  @Configuration
  public class SchedulerConfig implements SchedulingConfigurer {
      private final int POOL_SIZE = 10;

      @Override
      public void configureTasks(ScheduledTaskRegistrar scheduledTaskRegistrar) {
          ThreadPoolTaskScheduler threadPoolTaskScheduler = new ThreadPoolTaskScheduler();

          threadPoolTaskScheduler.setPoolSize(POOL_SIZE);
          threadPoolTaskScheduler.setThreadNamePrefix("task-pool-");
          threadPoolTaskScheduler.initialize();

          scheduledTaskRegistrar.setTaskScheduler(threadPoolTaskScheduler);
      }
  }
  ```

[21. (spring/스프링) EnableScheduling , Scheduled 사용해 주기적 스케줄링 반복 작업 수행 실시](https://kkh0977.tistory.com/1165)

### ✅POJO(Plain Old Java Object)

**자바 객체의 표준**으로, 특정 인터페이스나 클래스를 상속하지 않고, 순수하게 Getter, Setter로만 구성된**(어디에도 종속되지 않은) 자바 객체**

```java
public class User {
    private int id;
    private String name;
    private String email;

    public int getId() {
    	return id;
    }
    public String getName() {
    	return name;
    }
    public String getEmail() {
    	return email;
    }

    public void setId(int id) {
    	this.id = id;
    }
    public void setName(String name) {
    	this.name = name;
    }
    public void setEmail(String email) {
    	this.email = email;
    }
}
```

- POJO가 등장한 이유
  Spring 프레임워크 이전에는 사용하고자 하는 엔터프라이즈 기술이 있다면 그 기술을 직접적으로 사용하는 객체를 설계했었다. 이렇게 특정 기술과 환경에 종속되어 의존하게 된 자바 코드는 가독성이 떨어져 유지보수에 어려움이 생기고, 특정 기술의 클래스를 상속받거나, 직접 의존하게 되어 확장성이 매우 떨어지는 단점이 있었다.
  ⇒객체 지향 설계의 장점을 잃음
  이런 문제를 해결하고자 본래 자바의 장점을 살리는 ‘오래된’ 방식의 ‘순수한’ 자바객체인 POJO라는 개념이 등장했다.
    <aside>
    💡 Spring 프레임워크는 POJO 방식의 프레임워크이다.
    
    </aside>

- POJO의 조건
  - 특정 규약에 종속되지 않아야 한다.
  - 특정 환경에 종속되지 않아야 한다.
    - 미리 지정된 클래스를 **Extends**하면 안된다.
    - 미리 정의된 인터페이스를 **Implement**하면 안된다.
    - 미리 정의된 **Annotation**을 포함하면 안된다.
      ⇒해당 클래스를 사용하기 위해 어떤 프레임워크나 외부 환경이 필요가 없다.(Spring MVC를 걷어내도 정상적으로 동작해야 한다.)
  - 단일 책임 원칙을 지키는 클래스여야 한다.
- POJO의 특징
  - 객체 지향적인 설계를 할 수 있다.
  - 로우 레벨 코드와 비즈니스 코드가 분리되어 깔끔한 코드를 작성할 수 있다.
  - 테스트에 용이하다.

[Spring 특징(1): POJO](https://velog.io/@alicesykim95/Spring-POJOPlain-Old-Java-Object)

[Bean VS POJO](https://woopi1087.tistory.com/7)
