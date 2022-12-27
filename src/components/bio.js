/**
 * Bio component that queries for data
 * with Gatsby's useStaticQuery component
 *
 * See: https://www.gatsbyjs.com/docs/how-to/querying-data/use-static-query/
 */

import * as React from "react"
import { useStaticQuery, graphql } from "gatsby"
import { StaticImage } from "gatsby-plugin-image"

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
            <a
              className="hover:text-point hover:font-bold"
              href={`https://github.com/${social?.github || ``}`}
            >
              <svg
                viewBox="0 0 16 16"
                style={{ display: "inline-block", margin: "-4px 1px 0px 0px" }}
                width="16"
                height="16"
                class="octicon octicon-mark-github"
                aria-hidden="true"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"
                ></path>
              </svg>
              Github
            </a>
            에 오시면 더 많은 활동을 보실 수 있습니다.
            <ul>
              <li>
                📑이력서 :{" "}
                <a
                  className="hover:text-point hover:font-bold"
                  href={`https://github.com/${social?.github || ``}`}
                >
                  국문
                </a>{" "}
                /{" "}
                <a
                  className="hover:text-point hover:font-bold"
                  href={`https://github.com/${social?.github || ``}`}
                >
                  영문
                </a>
              </li>
              <li>
                📁포트폴리오 :{" "}
                <a
                  className="hover:text-point hover:font-bold"
                  href={`https://github.com/${social?.github || ``}`}
                >
                  국문
                </a>{" "}
                /{" "}
                <a
                  className="hover:text-point hover:font-bold"
                  href={`https://github.com/${social?.github || ``}`}
                >
                  영문
                </a>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}

export default Bio
