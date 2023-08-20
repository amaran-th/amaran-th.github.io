import * as React from "react"
import { Link } from "gatsby"
import { ChevronDoubleRightIcon } from "@heroicons/react/24/solid"

const Header = ({ openCategory, setOpenCategory, title }) => {
  // Set these values by editing "siteMetadata" in gatsby-config.js

  return (
    <header className="flex bg-white sticky top-0 shadow-md p-5 z-[99] opacity-90 backdrop-blur-lg">
      <p className="font-logo sm:text-5xl text-4xl">
        <button
          className="mr-4 px-2 bg-white z-[100]"
          onClick={() => setOpenCategory(!openCategory)}
        >
          <ChevronDoubleRightIcon
            className={
              "h-6 w-6 inline-block transition ease-in-out " +
              (openCategory ? "rotate-180" : "")
            }
          />
        </button>
        <Link to="/">{title}</Link>
      </p>
    </header>
  )
}

export default Header
