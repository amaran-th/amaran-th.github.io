---
title: "[OS] CPU 스케줄링 알고리즘"
date: "2024-04-21T01:35:03.284Z"
description: "CPU 스케줄링 알고리즘의 종류에 대해 알아보자."
section: "지식 공유"
category: "CS"
tags:
  - 운영체제
thumbnailImg: "./scheduling.png"
---

# CPU 스케줄링이란?

CPU 스케줄링이란 **운영체제가 언제, 어떤 프로세스에 CPU를 할당할지 결정하는 작업**을 의미한다.

다음 이미지를 보자.

CPU를 할당받기 전의 프로세스들은 Ready Queue에서 대기하게 되는데, 이 Ready Queue에 있는 프로세스 중 현재 실행 중인(=CPU를 할당받은) 프로세스 다음에 실행될 프로세스를 결정하는 방법이 바로 CPU 스케줄링 알고리즘이다.

# 개념 이해하기

CPU 스케줄링 알고리즘을 이해하기 위해 필요한 개념들에 대해 알아보자.

## Preemptive(선점형) & Nonpreemptive(비선점형)

- **Preemptive(선점형)**: 현재 CPU를 사용 중인 프로세스로부터 CPU 자원을 빼앗아 다른 프로세스에 할당할 수 있는 스케줄링 방식.
- **NonPreemptive(비선점형)**: 현재 CPU를 사용 중인 프로세스의 작업이 끝날 때까지 프로세스 작업을 기다리는 스케줄링 방식.

## Scheduling Criteria(스케줄링 기준)

CPU 스케줄링의 품질을 측정하는 기준으로는 Throughput(처리량), Turnaround Time(전체 처리 시간), Response Time(응답 시간), Waiting Time(대기 시간) 등이 있다.

