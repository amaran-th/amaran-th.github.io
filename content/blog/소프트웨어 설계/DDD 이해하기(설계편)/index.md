---
title: "DDD 이해하기(설계편)"
date: "2023-11-01T22:16:03.284Z"
description: "도메인 주도 설계에 대해 이해해보자."
section: "지식 공유" 
category: "소프트웨어 설계"
tags:
  - 우아한 테크코스
  - 소프트웨어 설계
  - DDD
thumbnailImg: "./img.png"
---



> ⚠️ 주의
>
> ---
> 해당 포스팅은 우아한 테크코스의 강의내용에 대한 작성자의 이해를 바탕으로 작성된 글입니다.  
> 
> 프로그래밍에 정답은 없습니다. DDD가 옳은 것 만은 아니며, 작성자 역시 배워가는 과정이기 때문에 본문에 부정확한 정보가 포함되어 있을 수 있으니 주의 바랍니다.

## 도메인 주도 설계 기본 요소
우리는 처음 도메인 모델을 만들 때 제일 먼저 **엔티티**와 **값객체**를 만듭니다.
### 값 객체(Value Object)
값객체의 값은 불변성을 가집니다.
의미를 명확하게 표혆거나 두 개 이상의 데이터가 개념적으로 하나인 경우, 값 객체를 이용합니다.
엔티티와 값 객체를 구분하는 기준으로 '식별자'를 두는 경우가 있습니다. 엔티티는 식별자가 존재하고, 값객체는 식별자가 없다는 식으로 말이죠.
식별자의 정의는 다음과 같습니다.
> **식별자**
> 
> ---
> - 객체의 상태 중 해당 객체의 고유한 성질을 표현할 수 있는 상태들
> - 객체 생성 시 함께 생성되며, 생성된 후에는 어떠한 이유로도 변경되지 않는다.

하지만 값 객체는 값객체가 가지는 값들 자체를 복합키(식별자)로 볼 수 있습니다.
다음과 같은 값객체를 예로 들어봅시다.
```java
class Name{
	private final String firstName;
	private final String lastName;
}
```
두 Name 객체의 firstName과 lastName이 모두 같은 경우, 두 객체의 동등성이 보장됩니다.
그리고 Name 객체가 생성된 이후 firstName과 lastName은 불변하므로 식별자의 불변성도 만족합니다.

### 엔티티(Entity)
식별자를 갖고, 그 외의 **변경 가능한** 값을 갖는 객체를 일컫습니다.
우리는 언제 가변 객체를 필요로 할까요?
값이 바뀌더라도 같은 객체를 보장하고 싶은 경우, 즉 객체를 추적하고 싶은 경우 엔티티를 사용합니다.

정리하면 값객체는 **불변 객체**, 엔티티는 **가변 객체**로 정의할 수 있습니다.

### 애그리거트
애그리거트는 DDD의 핵심 요소 중 하나로, 관련 객체를 하나로 묶은 군집을 의미합니다.
도메인 객체를 애그리거트로 묶어서 바라보면 좀 더 상위 수준에서 도메인 모델 간의 관계를 파악할 수 있습니다.
애그리거트는 다음과 같은 몇 가지 특징을 갖습니다.
- 애그리거트는 군집에 속한 객체들을 관리하는 **루트 엔티티**를 갖는다.
- 애그리거트에 속한 객체들은 유사하거나 동일한 라이프사이클을 갖는다.
	- ex) 지하철 도메인에서 노선(Line)과 역(Station)은 생성 시기가 다르기 때문에, 다른 애그리거트로 분류된다.
- 한 애그리거트에 속한 객체는 다른 애그리거트에 속하지 않는다.
- 두 개 이상의 엔티티로 구성되는 애그리거트는 드물게 존재한다.

