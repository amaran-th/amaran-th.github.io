/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.com/docs/reference/config-files/gatsby-node/
 */
const kebabCase = require(`lodash.kebabcase`)
const path = require(`path`)
const { createFilePath } = require(`gatsby-source-filesystem`)

// Define the template for blog post
const blogPost = path.resolve(`./src/templates/blog-post.js`)

/**
 * @type {import('gatsby').GatsbyNode['createPages']}
 */
exports.createPages = async ({ graphql, actions, reporter }) => {
  const { createPage } = actions

  // Get all markdown blog posts sorted by date
  const result = await graphql(`
    {
      essay: allMarkdownRemark(
        sort: { frontmatter: { date: ASC } },
        filter: {frontmatter: { section: {eq: "회고" }}}
        limit: 1000
        ) {
        nodes {
          id
          fields {
            slug
          }
        }
      }
      share: allMarkdownRemark(
        sort: { frontmatter: { date: ASC } },
        filter: {frontmatter: { section: {eq: "지식 공유" }}}
        limit: 1000
        ) {
        nodes {
          id
          fields {
            slug
          }
        }
      }
      solution: allMarkdownRemark(
        sort: { frontmatter: { date: ASC } },
        filter: {frontmatter: { section: {eq: "문제 해결" }}}
        limit: 1000
        ) {
        nodes {
          id
          fields {
            slug
          }
        }
      }
      tagList: allMarkdownRemark {
        group(field: frontmatter___tags) {
          fieldValue
          totalCount
        }
      }
      sectionList: allMarkdownRemark {
        group(field: frontmatter___section){
          fieldValue
          totalCount
        }
      }
      categoryList: allMarkdownRemark {
        group(field: frontmatter___category) {
          fieldValue
          totalCount
        }
      }
    }
  `)

  if (result.errors) {
    reporter.panicOnBuild(
      `There was an error loading your blog posts`,
      result.errors
    )
    return
  }
  const tagPosts = path.resolve("./src/templates/tag-posts.js")
  const categoryPosts = path.resolve("./src/templates/category-posts.js")
  const sectionPosts = path.resolve("./src/templates/section-posts.js")

  // 카테고리 데이터를 가져온다.
  const tags = result.data.tagList.group
  const categories = result.data.categoryList.group
  const sections = result.data.sectionList.group
  //태그 목록을 가져온다.
  // 카테고리 마다 하나의 페이지를 만든다.
  categories.forEach(category => {
    createPage({
      // 생성할 페이지들의 slug는 카테고리 이름을 kebab base로 변환한 것이다.
      path: `/${category.fieldValue}/`,
      component: categoryPosts,
      context: { category: category.fieldValue },
    })
  })
  sections.forEach(section => {
    createPage({
      // 생성할 페이지들의 slug는 카테고리 이름을 kebab base로 변환한 것이다.
      path: `/${section.fieldValue}/`,
      component: sectionPosts,
      context: { section: section.fieldValue },
    })
  })
  tags.forEach(tag => {
    createPage({
      // 생성할 페이지들의 slug는 카테고리 이름을 kebab base로 변환한 것이다.
      path: `/tags/` + kebabCase(tag.fieldValue) + `/`,
      component: tagPosts,
      context: { tag: tag.fieldValue },
    })
  })
  const essayPosts = result.data.essay.nodes;
  const sharePosts = result.data.share.nodes;
  const solutionPosts = result.data.solution.nodes;

  // Create blog posts pages
  // But only if there's at least one markdown file found at "content/blog" (defined in gatsby-config.js)
  // `context` is available in the template as a prop and as a variable in GraphQL

  if (essayPosts.length > 0) {
    essayPosts.forEach((post, index) => {
      const previousPostId = index === 0 ? null : essayPosts[index - 1].id
      const nextPostId = index === essayPosts.length - 1 ? null : essayPosts[index + 1].id

      createPage({
        path: post.fields.slug,
        component: blogPost,
        context: {
          id: post.id,
          previousPostId,
          nextPostId,
          tableOfContents: post.tableOfContents,
        },
      })
    })
  }
  if (sharePosts.length > 0) {
    sharePosts.forEach((post, index) => {
      const previousPostId = index === 0 ? null : sharePosts[index - 1].id
      const nextPostId = index === sharePosts.length - 1 ? null : sharePosts[index + 1].id

      createPage({
        path: post.fields.slug,
        component: blogPost,
        context: {
          id: post.id,
          previousPostId,
          nextPostId,
          tableOfContents: post.tableOfContents,
        },
      })
    })
  }
  if (solutionPosts.length > 0) {
    solutionPosts.forEach((post, index) => {
      const previousPostId = index === 0 ? null : solutionPosts[index - 1].id
      const nextPostId = index === solutionPosts.length - 1 ? null : solutionPosts[index + 1].id

      createPage({
        path: post.fields.slug,
        component: blogPost,
        context: {
          id: post.id,
          previousPostId,
          nextPostId,
          tableOfContents: post.tableOfContents,
        },
      })
    })
  }
}

/**
 * @type {import('gatsby').GatsbyNode['onCreateNode']}
 */
exports.onCreateNode = ({ node, actions, getNode }) => {
  const { createNodeField } = actions

  if (node.internal.type === `MarkdownRemark`) {
    const value = createFilePath({ node, getNode })

    createNodeField({
      name: `slug`,
      node,
      value,
    })
  }
}

/**
 * @type {import('gatsby').GatsbyNode['createSchemaCustomization']}
 */
exports.createSchemaCustomization = ({ actions }) => {
  const { createTypes } = actions

  // Explicitly define the siteMetadata {} object
  // This way those will always be defined even if removed from gatsby-config.js

  // Also explicitly define the Markdown frontmatter
  // This way the "MarkdownRemark" queries will return `null` even when no
  // blog posts are stored inside "content/blog" instead of returning an error
  createTypes(`
    type SiteSiteMetadata {
      author: Author
      siteUrl: String
      social: Social
    }

    type Author {
      name: String
      summary: String
    }

    type Social {
      github: String
      portfolioK: String
      portfolioE: String
      CVK: String
      CVE: String
    }

    type MarkdownRemark implements Node {
      frontmatter: Frontmatter
      fields: Fields
    }

    type Frontmatter {
      title: String
      description: String
      date: Date @dateformat
      image : String
      category : String
      section : String
      tags : [String!]
    }

    type Fields {
      slug: String
    }
  `)
}
