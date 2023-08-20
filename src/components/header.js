import React, { useState, useEffect } from "react"
import { Link } from "gatsby"
import { ChevronDoubleRightIcon } from "@heroicons/react/24/solid"
import { StaticImage } from "gatsby-plugin-image"

const Header = ({ openCategory, setOpenCategory, title }) => {
  const [percentScr, setPercentScr] = useState(0) //웹페이지 자체의 스크롤
  const handleScroll = () => {
    setPercentScr(
      (100 * Math.floor(window.pageYOffset)) /
        (document.documentElement.scrollHeight -
          document.documentElement.clientHeight)
    )
  }
  useEffect(() => {
    window.addEventListener("scroll", handleScroll)
    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  })

  return (
    <>
      <header className="w-full flex flex-col bg-white sticky top-0 shadow-md 0 z-[99] opacity-90 backdrop-blur-lg">
        <p className="font-logo sm:text-3xl text-2xl p-5 pb-0">
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
        <div className="flex h-[50px] shadow-inner w-full">
          <div className="w-[50px] bg-sub"></div>
          <div
            className={`flex justify-end bg-sub rounded-r-full`}
            style={{ width: percentScr + "%" }}
          >
            <StaticImage
              className="bio-avatar bg-white rounded-full border border-sub"
              layout="fixed"
              formats={["auto", "webp", "avif"]}
              src="../images/profile-pic.png"
              width={50}
              height={50}
              quality={95}
              alt="Profile picture"
            />
          </div>
        </div>
      </header>
    </>
  )
}

export default Header
