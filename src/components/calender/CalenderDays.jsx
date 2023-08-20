import React, { useState, useEffect } from "react"
import {
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
} from "@heroicons/react/24/solid"
import { format, addMonths, subMonths } from "date-fns"

const CalenderDays = ({ currentMonth, prevMonth, nextMonth }) => {
  const dates = ["Sun", "Mon", "Thu", "Wed", "Thrs", "Fri", "Sat"]

  return (
    <div className="border w-full grid grid-cols-7">
      {dates.map(date => (
        <div key={date} className="text-center">
          {" "}
          {date}
        </div>
      ))}
    </div>
  )
}

export default CalenderDays
