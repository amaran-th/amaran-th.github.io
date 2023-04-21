import React, { useState } from "react"
import { Link } from "gatsby"
import {
  ChevronRightIcon,
  ChevronDoubleRightIcon,
} from "@heroicons/react/24/solid"
import CategoryList from "./side"
import Bio from "./bio"
import TableOfContents from "./TableOfContents"

const Layout = ({
  location,
  title,
  categories,
  children,
  currentCategory,
  isPost = false,
  tableOfContents = null,
}) => {
  const rootPath = `${__PATH_PREFIX__}/`
  const isRootPath = location.pathname === rootPath
  const theme = "amaranth"
  const darkMode = true
  const [openCategory, setOpenCategory] = useState(false)
  let header
  let category

  if (isRootPath) {
    header = (
      <p className="font-bold font-logo sm:text-5xl text-4xl">
        <Link to="/">{title}</Link>
      </p>
    )
  } else {
    header = (
      <Link className="header-link-home font-logo" to="/">
        {title}
      </Link>
    )
  }
  category = (
    <nav className="min-h-[75vh] bg-white border-y border-r p-4 shadow-md rounded-r-xl sticky top-28">
      <ul className="space-y-2 py-4">
        {categories?.map(category => (
          <li key={category.fieldValue}>
            <Link to={`/${category.fieldValue}/`}>
              {category.fieldValue === currentCategory ? (
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
      <header className="flex bg-white sticky -top-4 pt-9 shadow-md p-5 z-[99]">
        <button
          className=" mr-4 px-2 bg-white z-[100] lg:hidden"
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
      <body className="relative">
        <nav
          className={
            "fixed min-w-[12rem] left-0 z-[98] mt-4 transition ease-in-out " +
            (openCategory ? "" : "lg:translate-x-0 -translate-x-[12rem]")
          }
        >
          {category}
        </nav>
        <div className="w-full flex justify-center space-x-2">
          <div className="w-full">
            <div className="w-full bg-shadow flex justify-center">
              <Bio />
            </div>
            <div className="w-full flex max-w-6xl justify-between">
              <nav className="lg:min-w-[12rem] lg:static lg:block"></nav>
              <div
                className="w-full max-w-3xl px-5 mt-12"
                data-is-root-path={isRootPath}
              >
                {children}
              </div>
            </div>
          </div>

          <nav
            className={
              "sticky top-24 max-h-[80vh] max-w-[16rem] z-[98] mt-4 transition ease-in-out hidden " +
              "lg:block lg:translate-x-0 translate-x-[12rem]"
            }
          >
            <TableOfContents content={tableOfContents} />
          </nav>
        </div>
      </body>

      <footer>
        © {new Date().getFullYear()}, Built with
        {` `}
        <a href="https://www.gatsbyjs.com">Gatsby</a>
      </footer>
    </div>
  )
}

export default Layout
