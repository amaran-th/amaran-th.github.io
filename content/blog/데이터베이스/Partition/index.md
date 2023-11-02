---
title: Partition
date: "2022-12-06T17:34:03.284Z"
description: "데이터베이스 Partition 적용하기"
section: "지식 공유" 
category: "데이터베이스"
tags:
  - database
---

### Partition(파티션)

하나의 테이블을 2개 이상의 저장 구조로 분리하는 것.

⇒테이블이 커짐에 따라 발생하는 성능 저하를 해결하기 위함

⭐테이블이 파티션되면 index도 분리된다.

- terminal에서 partition 사용해보기

  - startDay에 따라 파티션 분류

    ```
    create table member(—생략—)
    -> partition by range(year(startDay)) (
    ->     partition p0 values less then (2000),
    ->     partition p1 values less then (2010),
    ->     partition p2 values less then maxvalue
    -> );
    ```

  - partition 확인

    ```
    select table_name, partition_name, partition_method, partition_description, table_rows
        from information_schema.partitionos
        where table_name=’member’;
    ```

  - partition 삭제

    ```
    alter table member drop partition p2;
    ```

    ⭐partition을 삭제하게 되면 해당 partition의 record들이 함께 삭제된다.

  - partition 추가

    ```
     alter table member add partition(partition p2 values less than(2015));
    ```

  - partition 검색

    ```
     select * from member partition(p1);
    ```

  - partition 재구성1(모든 partition p1, p2를 n0, n1, n2로 재구성

    ```
     alter table member reorganize partition p1, p2 into(
        partition n0 values less than(2001),
        partition n1 values less than(2002),
        partition n3 values less than(maxvalue)
    );
    ```

  - partition 재구성2(모든 partition n3을 n4, n5, n6으로 재구성

    ```
    alter table member reorganize partition n3 into(
        partition n4 values less than(2003),
        partition n5 values less than(2004),
        partition n6 values less than(maxvalue)
    );
    ```

    - range를 사용한 파티션의 경우 마지막 파티션(위 예시에서는 n3)을 제외한 파티션에 대한 재구성은 허용되지 않는다.

  - partition 병합

    ```
     alter coalesce partition …
    ```

  - partition 내의 row들을 모두 삭제

    ```
    alter table … truncate partition
    ```

  - list를 사용한 partition 만들기

    ```
     create table part(—생략—, primary key(pid, **level**))
        partition by list(**level**) (
            partition p0 values in (0,4,8),
            partition p1 values in(1,5,9)
        );
    ```

    - 파티션에 사용하는 속성을 primary key로 정의하지 않으면 오류가 발생함.

  - hash를 사용한 partition 만들기(10개의 partition 만들기)

    ```
     create table part(—생략—) partition by hash(sales) partitions 10;
    ```

    - range, list, hash 외에 .inear hash, key, linear key를 사용할 수 있다.

  - partition 내에 subpartition 만들기
    range 파티션이 3개이고 각 range에 대해 4개의 subpartition이 만들어진다.
    ```
     create table product(pid int, pname varchar(10), kinds varchar(10), made DATE)
    -> partition by range(year(made))
    -> subpartition by hash(to_days(made))
    -> subpartitions 4(
    ->     partition p0 values less than (2000),
    ->     partition p1 values less than(2010),
    ->     partition p2 values less than maxvalue
    -> );
    ```
