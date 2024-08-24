---
title: "모달창 구현에 필요한 커스텀 훅 만들기"
date: "2024-08-24T22:03:03.284Z"
description: "모달창의 사용자 경험을 증대시킬 수 있는 커스텀 훅을 만들어보자."
section: "지식 공유"
category: "React"
tags:
  - 커스텀 훅
  - React
---

## 1. 모달 바깥 영역 클릭 시 모달을 닫는 Hook

개인적으로, 모달을 열었을 때 작은 닫기 버튼만으로 모달을 닫을 수 있게 하는 건 보기보다 불편한 경험이었다.
이런 경험에 따라 모달의 바깥 영역을 클릭했을 때 모달이 닫히도록 만들고 싶었고, 커스텀 훅을 만들어보았다.

```jsx
import { RefObject, useEffect } from 'react';

export default function useClickOutside(ref: RefObject<HTMLDivElement>, callback: () => void) {
	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (ref.current && !ref.current.contains(event.target as Node)) {
				callback();
			}
		}
		document.addEventListener('mousedown', handleClickOutside);

		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [ref, callback]);
}
```

이렇게 만든 훅은 다음과 같이 사용할 수 있다.

```jsx
interface HackathonTeamReadModalProps {
  selectedTeam: HackathonTeamDto | null;
  onClose: () => void;
}

const HackathonTeamReadModal = ({
  selectedTeam,
  setSelectedTeam,
}: HackathonTeamReadModalProps) => {
  const ref = useRef < HTMLDivElement > null
  useOnClickOutside(ref, onClose)

  return (
    <div className="fixed inset-0 z-[51] flex h-[100vh] w-[100vw] items-center justify-center bg-black bg-opacity-30">
      <div
        ref={ref}
        className="flex h-[600px] w-full max-w-[900px] flex-col items-center gap-2 rounded bg-white p-5 sm:h-[700px]"
      >
        ...
      </div>
    </div>
  )
}

export default HackathonTeamReadModal
```

클릭 영역에서 제외할 요소를 useRef로 지정해주고 커스텀 훅을 호출해주면 된다.
이때 파라미터로 ref 객체와 모달을 닫는 함수를 전달해주면 된다.

이렇게 하면 모달이 열렸을 때 바깥 영역을 클릭하면 창이 닫히도록 할 수 있다.

![](https://i.imgur.com/TiVqdI8.gif)

## 2. 모달 바깥 영역의 스크롤 이벤트를 막는 Hook

![](https://i.imgur.com/5Tkek7G.gif)
일반적인 방식으로 모달을 만들면, 위와 같이 모달 바깥 영역을 스크롤할 수 있다.
사용자 뷰에 모달이 나타났다면 모달에만 집중할 수 있어야 하는데, 이렇게 스크롤 이벤트를 막지 않으니 왠지 신경이 쓰인다.

그래서 이를 막아주는 훅을 만들어 사용하고자 했다.

body 엘레멘트의 css 속성 중 overflow를 hidden으로 변경하여 스크롤을 막는 방법을 사용했다.
모바일의 경우 `touch-action: none`을 적용하여 스크롤 동작을 막는다.

```jsx
import { useCallback } from "react"

export default function useBodyScrollLock() {
  const lockScroll = useCallback(() => {
    document.body.style.overflow = "hidden"
    document.documentElement.style.overflow = "hidden"
    document.body.style.touchAction = "none"
  }, [])

  const unlockScroll = useCallback(() => {
    document.body.style.overflow = ""
    document.documentElement.style.overflow = ""
    document.body.style.touchAction = ""
  }, [])

  return { lockScroll, unlockScroll }
}
```

훅을 사용하는 방법은 다음과 같다.

```jsx
interface HackathonTeamReadModalProps {
  selectedTeam: HackathonTeamDto | null;
  onClose: () => void;
}

const HackathonTeamReadModal = ({
  selectedTeam,
  onClose,
}: HackathonTeamReadModalProps) => {
  const { lockScroll, unlockScroll } = useBodyScrollLock()
  if (selectedTeam === null) {
    unlockScroll()
    return null
  }
  lockScroll()
  return (
    <div className="fixed inset-0 z-[51] flex h-[100vh] w-[100vw] items-center justify-center bg-black bg-opacity-30">
      ...
    </div>
  )
}

export default HackathonTeamReadModal
```

내 경우 selectedTeam이 null값인 경우 모달을 띄우지 않는 상태로 보고, selectedTeam이 초기화되어 있는 경우 해당 값을 기반으로 정보를 렌더링하는 모달을 띄우도록 구현했다. 따라서 selectedTeam이 null인 경우 스크롤 lock을 해제하는 훅을 호출하고, 그렇지 않은 경우 스크롤 lock을 활성화하는 훅을 호출하도록 했다.
