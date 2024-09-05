---
title: "[Next.js] Tiptap 라이브러리로 마크다운 뷰어 구현하기"
date: "2024-09-05T23:31:03.284Z"
description: "서버 컴포넌트와 클라이언트 컴포넌트에 대해 알아보자"
section: "지식 공유"
category: "React"
tags:
  - Nextjs
  - React
  - 라이브러리
---

![](https://i.imgur.com/7vkfeDm.gif)

SW 역량지원 시스템을 개발하면서, 해커톤 출전 팀의 Github README를 불러와 보여주는 UI를 구현하게 되었다.
이에 마크다운 뷰어, 정확히는 마크다운 기반의 텍스트를 Github, 노션처럼 예쁘게 보여주는 UI를 만들고자 관련 라이브러리를 찾아보았다.

## 마크다운 에디터 라이브러리 선택하기

ToastUI, ReactQuill, TipTap 이렇게 크게 3개의 라이브러리를 찾았다.

이 중 사용 경험이 있고, 대중적으로 많이 사용되는 마크다운 에디터 라이브러리는 ToastUI였지만, 리액트 18 이상 버전에서는 지원이 되지 않기 때문에 Next.js를 기반으로 구성된 프로젝트엔 적용할 수 없었다.

ReactQuill의 경우, 커뮤니티가 탄탄하지만 커스터마이징이 불편하다는 단점이 있었다.

TipTap은 ReactQuill보다 학습곡선이 높지만, 커스터마이징이 상대적으로 자유롭고 쉽다. 그리고 후술하겠지만 모듈식 구조이기 때문에 필요한 모듈만 조합할 수 있어 결과적으로 번들 크기를 최적화하기 용이하다는 장점이 있다.

개인적으로 커스터마이징을 자유롭게 할 수 있는 편이 더 끌려서 TipTap을 선택하게 되었다.

### Tiptap 사용법(기초)

TipTap은 다음 명령어를 통해 설치할 수 있다.

```shell
npm install @tiptap/react
```

다음과 같이 `useEditor()` 훅을 사용해 editor를 정의하고, `<EditorContent>` 태그의 속성으로 넣어주는 방식으로 사용하면 된다.

```jsx
import "./styles.scss"

import Highlight from "@tiptap/extension-highlight"
import Typography from "@tiptap/extension-typography"
import { EditorContent, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import React from "react"

export default () => {
  const editor = useEditor({
    StarterKit,
    Highlight,
    Typography,
    content: `
    <p>
      Markdown shortcuts make it easy to format the text while typing.
    </p>
    <p>
      To test that, start a new line and type <code>#</code> followed by a space to get a heading. Try <code>#</code>, <code>##</code>, <code>###</code>, <code>####</code>, <code>#####</code>, <code>######</code> for different levels.
    </p>
    <p>
      Those conventions are called input rules in Tiptap. Some of them are enabled by default. Try <code>></code> for blockquotes, <code>*</code>, <code>-</code> or <code>+</code> for bullet lists, or <code>\`foobar\`</code> to highlight code, <code>~~tildes~~</code> to strike text, or <code>==equal signs==</code> to highlight text.
    </p>
    <p>
      You can overwrite existing input rules or add your own to nodes, marks and extensions.
    </p>
    <p>
      For example, we added the <code>Typography</code> extension here. Try typing <code>(c)</code> to see how it’s converted to a proper © character. You can also try <code>-></code>, <code>>></code>, <code>1/2</code>, <code>!=</code>, or <code>--</code>.
    </p>
    `,
  })

  return <EditorContent editor={editor} />
}
```

![](https://i.imgur.com/tjslUzM.png)
관련 문서는 [여기서](https://tiptap.dev/docs/examples/basics/markdown-shortcuts) 확인할 수 있다.

## TipTap 확장 라이브러리

앞서 보여준 예시에서는 엄밀히 말하면 HTML 문서를 커스텀한 것이지, 아직은 마크다운 텍스트를 커스텀하지 못한다. 그리고 하이퍼링크를 첨부하거나 이미지를 렌더링하는 것도 불가하다.
마크다운을 인식할 수 있게 하거나 마크다운 요소를 커스텀하기 위해서는 Tiptap에서 제공하는 확장 라이브러리를 설치하여 extensions에 추가해주어야 한다.
[확장 라이브러리 공식 문서 목록](https://tiptap.dev/docs/editor/extensions/nodes)

### StarterKit

```shell
npm install @tiptap/starter-kit
```

Tiptap에서 주로 사용되는 확장 라이브러리들을 모아둔 라이브러리 묶음이다. 아래의 확장 라이브러리들을 포함한다.
이 라이브러리를 포함시켜주면 기본적으로 Heading, Blockquote(인용), List 목록 양식 등이 우리가 흔히 보던 형식의 디자인으로 적용된다.
![](https://i.imgur.com/bM5NVTn.png)
![](https://i.imgur.com/SFKAjrw.png)
![](https://i.imgur.com/mcLWqNQ.png)

### Markdown

마크다운 텍스트를 HTML 문법으로 변환하는 것을 도와주는 라이브러리를 설치한다.

```shell
npm install tiptap-markdown
```

그리고 다음과 같이 extensions에 포함시켜주면 된다.

```tsx
"use client"

