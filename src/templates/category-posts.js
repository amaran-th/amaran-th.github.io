import * as React from "react"
import { Link, graphql } from "gatsby"

import Bio from "../components/bio"
import Layout from "../components/layout"
import Seo from "../components/seo"
import GatsbyImage from "gatsby-image"
import "../tailwind.css"

const CategoryPost = ({ data, location, pageContext }) => {
  const siteTitle = data.site.siteMetadata?.title || `Title`
  const posts = data.allMarkdownRemark.nodes
  const categories = data.categoryList.group
  const { category } = pageContext

  if (posts.length === 0) {
    return (
      <Layout location={location} title={siteTitle}>
        <Bio />
        <p>
          No blog posts found. Add markdown posts to "content/blog" (or the
          directory you specified for the "gatsby-source-filesystem" plugin in
          gatsby-config.js).
        </p>
      </Layout>
    )
  }

  return (
    <Layout
      location={location}
      title={siteTitle}
      categories={categories}
      currentCategory={category}
    >
      <Seo title={`카테고리 [${category}]의 게시글 목록`} />{" "}
      {/* 페이지 title 수정 */}
      <span className="text-main text-xl font-bold ">
        {category}({posts.length})
      </span>
      <hr className="my-2" />
      {/* 현재 카테고리 표시 */}
      <ol style={{ listStyle: `none` }}>
        {posts.map(post => {
          const title = post.frontmatter.title || post.fields.slug

          const thumbnailImg =
            post.frontmatter.thumbnailImg?.childImageSharp.fluid

          return (
            <Link to={post.fields.slug} itemProp="url">
              <li
                key={post.fields.slug}
                className="flex justify-between justify-items-center border-2 rounded-md shadow-md p-4 my-4 hover:bg-slate-100"
              >
                <article
                  className=""
                  itemScope
                  itemType="http://schema.org/Article"
                >
                  <header className="mb-4">
                    <h2 className="mt-2 text-main text-3xl font-title">
                      <span itemProp="headline">{title}</span>
                    </h2>
                    <span className="text-sub text-sm">
                      {post.frontmatter.date}
                      <span className="font-bold mx-2 text-gray-400 text-sm">
                        {post.frontmatter.category}
                      </span>
                    </span>{" "}
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

export default CategoryPost

/**
 * Head export to define metadata for the page
 *
 * See: https://www.gatsbyjs.com/docs/reference/built-in-components/gatsby-head/
 */
export const Head = () => <Seo title="Faded Angels" />

export const pageQuery = graphql`
  query ($category: String!) {
    site {
      siteMetadata {
        title
      }
    }
    categoryList: allMarkdownRemark {
      group(field: frontmatter___category) {
        fieldValue
        totalCount
      }
    }
    allMarkdownRemark(
      sort: { frontmatter: { date: DESC } }
      filter: { frontmatter: { category: { eq: $category } } }
    ) {
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
        }
      }
    }
  }
`
