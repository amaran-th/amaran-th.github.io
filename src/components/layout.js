import React, { useState } from "react"
import { Link } from "gatsby"
import { ChevronRightIcon } from "@heroicons/react/24/solid"
import Bio from "./bio"
import TableOfContents from "./TableOfContents"
import Header from "./header"

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
  const theme = "hydrangea"
  const darkMode = true
  const [openCategory, setOpenCategory] = useState(true)

  const category = (
    <nav className="h-full bg-white border-y border-r shadow-md sticky">
      <div className="w-full bg-shadow flex justify-center h-[15em]">
        <Bio />
      </div>
      <ul
        className="scroll-box-hidden space-y-2 p-4 px-8 overflow-auto max-h-[calc(100vh-86px-15em)]"
        onScroll={e => {
          let window_scrolling
          e.target.classList.remove("scroll-box-hidden")

          clearTimeout(window_scrolling)
          window_scrolling = setTimeout(() => {
            window_scrolling = undefined
            e.target.classList.add("scroll-box-hidden")
          }, 400)
        }}
      >
        {categories?.map(category => (
          <li key={category.fieldValue} className="hover:text-main">
            <Link to={`/${category.fieldValue}/`}>
              {category.fieldValue === currentCategory ? (
                <>
                  <ChevronRightIcon className="h-6 w-6 inline-block" />

                  <span className="font-bold underline underline-offset-4">
                    {category.fieldValue} ({category.totalCount})
                  </span>
                </>
              ) : (
                <span>
                  {category.fieldValue} ({category.totalCount})
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
      <Header
        openCategory={openCategory}
        setOpenCategory={setOpenCategory}
        title={title}
      />
      <body className="relative mb-4 flex justify-center min-h-[calc(100vh-104px-160px)]">
        <div
          className={
            "scroll-box-hidden h-full fixed min-w-[20rem] left-0 z-[98] top-[86px] transition ease-in-out " +
            (openCategory ? "translate-x-0" : " -translate-x-[20rem]")
          }
        >
          {category}
        </div>
        {openCategory ? (
          <nav className="min-h-full md:block hidden relative min-w-[20rem]"></nav>
        ) : (
          ""
        )}
        <div className="w-full flex justify-center space-x-2">
          <div className="w-full flex max-w-6xl justify-center">
            <div
              className="w-full max-w-3xl px-5 mt-12"
              data-is-root-path={isRootPath}
            >
              {children}
            </div>
          </div>
          {tableOfContents ? (
            <nav
              className={
                "sticky top-[106px] max-h-[80vh] min-w-[16rem] z-[98] transition ease-in-out hidden " +
                "lg:block lg:translate-x-0 translate-x-[16rem]"
              }
            >
              <TableOfContents content={tableOfContents} />
            </nav>
          ) : (
            ""
          )}
        </div>
      </body>

      <footer className="bg-main flex justify-end text-white h-40 px-10">
        © {new Date().getFullYear()}, Built with
        {` `}
        <a href="https://www.gatsbyjs.com">Gatsby</a>
      </footer>
    </div>
  )
}

export default Layout