import { EditorContent, useEditor } from "@tiptap/react"
import { StarterKit } from "@tiptap/starter-kit"
import { Markdown } from "tiptap-markdown"

import "./markdown.css"

interface MarkdownViewerProps {
  content: string
}

const MarkdownViewer = ({ content }: MarkdownViewerProps) => {
  const editor = useEditor({
    extensions: [StarterKit, Markdown],
    content, // 에디터에 들어갈 내용(content) 데이터
    editable: false, // 에디터가 아닌 뷰어로 사용할 것이기 때문에 편집 가능여부를 false로 설정한다.
  })

  return (
    <div className="prose">
      <EditorContent editor={editor} />
    </div>
  )
}

export default MarkdownViewer
```

다음의 마크다운 텍스트를 위 컴포넌트의 content로 넣어주면

```markdown
# Heading 1

## Heading 2

### Heading 3

This is a **bold** text with some _italic_ and [a link](https://example.com).

- ㅁ렁ㄹㄴㄹ

1. ㄹㄴㅇㄹㅁㄹ
```

이렇게 HTML 태그로 변환되어 설정해둔 커스텀이 적용된 것을 확인할 수 있다.
![](https://i.imgur.com/83ZWR5v.png)

### Link

앞에서 본 예제를 보면, link 부분에 하이퍼링크가 적용되지 않은 것을 볼 수 있다. 이것도 기본적으로 제공되는 형식이 아니기 때문에 확장 라이브러리를 설치해주어야 한다.

```shell
npm install @tiptap/extention-link
```

참고로 이렇게 추가해주는 extension들은 `configure()`를 활용해 임의 속성을 추가해줄 수 있다. 이 말은 즉슨 style 속성을 설정해 자유롭게 커스텀이 가능하다는 뜻이다.
나는 TailwindCSS를 사용하고 있기 때문에 class를 수정해주었다.

```jsx
"use client"

import { EditorContent, useEditor } from "@tiptap/react"
import { StarterKit } from "@tiptap/starter-kit"
import { Markdown } from "tiptap-markdown"
import Link from "@tiptap/extension-link"

import "./markdown.css"

interface MarkdownViewerProps {
  content: string;
}

const MarkdownViewer = ({ content }: MarkdownViewerProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Markdown,
      Link.configure({
        HTMLAttributes: {
          class: "text-primary-main cursor-pointer hover:text-primary-dark",
        },
      }),
    ],
    content,
    editable: false,
  })

  return (
    <div className="prose">
      <EditorContent editor={editor} />
    </div>
  )
}

export default MarkdownViewer
```

이렇게 하면 'a link' 부분에 하이퍼링크가 활성화된 것을 확인할 수 있다.
![](https://i.imgur.com/FACcVEi.png)

### Image

```markdown
![이미지](https://example.png)
```

위와 같은 형식의 url을 통해 image를 불러와 렌더링할 수 있도록 하려면 Image 확장 라이브러리를 설치해야 한다.

```shell
npm install @tiptap/extension-image
```

다음과 같이 extensions에 Image 라이브러리를 추가해주면 된다.
작은 이미지가 여러 개 있을 경우 한 줄에 배열될 수 있도록 `inline` 속성을 true로 설정해주고, base64 형식으로 들어온 데이터도 이미지로 렌더링할 수 있도록 `allowBase64` 속성을 true로 설정해주었다.

```jsx
"use client"

import { EditorContent, useEditor } from "@tiptap/react"
import { StarterKit } from "@tiptap/starter-kit"
import { Markdown } from "tiptap-markdown"
import Link from "@tiptap/extension-link"
import Image from "@tiptap/extension-image"

import "./markdown.css"

interface MarkdownViewerProps {
  content: string;
}

const MarkdownViewer = ({ content }: MarkdownViewerProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Markdown,
      Link.configure({
        HTMLAttributes: {
          class: "text-primary-main cursor-pointer hover:text-primary-dark",
        },
      }),
      Image.configure({ inline: true, allowBase64: true }),
    ],
    content,
    editable: false,
  })

  return (
    <div className="prose">
      <EditorContent editor={editor} />
    </div>
  )
}

