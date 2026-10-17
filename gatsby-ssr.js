/**
 * Implement Gatsby's SSR (Server Side Rendering) APIs in this file.
 *
 * See: https://www.gatsbyjs.com/docs/reference/config-files/gatsby-ssr/
 */
import { newBlogUrl } from "./src/utils/new-blog"

/**
 * @type {import('gatsby').GatsbySSR['onRenderBody']}
 */
export const onRenderBody = ({ pathname, setHtmlAttributes, setHeadComponents }) => {
  setHtmlAttributes({ lang: `en` })
  // A meta refresh only fires once the whole page (images, scripts) has
  // loaded, so moved pages also redirect from a script at the top of <head>.
  // The meta refresh in the page's Head stays as the no-JS fallback.
  const movedTo = newBlogUrl(pathname)
  if (movedTo) {
    setHeadComponents([
      <script
        key="new-blog-redirect"
        dangerouslySetInnerHTML={{ __html: `location.replace(${JSON.stringify(movedTo)})` }}
      />,
    ])
  }
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
  // Only the plugin's tag carries data-baseprotocol; Head API tags (including
  // the new canonical) are in this list too and must stay.
  const kept = getHeadComponents().filter(
    c => !(c && c.type === "link" && c.props && c.props.rel === "canonical" && c.props["data-baseprotocol"])
  )
  // Run the redirect before the browser parses the inlined styles.
  const isRedirect = c => c && c.key === "new-blog-redirect"
  replaceHeadComponents([...kept.filter(isRedirect), ...kept.filter(c => !isRedirect(c))])
}
