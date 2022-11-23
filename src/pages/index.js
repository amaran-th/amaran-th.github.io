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
  const categories = data.allMarkdownRemark.categoryList

  if (posts.length === 0) {
    return (
      <Layout location={location} title={siteTitle}>
        <Bio />
        <p>블로그 포스트를 찾을 수 없습니다.</p>
      </Layout>
    )
  }

  return (
    <Layout location={location} title={siteTitle} categories={categories}>
      <Bio />
      <ol style={{ listStyle: `none` }}>
        {posts.map(post => {
          const title = post.frontmatter.title || post.fields.slug
          console.log(post)
          const thumbnailImg =
            post.frontmatter.thumbnailImg?.childImageSharp.fluid

          return (
            <Link to={post.fields.slug} itemProp="url">
              <li
                key={post.fields.slug}
                className="flex justify-between justify-items-center border-2 rounded-md shadow-md p-4 hover:bg-slate-100"
              >
                <article
                  className=""
                  itemScope
                  itemType="http://schema.org/Article"
                >
                  <header className="mb-4">
                    <h2 className="mt-2 text-main text-3xl">
                      <span itemProp="headline">{title}</span>
                    </h2>
                    <small className="text-sub">{post.frontmatter.date}</small>
                  </header>
                  <section>
                    <p
                      className="mb-0"
                      dangerouslySetInnerHTML={{
                        __html: post.frontmatter.description || post.excerpt,
                      }}
                      itemProp="description"
                    />
                  </section>
                </article>
                {thumbnailImg ? (
                  <div className="min-w-[5rem] max-w-[20rem] w-[150px] h-[150px]">
                    <GatsbyImage
                      fluid={thumbnailImg}
                      className="rounded-xl h-full w-full"
                    />
                  </div>
                ) : (
                  ""
                )}
              </li>
            </Link>
          )
        })}
      </ol>
    </Layout>
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
      categoryList: distinct(field: frontmatter___category)
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
        }
      }
    }
  }
`
