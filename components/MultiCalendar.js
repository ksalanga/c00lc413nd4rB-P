import React, {useState, useEffect} from 'react'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import animationStyles from '../styles/animations.module.css'

const dateAlreadyClicked = (dates, tileDate) => {
  return dates.some(date => 
  {
    const matchingDay = tileDate.getDate() === date.getDate()
    const matchingMonth = tileDate.getMonth() === date.getMonth()
    const matchingYear = tileDate.getFullYear() === date.getFullYear()

    return  matchingDay &&
    matchingMonth &&
    matchingYear
  })
}

// if a date is clicked, it must compare if the time sensitive dates array (one we're actually submitting)
// matches via the day, month, and year (not time), because the date clicked is 12am of
// the time zone of the client. 
// In our original implementation, we only used .getTime for comparison
// So even if they have matching days, months, and year, the hours, minutes seconds time values might be different
// so it might not actually remove it from the 
// time sensitive dates array because we were originally comparing strictly with UTC time.

const datesExcept = (dates, tileDate) => {
  return dates.filter(date => {
    const matchingDay = tileDate.getDate() !== date.getDate()
    const matchingMonth = tileDate.getMonth() !== date.getMonth()
    const matchingYear = tileDate.getFullYear() !== date.getFullYear()

    return  matchingDay ||
    matchingMonth ||
    matchingYear
  })
}

export function formatDate(date) {
  var d = new Date(date),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear()

  if (month.length < 2) 
      month = '0' + month
  if (day.length < 2) 
      day = '0' + day

  return [year, month, day].join('-')
}

export function MultiCalendar(props) {
  const fadeInUp = animationStyles.animated + ' ' + animationStyles.animatedFadeInUp + ' ' + animationStyles.fadeInUp
  const dates = props.dates
  const setDates = props.setDates
  const [range, setRange] = useState(false)
  const [view, setView] = useState(new Date().toLocaleString('default', {month: 'long', year: 'numeric'}))
  const ref = React.useRef()
  const [beginDate, setBegin] = useState(null)
  const views = ['day', 'month', 'year', 'decade']

  async function waitForDate() {
    function dateChanged() {
      return new Promise(resolve => {
        const observer = new MutationObserver(() => {
          resolve(ref.current.getElementsByClassName('react-calendar__navigation__label')[0].children[0].innerHTML)
        })
        var config = { characterData: true, attributes: false, childList: false, subtree: true }

        observer.observe(ref.current.getElementsByClassName('react-calendar__navigation__label')[0].children[0], config)
      })
    }

    var title = await dateChanged()
    setView(title)
  }

  const typeOfView = () => {
    if (/\d/.test(view) && /[a-z]/i.test(view)) {
      return('month')
    } else if (/–/.test(view)) {
      return('decade')
    } else {
      return('year')
    }
  }

  // Date and State callback handler for Hovering
  useEffect(() => {
    ref.current.getElementsByClassName('react-calendar__navigation')[0].onclick = () => {waitForDate()}

    // conditionals for monthView vs. yearView vs. decadeView
    var viewType = typeOfView()
    var viewElement = 'react-calendar__'+ viewType +'-view__' + views[views.indexOf(viewType) - 1] + 's'
    var calendarView = ref.current.getElementsByClassName(viewElement)[0]
    var buttons = calendarView.children
    
    // If it's not a month, we have to update State
    if (viewType != 'month') for (var i = 0; i < buttons.length; i++) buttons[i].onclick = () => {waitForDate()}

    hoverButtons(buttons, viewType)
    if (viewType == 'month') deselect(buttons)

  }, [dates, beginDate, view])

  const hoverButtons = (buttons, viewType) => {
    if (beginDate !== null) {
      for (var i = 0; i < buttons.length; i++) {
        // MonthView Day Hover Functionality
        buttons[i].onmouseenter = (e) => {
          if (viewType == 'decade') var currentDate = new Date(e.target.innerHTML)
          else var currentDate = new Date(e.target.firstChild.getAttribute('aria-label'))

          for (var j = 0; j < buttons.length; j++) {
            if (viewType == 'decade') var compareDate = new Date(buttons[j].innerHTML)
            else var compareDate = new Date(buttons[j].firstChild.getAttribute('aria-label'))
            var addedHover = buttons[j].getAttribute('class')

            // If date is between the two times Begin Date and End Date, then give it a class name of hover.
            if (compareDate.getTime() >= Math.min(beginDate.getTime(), currentDate.getTime()) 
            && compareDate.getTime() <= Math.max(beginDate.getTime(), currentDate.getTime())) {
              addedHover = addedHover.includes(' react-calendar__tile--hover') ? addedHover : addedHover + ' react-calendar__tile--hover' 
            } else {
              addedHover = addedHover.replace(' react-calendar__tile--hover', '')
            }
            buttons[j].setAttribute('class', addedHover)
          }
        }
      }
    }
  }

  const deselect = (buttons) => {
    // clears the active style when you deselect a date.
    // now do it based off of date, month, and year rather than with time.
    // this way, we can include dates with hours, minutes, and seconds that aren't zero.
    var dateTimes = dates.map(day => formatDate(day))
    for (var i = 0; i < buttons.length; i++) {
      var currentDate = formatDate(new Date(buttons[i].firstChild.getAttribute('aria-label')))
      if (dateTimes.indexOf(currentDate) == -1) {
        var removeActive = buttons[i].getAttribute('class').replaceAll(' react-calendar__tile--active', '')
        buttons[i].setAttribute('class', removeActive)
      }
    }
  }

  const resetHover = () => {
    setBegin(null)
    var viewType = typeOfView()
    var viewElement = 'react-calendar__'+ viewType +'-view__' + views[views.indexOf(viewType) - 1] + 's'
    var calendarView = ref.current.getElementsByClassName(viewElement)[0]
    var buttons = calendarView.children

    for (var i = 0; i < buttons.length; i++) {
      var removeHover = buttons[i].getAttribute('class').replace(' react-calendar__tile--hover', '')
      buttons[i].setAttribute('class', removeHover)
      buttons[i].onmouseenter = null
    }
  }

  const onClickDay = date => {
    if (range) {
      if (beginDate == null) {
        setBegin(date)
      } else {
        var minDate = beginDate.getTime() <= date.getTime() ? beginDate : date
        var maxDate = minDate.getTime() === beginDate.getTime() ? date : beginDate
        var selectedDates = props.getDates(minDate, maxDate)
        var allDaysFilled = true

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

  return (
    <div style={{textAlign: 'center'}} className={fadeInUp}>
      <Calendar
        inputRef={ref}
        className={range ? 'react-calendar--selectRange' : ''}
        onClickDay={onClickDay}
        minDetail={"decade"}
        minDate={new Date(props.minDate + 'T00:00:00')}
        maxDate={new Date(new Date().setFullYear(new Date().getFullYear() + 100))}
        tileClassName={({date}) => {
          if (dateAlreadyClicked(dates, date)) {
            return 'react-calendar__tile--active'
          }
        }}
        // max Date is always set to 100 years ahead of today
      />
      <button onClick={(e) => {
        e.preventDefault()
        resetHover()
        setRange(!range)}}
        style={range ? {backgroundColor : '#90ee90'} : null}>Range Selection</button>
    </div>
  )
}