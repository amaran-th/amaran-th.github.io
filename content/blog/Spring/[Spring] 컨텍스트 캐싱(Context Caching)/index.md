---
title: "[Spring] 컨텍스트 캐싱(Context Caching)"
date: "2023-11-30T17:03:03.284Z"
description: "컨텍스트 캐싱을 최대한으로 활용하기 위해 주의해야 할 점을 알아보자."
section: "문제 해결" 
category: "Spring"
tags:
  - Kerdy
  - 테스트
  - Spring
---


## 글을 쓴 계기
---
![](https://i.imgur.com/ayl72Qh.png)

이번에 커디의 관리자 로그인 기능을 구현하면서 위와 같은 리뷰를 받았다.
난 `@MockBean`을 단순히 'Mocking한 빈 객체를 주입하는 어노테이션'으로 이해하고 있었는데, 이로 인해 컨텍스트 캐싱이 깨질 수 있다는 말이 대체 무슨 의민지 이해가 되질 않았다.
그래서 이를 학습하면서 새로 알게된 지식을 정리하고 공유하고자 글을 작성하게 되었다.

## MockBean
먼저 MockBean의 개념을 짚고 넘어가자.

*Mocking에 대한 개념은 [해당 글](https://amaran-th.github.io/%EC%9A%B0%ED%85%8C%EC%BD%94%205%EA%B8%B0/[%EA%B8%B0%EC%88%A0%EB%B6%80%EC%B1%84]%20%EC%9A%B0%ED%85%8C%EC%BD%94%205%EA%B8%B0%20%EB%A0%88%EB%B2%A81%20-%208%EC%A3%BC%EC%B0%A8/#%ED%85%8C%EC%8A%A4%ED%8A%B8-%EB%8D%94%EB%B8%94)을 참조하자.

Mokito에서 제공하는 어노테이션 @MockBean을 사용하면, 모킹된 스프링 빈 객체를 주입받을 수 있다.
```java
  @MockBean
  private JwtTokenProvider tokenProvider;
  ...

  @Test
  @DisplayName("관리자 아이디, 패스워드로 사용자를 조회하여 토큰을 생성한다.")
  void createAdminToken_success() {
    // given
    final Long memberId = adminMemberId;
    final AdminLoginRequest request = new AdminLoginRequest(adminId, adminPassword);
    final String expectAccessToken = "expect_access_token";
    given(tokenProvider.createToken(String.valueOf(memberId))).willReturn(expectAccessToken);

    // when
    final AdminTokenResponse actualToken = adminLoginService.createAdminToken(request);

    // then
    assertEquals(expectAccessToken, actualToken.getAccessToken());
  }
```
리뷰를 받았던 코드는 위와 같다.

여기서 JwtTokenProvider는 `@Component` 어노테이션을 통해 빈으로 등록해준 커스텀 빈이다.
나는 JwtTokenProvider의 createToken() 메서드를 호출하면 내가 정의한 임의의 토큰("expect_access_token")을 반환하게 하고 싶어, `@MockBean` 어노테이션을 사용해서 해당 빈의 Mock 객체를 주입받게 하였다.
## 컨텍스트 캐싱
---
컨텍스트 캐싱에 대해 설명하기 전에, 우리가 테스트를 수행하는 방법에 대해 잠시 알아보자.

우리가 테스트 클래스에 `@SpringBootTest` 어노테이션을 붙이고 테스트를 실행하면, `@SpringBootTest`는 실제 스프링 컨텍스트를 띄워서 빈으로 등록된 모든 객체를 가져온다.

스프링 컨텍스트를 띄우는 작업은 시간이 꽤 걸리는 작업인데, 만약 `@SpringBootTest`가 붙은 테스트 코드를 여러 개 실행하는 상황에서 테스트 클래스마다 새로운 스프링 컨텍스트를 띄운다면 전체 테스트에 걸리는 시간이 굉장히 길어질 것이다.

이런 문제를 해결하기 위해 스프링에서는 **Context Caching**이라는 테스트 최적화 기법을 제공하고 있다.

Context Caching은 말 그대로 스프링 컨텍스트를 캐싱하는 것으로, **동일한 컨텍스트 구성을 갖는 테스트**라면 캐싱된 컨텍스트를 재활용할 수 있다.

여기서 '동일한 컨텍스트 구성을 갖는 테스트'에 집중해보자. ApplicationContext를 식별하는 기준엔 무엇이 있을까?
공식 문서에 따르면, TestContext 프레임워크는 다음의 구성 매개변수들을 사용해 컨텍스트 식별자(cache key)를 구성한다.

> - locations (from @ContextConfiguration)
> - classes (from @ContextConfiguration)
> - contextInitializerClasses (from @ContextConfiguration)
> - contextCustomizers (from ContextCustomizerFactory) – this includes @DynamicPropertySource methods as well as various features from Spring Boot’s testing support such as @MockBean and @SpyBean.
> - contextLoader (from @ContextConfiguration)
> - parent (from @ContextHierarchy)
> - activeProfiles (from @ActiveProfiles)
> - propertySourceLocations (from @TestPropertySource)
> - propertySourceProperties (from @TestPropertySource)
> - resourceBasePath (from @WebAppConfiguration)

이 중에서 4번째 항목을 보면, 어떤 빈을 mocking했는지가 컨텍스트 캐싱 여부에 영향을 준다는 것을 알 수 있다.

이는 즉 테스트 클래스마다 **`@MockBean` 처리한 빈들의 조합**이 달라지면 캐싱된 컨텍스트를 재활용하지 못하고 새로운 컨텍스트를 띄운다는 의미이다. 
### 문제 해결
보통은 이 문제를 해결하기 위해 같은 유형의 **테스트 클래스들이 사용하는 Bean을 통일**시킨다. 커디 서비스 역시 ServiceIntegrationTestHelper라는 헬퍼 클래스를 만들어 Service 계층의 테스트에서 사용되는 모든 `@MockBean` 객체들을 정의해두고, 모든 서비스 테스트 클래스들이 해당 클래스를 상속 받도록 하여 이 문제를 해결하고 있었다.
```java
@SpringBootTest  
@Sql(value = "/data-test.sql", executionPhase = ExecutionPhase.BEFORE_TEST_METHOD)  
public abstract class ServiceIntegrationTestHelper {  
  
  @MockBean  
  protected GithubClient githubClient;  
  @MockBean  
  protected FirebaseCloudMessageClient firebaseCloudMessageClient;  
  @MockBean  
  protected ImageCommandService imageCommandService;  
  @MockBean  
  protected S3Client s3Client;  
}
```
여기까지 학습하고 나서, 리뷰받은 코드를 어떻게 수정할지 고민을 해봤는데 다시 생각해보니 JwtTokenProvider는 외부 서비스가 아니라 우리가 직접 구현한 서비스이기 때문에 굳이 Mocking을 하지 않아도 될 것 같았다.

그래서 코드를 다음과 같이 수정했다.
```java
@Autowired  
private JwtTokenProvider jwtTokenProvider;  
  
@Test  
@DisplayName("관리자 아이디, 패스워드로 사용자를 조회하여 토큰을 생성한다.")  
void createAdminToken_success() {  
  // given  
  final Long memberId = adminMemberId;  
  final AdminLoginRequest request = new AdminLoginRequest(adminId, adminPassword);  
  final String expectAccessToken = jwtTokenProvider.createToken(String.valueOf(memberId));  
  
  // when  
  final AdminTokenResponse actualToken = adminLoginService.createAdminToken(request);  
  
  // then  
  assertEquals(expectAccessToken, actualToken.getAccessToken());  
}
```
결국 문제 원인을 없앰으로써 문제가 해결된 케이스가 되긴 했지만, Context Caching에 대해 이전보다 확실하게 이해하게 되었고 앞으로 다른 프로젝트를 진행할 때 적용할 수 있을 테스트 최적화 사례를 알게 되어서 굉장히 뜻깊은 경험이 됐다고 생각한다.

## 참고 게시글
---
[[Spring] 테스트 시간 최적화 (feat.Context Caching)](https://jaeseo.tistory.com/entry/%ED%85%8C%EC%8A%A4%ED%8A%B8-%EC%BD%94%EB%93%9C-%EC%B5%9C%EC%A0%81%ED%99%94-featContext-Caching)

[테스트 성능 개선하기](https://velog.io/@byeongju/%ED%85%8C%EC%8A%A4%ED%8A%B8-%EC%84%B1%EB%8A%A5-%EA%B0%9C%EC%84%A0%ED%95%98%EA%B8%B0)