import * as React from "react"
import { Link, graphql } from "gatsby"

import Bio from "../components/bio"
import Layout from "../components/layout"
import Seo from "../components/seo"
import GatsbyImage from "gatsby-image"
import "../tailwind.css"

const BlogIndex = ({ data, location }) => {
  const siteTitle = data.site.siteMetadata?.title || `Title`
  const posts = data.allMarkdownRemark.nodes
  const categories = data.allMarkdownRemark.group
  if (posts.length === 0) {
    return (
      <Layout location={location} title={siteTitle}>
        <Bio />
        <p>블로그 포스트를 찾을 수 없습니다.</p>
      </Layout>
    )
  }

  return (
    <>
      <Seo />
      <Layout location={location} title={siteTitle} categories={categories}>
        <div className="grid md:grid-cols-3 grid-cols-2 space-x-4">
          {posts.map(post => {
            const title = post.frontmatter.title || post.fields.slug
            console.log(post)
            const thumbnailImg =
              post.frontmatter.thumbnailImg?.childImageSharp.fluid

            return (
              <Link to={post.fields.slug} itemProp="url">
                <div
                  key={post.fields.slug}
                  className="h-80 flex justify-between justify-items-center border-2 rounded-md shadow-md my-4 hover:bg-slate-100 hover:shadow-xl"
                >
                  <article
                    itemScope
                    itemType="http://schema.org/Article"
                    className="flex flex-col p-4"
                  >
                    {thumbnailImg ? (
                      <div className="max-w-full w-full h-[116px]">
                        <GatsbyImage
                          fluid={thumbnailImg}
                          className="rounded-md h-full w-full"
                        />
                      </div>
                    ) : (
                      ""
                    )}
                    <div className="flex-auto flex flex-col">
                      <header className="mb-2">
                        <h2 className="listItemTitle mt-2 text-main text-2xl max-h-16">
                          <span itemProp="headline" className="font-title">
                            {title}
                          </span>
                        </h2>
                        <span className="text-sub text-sm">
                          {post.frontmatter.date}
                        </span>
                        <span className="ml-2 font-bold text-gray-400 text-sm">
                          {post.frontmatter.category}
                        </span>
                      </header>
                      <section className="max-h-full">
                        <p
                          className="listItemTitle mb-0"
                          dangerouslySetInnerHTML={{
                            __html:
                              post.frontmatter.description || post.excerpt,
                          }}
                          itemProp="description"
                        />
                      </section>
                    </div>
                  </article>
                </div>
              </Link>
            )
          })}
        </div>
      </Layout>
    </>
  )
}

export default BlogIndex

/**
 * Head export to define metadata for the page
 *
 * See: https://www.gatsbyjs.com/docs/reference/built-in-components/gatsby-head/
 */
export const Head = () => <Seo title="Faded Angels" />

export const pageQuery = graphql`
  {
    site {
      siteMetadata {
        title
      }
    }
    allMarkdownRemark(sort: { frontmatter: { date: DESC } }) {
      group(field: frontmatter___category) {
        fieldValue
        totalCount
      }
      nodes {
        excerpt
        fields {
          slug
        }
        frontmatter {
          date(formatString: "MMMM DD, YYYY")
          title
          description
          thumbnailImg {
            childImageSharp {
              fluid(maxWidth: 800) {
                ...GatsbyImageSharpFluid
              }
            }
          }
          category
          tags
        }
      }
    }
  }
`
