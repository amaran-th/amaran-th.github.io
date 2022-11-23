/**
 * Bio component that queries for data
 * with Gatsby's useStaticQuery component
 *
 * See: https://www.gatsbyjs.com/docs/how-to/querying-data/use-static-query/
 */

import * as React from "react"
import { Link, graphql } from "gatsby"

const CategoryList = ({ categories }) => {
  // Set these values by editing "siteMetadata" in gatsby-config.js

  return (
    <nav className=" bg-shadow m-2 p-4 shadow-md rounded-xl sticky top-32 mt-4 ">
      <p className="text-point text-center font-bold">-● 카테고리 ●-</p>
      <ul className="">
        {categories?.map(category => (
          <li key={category}>
            <Link to={`/${category}/`}>{category}</Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default CategoryList
