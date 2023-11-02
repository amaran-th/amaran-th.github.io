---
title: "[Spring] Github 소셜 로그인 구현하기"
date: "2023-05-26T20:30:03.284Z"
description: "Github의 인증 API를 사용해 소셜 로그인을 구현해보자."
section: "지식 공유" 
category: "Spring"
tags:
  - 우아한 테크코스
  - Spring
  - Web
  - 보안
---

> 이 글은 학습 고도화 근로팀에서 PROLOG 도메인을 분석하는 과정에서 작성되었다.

## Github 소셜 로그인 인증 흐름

---

Spring(Java)에서 Github 소셜 로그인을 구현하기 위해 알아둬야 할 인증 흐름은 다음과 같다.

1. `https://github.com/login/oauth/authorize?client_id={발급받은 client_ID}` 주소를 사용자에게 띄워준다.(프론트에서 리다이렉션)
2. 사용자는 Github 로그인을 통해서 인증을 한다.
3. 인증에 성공하면, Github는 {우리가 설정한 콜백 URL}?code={인증코드} 로 **code값**을 쿼리 파라미터 형태로 보내준다.
4. 받은 code를 이용해서 `https://github.com/login/oauth/access_token` 로 {client_ID,client_Secret,code}를 POST요청으로 전송한다.
5. Github는 `access_token`을 응답해서 서버측으로 보내준다.
6. 서버는 `access_token`을 `https://api.github.com/user` 로 담아서 GET 요청을 보낸다.
7. Github는 로그인한 사용자의 정보를 서버측으로 보내준다.
8. 받은 사용자 정보를 사용한다.(회원가입 혹은 로그인)

**4번 단계부터가 서버에서 처리하는 동작이다.**

현재(2023-05-26) 기준 GithubLogService 클래스에 작성되어 있는 createToken() 메서드는 다음과 같다.

```java
private final GithubClient githubClient;
...
public TokenResponse createToken(TokenRequest tokenRequest) {
		String githubAccessToken = githubClient.getAccessTokenFromGithub(tokenRequest.getCode());
    GithubProfileResponse githubProfile = githubClient
        .getGithubProfileFromGithub(githubAccessToken);
    Member member = memberService.findOrCreateMember(githubProfile);
    String accessToken = jwtTokenProvider.createToken(member);
    return TokenResponse.of(accessToken);
}
```

GithubClient 클래스에 구현되어 있는 `getAccessTokenFromGithub()`는 Github Auth API를 호출하여 Github 로그인 인증 토큰을 받아온다.

`getGithubPorfileFromGithub()`는 앞 라인에서 받아온 Github 로그인 인증 토큰으로 사용자의 Github 계정의 프로필 정보를 받아온다.(닉네임, 프로필 이미지 등)

이제 각 메서드의 상세 동작 메커니즘을 살펴보자.

### 4. 받은 code를 이용해서 `https://github.com/login/oauth/access_token` 로 {client_ID,client_Secret,code}를 POST요청으로 전송한다.

`getAccessTokenFromGithub()`

```java
public String getAccessTokenFromGithub(String code) {
    GithubAccessTokenRequest githubAccessTokenRequest = new GithubAccessTokenRequest(
        code,
        clientId,
        clientSecret
    );

    HttpHeaders headers = new HttpHeaders();
    headers.add("Accept", MediaType.APPLICATION_JSON_VALUE);

    HttpEntity<MultiValueMap<String, String>> httpEntity = new HttpEntity(
        githubAccessTokenRequest, headers);
    RestTemplate restTemplate = new RestTemplate();

    String accessToken = restTemplate
        .exchange(tokenUrl, HttpMethod.POST, httpEntity, GithubAccessTokenResponse.class)
        .getBody()
        .getAccessToken();
    if (accessToken == null) {
        throw new GithubApiFailException();
    }
    return accessToken;
}
```

Github Auth API를 호출하기 위해 `{client_ID,client_Secret,code}`를 데이터로 담은 요청 객체(HttpEntity)를 생성한다.

<aside>
💡 RestTemplate이란?

Spring에서 HTTP 통신을 RESTful 형식에 맞게 간편하게 사용할 수 있게 해주는 템플릿이다.

Rest API 서비스에 요청을 보내고 응답을 받을 수 있다.

- `exchange()` : 원하는 HTTP 메소드를 요청하고 결과를 ResponseEntity로 반환한다.
</aside>

```java
public <T> ResponseEntity<T> exchange(String url, HttpMethod method,
			@Nullable HttpEntity<?> requestEntity, Class<T> responseType, Object... uriVariables)
			throws RestClientException {
```

exchange() 메서드의 파라미터는 순서대로 요청을 보낼 **url**, HTTP **메서드**, **요청 객체**, Response data를 매핑할 **객체(dto)의 클래스**이다.

Github 로그인 인증 API를 호출하기 위해 `tokenUrl`에는 다음 url이 담겨있다.

```
https://github.com/login/oauth/access_token
```

해당 url에 `{client_ID,client_Secret,code}`을 담은 POST 요청을 보낸다.

### 5. Github는 `access_token`을 응답해서 서버측으로 보내준다.

이렇게 해서 응답받은 데이터에는 인증된 Github 계정의 액세스 토큰이 포함되어있다. 이를 추출한다.

```java
String githubAccessToken = githubClient.getAccessTokenFromGithub(tokenRequest.getCode());
```

### 6. 서버는 `access_token`을 `https://api.github.com/user` 로 담아서 GET 요청을 보낸다.

`getGithubProfileFromGithub()`

```java
public GithubProfileResponse getGithubProfileFromGithub(String accessToken) {
    HttpHeaders headers = new HttpHeaders();
    headers.add("Authorization", "token " + accessToken);

    HttpEntity httpEntity = new HttpEntity<>(headers);
    RestTemplate restTemplate = new RestTemplate();

    try {
        return restTemplate
            .exchange(profileUrl, HttpMethod.GET, httpEntity, GithubProfileResponse.class)
            .getBody();
    } catch (HttpClientErrorException e) {
        throw new GithubConnectionException();
    }
}
```

마찬가지로 profileUrl에는 다음 url 정보가 선언되어 있다.

```
https://api.github.com/user
```

위 url에 GET 요청을 보낸다.

### 7. Github는 로그인한 사용자의 정보를 서버 측으로 보내준다.

이렇게 해서 응답 받은 데이터에는 다음과 같은 회원 정보가 들어가 있다.

```java
public class GithubProfileResponse {

    @JsonProperty("name")
    private String nickname;
    @JsonProperty("login")
    private String loginName;
    @JsonProperty("id")
    private String githubId;
    @JsonProperty("avatar_url")
    private String imageUrl;

		...
```

### 8. 받은 사용자 정보를 사용한다.(회원 가입 혹은 로그인)

## 참고 게시글

---

[· Spring Boot Github 소셜 로그인 구현하기 (RestTemplate · WebClient)](https://inkyu-yoon.github.io/docs/Language/SpringBoot/GithubLogin)
