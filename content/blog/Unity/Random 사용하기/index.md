---
title: Random 사용하기
date: "2022-12-11T20:16:03.284Z"
description: "내장 클래스 Random Class를 사용해보자"
category: "Unity"
tags:
  - Unity
  - C#
  - Random
---

### Random Class

: **UnityEngine**에 내장된 클래스

- 랜덤 숫자 추출
  - `Random.value` : 0.0에서 1.0 사이의 임의의 부동 소수점 수를 제공
  - `Random.Range(min,max)` : 사용자가 제공한 최솟값과 최댓값 사이의 임의의 숫자를 제공.
    제공된 최솟값&최댓값이 int→int 반환
    제공된 최솟값&최댓값이 float→float 반환
- 배열에서 랜덤 값 추출
  ```csharp
  var element=myArr[Random.Range(0,myArr.Length)];
  ```
  위와 같이 배열 내 원소 중 하나를 무작위로 선택할 수 있다.
- 리스트 순서 섞기
  ```csharp
  void Shuffle(int[] deck){
  	for (int i=0;i<deck.Length;i++){
  		int temp=deck[i];
  		int randomIndex=Random.Range(i,deck.Length);
  		deck[i]=deck[randomIndex];
  		deck[randomIndex]=temp;
  	}
  }
  ```
- 아이템 집합에서 반복 없이 선택하기

  ```csharp
  Transform[] spawnPoints;

  Transform[] ChooseSet (int numRequired) {
      Transform[] result = new Transform[numRequired];

      int numToChoose = numRequired;

      for (int numLeft = spawnPoints.Length; numLeft > 0; numLeft--) {

          float prob = (float)numToChoose/(float)numLeft;

          if (Random.value <= prob) {
              numToChoose--;
              result[numToChoose] = spawnPoints[numLeft - 1];

              if (numToChoose == 0) {
                  break;
              }
          }
      }
      return result;
  }
  ```