export default MarkdownViewer
```

![](https://i.imgur.com/CbYvly2.png)

### Table

```markdown
| 한글명    | 영문명     | 설명                                   |
| --------- | ---------- | -------------------------------------- |
| 상품      | product    | 메뉴를 관리하는 기준이 되는 데이터     |
| 메뉴 그룹 | menu group | 메뉴 묶음, 분류                        |
| 메뉴      | menu       | 메뉴 그룹에 속하는 실제 주문 가능 단위 |
```

위와 같은 양식으로 작성된 표를 렌더링하기 위해선 Table 관련 확장 라이브러리를 설치해야 한다.

```shell
npm install @tiptap/extension-table @tiptap/extension-table-cell @tiptap/extension-table-header @tiptap/extension-table-row
```

```jsx
"use client"

import { EditorContent, useEditor } from "@tiptap/react"
import { StarterKit } from "@tiptap/starter-kit"
import { Markdown } from "tiptap-markdown"
import Link from "@tiptap/extension-link"
import Image from "@tiptap/extension-image"
import Table from "@tiptap/extension-table"
import TableCell from "@tiptap/extension-table-cell"
import TableHeader from "@tiptap/extension-table-header"
import TableRow from "@tiptap/extension-table-row"

import "./markdown.css"

interface MarkdownViewerProps {
  content: string;
}

const MarkdownViewer = ({ content }: MarkdownViewerProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Markdown,
      Link.configure({
        HTMLAttributes: {
          class: "text-primary-main cursor-pointer hover:text-primary-dark",
        },
      }),
      Image.configure({ inline: true, allowBase64: true }),
      Table,
      TableRow,
      TableHeader,
      TableCell,
    ],
    content,
    editable: false,
  })

  return (
    <div className="prose">
      <EditorContent editor={editor} />
    </div>
  )
}

export default MarkdownViewer
```

![](https://i.imgur.com/zF5CTYd.png)

### TaskList

```marakdown
- [x] 패키지 구조 변경
- [x] setter 제거
    - [x] product
    - [ ] menu group
    - [x] menu
    - [x] order
    - [ ] table group
    - [x] table
```

위와 같은 형식의 마크다운 텍스트를 체크리스트 형식으로 만들기 위해서는 다음과 Task와 관련된 같은 확장 라이브러리를 설치해주어야 한다.

```shell
npm install @tiptap/extension-task-list @tiptap/extension-task-item
```

```jsx
"use client"

import { EditorContent, useEditor } from "@tiptap/react"
import { StarterKit } from "@tiptap/starter-kit"
import { Markdown } from "tiptap-markdown"
import Link from "@tiptap/extension-link"
import Image from "@tiptap/extension-image"
import Table from "@tiptap/extension-table"
import TableCell from "@tiptap/extension-table-cell"
import TableHeader from "@tiptap/extension-table-header"
import TableRow from "@tiptap/extension-table-row"
import TaskList from "@tiptap/extension-task-list"
import TaskItem from "@tiptap/extension-task-item"

import "./markdown.css"

interface MarkdownViewerProps {
  content: string;
}

const MarkdownViewer = ({ content }: MarkdownViewerProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Markdown,
      Link.configure({
        HTMLAttributes: {
          class: "text-primary-main cursor-pointer hover:text-primary-dark",
        },
      }),
      Image.configure({ inline: true, allowBase64: true }),
      Table,
      TableRow,
      TableHeader,
      TableCell,
      TaskList,
      TaskItem.configure({
        nested: true,
        HTMLAttributes: {
          class: "flex space-x-2 [&_p]:m-0",
        },
      }),
    ],
    content,
    editable: false,
  })

  return (
    <div className="prose">
      <EditorContent editor={editor} />
    </div>
  )
}

