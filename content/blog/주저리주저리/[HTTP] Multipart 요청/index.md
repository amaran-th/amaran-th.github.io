---
title: '[HTTP] Multipart 요청'
date: "2023-09-26T00:23:03.284Z"
description: "Multipart 타입의 기본 개념과 사용법에 대해 정리하였다."
section: "지식 공유" 
category: "주저리주저리"
tags:
  - 우아한 테크코스
  - Kerdy
  - HTTP
---

## Multipart
---
<aside>

**Multipart란?**

---
클라이언트와 서버 간에 전송되는 HTTP 요청 또는 응답에서 여러 종류의 데이터를 동시에 전송하기 위해 사용되는 방식
</aside>

HTTP 요청은 크게 Header와 Body로 나누어져 있는데, Header의 Content-Type 속성은 Body 데이터의 유형을 정의한다.

HTTP 요청을 받은 서버는 요청 Header의 Content-Type 속성 값을 보고 Body 부분을 알맞은 형태로 해석한다.

Multipart는 이 Content-Type의 한 종류로, 웹 클라이언트가 요청을 보낼 때 Http 요청의 바디 부분을 **여러 부분으로 나누어서**(multi part) 보내는 방식이다.

### Multipart의 필요성

클라이언트가 이미지를 첨부한 게시글을 업로드하는 상황을 생각해보자.

**게시글의 제목**과 **이미지 파일**을 받는 input 필드가 있을 것이다.(`<input type="text"/>`, `<input type="file"/>`) 이 두 input 데이터의 Content-Type은 각각 `application/x-www-form-unlencoded`와 `image/jpeg`가 된다. 즉, 하나의 요청에 Content-Type이 서로 다른 데이터가 2개 이상 들어가게 된다.

이렇게 한 Request Body에서 2종류 이상의 데이터를 넣어주기 위해 등장한 것이 바로 `multipart/form-data` 타입이다.

## Multipart 요청 보내보기
---
이번에 Kerdy에 이미지 저장 기능을 도입하면서, 행사 생성 API를 수정하고(백엔드) 관리자 페이지의 요청 코드(프론트엔드)를 작성했다.

순서대로 실제 오가는 HTTP 요청의 예시, API 코드, 프론트엔드 코드를 소개하도록 하겠다.

### Multipart HTTP 요청 예제
```http
POST /events HTTP/1.1 
Content-Type: multipart/form-data; boundary=6o2knFse3p53ty9dmcQvWAIx1zInP11uCfbm 
Host: localhost:8080 

--6o2knFse3p53ty9dmcQvWAIx1zInP11uCfbm 
Content-Disposition: form-data; name=images 

test data 
--6o2knFse3p53ty9dmcQvWAIx1zInP11uCfbm 
Content-Disposition: form-data; name=images 

test data 
--6o2knFse3p53ty9dmcQvWAIx1zInP11uCfbm 
Content-Disposition: form-data; name=request 
Content-Type: application/json 

{"name":"인프콘 2023","location":"코엑스",...(생략)..."paymentType":"FREE","organization":"행사기관"} 
--6o2knFse3p53ty9dmcQvWAIx1zInP11uCfbm--
```
Multipart 타입의 HTTP 요청은 boundary라는 문자열을 기준으로 각 데이터를 나눈다.
마지막 boundary 끝에 붙은 `--`는 Request Body의 끝을 알린다.
<aside>

**Boundary란?**

---
파일을 첨부할 때 브라우저가 랜덤으로 생성한 값. 여러 개의 데이터가 전송되었을 때 각각의 key/value 쌍을 구분하기 위해 boundary가 사용된다.
</aside>

요청의 Body 부분을 보면 총 3개의 데이터를 확인할 수 있다. images에 할당된 데이터가 2개, request에 할당된 데이터가 1개이고 request 데이터는 `application/json` 타입이라고 명시되어 있다.(images의 경우 클라이언트측에서 타입을 직접 명시해주지 않았는데, 이 경우 서버가 실제 업로드된 데이터를 보고 타입을 판별한다.)

### @RequestPart 어노테이션

`multipart/form-data`요청의 일부를 메서드 인수와 매핑하는 데 사용되는 어노테이션.

- 사용 예시
    ```java
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)  
    @ResponseStatus(HttpStatus.CREATED)  
    public EventDetailResponse addEvent(@RequestPart @Valid final EventDetailRequest request,  
        @RequestPart final List<MultipartFile> images) {  
    return eventService.addEvent(request, images, LocalDate.now());  
    }
    ```
코드를 보면 요청 데이터로 Dto 객체(request)와 MultipartFile 리스트 객체(images)를 받는 것을 확인할 수 있다.

*MultipartFile 객체는 `@RequestParam`으로도 받을 수 있지만, Dto와 MultipartFile 객체를 함께 받기 위해서는 `@RequestPart `어노테이션을 사용해야 한다.

앞서 보여준 HTTP 요청에서도 request로 json 형식의 데이터가, images로 복수 개의 데이터가 전달된 것을 확인할 수 있었는데, 이는 API 코드와 부합한다.

<aside>

**@RequestParam과의 차이점**

---
`@RequestParam`은 쿼리 파라미터, Form Data, Multipart 등 많은 요청 파라미터를 지원한다. 메서드 파라미터의 타입이 String 또는 MultipartFile/Part가 아닌 경우, Converter 또는 PropertyEditor를 참조해 변환을 시도한다.

