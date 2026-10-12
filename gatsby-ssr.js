/**
 * Implement Gatsby's SSR (Server Side Rendering) APIs in this file.
 *
 * See: https://www.gatsbyjs.com/docs/reference/config-files/gatsby-ssr/
 */
import { newBlogUrl } from "./src/utils/new-blog"

/**
 * @type {import('gatsby').GatsbySSR['onRenderBody']}
 */
export const onRenderBody = ({ setHtmlAttributes }) => {
  setHtmlAttributes({ lang: `en` })
}

/**
 * Posts that moved to the new blog declare the new URL as canonical in their
 * Head; drop gatsby-plugin-canonical-urls' self canonical there so a page
 * never carries two.
 *
 * @type {import('gatsby').GatsbySSR['onPreRenderHTML']}
 */
export const onPreRenderHTML = ({ pathname, getHeadComponents, replaceHeadComponents }) => {
  if (!newBlogUrl(pathname)) return
  replaceHeadComponents(
    // Only the plugin's tag carries data-baseprotocol; Head API tags (including
    // the new canonical) are in this list too and must stay.
    getHeadComponents().filter(
      c => !(c && c.type === "link" && c.props && c.props.rel === "canonical" && c.props["data-baseprotocol"])
    )
  )
}
