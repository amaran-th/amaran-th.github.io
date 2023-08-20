import React, { useState, useEffect } from "react"
import CalenderHeader from "./CalenderHeader"
import CalenderDays from "./CalenderDays"
import { format, addMonths, subMonths } from "date-fns"
import CalenderCells from "./CalenderCells"

const PostCalender = ({ posts }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1))
  }
  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
  }
  const onDateClick = day => {
    setSelectedDate(day)
  }
  return (
    <>
      <CalenderHeader
        currentMonth={currentMonth}
        setCurrentMonth={setCurrentMonth}
        prevMonth={prevMonth}
        nextMonth={nextMonth}
      />
      <CalenderDays />
      <CalenderCells
        currentMonth={currentMonth}
        selectedDate={selectedDate}
        onDateClick={onDateClick}
        posts={posts}
      />
    </>
  )
}

export default PostCalender
