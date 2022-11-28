import React, { useState, useEffect } from "react"
import { Link } from "gatsby"
import {
  ChevronRightIcon,
  ChevronDoubleRightIcon,
} from "@heroicons/react/24/solid"
import CategoryList from "./side"

const Layout = ({ location, title, categories, children, currentCategory }) => {
  const rootPath = `${__PATH_PREFIX__}/`
  const isRootPath = location.pathname === rootPath
  const theme = "amaranth"
  const darkMode = true
  const [openCategory, setOpenCategory] = useState(false)
  let header
  let category

  if (isRootPath) {
    header = (
      <p className="font-bold font-cardHand sm:text-7xl text-4xl">
        <Link to="/">{title}</Link>
      </p>
    )
  } else {
    header = (
      <Link className="header-link-home font-cardHand" to="/">
        {title}
      </Link>
    )
  }
  category = (
    <nav className="h-[70vh] bg-white border-y border-r p-4 shadow-md rounded-r-xl sticky top-32 mt-4">
      <ul className="space-y-2 py-4">
        {categories?.map(category => (
          <li key={category.fieldValue}>
            <Link to={`/${category.fieldValue}/`}>
              {category.fieldValue == currentCategory ? (
                <>
                  <ChevronRightIcon className="h-6 w-6 inline-block" />

                  <span className="font-bold underline underline-offset-4">
                    {category.fieldValue}({category.totalCount})
                  </span>
                </>
              ) : (
                <span>
                  {category.fieldValue}({category.totalCount})
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
  return (
    <div className={theme + "-theme " + (darkMode ? "dark" : "light") + " "}>
      <header className="flex bg-white sticky -top-4 pt-9 shadow-md p-5 z-[99] mb-4 sm:mb-12">
        <button
          className=" mr-4 px-2 bg-white z-[100] md:hidden"
          onClick={() => setOpenCategory(!openCategory)}
        >
          <ChevronDoubleRightIcon
            className={
              "h-6 w-6 inline-block transition ease-in-out " +
              (openCategory ? "rotate-180" : "")
            }
          />
        </button>
        {header}
      </header>
      <div className="flex max-w-6xl justify-between">
        <nav
          className={
            "fixed min-w-[12rem] left-0 z-[99] md:static md:block transition ease-in-out " +
            (openCategory ? "" : "md:translate-x-0 -translate-x-[12rem]")
          }
        >
          {category}
        </nav>
        <div
          className=" w-full max-w-3xl px-5 py-4"
          data-is-root-path={isRootPath}
        >
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
