//TODO 공통 컴포넌트 구현

import * as React from "react"
import { Link } from "gatsby"

const ContentIndex = ({ children }) => {
  // Set these values by editing "siteMetadata" in gatsby-config.js

  return <nav className="bg-black">{children}</nav>
}

export default ContentIndex
