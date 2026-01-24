import { graphql, useStaticQuery } from "gatsby"

const Seo = ({ description, title, children }) => {
  const { site } = useStaticQuery(
    graphql`
      query {
        site {
          siteMetadata {
            title
            description
          }
        }
      }
    `
  )

  const metaDescription = description || site.siteMetadata.description
  const defaultTitle = site.siteMetadata?.title

  return (
    <>
      <title>{defaultTitle ? `${title} | ${defaultTitle}` : title}</title>
      <meta name="description" content={metaDescription} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:type" content="website" />
      <meta
        property="og:image"
        content="https://amaran-th.github.io/static/7bdca5c75cee8c2aadcba0f8aece6b7c/d4bf4/profile-pic.avif"
      />
      <meta name="twitter:card" content="summary" />
      <meta
        name="google-site-verification"
        content="aZ6Rx91KxboXOthhgdEOqpLc2tw6PThHxoPcNdMfeIk"
      />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={metaDescription} />
      <script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1344097825263008"
        crossorigin="anonymous"
      ></script>
      {children}
    </>
  )
}

export default Seo
