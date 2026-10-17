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
        dangerouslySetInnerHTML={{ __html: redirectScript(movedTo) }}
      />,
    ])
  }
}

// The new page can take a few seconds when it is not cached yet, and the
// browser keeps showing this page until then. Cover it with a "moving"
// screen instead of the old post. Added from the script so visitors without
// JS still see the post until the meta refresh fires; !important because the
// page's own inlined styles come later in <head>.
const MOVING_CSS = `
body{display:none !important}
html{height:100% !important;background:#fff !important;color:#1c2024 !important;font-family:-apple-system,BlinkMacSystemFont,"Apple SD Gothic Neo","Noto Sans KR",sans-serif !important}
html::before,html::after{position:fixed !important;left:0 !important;right:0 !important;text-align:center !important}
html::before{content:"amaranth.log 로 이사했어요" !important;top:calc(50% - 1.75rem) !important;font-size:1.25rem !important;font-weight:700 !important}
html::after{content:"새 블로그로 이동하는 중…" !important;top:calc(50% + 0.5rem) !important;font-size:0.9375rem !important;color:#80838d !important}
@media (prefers-color-scheme:dark){html{background:#111113 !important;color:#edeef0 !important}html::after{color:#b0b4ba !important}}
`

const redirectScript = url =>
  `(function(){var s=document.createElement("style");s.textContent=${JSON.stringify(
    MOVING_CSS.replace(/\n/g, "")
  )};document.head.appendChild(s);location.replace(${JSON.stringify(url)})})()`

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
