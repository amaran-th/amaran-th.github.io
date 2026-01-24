/**
 * Bio component that queries for data
 * with Gatsby's useStaticQuery component
 *
 * See: https://www.gatsbyjs.com/docs/how-to/querying-data/use-static-query/
 */

import { Link, graphql, useStaticQuery } from "gatsby"
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
            newBlog
          }
        }
      }
    }
  `)

  // Set these values by editing "siteMetadata" in gatsby-config.js
  const author = data.site.siteMetadata?.author
  const social = data.site.siteMetadata?.social

  return (
    <>
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
            </div>
          </div>
        )}
      </div>
      <div className="migrated-notice flex p-2 font-title flex-col items-center bg-red-100">
        <p>🚨 새 블로그로 이사했어요 🚨</p>
        <div className="flex items-center gap-1">
          <span>➡</span>
          <Link
            className="text-red-400 hover:text-red-600"
            target="_blank"
            to={`${social?.newBlog || ``}`}
          >
            바로가기
          </Link>
        </div>
      </div>
    </>
  )
}

export default Bio
