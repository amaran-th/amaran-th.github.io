import * as React from "react"
import { Link, useStaticQuery, graphql } from "gatsby"
import kebabCase from "lodash.kebabcase"

import Bio from "../components/bio"
import Layout from "../components/layout"
import Seo from "../components/seo"

const BlogPostTemplate = ({
  data: { previous, next, site, categoryList, markdownRemark: post },
  location,
}) => {
  const siteTitle = site.siteMetadata?.title || `Title`
  const categories = categoryList.group
  const writer = site.siteMetadata?.author?.name
  return (
    <Layout
      location={location}
      title={siteTitle}
      categories={categories}
      isPost={true}
    >
      <article
        className="blog-post space-y-8"
        itemScope
        itemType="http://schema.org/Article"
      >
        <header>
          <h1
            className="text-main text-5xl font-bold font-title"
            itemProp="headline"
          >
            {post.frontmatter.title}
          </h1>
          <p className="space-x-4">
            <span className="font-bold text-sub">{writer}</span>
            <span>{post.frontmatter.date}</span>
          </p>
        </header>
        <section
          className="mark_down p-4  rounded-md"
          dangerouslySetInnerHTML={{ __html: post.html }}
          itemProp="articleBody"
        />

        <div className="tags">
          <ul>
            {post.frontmatter.tags
              ? post.frontmatter.tags.map(tag => (
                  <Link
                    key={kebabCase(tag)}
                    to={`/tags/${kebabCase(tag)}`}
                    className="rounded-full border shadow-sm px-4 m-1 bg-white hover:bg-slate-100"
                  >
                    {kebabCase(tag)}
                  </Link>
                ))
              : null}
          </ul>
        </div>
        <hr />
        <br />
      </article>
      <nav className="blog-post-nav">
        <ul
          className="text-main font-bold hover:text-point"
          style={{
            display: `flex`,
            flexWrap: `wrap`,
            justifyContent: `space-between`,
            listStyle: `none`,
            padding: 0,
          }}
        >
          <li>
            {previous && (
              <Link to={previous.fields.slug} rel="prev">
                ←{" "}
                <span className="underline underline-offset-4">
                  {previous.frontmatter.title}
                </span>
              </Link>
            )}
          </li>
          <li>
            {next && (
              <Link to={next.fields.slug} rel="next">
                <span className="underline underline-offset-4">
                  {next.frontmatter.title}
                </span>{" "}
                →
              </Link>
            )}
          </li>
        </ul>
      </nav>
    </Layout>
  )
}

export const Head = ({ data: { markdownRemark: post } }) => {
  return (
    <Seo
      title={post.frontmatter.title}
      description={post.frontmatter.description || post.excerpt}
    />
  )
}

export default BlogPostTemplate

export const pageQuery = graphql`
  query BlogPostBySlug(
    $id: String!
    $previousPostId: String
    $nextPostId: String
  ) {
    site {
      siteMetadata {
        title
        author {
          name
        }
      }
    }
    categoryList: allMarkdownRemark {
      group(field: frontmatter___category) {
        fieldValue
        totalCount
      }
    }
    allMarkdownRemark(sort: { frontmatter: { date: DESC } }) {
      nodes {
        excerpt
        fields {
          slug
        }
        frontmatter {
          date(formatString: "MMMM DD, YYYY")
          title
          description
          tags
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
    markdownRemark(id: { eq: $id }) {
      id
      excerpt(pruneLength: 160)
      html
      frontmatter {
        title
        date(formatString: "YYYY년 MM월 DD일")
        description
        tags
      }
    }
    previous: markdownRemark(id: { eq: $previousPostId }) {
      fields {
        slug
      }
      frontmatter {
        title
      }
    }
    next: markdownRemark(id: { eq: $nextPostId }) {
      fields {
        slug
      }
      frontmatter {
        title
      }
    }
  }
`
