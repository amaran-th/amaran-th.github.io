import React, { useState, useEffect } from "react"
import {
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
} from "@heroicons/react/24/solid"
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  isSameMonth,
  parse,
  isSameDay,
  addDays,
} from "date-fns"
import { Link } from "gatsby"

const CalenderCells = ({ currentMonth, selectedDate, onDateClick, posts }) => {
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(monthStart)
  const startDate = startOfWeek(monthStart)
  const endDate = endOfWeek(monthEnd)
  const rows = []
  let days = []
  let formattedDate = ""
  let day = startDate

  const isPosting = day => {
    console.log(day)
    if (
      posts.filter(post => isSameDay(day, new Date(post.frontmatter.date)))
        .length != 0
    )
      return true
    return false
  }

  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      formattedDate = format(day, "d")
      const cloneDay = day
      let filteredPost = posts.filter(post =>
        isSameDay(day, new Date(post.frontmatter.date))
      )
      let limitedPost =
        filteredPost.length >= 3 ? filteredPost.slice(0, 2) : filteredPost

      days.push(
        <div
          className={`w-full h-[5em] p-1 border  ${
            !isSameMonth(day, monthStart)
              ? "text-gray-300"
              : isSameDay(day, selectedDate)
              ? "font-bold"
              : ""
          }`}
          key={day}
          onClick={() => onDateClick(parse(cloneDay))}
        >
          <span>
            <span
              className={
                isSameDay(day, selectedDate)
                  ? "text-white bg-main p-1 rounded-full"
                  : ""
              }
            >
              {formattedDate}
            </span>{" "}
            {isSameMonth(day, monthStart) && filteredPost.length !== 0 ? (
              <span className="text-main">({filteredPost.length})</span>
            ) : (
              ""
            )}
          </span>

          {isSameMonth(day, monthStart) ? (
            <div className="space-2">
              {limitedPost.map(post => (
                <Link to={post.fields.slug} itemProp="url">
                  <div className="text-point mt-1 px-1 bg-shadow hover:bg-sub rounded-md text-sm truncate">
                    {post.frontmatter.title}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            ""
          )}
        </div>
      )
      day = addDays(day, 1)
    }
    rows.push(
      <div className="grid grid-cols-7" key={day}>
        {days}
      </div>
    )
    days = []
  }
  return <div className="">{rows}</div>
}

export default CalenderCells