`@RequestPart`는 Multipart를 지원한다. `@RequestParam`은 name-value 형식의 데이터를 지원하지만 `@RequestPart`는 보다 복잡한 JSON, XML 등과 같은 것들을 지원한다.

요청 헤더의 Content-Type에 해당하는 HttpMessageConverter를 사용한다.
</aside>

### JavaScript 코드(feat. axios)
앞서 보여준 API와 매핑되는 요청을 보내는 javascript 코드를 작성하면 다음과 같이 작성할 수 있다.
```javascript
async function addEvent({ newData, newTags, type, images }) {
	const formData = new FormData();
	const request = {
		name: newData.name,
		location: newData.location,
		informationUrl: newData.informationUrl,
		/* 중략 */
		eventMode: newData.eventMode,
		paymentType: newData.paymentType,
		organization: newData.organization,
	};
	formData.append(`request`, new Blob([JSON.stringify(request)], { type: "application/json" }))
	Array.from(images).forEach((image) => {
		formData.append(`images`, image);
	})
	const options = {
		method: "POST",
		url: API_URL + "/events",
		data: formData
	};
	try {
		const response = await axios(options);
		return response.data;
	} catch (error) {
		alert(error.response?.data?.message);
		return error.response?.data;
	}
}
```
`FormData` 객체에 여러 타입의 데이터를 넣어주면 요청의 Content-Type이 자동으로 multipart 타입으로 설정된다.

### Spring @RequestMapping 어노테이션의 consumes 설정
```java
@PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)  
@ResponseStatus(HttpStatus.CREATED)  
public EventDetailResponse addEvent(@RequestPart @Valid final EventDetailRequest request,  
    @RequestPart final List<MultipartFile> images) {  
  return eventService.addEvent(request, images, LocalDate.now());  
}  
  
@PutMapping("/{eventId}")  
@ResponseStatus(HttpStatus.OK)  
public EventDetailResponse updateEvent(@PathVariable final Long eventId,  
    @RequestPart @Valid final EventDetailRequest request,  
    @RequestPart final List<MultipartFile> images) {  
  return eventService.updateEvent(eventId, request, images, LocalDate.now());  
}
```
여기서 깜빡하고 수정 API(updateEvent)에 대해 consumes를 설정해주지 않았는데, 실제로 동작이 잘 이루어져서 의아했다.

ChatGPT에게 물어보니 다음과 같은 답변을 받았다.

> Spring MVC에서 `@PostMapping` 및 `@RequestMapping` 주석의 `consumes` 속성은 핸들러 메서드가 소비하거나 허용할 수 있는 미디어 유형을 지정하는 데 사용됩니다. 이는 반드시 필요한 것은 아니며 지정되지 않은 경우 Spring은 요청 헤더, 특히 `Content-Type` 헤더를 기반으로 미디어 유형을 결정하려고 시도합니다. Spring이 미디어 유형을 결정할 수 없으면 기본값을 사용합니다.
> 
> `addEvent` 메소드에서 `consumes = MediaType.MULTIPART_FORM_DATA_VALUE`를 지정했습니다. 이는 이 메소드가 `multipart/form-data`의 `Content-Type`이 있는 요청만 허용할 수 있음을 나타냅니다. 이는 콘텐츠 유형을 제한하므로 파일 업로드가 필요한 엔드포인트에 적합합니다.
> 
> `updateEvent` 메소드에서 `consumes` 속성을 명시적으로 설정하지 않았습니다. 'consumes'를 지정하지 않으면 Spring은 요청 헤더에서 미디어 유형을 결정하려고 시도합니다. 이 경우, 이 엔드포인트로 전송된 요청의 'Content-Type'이 'multipart/form-data'인 경우 제대로 작동할 수 있습니다.
> 
> 따라서 귀하의 경우 `updateEvent` 메소드가 `multipart/form-data` 요청을 허용하도록 의도된 경우 `consumes` 속성을 지정하지 않은 채로 두면 들어오는 요청에 적절한 속성이 있는 한 예상대로 작동합니다. '콘텐츠 유형' 헤더. 그러나 더 명시적으로 표현하고 싶거나 엔드포인트가 다른 미디어 유형을 소비할 것으로 예상되는 경우 `consumes`를 사용하여 이를 지정해야 합니다.
> 
> API를 정의할 때 특히 클라이언트가 올바른 콘텐츠 유형을 전송하는지 확인하려는 경우 명시적으로 정의하는 것이 좋습니다. 콘텐츠 유형을 `multipart/form-data`로 제한하려면 `updateEvent` 메서드에 `consumes = MediaType.MULTIPART_FORM_DATA_VALUE`를 추가하여 코드에서 명확하게 만들 수 있습니다.

즉 우리가 `@RequestMapping`의 path 값을 지정해 해당 path를 uri로 갖는 요청만을 매핑시키는 것처럼, consumes 값을 지정해서 해당 Content-Type이 설정된 요청만을 매핑하도록 해주는 제약이라고 할 수 있다. 분명 저번에 한 번 공부했던 내용인데 그새 까먹고 삽질을 했다...

## 참고 자료
---
[Spring Multipart 및 업로드(study4_4)](https://brilliantdevelop.tistory.com/111)