- **애그리거트 루트**
	루트 애그리거트(=루트 엔티티)는 해당 애그리거트 내 객체들 중 유일하게 다른 애그리거트와 협력하는 객체입니다.
	다르게 표현하면, 루트 엔티티의 id는 외부에서 참조할 수 있는 **전역 식별자**이고, 자식 엔티티의 id는 외부에서 참조할 수 없는 **지역 식별자**입니다.
	![](https://i.imgur.com/rLOZeco.png)
	이런 규칙 하에 자식 엔티티들은 애그리거트 내에서 **캡슐화**됩니다.
	
	애그리거트를 분류할 때, 객체의 라이프사이클을 단순 CRUD를 기준으로 생각해선 안됩니다. 애그리거트는 불변식(절대 깨져선 안되는 규칙=비즈니스 규칙)이 꺠지지 않도록 보호하는 단위입니다.
	- 시스템이 기대하는 책임을 수행하며 일관성을 유지하는 단위
	- 일관성은 항상 참이어야 하는 속성을 유지함으로써 달성된다.
	- 명령을 수행하기 위해 함께 조회하고 업데이트해야 하는 최소 단위
	
	트랜잭션이 인프라 스트럭쳐(DB)에서 ACID를 보장하는 단위라면, 애그리거트는 애플리케이션 영역에서 ACID를 보장하는 단위입니다.

- **애그리거트 참조**
	애그리거트 간 참조는 간접참조로 구현하는 것이 권장됩니다. 복잡도를 낮출 수도 있고, 한 애그리거트에서 다른 애그리거트를 수정하는 문제를 원천적으로 방지할 수 있습니다.

### 레파지토리
엔티티와 값객체가 요구사항으로부터 도출되는 도메인 모델이라면, 레파지토리는 구현을 위한 도메인 모델입니다.
**애그리거트 단위**로 **도메인 객체를 저장하고 조회**하는 기능을 합니다.

### 도메인 서비스
결제 금액을 계산하는 로직을 구현한다고 해봅시다.
이때, 기능을 구현하기 위해서는 상품 애그리거트, 주문 애그리거트, 할인 쿠폰 애그리거트, 회원 애그리거트 등 여러 종류의 애그리거트에 접근해야 합니다.
그럼 실제로 결제 금액을 계산해야 하는 주체는 어떤 애그리거트일까요?

이 때 등장하는 것이 바로 서비스(Service) 개념입니다.

한 애그리거트에 넣기 애매한 도메인 개념을 구현할 때, 애그리거트에 억지로 넣기보단 도메인 서비스를 이용해서 도메인 개념을 명시적으로 드러낼 수 있습니다.
우리가 지금까지 알고 있었던 응용 영역(Application Layer)의 서비스가 응용 로직을 다룬다면, 도메인 영역의 도메인 서비스는 도메인 로직을 다룹니다.
도메인 서비스는 도메인 영역의 엔티티, 값객체 등과 달리 **상태 없이 로직만 구현**합니다.

이렇게 해서 만들어진 도메인 서비스는 애그리거트가 사용할 수도 있고, 응용 서비스에서 사용할 수도 있습니다.
어떤 기능과 관련된 로직을 한 데 모은 클래스이기 때문에, 절차지향적인 코드가 나올 수밖에 없습니다.
객체지향 코드에 익숙해진 사람이라면 이에 거부감이 들 수 있지만, 필요한 경우 절차지향적인 코드를 사용하는 것이 오히려 더 나은 선택지일 수도 있습니다.
실제로도 도메인 서비스는 응집도가 매우 높습니다.

## 미션 코드로 알아보는 의존성 리팩토링
강의에서 배운 내용을 바탕으로 '레거시 코드 리팩토링' 미션을 진행해보았습니다.

[미션 레파지토리](https://github.com/woowacourse/jwp-refactoring)

미션으로 주어진 코드를 책임 분배와 도메인 간 의존성의 관점에서 리팩토링하는 것이 과제였는데요,
**상품(Product), 메뉴 그룹(MenuGroup), 메뉴(Menu), 주문(Order), 주문 테이블(OrderTable), 단체 지정(TableGroup)** 총 6가지의 도메인이 제공되었습니다.
저는 이 각각이 하나의 애그리거트로 분류된다고 판단했습니다.
그래서 패키지를 애그리거트별로 나누어 주었고, 초기 코드의 도메인 클래스들은 다음과 같이 분류되었습니다.
![](https://i.imgur.com/B9VDAnp.png)

처음 받은 레거시 코드는 모든 도메인 클래스가 getter와 setter만 가지고 있고, 모든 비즈니스 로직이 서비스 계층에 존재하는 상태였습니다.
그래서 먼저 수행한 작업은 일급 컬렉션(MenuProducts)과 값객체(Price)를 만들어 **서비스에 있던 비즈니스 로직을 도메인으로 옮기는** 작업이었습니다.
1차적인 리팩토링이 끝난 후 패키지 별 도메인 클래스는 다음과 같이 구성되었습니다.

![](https://i.imgur.com/lqxodGF.png)

그 다음 저에게 주어진 과제는 **애그리거트 간의 참조 관계(=패키지 의존성)를 정리하는 것**이었습니다.
저는 이번 미션에서 JPA를 사용하지 않았고, 초기의 간접참조 방식을 그대로 유지했기 때문에 의존성 리팩토링을 하기 전 도메인 연관관계는 다음과 같았습니다.
![](https://i.imgur.com/yRgOXKb.png)

![](https://i.imgur.com/BJIri2r.png)

앞서 강조했던 대로 서로 다른 애그리거트 간의 참조관계는 모두 간접 참조로 처리되었죠. 양방향 참조도 보이지 않습니다.
이렇게 보면 아무런 문제가 없어보입니다. 적어도 '도메인 계층'에서는요.
사실, 앞서 서비스 리팩토링을 한 차례 거쳤음에도 일부 비즈니스 로직이 여전히 서비스 계층에 남아있는 문제가 있었습니다.
=> 서비스 계층에 남아있는 비즈니스 로직
그리고, 애그리거트 간의 의존성을 따질 때, 우리는 도메인뿐만 아니라 그 외 계층(서비스 계층)에서의 참조관계도 고려해야 합니다. 실제로 확인해본 결과 패키지 간 의존관계에서 양방향 사이클이 존재했습니다.
=> 패키지 간 양방향 사이클
### 1. 서비스 계층에 남아있는 비즈니스 로직
모든 비즈니스 로직을 도메인 계층으로 옮길 수 없었던 이유는 바로 **다른 애그리거트의 엔티티를 참조하는 로직**들이 포함되었기 때문인데요.

이와 관련된 요구사항과 참조 관계는 다음과 같았습니다. 
> 새로운 메뉴를 추가할 때, 메뉴의 가격은 메뉴를 구성하는 상품의 총 가격보다 저렴해야 한다.(Menu->Product)
```java
// MenuService.java

@Transactional  
public MenuQueryResponse create(final MenuCreateRequest request) {  
    validateMenuRequest(request, new Price(request.getPrice()));  
    final Menu menu = request.toMenu();  
  
    final Menu savedMenu = menuRepository.save(menu);  
  
    return MenuQueryResponse.from(savedMenu);  
}  
  
private void validateMenuRequest(  
        final MenuCreateRequest request, final Price price) {  
    final List<MenuProductCreateRequest> menuProducts = request.getMenuProducts();  
    final Price totalPrice = calculateTotalPrice(menuProducts);  
    validateMenuPrice(price, totalPrice);  
    validateExistMenuGroup(request.getMenuGroupId());  
}  
  
private Price calculateTotalPrice(final List<MenuProductCreateRequest> menuProducts) {  
    Price totalPrice = Price.ZERO;  
    for (final MenuProductCreateRequest menuProduct : menuProducts) {  
        final Product product = productRepository.findById(menuProduct.getProductId())  
                .orElseThrow(IllegalArgumentException::new);  
        totalPrice = totalPrice.add(product.getPrice().multiply(menuProduct.getQuantity()));  
    }  
    return totalPrice;  
}  
  
private void validateMenuPrice(final Price price, final Price totalPrice) {  
    if (price.isGreaterThan(totalPrice)) {  
        throw new IllegalArgumentException();  
    }  
}  
  
private void validateExistMenuGroup(final Long menuGroupId) {  
    if (!menuGroupRepository.existsById(menuGroupId)) {  
        throw new IllegalArgumentException();  
    }  
}
```
위 코드를 보면, calculateTotalPrice의 로직들은 모두 명백한 비즈니스 로직입니다. `productRepository`에 접근하는 코드를 제외하면 말이죠.
### 해결
**해결법 1.** 간접 참조를 포기하고 Menu가 Product를 직접참조를 하게 한다.

결론부터 말씀드리자면, 저는 Menu 애그리거트가 Product 애그리거트를 **직접 참조**하도록 하여 문제를 해결했습니다.
일반적으로, 서로 다른 애그리거트 간의 연관관계를 만들 떈 결합도를 줄이기 위해 직접참조보다는 간접참조를 하는 것이 권장됩니다. 
하지만 해당 요구사항에 의해 Menu와 Product는 긴밀한 협력관계를 맺고 있었기에, 두 애그리거트는 높은 결합도를 가져도 괜찮다고 생각했습니다.
그리고 직접 참조를 하면 간단하게 해결될 문제인데 간접참조를 고집하느라 굳이 멀리 돌아간다는 느낌도 없지않아 있었구요.
그래서 도메인 간 참조관계는 다음과 같은 구성이 되었습니다.

![](https://i.imgur.com/SnX7jJB.png)

**해결법 2.** Menu 도메인에 대한 모든 검증 작업을 수행하는 도메인 서비스를 만든다.

만약 간접참조를 포기하고 싶지 않다면, 조영호님의 [세미나 영상](https://youtu.be/dJ5C4qRqAgA)에서 제시된 해결책을 도입할 수 있습니다.
현재 상황에서는 Menu가 비즈니스 로직에서 참조하는 도메인이 Product 하나이기 때문에 첫번째 해결법을 채택했지만, 만일 프로젝트 규모가 커지고 Menu에 대한 로직을 처리할 때 더 많은 도메인을 참조하게 되는 경우, 그러한 로직들을 한 데 모아 Menu에 대한 검증만을 위한(이를테면 MenuValidator라는) 클래스를 만들어줄 수 있습니다.(=도메인 서비스)
### 2. 패키지 간 양방향 사이클
애그리거트 간 의존관계는 다음과 같이 구성되었습니다.

![](https://i.imgur.com/OJGxYiT.png)

도메인 간의 직/간접 참조는 요구사항 특성상 제거하는 데 어려움이 있기 때문에, 그 외의 참조관계를 제거해주어야 합니다.
이 구성에서 제거해야 할 참조관계는 다음과 같습니다.
- product->menu
- table->order
- table_group->order

1. **product->menu**

	이 참조관계는, Product 클래스가 Menu 애그리거트에 포함되어 있는 Price 값객체를 직접참조하고 있기 때문에 발생한 것이었습니다.
	이처럼 공통적으로 사용되는 값객체는 어느 애그리거트에 포함되어야 할지 고민이 많았는데요, 크게 모든 패키지가 참조하는 common 패키지를 만들어 그 안에 위치시키는 방법과  Product만을 위한 Price 값객체를 별도로 만들어주는 방법 2가지가 나왔습니다.
	저는 이 중 후자의 방식을 선택했습니다.
2. **table->order & table_group->order**

	이 참조관계가 발생한 이유는 다음의 요구사항 때문이었습니다.
	> 주문 테이블이 비었는지 여부를 변경할 때 혹은 단체 지정을 해제할 때 테이블에 완료되지 않은 주문이 포함되어 있으면 안된다.
	
	검증 로직에 Order 애그리거트에 접근하는 로직이 포함되어 있는 것이죠.
	이 경우에도 2가지 해결책이 있는데, 하나는 의존성 역전을 통해 의존 방향을 역전시키는 것이고 다른 하나는 **도메인 이벤트(Event)** 를 활용하는 것입니다.
	저는 이 중 후자의 방법을 통해 문제를 해결했습니다.
	order의 도메인 계층에 이벤트를 수신하는 Event Listener 클래스를 구현해줍니다.
```java
// OrderEventListener.java

@Component  
public class OrderEventListener {  
    private final OrderRepository orderRepository;  
  
    public OrderEventListener(final OrderRepository orderRepository) {  
        this.orderRepository = orderRepository;  
    }  
  
    @EventListener  
    public void validateAllOrdersCompletion(final ValidateOrderOfTableEvent event) {  
        if (orderRepository.existsByOrderTableIdAndOrderStatusIn(event.getOrderTableId(),  
                OrderStatus.NOT_COMPLETION_STATUSES)) {  
            throw new IllegalArgumentException();  
        }  
    }  
  
    @EventListener  
    public void validateAllOrderTablesCompletion(final ValidateOrderOfTablesEvent event) {  
        if (orderRepository.existsByOrderTableIdInAndOrderStatusIn(  
                event.getOrderTableIds(), OrderStatus.NOT_COMPLETION_STATUSES)) {  
            throw new IllegalArgumentException();  
        }  
    }  
}
```
그리고 table과 table_group 도메인 계층에 이벤트 객체를 구현해줍니다.
```java
// table...ValidateOrderOfTableEvent.java

public class ValidateOrderOfTableEvent {  
    private Long orderTableId;  
  
    public ValidateOrderOfTableEvent(Long orderTableId) {  
        this.orderTableId = orderTableId;  
    }  
  
    public Long getOrderTableId() {  
        return orderTableId;  
    }  
}
```
```java
// table_group...ValidateOrderOfTablesEvent.java

public class ValidateOrderOfTablesEvent {  
    private final List<Long> orderTableIds;  
  
    public ValidateOrderOfTablesEvent(final List<Long> orderTableIds) {  
        this.orderTableIds = orderTableIds;  
    }  
  
    public List<Long> getOrderTableIds() {  
        return orderTableIds;  
    }  
}
```
이제 기존에 Order 애그리거트에 접근했던 서비스 계층의 로직을 이벤트를 발행하는 로직으로 수정해줍니다.(`publisher.publishEvent()`)
```java
// TableService.java

private final ApplicationEventPublisher publisher;
...

@Transactional  
public OrderTableQueryResponse changeEmpty(final Long orderTableId,  
                                           final OrderTableEmptyModifyRequest request) {  
    final OrderTable savedOrderTable = orderTableRepository.findById(orderTableId)  
            .orElseThrow(IllegalArgumentException::new);  
    publisher.publishEvent(new ValidateOrderOfTableEvent(orderTableId));  
    savedOrderTable.updateEmpty(request.isEmpty());  
  
    return OrderTableQueryResponse.from(orderTableRepository.save(savedOrderTable));  
}
```
```java
//TableGroupService.java

private final ApplicationEventPublisher publisher;
...

@Transactional  
public void ungroup(final Long tableGroupId) {  
    final OrderTables orderTables = new OrderTables(  
            orderTableRepository.findAllByTableGroupId(tableGroupId));  
  
    final List<Long> orderTableIds = orderTables.extractOrderTableIds();  
  
    publisher.publishEvent(new ValidateOrderOfTablesEvent(orderTableIds));  
  
    final List<OrderTable> ungroupedTables = orderTables.ungroup();  
    for (final OrderTable orderTable : ungroupedTables) {  
        orderTableRepository.save(orderTable);  
    }  
}
```
이렇게 하면 다른 애그리거트를 참조하지 않고도 해당 애그리거트의 로직을 수행할 수 있습니다.

## 참고 자료
우아한테크코스 제이슨 코치의 강의 내용

[의존성을 이용해 설계 진화시키기 - 우아한테크세미나](https://youtu.be/dJ5C4qRqAgA)

도서 \[객체 지향의 사실과 오해]

[복잡성과 OOP](http://redutan.github.io/2016/10/13/complexity-and-oop)

[소프트웨어 복잡성](https://kwangyulseo.com/2015/04/28/%EC%86%8C%ED%94%84%ED%8A%B8%EC%9B%A8%EC%96%B4-%EB%B3%B5%EC%9E%A1%EC%84%B1/)