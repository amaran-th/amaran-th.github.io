import * as React from "react"
import { Link } from "gatsby"

import CategoryList from "./side"

const Layout = ({ location, title, categories, children }) => {
  const rootPath = `${__PATH_PREFIX__}/`
  const isRootPath = location.pathname === rootPath
  const theme = "amaranth"
  const darkMode = true
  let header
  let category
  if (isRootPath) {
    header = (
      <h1 className="font-bold font-cardHand text-7xl">
        <Link to="/">{title}</Link>
      </h1>
    )
    category = (
      <nav className="h-[70vh] bg-white border-y border-r p-4 shadow-md rounded-r-xl sticky top-32 mt-4 ">
        <p className="text-point text-center font-bold">-● 카테고리 ●-</p>
        <ul className="">
          {categories?.map(category => (
            <li key={category}>
              <Link to={`/${category}/`}>{category}</Link>
            </li>
          ))}
        </ul>
      </nav>
    )
  } else {
    header = (
      <Link className="header-link-home font-cardHand" to="/">
        {title}
      </Link>
    )
    category = (
      <nav className=" bg-shadow m-2 p-4 shadow-md rounded-xl sticky top-20 mt-4 ">
        <p className="text-point text-center font-bold">-● 카테고리 ●-</p>
        <ul className="">
          {categories?.map(category => (
            <li key={category}>
              <Link to={`/${category}/`}>{category}</Link>
            </li>
          ))}
        </ul>
      </nav>
    )
  }

  return (
    <div className={theme + "-theme " + (darkMode ? "dark" : "light") + " "}>
      <header className=" bg-white sticky -top-4 pt-9 shadow-md p-5 mb-12 z-[99]">
        {header}
      </header>
      <div className="flex">
        <nav className="fixed left-0 md:static min-w-xs ">{category}</nav>
        <div className="max-w-3xl px-5 py-10" data-is-root-path={isRootPath}>
          <main>{children}</main>
        </div>
      </div>
      <footer>
        © {new Date().getFullYear()}, Built with
        {` `}
        <a href="https://www.gatsbyjs.com">Gatsby</a>
      </footer>
    </div>
  )
}

export default Layout