- **Throughput**: 단위 시간당 실행이 완료된 프로세스의 수
- **Turnaround Time**: 프로세스가 Ready Queue에 도착하고 실행을 완료할 때까지 소요된 시간
  ![](https://i.imgur.com/m7ZqLqM.png)
- **Response Time** : 프로세스가 Ready Queue에 도착하고 처음 실행되기까지 소요된 시간
  ![](https://i.imgur.com/TKXroB2.png)
- **Waiting Time**: 프로세스가 Ready Queue에서 대기하는 시간

# CPU 스케줄링 알고리즘

이번 글에서 다룰 스케줄링 알고리즘은 다음의 7가지이다.

- FCFS (First Come First Served, 선입 선처리)
- SJF (Shortest Job First, 최단작업 우선)
- SRTF (Shortest Remaining Time First, 최소 잔여시간 우선)
- RR (Round Robin)
- Priority Scheduling(우선순위 스케줄링)
- MLQ (Multi-Level Queue, 다단계 큐)
- MLFQ (Multilevel Feedback Queue, 다단계 피드백 큐)

## FCFS(First-Come, First-Served) 스케줄링

FCFS는 단순히 먼저 Ready Queue에 삽입된 순서대로 CPU를 할당하는 방법으로, **비선점형 스케줄링** 방식이다.

### 예제

프로세스 P1, P2, P3의 Burst Time(CPU 실행 시간)이 다음과 같이 주어지고, 프로세스가 Ready Queue에 도착하는 시간(Arrival Time)은 모두 0이라고 하자.
![](https://i.imgur.com/Z0kPGET.png)
![](https://i.imgur.com/dFQILl4.png)

- 프로세스 별 대기 시간(Waiting Time): P1=0, P2=24, P3=27
  - 평균 대기 시간: 17
  - 평균 전체 처리시간: (24+27+30)/3 = 27
- 문제점
  - 프로세스들의 대기 시간이 매우 길어질 수 있다.

## SJF (Shortest Job First) 스케줄링

SJF는 총 실행 시간이 짧은 프로세스에 대해 우선적으로 CPU를 할당하는 방법으로, **비선점형 스케줄링** 방식이다.

### 예제

![](https://i.imgur.com/7fUrK7c.png)
![](https://i.imgur.com/PVSwzL7.png)

- 평균 대기 시간 = (3+16+9+0)/4 = 7
- FCFS 방식일 때의 평균 대기 시간 = (0+6+14+21)/4 = 10.25
  => 확실히 FCFS 방식에 비해 평균 대기시간이 줄어든 것을 확인할 수 있다.

다음으로 프로세스 별 Arrival Time이 다른 경우를 보자.
![](https://i.imgur.com/Gi1rwgD.png)
![](https://i.imgur.com/8yAZMsq.png)
SFJ는 비선점형 방식이기 때문에 Arrival Time에 따라 스케줄링 결과가 영향을 받는다.

- 평균 대기 시간 = (0+14+2+6)/4 = 5.5
- FCFS 방식일 때의 평균 대기 시간 = (0+4+10+14)/4 = 7

## SRTF (Shortest Remaining Time First) 스케줄링

SJF 스케줄링에 RR 스케줄링을 결합한 방식이다.

정해진 시간만큼 CPU를 이용하되, 다음으로 CPU를 사용할 프로세스로는 남은 작업 시간이 가장 적은 프로세스를 선택하는 방법으로, **선점형 스케줄링** 방식이다.

### 예제

![](https://i.imgur.com/aqGJqu6.png)
![](https://i.imgur.com/T9ki6lT.png)

- 평균 대기 시간 = (10-1)+(1-1)+(17-2)+(5-3)/4 = 26/4 = 6.5

## RR (Round Robin) 스케줄링

FCFS 스케줄링에 타임 슬라이스(time slice) 기법을 결합한 방식이다. \*타임 슬라이스: 각 프로세스가 CPU를 사용할 수 있는 정해진 시간

정해진 타임 슬라이스만큼의 시간동안 돌아가며 CPU를 이용하는 방법으로, **선점형 스케줄링** 방식이다.

- Ready Queue에 삽입된 프로세스들은 들어온 순서대로 CPU를 이용하되, 정해진 시간만큼만 이용한다.
- 정해진 시간을 모두 사용하였음에도 아직 프로세스가 완료되지 않았다면 다시 큐의 맨 뒤에 삽입한다.(컨텍스트 스위칭이 일어남)

### 예제

타임 슬라이스의 크기(Time Quantum)가 4라고 가정하자.
![](https://i.imgur.com/i2bN4sq.png)
![](https://i.imgur.com/WA1F6FY.png)

- 타임 슬라이스의 크기가 너무 크면 사실상 FCFS와 같아지고, 너무 작으면 컨텍스트 스위칭으로 인한 오버헤드로 인해 CPU 성능이 떨어진다.

## Priority Scheduling(우선순위 스케줄링)

프로세스들에 우선순위를 부여하고, 우선순위가 높은 프로세스를 우선적으로 실행하는 방법으로, 선점형 스케줄링, 비선점형 스케줄링 방식 모두 적용 가능하다.

- 우선순위가 같은 프로세스들은 선입선처리로 스케줄링된다.
- FCFS 스케줄링과 SJF 스케줄링, SRTF 스케줄링은 우선순위 스케줄링에 포함된다.

### 예제

- 비선점 스케줄링 방식
  ![](https://i.imgur.com/QVHxuf6.png)
  ![](https://i.imgur.com/74OKRUj.png)
  - 평균 대기 시간 = 8.2
- 선점형(Round-Robin) 스케줄링 방식(Time Quantum=2)
  ![](https://i.imgur.com/VFxZxzV.png)
  ![](https://i.imgur.com/xwfiMuA.png)
- 문제점
  - 우선순위가 높은 프로세스만 실행하게 되면서 우선순위가 낮은 프로세스의 실행이 무한정 미뤄지게 되는 기아(starvation) 현상이 발생한다.

## MLQ (Multi-Level Queue, 다단계 큐) 스케줄링

우선순위 별로 Ready Queue를 여러 개 사용하는 스케줄링 방법으로, **선점형 스케줄링** 방식이다.

- 우선순위 스케줄링이 발전된 형태.
- 우선순위가 가장 높은 큐에 있는 프로세스를 먼저 처리한다.
- 우선순위가 가장 높은 큐가 비어있으면 그 다음 우선순위 큐에 있는 프로세스를 처리한다.
- 프로세스가 한 번 큐에 입력되면 다른 큐로 이동하는 것이 불가하다.
- 각 큐는 각자의 스케줄링 알고리즘이 정해져 있다. - ex: 큐1은 RR, 큐2는 FCFS
  ![](https://i.imgur.com/lXDmALx.png)

- 문제점
  - 우선순위 스케줄링과 마찬가지로 기아 현상(Starvation)이 발생할 수 있다.

## MLFQ (Multilevel Feedback Queue, 다단계 피드백 큐) 스케줄링

MLQ에 기반하지만 다음의 특징을 가지고 있는 스케줄링 방법이다.

- MLQ가 가지고 있던 문제를 해결하기 위해 더 발전된 스케줄링 알고리즘.
- 프로세스는 큐 간의 이동이 가능하다.
- 처음 Ready Queue에 들어온 프로세스는 가장 우선순위가 높은 큐에 입력된다.
- 해당 프로세스가 실행되고 실행 시간이 남아 다시 Ready Queue로 돌아오게 되면, 프로세스는 그 다음으로 우선순위가 높은 큐에 입력된다.
- 이런 방식으로 Ready Queue에 되돌아올 때마다 점점 낮은 순위의 큐에 입력되게 된다.
- 자연스럽게 CPU를 많이 이용해야 하는 프로세스일수록 우선순위가 상대적으로 낮아지고 비교적 CPU를 적게 써도 괜찮은 입출력 집중 프로세스의 우선순위는 상대적으로 높아진다.
  ![](https://i.imgur.com/BAYyqDU.png)

# 추가 - Real-Time System

Real-Time System(실시간 시스템)은 이벤트가 발생하면 가능한 빠르게 처리되어야 하기 때문에, Latency(지연 시간)를 최소화해야 한다.

Event Latency는 event가 발생하고 system이 응답하기까지의 시간으로, Interrupt Latency와 Dispatch Latency의 총합이다.

Interrupt Latency는 CPU에 인터럽트가 도착해서 Service될 때까지의 시간이다.
![](https://i.imgur.com/yiPTmZE.png)
Dispatch Latency는 실행중인 프로세스를 제거하고, ISR(인터럽트 서비스 루틴)에 필요한 리소스를 확보하고, ISR을 CPU에 적재할 때까지의 시간이다.
![](https://i.imgur.com/v5APVMQ.png)

Real-Time System에는 Soft Real-time System과 Hard Real-time System이 있다.

- Soft Real-time System: 이벤트에 대해 응답할 프로세스가 다른 프로세스보다 더 큰 우선순위를 얻는다는 것을 보장한다.
- Hard Real-time System: 이벤트에 대해 응답할 프로세스가 마감 시간 전까지 반드시 시작/처리될 것을 보장한다.

## Priority-Based Scheduling

프로세스마다 우선순위를 부여하고, 현재 실행중인 프로세스보다 더 우선순위가 높은 프로세스가 들어오면 바로 CPU를 선점하는 **선점형 스케줄링** 방식이다.

실행만을 보장해주기 때문에 **Soft Real-Time System**에 해당한다.

- 문제점
  - Hard Real-Time System은 마감시간(Deadline)까지 보장해주어야 하기 때문에 적합하지 않다.
  - 낮은 우선순위의 프로세스에 대해 기아 현상(Starvation)이 발생할 수 있다.

## Rate-Monotonic Scheduling(RMS)

주기적인 일을 처리하는 선점형 스케줄링 방식이다.

실행 주기(Period)가 짧을 수록 높은 우선순위를 가진다.

### 예제

프로세스 P1, P2의 주기(Period)가 각각 50, 100이고 CPU 실행 시간이 20, 35, 마감 시간은 주기와 동일하다고 하자. 우선순위가 제대로 지켜지지 않아서 P2가 먼저 실행되는 경우, P1는 마감 시간을 지키지 못한다.
![](https://i.imgur.com/D9D9u5z.png)
반대로 주기가 짧은 P1이 높은 우선순위를 받으면 다음과 같이 원활하게 작업을 처리할 수 있다.
![](https://i.imgur.com/aDx1Nlo.png)
다음으로 프로세스 P1, P2의 주기가 각각 50, 80이고 CPU 실행 시간이 25, 35, 마감 시간은 주기와 동일한 경우를 보자.

이 경우 마감 시간을 지키지 못한다.

![](https://i.imgur.com/urW72eZ.png)

## Earliest-Deadline-First(EDF)

마감 시간(Deadline)이 가장 이른 프로세스를 먼저 실행하는 알고리즘. 선점형, 비선점형 스케줄링 모두 가능하다.

- 스케줄러가 Deadline에 따라 우선순위를 부여하는 방식으로 동작한다.
- 새로운 프로세스가 발생하면 Deadline을 반영하여 우선순위가 조정된다.

### 예제

앞서 RMS 스케줄링 예제에서 실패했던 예시를 그대로 가져와보겠다.

프로세스 P1, P2의 주기가 각각 50, 80이고 CPU 실행 시간이 25, 35, 마감 시간은 주기와 동일하다고 할 때, EDF 스케줄링을 시도한 결과는 다음과 같다.
![](https://i.imgur.com/idk83tP.png)
50에서 P1이 들어왔음에도 P2의 마감시간이 P1보다 빨라 선점되지 않는 것을 확인할 수 있다.

- RMS보다 유휴시간이 적지만 Ready Queue에 Process가 들어올 때마다 마감시간을 확인해야 하기 때문에 오버헤드가 크다.

## Proportional Share Scheduling

전체 CPU 실행시간을 Time Share라는 단위로 쪼갠 뒤, 각 프로세스에게 일정 퍼센트만큼 할당해주는 방법.

전체 Time Share를 T라고 했을 때, 각 프로세스는 N만큼의 시간을 할당받는다.(N<T)

=> 시간을 우선순위 별로 나누는 방식

### 예제

프로세스 A와 B를 3:2의 비율로 Time Share를 할당해준다고 하자. 만약 B프로세스가 한타임 실행되면 3:1이 되고, A프로세스가 한 타임 실행되면 2:1이 되는 식이다. 모든 숫자가 0이 되면 다시 초기화시켜준다.
