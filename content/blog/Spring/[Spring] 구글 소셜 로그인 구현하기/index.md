---
title: "[Spring] 구글 소셜 로그인 구현하기"
date: "2024-01-25T21:30:03.284Z"
description: "구글 소셜 로그인을 구현해보자."
section: "문제 해결" 
category: "Spring"
tags:
  - 두레
  - Spring
---


# 들어가며
---
이번에 두레 서비스의 소셜 로그인 기능을 맡게 되어, 기능을 구현한 과정을 정리해보았습니다.

![](https://i.imgur.com/2CevUad.png)
구글 소셜 로그인을 구현한 다른 문서들을 참고하며 이해한 내용을 바탕으로 흐름도를 만들어보았습니다.

전체적인 흐름을 클라이언트와 서버(SpringBoot) 파트로 분류해보자면, 'Google 로그인'부터 '인가 코드 전달'까지는 클라이언트에서, 구글 서버에서 인가코드를 전달받은 후부터 '서버 Access Token 반환'하는 부분 까지가 서버에서 처리해야 하는 로직입니다.

그럼 한 차례씩 진행해보도록 하겠습니다.

# Google Cloud에서 클라이언트 등록하기
로직을 구현하기 앞서, 구글 소셜 로그인을 구현하기 위해서는 구글의 OAuth API를 사용해야 합니다.

이 OAuth API를 사용하기 위해서는 Google로부터 인가받은 클라이언트 키가 필요한데, 이 키들은 Google Cloud에서 발급받을 수 있습니다.

## 1. Google Cloud 프로젝트 생성
먼저 [Google Cloud](https://console.cloud.google.com/welcome?pli=1&project=sixth-foundry-280506)로 접속합니다.

![](https://i.imgur.com/fD4589T.png)
좌측 상단의 빨간색 박스로 표시한 부분을 클릭합니다.
![](https://i.imgur.com/zMTKrd1.png)
여기서 새 프로젝트 생성을 클릭합니다.
![](https://i.imgur.com/qGj9j04.png)
프로젝트 이름을 설정하고 `만들기`를 클릭합니다.
## 2. 소셜 로그인 시 수집할 개인정보 설정
다들 소셜 로그인을 할 때 서비스에 제공할 정보를 선택한 경험이 있을 것입니다. 저희 두레 서비스가 사용자로부터 제공받아야 할 Google 계정 정보를 설정해봅시다.
![](https://i.imgur.com/mD40V3n.png)
사이드바에서 `API 및 서비스`>`사용자 인증 정보`를 찾아 클릭합니다.
![](https://i.imgur.com/eUd83UE.png)
`동의화면 구성`을 클릭합니다.
![](https://i.imgur.com/F5QuySo.png)
프로젝트를 만들 때 조직을 구성하지 않았기 때문에 내부는 선택할 수 없습니다. 외부를 선택한 후 `만들기`를 클릭합니다.
![](https://i.imgur.com/pkJMFCf.png)
첫 번째로 서비스의 정보를 입력하는 화면이 뜹니다.

서비스 이름인 두레와 Cloud 프로젝트를 생성한 계정을 입력한 뒤, `저장하고 계속`을 클릭합니다.
![](https://i.imgur.com/XC2vxvf.png)
다음으로 나오는 화면에서 `범위 추가 또는 삭제`를 클릭합니다.
![](https://i.imgur.com/OOMv3D0.png)
기본적으로 자주 사용하는 email, profile, openid를 선택해 주었습니다.
![](https://i.imgur.com/Wi1QyTL.png)
그리고 다음으로 넘어가서, 테스트 사용자를 설정하는 창이 뜰 것입니다. 여기서 `ADD USERS`를 클릭하여 
테스트 사용자를 이메일 형식으로 등록합니다.

여기까지 마쳤다면 OAuth 동의 화면 구성이 끝난 것입니다.
## 3. 클라이언트 ID 생성
이제 OAuth API를 호출하는 데 필요한 클라이언트 키를 발급받아 봅시다.
![](https://i.imgur.com/gS9Ak2m.png)
사이드 바에서 `사용자 인증 정보` 화면으로 이동한 뒤, `사용자 인증 정보 만들기`>`OAuth 클라이언트 ID`를 클릭합니다.
![](https://i.imgur.com/mW9GvyF.png)
두레는 웹 서비스이므로, 애플리케이션 유형으로 `웹 애플리케이션`을 선택하고, 서비스 이름을 입력한 뒤 승인된 리디렉션 URI에 임시로 `http://localhost:8080/login/oauth2/code/google`를 입력합니다.
![](https://i.imgur.com/D56w6Cd.png)
다음 화면으로 넘어가면, 이제 클라이언트 ID와 비밀번호가 생성됩니다.
해당 값을 기억해둡시다.
# Google 로그인~인가 코드 전달(클라이언트)
클라이언트 파트는 간단하게 훑고 넘어가도록 하겠습니다.

브라우저에서 구글 로그인 창을 호출하는 URL은 `https://accounts/google.com/o/oauth2/v2/auth`이고, 여기에 필수 파라미터 4가지를 추가해주어야 합니다.

- **client_id** : 앞서 발급받은 ClientID
- **redirect_url** : 앞서 Google Cloud에서 설정해주었던 리다이렉트 url
- **response_type** : code로 고정(인가 코드를 통한 로그인 방식을 사용할 것이므로)
- **scope**: 토큰 발급 이후 유저 정보에서 어떤 항목을 조회할 것인지(email, profile 등)
클라이언트에서 리다이렉트해주어야 할 url은 다음과 같은 형태가 됩니다.
```javascript
const url = 'https://accounts.google.com/o/oauth2/v2/auth?client_id=' + process.env.VUE_APP_GOOGLE_CLIENT_ID + '&redirect_uri=' + process.env.VUE_APP_GOOGLE_REDIRECT_URL + '&response_type=code' + '&scope=email profile';
```
브라우저에서 이 url로 접속하니 다음과 같이 소셜 로그인 화면이 뜹니다.
![](https://i.imgur.com/F46HPxH.png)
여기서 계정을 선택하면 앞서 설정해준 리다이렉트 url로 리다이렉트됩니다. 이 때 리다이렉트된 url을 살펴보면 쿼리 파라미터로 code 속성을 가지고 있는데, 이 값이 바로 백엔드에 전달해주어야 할 인가코드입니다.
```
http://localhost:8080/login/oauth2/code/google?code={인가코드}&scope=email+profile+...
```
클라이언트는 이 **인가 코드**를 저장해두었다가, 로그인 요청과 함께 서비스 서버에 전달하도록 구성합니다.
# Access Token 요청~서버 Access Token 반환(서버)
구현에 앞서 여기서 확실하게 짚고 넘어가야 할 것은, 흐름도에 표현된 **Access Token**과 **서버 Access Token**의 차이입니다. Access Token으로 표기한 토큰은 회원가입/로그인 한 사용자의 구글 계정 정보를 가져올 수 있도록 Google에서 발급해준 액세스 토큰입니다.

서버 Access Token은 우리 서버에서 자체적으로 생성한 액세스 토큰으로, 우리 서비스를 이용하기 위해 필요한 사용자 인증 토큰입니다.

간단히 흐름만 살펴보자면, 백엔드에서는 이제 클라이언트가 전달한 인가코드를 가지고 Google OAuth API를 호출하여 Access Token을 요청해야 합니다.

그리고 이 Access Token을 사용해 사용자의 구글 계정 정보를 요청하고, (회원가입이 되어있지 않은 경우) 해당 정보를 기반으로 서비스 DB에 회원(Member) 레코드를 추가합니다.

그리고 서버의 Access Token을 생성해서 클라이언트 측에 반환하기만 하면, 소셜 로그인 동작이 마무리됩니다.
그럼 본격적으로 구현에 들어가봅시다.

<br/>

먼저 앞서 발급받은 client id, client secret 및 redirect url은 외부에 노출되어선 안될 중요한 정보이므로, 신경써서 관리해주어야 합니다.

옛날에 [민감 정보 관리에 대해 고민했던 내용을 정리한 적](https://amaran-th.github.io/%EC%A3%BC%EC%A0%80%EB%A6%AC%EC%A3%BC%EC%A0%80%EB%A6%AC/Kerdy%20%ED%94%84%EB%A1%9C%EC%A0%9D%ED%8A%B8%EC%9D%98%20%EC%9D%B8%ED%94%84%EB%9D%BC%EC%97%90%20%EB%8C%80%ED%95%9C%20%EB%85%BC%EC%9D%98/)이 있으니, 필요하다면 참고해주시면 감사하겠습니다.

로그인에 필요한 로직을 수행하는 도메인을 다음과 같이 설계해보았습니다.
![](https://i.imgur.com/8X9PjyF.png)

## Google Access Token 요청(GoogleClient)
먼저, GoogleClient 클래스를 구현하여 Google Access Token을 조회하는 로직을 구현해봅시다.
요청 url은 `https://oauth2.googleapis.com/token`이며, HTTP 메서드는 **POST**입니다.
```json
POST https://oauth2.googleapis.com/token  
Content-Type: application/json;
  
{  
  "code": "4%2F0AfJohXlpgkCgIruONFGdaZ9NBbqWY77MkcJlPLFJg9NQmB38ZFpy80qUjKCFOWWSRIGevA",  
  "client_id": "****************************",  
  "client_secret": "****************************",  
  "redirect_uri": "****************************",  
  "grant_type": "authorization_code"
}
```
- **code** : 클라이언트로부터 전달받은 인가 코드
- **client_id** : 구글 개발자센터에서 발급 받은 Client ID
- **client_secret** : 구글 개발자센터에서 발급 받은 Client Secret
- **redirect_uri** : 구글 개발자센터에서 등록한 redirect_uri
- **grant_type**: 'authorization_code' 로 고정 (인가코드를 통한 로그인 방식)

위와 같은 요청을 보냈을 때 응답받는 데이터 형식은 다음과 같습니다.
```json
HTTP/1.1 200 OK

{
  "access_token": "ya29.a0AfB_byBBu8CYAjXyRqT-7dYgd7LUVL2YaolgOiHDkztgRHovvvhxnKcy8aqE72llGvcNmBY-vXS8ZdDEak2QradNvAlCxfRUi_q6GyF9WpaKta4Ko0MKr7Z7iKCZY6Es8opsaa5frZNR9lTdpieAx_VVUajKRAI4cAMqaCgYKAUoSARMSFQHGX2MiU0f5LUFgsRiWTkR3_eNzDg0171",
  "expires_in": 3599,
  "scope": "openid https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile",
  "token_type": "Bearer",
  "id_token": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjQ4YTYzYmM0NzY3Zjg1NTBhNTMyZGM2MzBjZjdlYjQ5ZmYzOTdlN2MiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiI0NzAyNzY3MTQ4MTYtZTNxMTZqdHA2YTV0bW9ndDB0dDFsMWQwdThicmhyNjUuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiI0NzAyNzY3MTQ4MTYtZTNxMTZqdHA2YTV0bW9ndDB0dDFsMWQwdThicmhyNjUuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMTY1MDU1NzQxODU3NDQxMjMyNjciLCJlbWFpbCI6InNvbmdzeTQwNUBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiYXRfaGFzaCI6IkpSOHJRWmNsRWxDZUxCSE9xS1FLOHciLCJuYW1lIjoi7YOA7JWEIiwicGljdHVyZSI6Imh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS9hL0FDZzhvY0xkdnJKa2xaa0pjaWdOOE1hV2FhNTM5RGl0UkMtRGYwRlhDTmdOeHFzUmN3PXM5Ni1jIiwiZ2l2ZW5fbmFtZSI6IuyVhCIsImZhbWlseV9uYW1lIjoi7YOAIiwibG9jYWxlIjoia28iLCJpYXQiOjE3MDU5OTEyNDUsImV4cCI6MTcwNTk5NDg0NX0.WZrdcuJXS_8544O8ek8ylRuNpunD_AkmI5YwEi9N80bAbzs4UjXJS32XjJywNCbPu3SN96Zjp7QYfPezypz1lfiVDYZdV18tiAfaDS1K4FEVmiL5_2MjkG9SfvHbG9cr7XTjepNpK_1d-jeSvqJAOt6ZGnaygZqdsJXh9_al72VUb9vvrqrJ4t8Rdnd_sib31GT2kb105oRScUxq1k-EO5nzt53tdokzP3bj_EY-H5tWZKIZas7RmVkTn9VsIVCSFME7_DI3hsCJRNrDuwSuR13mTiJmuBl1S7lU0unPwmkPsigtugUzx7DgWlIOx_sGpr0G2VW8Rsd52zmzjEW5CA"
}
```
- **access_token** : 구글 액세스 토큰
- **expires_in** : 구글 액세스 토큰의 만료 시간(초 단위)
- **scope** : 조회하고자 하는 사용자의 정보
- **token_type** : 토큰 유형. Bearer로 고정
- **id_token** : 구글 리프레시 토큰

구글 서버에 요청을 보내기 위해 저는 **RestTemplate**를 사용했습니다.
```java
private String requestGoogleAccessToken(final String code) {  
    final String decodedCode = URLDecoder.decode(code, StandardCharsets.UTF_8);  
    final HttpHeaders headers = new HttpHeaders();  
    headers.add(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE);  
    final HttpEntity<GoogleAccessTokenRequest> httpEntity = new HttpEntity<>(  
            new GoogleAccessTokenRequest(decodedCode, clientId, clientSecret, redirectUri, authorizationCode),  
            headers  
    );  
    final GoogleAccessTokenResponse response = restTemplate.exchange(  
            accessTokenUrl, HttpMethod.POST, httpEntity, GoogleAccessTokenResponse.class  
    ).getBody();  
    return Optional.ofNullable(response)  
            .orElseThrow(() -> new LoginException(NOT_FOUND_GOOGLE_ACCESS_TOKEN_RESPONSE))  
            .getAccessToken();  
}
```
한 라인씩 설명을 하도록 하겠습니다.
```java
final String decodedCode = URLDecoder.decode(code, StandardCharsets.UTF_8);
```
code값을 utf-8로 디코딩하는 코드입니다. 트러블 슈팅을 거쳐 추가하게 되었습니다.
클라이언트로부터 입력받은 인가 코드(code 값)는 앞부분에 `\`(역슬래시) 문자가 %2F로 인코딩되어 포함되어 있는데, 이를 그대로 구글에 보내는 요청에 포함시키게 되면 해당 인가코드를 잘못된 코드로 인식하여 "**malformed auth code.**"라는 오류 메시지를 반환하게 됩니다.
그래서 애플리케이션 코드 수준에서 직접 인가 코드 값을 UTF-8로 디코딩시켜주는 것입니다.
[참고한 게시글](https://velog.io/@hwsa1004/SpringSpringBoog-%EA%B5%AC%EA%B8%80-%EB%A1%9C%EA%B7%B8%EC%9D%B8-errordescription-malformed-auth-code.-%EB%AC%B8%EC%A0%9C-%ED%95%B4%EA%B2%B0)
```java
final HttpHeaders headers = new HttpHeaders();  
    headers.add(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE);  
    final HttpEntity<GoogleAccessTokenRequest> httpEntity = new HttpEntity<>(  
            new GoogleAccessTokenRequest(decodedCode, clientId, clientSecret, redirectUri, authorizationCode),  
            headers  
    );  
```
구글에 보낼 요청에 대한 명세를 설정하는 코드입니다. 헤더에 `Accept: application/json`을 추가해주고, body에 값을 채워넣었습니다.
```java
final GoogleAccessTokenResponse response = restTemplate.exchange(  
            accessTokenUrl, HttpMethod.POST, httpEntity, GoogleAccessTokenResponse.class  
    ).getBody();  
```
accessTokenUrl은 앞서 언급했던 요청 url입니다. HTTP 메서드는 POST로 설정해주고, 앞서 정의했던 요청 명세(HttpEntity) 객체를 넣어준 다음 응답 데이터를 담을 DTO의 타입을 명시해줍니다. 이렇게 해서 얻은 응답 데이터의 Body 데이터를 DTO 객체로 받아올 수 있습니다. 

## Google 계정 프로필 정보 요청하기(GoogleClient)
다음으로, 응답받은 액세스 토큰을 가지고 사용자의 계정 정보를 조회하는 로직을 구현해봅시다.
요청 url은 `https://www.googleapis.com/userinfo/v2/me`이며, HTTP 메서드는 **GET**입니다.
```http
GET https://www.googleapis.com/userinfo/v2/me?access_token=ya29.a0AfB_byDdUDtF6mbOwRnwCRF-qkv34BVNLS4Dh7AmVhVDkxXepmjiMpgDuPvKsdQHpWT9p_QTB2_ao5rfYg0C-jszCnQTB9TIMeUGEuIETNgKWxn3hIZNUyxF5aDyTpQKVbpz-_BwXeAFtH3XRZHE4BDsTjRukbPvu5ecaCgYKAd0SARMSFQHGX2MiUb3h2ERMghLbiu-Q5NBMfQ0171
```
```http
GET https://www.googleapis.com/userinfo/v2/me
Authorization: Bearer ya29.a0AfB_byDdUDtF6mbOwRnwCRF-qkv34BVNLS4Dh7AmVhVDkxXepmjiMpgDuPvKsdQHpWT9p_QTB2_ao5rfYg0C-jszCnQTB9TIMeUGEuIETNgKWxn3hIZNUyxF5aDyTpQKVbpz-_BwXeAFtH3XRZHE4BDsTjRukbPvu5ecaCgYKAd0SARMSFQHGX2MiUb3h2ERMghLbiu-Q5NBMfQ0171
```
여기서 위의 두가지 방법 중 무엇을 사용하든 구글 서버는 같은 응답을 반환합니다. 액세스 토큰을 쿼리스트링으로 노출하는 것보다는 헤더에 숨기는 편이 보안적으로 더 안전하므로 후자의 방식으로 구현했습니다.
응답 데이터의 형식은 다음과 같습니다.
```json
HTTP/1.1 200 OK

{
  "id": "116505574185744123267",
  "email": "songsy405@gmail.com",
  "verified_email": true,
  "name": "타아",
  "given_name": "아",
  "family_name": "타",
  "picture": "https://lh3.googleusercontent.com/a/ACg8ocLdvrJklZkJcigN8MaWaa539DitRC-Df0FXCNgNxqsRcw=s96-c",
  "locale": "ko"
}
```
이제 구현 코드를 봅시다.
```java
private GoogleAccountProfileResponse requestGoogleAccountProfile(final String accessToken) {  
    final HttpHeaders headers = new HttpHeaders();  
    headers.add(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken);  
    final HttpEntity<GoogleAccessTokenRequest> httpEntity = new HttpEntity<>(headers);  
    return restTemplate.exchange(profileUrl, HttpMethod.GET, httpEntity, GoogleAccountProfileResponse.class)  
            .getBody();  
}
```
헤더의 **Authorization** 속성을 설정해주고 요청 Url에 GET 요청을 보냅니다.
나머지는 Google Access Token 요청과 동일합니다.

## GoogleClient.java 전체 코드
```java
@Component  
@RequiredArgsConstructor  
public class GoogleClient {  
  
    @Value("${spring.security.oauth2.client.registration.google.client-id}")  
    private String clientId;  
    @Value("${spring.security.oauth2.client.registration.google.client-secret}")  
    private String clientSecret;  
    @Value("${spring.security.oauth2.client.registration.google.redirect-uri}")  
    private String redirectUri;  
    @Value("${spring.security.oauth2.client.registration.google.authorization-grant-type}")  
    private String authorizationCode;  
    @Value("${url.access-token}")  
    private String accessTokenUrl;  
    @Value("${url.profile}")  
    private String profileUrl;  
  
  
    private final RestTemplate restTemplate;  
  
    public GoogleAccountProfileResponse getGoogleAccountProfile(final String code) {  
        final String accessToken = requestGoogleAccessToken(code);  
        return requestGoogleAccountProfile(accessToken);  
    }  
  
    private String requestGoogleAccessToken(final String code) {  
        final String decodedCode = URLDecoder.decode(code, StandardCharsets.UTF_8);  
        final HttpHeaders headers = new HttpHeaders();  
        headers.add(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE);  
        final HttpEntity<GoogleAccessTokenRequest> httpEntity = new HttpEntity<>(  
                new GoogleAccessTokenRequest(decodedCode, clientId, clientSecret, redirectUri, authorizationCode),  
                headers  
        );  
        final GoogleAccessTokenResponse response = restTemplate.exchange(  
                accessTokenUrl, HttpMethod.POST, httpEntity, GoogleAccessTokenResponse.class  
        ).getBody();  
        return Optional.ofNullable(response)  
                .orElseThrow(() -> new LoginException(NOT_FOUND_GOOGLE_ACCESS_TOKEN_RESPONSE))  
                .getAccessToken();  
    }  
  
    private GoogleAccountProfileResponse requestGoogleAccountProfile(final String accessToken) {  
        final HttpHeaders headers = new HttpHeaders();  
        headers.add(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken);  
        final HttpEntity<GoogleAccessTokenRequest> httpEntity = new HttpEntity<>(headers);  
        return restTemplate.exchange(profileUrl, HttpMethod.GET, httpEntity, GoogleAccountProfileResponse.class)  
                .getBody();  
    }  
}
```

## 서비스 로그인 Access Token 발급(JwtTokenGenerator)
다음으로, 이렇게 받은 구글 계정 정보를 토대로 회원 정보 값을 셋팅하여 새로운 회원을 등록하거나(회원가입), 기존에 존재하는 회원 중 정보가 일치하는 회원을 찾아 해당 회원의 로그인 Access Token을 발급해주어야 합니다.

두레 서비스에서는 JWT(Json Web Token)을 발급할 것이기 때문에, JWT에 대해 간략히 알아보도록 하겠습니다.
### JWT(Json Web Token)
JWT란 Json 객체에 인증에 필요한 정보들을 담은 후 비밀키를 통해 암호화한 토큰입니다.

JWT는 `.`을 기준으로 구분되며 Header, Payload, Signature 3가지 요소로 구성됩니다.
![](https://i.imgur.com/4pndNuC.png)
그럼 각 요소에 대해 암호화되기 전 Json 데이터의 형식을 살펴봅시다.
- Header

	```java
	{
		"alg": signature에서 사용하는 알고리즘,
		"typ": 토큰 타입
	}
	```
- Payload

	Payload에는 보통 Claim이라고 하는 속성을 key-value 형태로 저장합니다. Claim이라는 단어 뜻 그대로 토큰에서 사용할 정보의 조각인 셈입니다.

	Payload에 어떤 데이터(Claim)를 넣을지는 자유이지만, JWT의 표준 스펙에서는 다음과 같은 Claim들이 포함됩니다.
	```java
	{
		"sub": 토큰 제목(subject),
		"aud": 토큰 대상자(audience),
		"iat": 토큰이 발급된 시각(issued at),
		"exp": 토큰의 만료 시각(expired)
	}
	```
- Signature

	Signature은 Header와 Payload의 문자열을 합친 후, 헤더에서 선언한 알고리즘과 비밀키를 이용해 암호화한 값입니다.

	Header와 Payload는 단순히 Base64url로 인코딩되어 있기 때문에 누구나 쉽게 복호화할 수 있지만, Signature는 비밀키 없이는 복호화할 수가 없습니다.

이러한 구성을 이해한 채로, 실제 구현 코드를 작성해봅시다.
### 토큰 발급
```java
public String generateToken(final String id) {  
        final Claims claims = Jwts.claims();  
        claims.put("memberId", id);  
        final Date now = new Date();  
        final Date expiredDate = new Date(now.getTime() + expireTimeMilliSecond);  
  
        return Jwts.builder()  
                .setClaims(claims)  
                .setIssuedAt(now)  
                .setExpiration(expiredDate)  
                .signWith(SignatureAlgorithm.HS256, secretKey)  
                .compact();  
    }  
```
두레 서비스의 Access Token는 회원 식별을 위해 memberId를 Claim으로 넣어주었습니다.
`setIssuedAt()`, `setExpiration()` 메서드를 통해 토큰 발급 날짜와 만료 날짜를 설정해주었고, `signWith()` 메서드를 통해 시그니처를 암호화할 방식과 비밀키를 지정해주었습니다.

### 토큰 해독
추후 서버에서 발급한 Access Token을 포함한 요청을 받았을 때 Payload 데이터(memberId)를 얻을 수 있도록 `extractMemberId()` 메서드를 미리 구현해둡시다.
```java
public String extractMemberId(final String token) {  
        try {  
            return Jwts.parser()  
                    .setSigningKey(secretKey)  
                    .parseClaimsJws(token)  
                    .getBody()  
                    .get("memberId")  
                    .toString();  
        } catch (final Exception error) {  
            throw new LoginException(LoginExceptionType.INVALID_ACCESS_TOKEN);  
        }  
    } 
```
토큰을 파싱하는 과정에서 예외가 발생했을 때, 즉 유효하지 않은 토큰이 입력으로 들어왔을 경우 커스텀 예외를 반환하도록 해주었습니다.

## JwtTokenGenerator.java 전체 코드
```java
@Component  
public class JwtTokenGenerator {  
  
    @Value("${jwt.secret-key}")  
    private String secretKey;  
    @Value("${jwt.expire-length}")  
    private long expireTimeMilliSecond;  
  
    public String generateToken(final String id) {  
        final Claims claims = Jwts.claims();  
        claims.put("memberId", id);  
        final Date now = new Date();  
        final Date expiredDate = new Date(now.getTime() + expireTimeMilliSecond);  
  
        return Jwts.builder()  
                .setClaims(claims)  
                .setIssuedAt(now)  
                .setExpiration(expiredDate)  
                .signWith(SignatureAlgorithm.HS256, secretKey)  
                .compact();  
    }  
  
    public String extractMemberId(final String token) {  
        try {  
            return Jwts.parser()  
                    .setSigningKey(secretKey)  
                    .parseClaimsJws(token)  
                    .getBody()  
                    .get("memberId")  
                    .toString();  
        } catch (final Exception error) {  
            throw new LoginException(LoginExceptionType.INVALID_ACCESS_TOKEN);  
        }  
    }  
}
```
# 마무리하며
---
이렇게 해서 구글 소셜 로그인 기능을 구현해보았습니다.
이번에 구현한 기능은 로그인 토큰을 발급하는 기능까지였고, 이제 이 토큰을 전달받았을 때 사용자 권한을 체크하기만 하면 권한 인증과 관련된 기능은 마무리됩니다.

로그인 과정에 대해서는 이전에 참여했던 프로젝트에서 공부했었기 때문에 이해하고 있었지만, 직접 구현해보니 감회가 새로웠습니다. 생각했던 것보다 트러블 슈팅도 많이 겪었구요.
역시 뭐든 직접 구현해봐야 배우는 느낌이 나는 것 같습니다.

그럼 다음 글에서 뵙겠습니다.
# 참고 자료
[[Spring Boot] Spring Security를 사용한 Jwt Token 로그인 구현](https://chb2005.tistory.com/178)
