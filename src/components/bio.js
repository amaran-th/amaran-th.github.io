/**
 * Bio component that queries for data
 * with Gatsby's useStaticQuery component
 *
 * See: https://www.gatsbyjs.com/docs/how-to/querying-data/use-static-query/
 */

import * as React from "react"
import { useStaticQuery, graphql, Link } from "gatsby"
import { StaticImage } from "gatsby-plugin-image"
import { VscGithubInverted, VscMail } from "react-icons/vsc"
const Bio = () => {
  const data = useStaticQuery(graphql`
    query BioQuery {
      site {
        siteMetadata {
          author {
            name
            summary
          }
          social {
            email
            github
            portfolioK
            portfolioE
            CVK
            CVE
          }
        }
      }
    }
  `)

  // Set these values by editing "siteMetadata" in gatsby-config.js
  const author = data.site.siteMetadata?.author
  const social = data.site.siteMetadata?.social

  return (
    <div className="bio p-2">
      <StaticImage
        className="bio-avatar bg-white"
        layout="fixed"
        formats={["auto", "webp", "avif"]}
        src="../images/profile-pic.png"
        width={100}
        height={100}
        quality={95}
        alt="Profile picture"
      />
      {author?.name && (
        <div className="flex flex-col items-center">
          <p className="font-title text-point text-xl">{author.name}</p>
          <p className="text-lg font-bold">{author?.summary || null}</p>
          <div className="p-2 space-y-2">
            <p className="flex justify-center space-x-8">
              <Link
                className="ml-1 hover:text-point hover:font-bold"
                target="_blank"
                to={`${social?.github || ``}`}
              >
                <VscGithubInverted className="inline-block -mt-1 -ml-1 w-8 h-8" />
              </Link>
              <Link
                className="ml-1 hover:text-point hover:font-bold"
                target="_blank"
                to={`mailto:${social?.email || ``}`}
              >
                <VscMail className="inline-block -mt-1 -ml-1 w-8 h-8" />
              </Link>
            </p>

            <ul>
              <li>
                📑
                <span className="inline-block text-center font-bold min-w-[5rem]">
                  CV
                </span>
                <Link
                  className="hover:bg-main rounded-sm bg-sub text-white px-2 py-[2px]"
                  target="_blank"
                  to={`${social?.CVK || ``}`}
                >
                  KR
                </Link>{" "}
                /{" "}
                <Link
                  className="hover:bg-main rounded-sm bg-sub text-white px-2 py-[2px]"
                  target="_blank"
                  to={`${social?.CVE || ``}`}
                >
                  EN
                </Link>
              </li>
              <li>
                📁
                <span className="inline-block text-center font-bold min-w-[5rem]">
                  Portfolio
                </span>
                <Link
                  className="hover:bg-main rounded-sm bg-sub text-white px-2 py-[2px]"
                  target="_blank"
                  to={`${social?.portfolioK || ``}`}
                >
                  KR
                </Link>{" "}
                /{" "}
                <Link
                  className="hover:bg-main rounded-sm bg-sub text-white px-2 py-[2px]"
                  target="_blank"
                  to={`${social?.portfolioE || ``}`}
                >
                  EN
                </Link>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}

export default Bio
