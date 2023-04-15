import React from "react"

const TableOfContents = ({ content }) => {
  return (
    <div
      // 스타일링을 위해서 클래스이름을 부여 한다.
      className="table-of-content"
      // dangerouslySetInnerHTML는 보안 관점에서 위험하지만
      // innerHTML을 사용하겠다는 뜻이다.
      dangerouslySetInnerHTML={{ __html: content }}
    />
  )
}

export default TableOfContents
