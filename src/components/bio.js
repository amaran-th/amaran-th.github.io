/**
 * Bio component that queries for data
 * with Gatsby's useStaticQuery component
 *
 * See: https://www.gatsbyjs.com/docs/how-to/querying-data/use-static-query/
 */

import * as React from "react"
import { useStaticQuery, graphql, Link } from "gatsby"
import { StaticImage } from "gatsby-plugin-image"
import { VscGithubInverted } from "react-icons/vsc"
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
    <div className="bio p-4 ">
      <StaticImage
        className="bio-avatar ring-4 ring-sub bg-white"
        layout="fixed"
        formats={["auto", "webp", "avif"]}
        src="../images/profile-pic.png"
        width={50}
        height={50}
        quality={95}
        alt="Profile picture"
      />
      {author?.name && (
        <div className="">
          <p className="font-title text-point text-xl">{author.name}</p>
          <p className="text-lg font-bold">{author?.summary || null}</p>
          <div className="p-2">
            제{" "}
            <Link
              className="ml-1 hover:text-point hover:font-bold"
              target="_blank"
              to={`${social?.github || ``}`}
            >
              <VscGithubInverted className="inline-block -mt-1 -ml-1" />
              Github
            </Link>
            에 오시면 더 많은 활동을 보실 수 있습니다.
            <ul>
              <li>
                📑이력서 :{" "}
                <Link
                  className="text-sm hover:bg-main rounded-full bg-sub text-white px-2"
                  target="_blank"
                  to={`${social?.CVK || ``}`}
                >
                  국문(Kor)
                </Link>{" "}
                /{" "}
                <Link
                  className="text-sm hover:bg-main rounded-full bg-sub text-white px-2"
                  target="_blank"
                  to={`${social?.CVE || ``}`}
                >
                  영문(Eng)
                </Link>
              </li>
              <li>
                📁포트폴리오 :{" "}
                <Link
                  className="text-sm hover:bg-main rounded-full bg-sub text-white px-2"
                  target="_blank"
                  to={`${social?.portfolioK || ``}`}
                >
                  국문(Kor)
                </Link>{" "}
                /{" "}
                <Link
                  className="text-sm hover:bg-main rounded-full bg-sub text-white px-2"
                  target="_blank"
                  to={`${social?.portfolioE || ``}`}
                >
                  영문(Eng)
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