export default MarkdownViewer
```

![](https://i.imgur.com/ECbqjp8.png)

### CodeBlock

이 부분에서 삽질을 많이 했다. 코드 블럭을 언어에 따라 컬러풀하게 보여주기 위해서는 syntax highlighting 라이브러리가 필요하다. 대표적으로 `highlight.js`, `lowlight`가 있는데, 처음에는 `highlight.js`를 사용하려고 했다. 그런데 어째선지 온갖 에러를 마주해서 트러블슈팅을 하다 포기하고 `lowlight`를 사용하기로 했다.
마침 Tiptap에서도 `lowlight에` 기반한 CodeBlock 확장 라이브러리를 제공하고 있어서, 이를 함께 사용했다.

```shell
npm install lowlight @tiptap/extension-code-block-lowlight
```

```jsx
"use client"

import { EditorContent, useEditor } from "@tiptap/react"
import { StarterKit } from "@tiptap/starter-kit"
import { Markdown } from "tiptap-markdown"
import Link from "@tiptap/extension-link"
import Image from "@tiptap/extension-image"
import Table from "@tiptap/extension-table"
import TableCell from "@tiptap/extension-table-cell"
import TableHeader from "@tiptap/extension-table-header"
import TableRow from "@tiptap/extension-table-row"
import TaskList from "@tiptap/extension-task-list"
import TaskItem from "@tiptap/extension-task-item"
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight"
import { common, createLowlight } from "lowlight"

import "./markdown.css"

interface MarkdownViewerProps {
  content: string;
}

const MarkdownViewer = ({ content }: MarkdownViewerProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      Markdown,
      Link.configure({
        HTMLAttributes: {
          class: "text-primary-main cursor-pointer hover:text-primary-dark",
        },
      }),
      Image.configure({ inline: true, allowBase64: true }),
      Table,
      TableRow,
      TableHeader,
      TableCell,
      TaskList,
      TaskItem.configure({
        nested: true,
        HTMLAttributes: {
          class: "flex space-x-2 [&_p]:m-0",
        },
      }),
      CodeBlockLowlight.configure({
        lowlight: createLowlight(common),
      }),
    ],
    content,
    editable: false,
  })

  return (
    <div className="prose">
      <EditorContent editor={editor} />
    </div>
  )
}

export default MarkdownViewer
```

![](https://i.imgur.com/QOWp0Wb.png)

### Code

`이런` 코드블럭을 마크다운 텍스트로부터 변환하려면 Code 확장 라이브러리를 사용해야 한다.

```shell
npm install @tiptap/extension-code
```

```jsx
"use client"

import { EditorContent, useEditor } from "@tiptap/react"
import { StarterKit } from "@tiptap/starter-kit"
import { Markdown } from "tiptap-markdown"
import Link from "@tiptap/extension-link"
import Image from "@tiptap/extension-image"
import Table from "@tiptap/extension-table"
import TableCell from "@tiptap/extension-table-cell"
import TableHeader from "@tiptap/extension-table-header"
import TableRow from "@tiptap/extension-table-row"
import TaskList from "@tiptap/extension-task-list"
import TaskItem from "@tiptap/extension-task-item"
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight"
import { common, createLowlight } from "lowlight"
import Code from "@tiptap/extension-code"

import "./markdown.css"

interface MarkdownViewerProps {
  content: string;
}

const MarkdownViewer = ({ content }: MarkdownViewerProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      Markdown,
      Link.configure({
        HTMLAttributes: {
          class: "text-primary-main cursor-pointer hover:text-primary-dark",
        },
      }),
      Image.configure({ inline: true, allowBase64: true }),
      Table,
      TableRow,
      TableHeader,
      TableCell,
      TaskList,
      TaskItem.configure({
        nested: true,
        HTMLAttributes: {
          class: "flex space-x-2 [&_p]:m-0",
        },
      }),
      CodeBlockLowlight.configure({
        lowlight: createLowlight(common),
      }),
      Code.configure({
        HTMLAttributes: {
          class:
            "after:hidden px-2 before:hidden bg-primary-light rounded-md text-black text-xs p-1",
        },
      }),
    ],
    content,
    editable: false,
  })

  return (
    <div className="prose">
      <EditorContent editor={editor} />
    </div>
  )
}

export default MarkdownViewer
```

![](https://i.imgur.com/BICnHRI.png)

### BlockQuote(인용구)

왠진 모르겠지만, 분명 StarterKit 안에 BlockQuote가 포함되어 있는데도 UI가 제대로 적용되지 않았다. 그래서 BlockQuote 확장 라이브러리를 설치해서 추가해주었다.

```shell
npm install @tiptap/extension-blockquote
```

```jsx
"use client"

