import * as React from "react"
import { Link, graphql } from "gatsby"

import Bio from "../components/bio"
import Layout from "../components/layout"
import PostCalender from "../components/calender/PostCalender"
import Seo from "../components/seo"
import GatsbyImage from "gatsby-image"
import "../tailwind.css"

const SectionPost = ({ data, location, pageContext }) => {
    const siteTitle = data.site.siteMetadata?.title || `Title`
    const posts = data.allMarkdownRemark.nodes
    const categories = data.categoryList.group
    const sections = data.sectionList.group;
    const { section } = pageContext

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
            <Seo title={`"${section}"의 게시글 목록`} />{" "}
            <Layout location={location} title={siteTitle} sections={sections} categories={categories}>
                <PostCalender posts={posts} />
                <div className="grid lg:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-x-4">
                    {posts.map(post => {
                        const title = post.frontmatter.title || post.fields.slug
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

export default SectionPost

/**
 * Head export to define metadata for the page
 *
 * See: https://www.gatsbyjs.com/docs/reference/built-in-components/gatsby-head/
 */

export const pageQuery = graphql`
  query ($section: String!) {
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
    allMarkdownRemark(
        sort: { frontmatter: { date: DESC } }
        filter: {frontmatter: {section: {eq: $section}}}
        ) {
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