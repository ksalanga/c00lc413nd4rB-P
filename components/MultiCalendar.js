import React, {useState, useEffect, useCallback} from 'react'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import Image from 'next/image'
import Cat from '../public/vancat.jpeg'

const dateAlreadyClicked = (dates, date) => dates.some(d => new Date(date).getTime() === new Date(d).getTime())
const datesExcept = (dates, date) => dates.filter(d => !(new Date(date).getTime() === new Date(d).getTime()))
Date.prototype.addDays = function(days) {
  var date = new Date(this.valueOf());
  date.setDate(date.getDate() + days);
  return date;
}

function getDates(startDate, stopDate) {
  var dateArray = new Array();
  var currentDate = startDate;
  while (currentDate <= stopDate) {
      dateArray.push(new Date (currentDate));
      currentDate = currentDate.addDays(1);
  }
  return dateArray;
}

const MainCalendar = () => {
  const [dates, setDates] = useState([])
  const [range, setRange] = useState(false)
  const [month, setMonth] = useState(0)
  const ref = React.useRef()
  const [beginDate, setBegin] = useState(null)

  async function waitForDate(i) {
    function dateChanged() {
      return new Promise(resolve => {
        const observer = new MutationObserver(() => {
          resolve()
        })
        var config = { characterData: true, attributes: false, childList: false, subtree: true }

        observer.observe(ref.current.getElementsByClassName('react-calendar__navigation__label')[0].children[0], config)
      })
    }

    await dateChanged()

    setMonth(month + i)
  }

  // Date and State callback handler for Hovering
  useEffect(() => {

    ref.current.getElementsByClassName('react-calendar__navigation')[0].onclick = (e) => {
      switch(e.target.innerHTML) {
        case '«':
          waitForDate(-12)
          break
        case '‹':
          waitForDate(-1)
          break
        case '›':
          waitForDate(1)
          break
        case '»':
          waitForDate(12)
          break
        default:
          // ToDo changeTypeOfView state which will require different DOM selections for different buttons
      }
    }

    // conditionals for monthView vs. yearView vs. decadeView
    var monthView = ref.current.getElementsByClassName('react-calendar__month-view__days')[0]
    var days = monthView.children

    hoverButtons(days)
    deselect(days)

  }, [dates, beginDate, month])

  const hoverButtons = (days) => {
    if (beginDate !== null) {
      for (var i = 0; i < days.length; i++) {
        // MonthView Day Hover Functionality
        days[i].onmouseenter = (e) => {
          var currentDate = new Date(e.target.firstChild.getAttribute('aria-label'))
          for (var j = 0; j < days.length; j++) {
            let compareDate = new Date(days[j].firstChild.getAttribute('aria-label'))
            var addedHover = days[j].getAttribute('class')

            // If date is between the two times Begin Date and End Date, then give it a class name of hover.
            if (compareDate.getTime() >= Math.min(beginDate.getTime(), currentDate.getTime()) 
            && compareDate.getTime() <= Math.max(beginDate.getTime(), currentDate.getTime())) {
              addedHover = addedHover.includes(' react-calendar__tile--hover') ? addedHover : addedHover + ' react-calendar__tile--hover' 
            } else {
              addedHover = addedHover.replace(' react-calendar__tile--hover', '')
            }
            days[j].setAttribute('class', addedHover)
          }
        }
      }
    }
  }

  const deselect = (days) => {
    // clears the active style when you deselect a date.
    var dateTimes = dates.map(day => day.getTime())
    for (var i = 0; i < days.length; i++) {
      var currentDate = new Date(days[i].firstChild.getAttribute('aria-label')).getTime()
      if (dateTimes.indexOf(currentDate) == -1) {
        var removeActive = days[i].getAttribute('class').replaceAll(' react-calendar__tile--active', '')
        days[i].setAttribute('class', removeActive)
      }
    }
  }

  const resetHover = () => {
    setBegin(null)
    var monthView = ref.current.getElementsByClassName('react-calendar__month-view__days')[0]
    var days = monthView.getElementsByTagName('button')
    for (var i = 0; i < days.length; i++) {
      var removeHover = days[i].getAttribute('class').replace(' react-calendar__tile--hover', '')
      days[i].setAttribute('class', removeHover)
      days[i].onmouseenter = null
    }
  }

  const onClickDay = date => {
    if (range) {
      if (beginDate == null) {
        setBegin(date)
      } else {
        var minDate = beginDate.getTime() <= date.getTime() ? beginDate : date
        var maxDate = minDate.getTime() === beginDate.getTime() ? date : beginDate
        var selectedDates = getDates(minDate, maxDate)
        var allDaysFilled = true

        // Have to account for different months and years later (might not be necessary)
        selectedDates.forEach(day => {
          var included = dates.find(calendarDate => calendarDate.getTime() === day.getTime())
          if (!included) {
            allDaysFilled = false
            setDates(dates => [...dates, day])
          }
        })

        if (allDaysFilled) {
          // map each date in selected Dates as an array of times
          var selectedDateTimes = selectedDates.map(day => {return day.getTime()})
          // if the date in dates converted to getTime is not in the selectedDates, then it passes through the filter
          setDates(dates => dates.filter(day => {return selectedDateTimes.indexOf(day.getTime()) == -1}))
        }
        
        resetHover()
      }
    } else {
      // if day is already clicked, remove it from state
      if (dateAlreadyClicked(dates, date)) {
        setDates(dates => datesExcept(dates, date))
      } else {
        setDates(dates => [...dates, date])
      }
    }
  }
  
  // Range
  // set up YearView
  // set up DecadeView


  return (
    <>
    <Calendar
      inputRef={ref}
      className={range ? 'react-calendar--selectRange' : ''}
      tileClassName={({date}) => {
        if (dateAlreadyClicked(dates, date)) {
        return 'react-calendar__tile--active'}}}
      onClickDay={onClickDay}
      minDetail={"decade"}
      minDate={new Date()}
      maxDate={new Date(new Date().setFullYear(new Date().getFullYear() + 100))}
      // max Date is always set to 100 years ahead of today
    />
    <button onClick={(e) => {
      e.preventDefault()
      resetHover()
      setRange(!range)}}
      style={range ? {backgroundColor : 'green'} : null}>range</button>
    <Image src={Cat} width="300px" height="200px"></Image>
    </>
  )
}

export default function MultiCalendar() {
    return (
      <>
        <MainCalendar/>
      </>
    )
}