import { EditorContent, useEditor } from "@tiptap/react"
import { StarterKit } from "@tiptap/starter-kit"
import { Markdown } from "tiptap-markdown"
import Link from "@tiptap/extension-link"
import Image from "@tiptap/extension-image"
import Table from "@tiptap/extension-table"
import TableCell from "@tiptap/extension-table-cell"
import TableHeader from "@tiptap/extension-table-header"
import TableRow from "@tiptap/extension-table-row"
import TaskList from "@tiptap/extension-task-list"
import TaskItem from "@tiptap/extension-task-item"
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight"
import { common, createLowlight } from "lowlight"
import Code from "@tiptap/extension-code"
import BlockQuote from "@tiptap/extension-blockquote"

import "./markdown.css"

interface MarkdownViewerProps {
  content: string;
}

const MarkdownViewer = ({ content }: MarkdownViewerProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
        blockquote: false,
      }),
      Markdown,
      Link.configure({
        HTMLAttributes: {
          class: "text-primary-main cursor-pointer hover:text-primary-dark",
        },
      }),
      Image.configure({ inline: true, allowBase64: true }),
      Table,
      TableRow,
      TableHeader,
      TableCell,
      TaskList,
      TaskItem.configure({
        nested: true,
        HTMLAttributes: {
          class: "flex space-x-2 [&_p]:m-0",
        },
      }),
      CodeBlockLowlight.configure({
        lowlight: createLowlight(common),
      }),
      Code.configure({
        HTMLAttributes: {
          class:
            "after:hidden px-2 before:hidden bg-primary-light rounded-md text-black text-xs p-1",
        },
      }),
      BlockQuote,
    ],
    content,
    editable: false,
  })

  return (
    <div className="prose">
      <EditorContent editor={editor} />
    </div>
  )
}

export default MarkdownViewer
```

![](https://i.imgur.com/cyAfJnE.png)

## 전체 코드

```tsx
"use client"

import BlockQuote from "@tiptap/extension-blockquote"
import Code from "@tiptap/extension-code"
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight"
import Highlight from "@tiptap/extension-highlight"
import Image from "@tiptap/extension-image"
import Link from "@tiptap/extension-link"
import Table from "@tiptap/extension-table"
import TableCell from "@tiptap/extension-table-cell"
import TableHeader from "@tiptap/extension-table-header"
import TableRow from "@tiptap/extension-table-row"
import TaskItem from "@tiptap/extension-task-item"
import TaskList from "@tiptap/extension-task-list"
import Typography from "@tiptap/extension-typography"
import { EditorContent, useEditor } from "@tiptap/react"
import { StarterKit } from "@tiptap/starter-kit"
import { common, createLowlight } from "lowlight"
import { Markdown } from "tiptap-markdown"

import "./markdown.css"

interface MarkdownViewerProps {
  content: string
}

const MarkdownViewer = ({ content }: MarkdownViewerProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
        blockquote: false,
      }),
      Highlight,
      Image.configure({ inline: true, allowBase64: true }),
      Typography,
      Markdown,
      Table,
      TableRow,
      TableHeader,
      TableCell,
      TaskList,
      TaskItem.configure({
        nested: true,
        HTMLAttributes: {
          class: "flex space-x-2 [&_p]:m-0",
        },
      }),
      CodeBlockLowlight.configure({
        lowlight: createLowlight(common),
      }),
      Code.configure({
        HTMLAttributes: {
          class:
            "after:hidden px-2 before:hidden bg-primary-light rounded-md text-black text-xs p-1",
        },
      }),
      Link.configure({
        HTMLAttributes: {
          class: "text-primary-main cursor-pointer hover:text-primary-dark",
        },
      }),
      BlockQuote,
    ],
    content,
    editable: false,
  })

  return (
    <div className="prose">
      <EditorContent editor={editor} />
    </div>
  )
}

export default MarkdownViewer
```

+) `<EditoaContent>` 태그를 둘러싼 div에 적용한 'prose'는, 일반적으로 TailwindCSS를 적용하면 기본으로 적용되는 li 태그의 mark 기호나 h1, h2, h3과 같은 헤딩 태그의 css가 무효화되는데, 이를 다시 복구시키는 설정이다.
