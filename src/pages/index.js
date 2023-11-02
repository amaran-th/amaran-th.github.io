import * as React from "react"
import { Link, graphql } from "gatsby"

import Layout from "../components/layout"
import Seo from "../components/seo"
import "../tailwind.css"

const BlogIndex = ({ data, location }) => {
  const siteTitle = data.site.siteMetadata?.title || `Title`
  const essayPosts = data.essay.nodes;
  const sharePosts = data.share.nodes;
  const solutionPosts = data.solution.nodes;

  const categories = data.categoryList.group
  const sections = data.sectionList.group;

  const getPosts = (section) => {
    if (section === "회고") return essayPosts;
    if (section === "지식 공유") return sharePosts;
    if (section === "문제 해결") return solutionPosts;
  }

  return (
    <>
      <Seo title={`메인 홈`} />{" "}
      <Layout location={location} title={siteTitle} sections={sections} categories={categories}>
        <div className="flex flex-col gap-y-16">
          {sections.map(section => (<div className="mb-4">
            <Link to={section.fieldValue} itemProp="url">
              <div className="max-w-[200px] mx-auto font-bold text-center border-b-2 border-black px-2 mb-8 text-2xl">{section.fieldValue}</div>
            </Link>
            <div>
              {getPosts(section.fieldValue)?.map(post => (
                <Link to={post.fields.slug} itemProp="url">
                  <p className="max-w-[800px] w-full flex gap-2 justify-between border-b px-1 hover:bg-slate-50">
                    <span className="truncate">{post.frontmatter.title}</span>
                    <span className="bg-sub text-white rounded-full text-sm px-2 my-auto">{post.frontmatter.category}</span>
                  </p>
                </Link>
              ))}
              <Link to={section.fieldValue} itemProp="url">
                <div className="mt-2 bg-shadow h-[1.5em] rounded-md text-point hover:bg-sub">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mx-auto">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </div>
              </Link>
            </div>




          </div>
          ))}
        </div>
      </Layout >
    </>
  )
}

export default BlogIndex

/**
 * Head export to define metadata for the page
 *
 * See: https://www.gatsbyjs.com/docs/reference/built-in-components/gatsby-head/
 */

export const pageQuery = graphql`
  {
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
    sectionList: allMarkdownRemark {
      group(field: frontmatter___section) {
        fieldValue
        totalCount
      }
    }
    essay: allMarkdownRemark(
        sort: { frontmatter: { date: DESC } },
        filter: {frontmatter: { section: {eq: "회고" }}}
        limit: 5
        ) {
        nodes {
          fields {
          slug
        }
          frontmatter {
          date(formatString: "MMMM DD, YYYY")
          title
          description
          category
        }
      }
    }
    share: allMarkdownRemark(
        sort: { frontmatter: { date: DESC } },
        filter: {frontmatter: { section: {eq: "지식 공유" }}}
        limit: 5
        ) {
        nodes {
          fields {
          slug
        }
          frontmatter {
          date(formatString: "MMMM DD, YYYY")
          title
          description
          category
          }
        }
      }
      solution: allMarkdownRemark(
        sort: { frontmatter: { date: DESC } },
        filter: {frontmatter: { section: {eq: "문제 해결" }}}
        limit: 5
        ) {
        nodes {
          fields {
          slug
        }
          frontmatter {
          date(formatString: "MMMM DD, YYYY")
          title
          description
          category
        }
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
          thumbnailImg {
            childImageSharp {
              fluid(maxWidth: 800) {
                ...GatsbyImageSharpFluid
              }
            }
          }
          section
          category
          tags
        }
      }
    }
  }
`
