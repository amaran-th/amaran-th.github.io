---
title: List&Dictionary 사용법
date: "2022-12-24T00:08:03.284Z"
description: "C#의 리스트와 딕셔너리를 사용해보자."
category: "Unity"
tag: ["Unity"]
---

<nav>
#목차

    List(리스트)

        선언, 원소 추가, 원소 탐색, 원소 제거, 정렬

    Dictionary(딕셔너리)

        선언, 원소 추가, 원소 값 접근, 키 포함 여부, 속성, 복사, 정렬

</nav>

### List(리스트)

\*배열과의 차이

1. 크기를 미리 정해줄 필요가 없다. = 크기가 동적이다.
2. 특정 원소를 제거하면 해당 원소의 뒤의 원소들의 index가 한 칸씩 당겨진다.

- 선언 : **List<_type_> _varName_ = new List<_type_>();**
  ```csharp
  List<int> num = new List<int>();
  ```
- 원소 추가 : **Add(_value_)**
  ```csharp
  num.Add(2);
  ```
  +) 특정 위치에 원소 추가 : **Insert(_index_, _value_)**
  ```csharp
  ...
  dogs.Add("spaniel");
  dogs.Add("beagle");
  dogs.Insert(1,"dalmatian");
  ```
  +) 특정 위치에 배열 추가 : **InsertRang(_index_, _array_)**
  ```csharp
  ...
  dogs.Add("spaniel");
  dogs.Add("beagle");
  String[] dogs2=new String[3];
  dogs2[0]="chiwawa";
  dogs2[1]="poodle";
  dogs2[2]="pomeranian";
  dogs.Insert(1,dogs2);
  ```
  +) 리스트 마지막에 배열 추가 : **AddRange(_array_);**
- 원소 탐색
  - **Contains(_value_)**
    : list 안에 해당 요소가 있는지 없는지 여부를 true/false로 반환한다.
    ```csharp
    if(dogs.Contains("spaniel")){
    	...
    ```
  - **IndexOf(_value_)**
    : list 내에서 function의 조건을 만족하는 원소의 index를 반환한다. 존재하지 않을 시 -1을 반환한다.
    ```csharp
    dogs.IndexOf("spaniel")
    ```
  - **Find(_function_)**
    : list 내 원소 중 function의 조건을 만족하는 첫 번째 원소를 반환한다.
    ```csharp
    String result=dogs.Find(dog=>dog=="chiwawa")
    ```
  - **Exist(_function_)**
    : list 내에서 function의 조건을 만족하는 원소의 존재 여부를 true/false로 반환한다.
    ```csharp
    if(dogs.Exist(dog=>dog=="chiwawa")){
    	...
    ```
- 원소 제거
  - **Remove(_value_)** : list 내의 value 값을 갖는 요소 제거
  - **RemoveAt(_index_)** : list의 특정 index의 요소 제거
  - **RemoveAll()** : list 내의 모든 요소 제거
  - **RemoveRange(_startIndex_, _endIndex_)** : list 내에서 index 범위 내의 요소들을 제거
- 원소 정렬 : **Sort()**
  : 기본적으로 원소들을 오름차순 정렬한다.

---

### Dictionary(딕셔너리)

: 키(key)와 값(value)의 쌍을 원소로 갖는 배열

\*파이썬의 dictionary와 동일한 개념이다.

- 선언
  ```csharp
  Dictionary<string, int> dict=new Dictionary<string, int>();
  ```
- 원소 추가 : **Add(_key_, _value_)**
  ```csharp
  dict.Add("cat", 2);
  ```
- 원소 값 접근 : **_dictionary_[*key*]**

  ```csharp
  int val=dict["cat"]
  ```

  +) **TryGetValue(_key_, out _변수_)**
  특정 키가 존재할 경우 해당 *key*에 대응되는 값을 찾아 *변수*에 저장한다.

  ```csharp
  int val1;
  if(dict.TryGetValue("cat", out val1)){
  ...

  //아래와 같이 변수의 선언과 동시에 값을 받아올 수도 있다.
  if(dict.TryGetValue("cat", out int val2)){
   ...
  ```

  +) foreach문으로 pair 를 추출 후 조회하는 방법

  ```csharp
  foreach(var pair in dict){
  	sum+=**pair.Value**;
  }
  ```

- 키 포함 여부 : **ContainsKey(key)**
  딕셔너리에 존재하는 키인지 여부를 반환한다.
  ```csharp
  if(dict.ConatinsKey("cat")){
  ...
  ```
- 딕셔너리의 속성(Property)
  **Count :** 딕셔너리의 원소 개수
  **Keys** : 딕셔너리의 키의 배열
  **Values** : 딕셔너리의 값의 배열

  ```csharp
  Dictionary<string, int> dict=new Dictionary<string, int>(){
  {"cat",1}, {"dog",2}, {"rose",1}, {"bird",3}
  };

  **dict.Count    //4
  dict.Keys    //["cat", "dog", "rose", "bird"]
  dict.Values  //[1,2,1,3]**
  ```

- 딕셔너리 객체를 복사하는 법
  생성자의 인수에 복사하고자 하는 딕셔너리 객체를 입력한다.

  ```csharp
  Dictionary<string, int> dict2=new Dictionary<string, int>(dict1);

  ```

- 딕셔너리를 정렬하는 방법
  : LINQ의 OrderBy 메서드를 사용한다.
  ```csharp
  using System.Linq;
  ...
  var sortedDict = dict.OrderBy(x => x.Value);    //값을 기준으로 정렬
  ```
