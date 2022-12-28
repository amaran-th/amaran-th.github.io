import * as React from "react"
import { Link, graphql } from "gatsby"

import Bio from "../components/bio"
import Layout from "../components/layout"
import Seo from "../components/seo"
import GatsbyImage from "gatsby-image"
import "../tailwind.css"
var kebabCase = require("lodash.kebabcase")

const Tags = ({ pageContext, data, location }) => {
  const siteTitle = data.site.siteMetadata?.title || `Title`
  const posts = data.allMarkdownRemark.nodes
  const categories = data.categoryList.group
  const tags = data.tagList.group
  const { tag } = pageContext
  return (
    <Layout location={location} title={siteTitle} categories={categories}>
      <Seo title={`태그 [${tag}]의 게시글 목록`} />
      <div className="border bg-gray-50 p-2 mb-4">
        <h1>Tags</h1>
        <ul className="flex flex-wrap">
          {tags.map(tag => (
            <Link
              to={`/tags/${kebabCase(tag.fieldValue)}/`}
              className="rounded-full border shadow-sm px-4 m-1 bg-white hover:bg-slate-100"
            >
              {tag.fieldValue} ({tag.totalCount})
            </Link>
          ))}
        </ul>
      </div>
      <span className="text-main text-xl font-bold ">
        {tag}({posts.length})
      </span>
      <hr className="my-2" />
      <ol style={{ listStyle: `none` }}>
        {posts.map(post => {
          const title = post?.frontmatter?.title || post?.fields?.slug
          const thumbnailImg =
            post?.frontmatter.thumbnailImg?.childImageSharp.fluid
          return (
            <Link to={post?.fields.slug} itemProp="url">
              <li
                key={post?.fields.slug}
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
                    <small className="text-sub">{post?.frontmatter.date}</small>
                  </header>
                  <section>
                    <p
                      className="mb-0"
                      dangerouslySetInnerHTML={{
                        __html: post?.frontmatter.description || post?.excerpt,
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

export default Tags

export const pageQuery = graphql`
  query ($tag: String) {
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
    tagList: allMarkdownRemark {
      group(field: frontmatter___tags) {
        fieldValue
        totalCount
      }
    }
    allMarkdownRemark(
      sort: { frontmatter: { date: DESC } }
      filter: { frontmatter: { tags: { in: [$tag] } } }
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
          tags
        }
      }
    }
  }
`
