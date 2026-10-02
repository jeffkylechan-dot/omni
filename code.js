//!IMPORTANT ALL MONTHS IN THIS CODE ARE SHIFTED DOWN BY ONE, MEANING E.G. JAN = 0, AUG = 7

const cal = document.getElementById("calendar")
const next_button = document.getElementById("next")
const last_button = document.getElementById("last")
const subject_screen = document.getElementById("subject_choose_screen")
const calendar_screen = document.getElementById("calendar_screen")
const popup_background = document.querySelector('#popup_background')
const popup_close_button = document.querySelector("#close_popup")
const canvas_screen = document.getElementById("chart")

const screens = [subject_screen, calendar_screen, canvas_screen]
for (let screen of screens) {
  screen.classList.add('hidden')
}

let today = new Date()
let current_year = today.getFullYear()
let current_month = today.getMonth()
let current_day = today.getDate()
let today_date = `${current_day}-${current_month}-${current_year}`

function reset_day() {
  today = new Date()
  current_year = today.getFullYear()
  current_month = today.getMonth()
  current_day = today.getDate()
  today_date = `${current_day}-${current_month}-${current_year}`
}

let crazy_stuff = localStorage.getItem("data")
let timer = null

let stuff = crazy_stuff ? JSON.parse(crazy_stuff) : {
  subjects: ["physics", "chemistry", "math"],
  time_spent: {
    [today_date]: { physics: 0, chemistry: 0, math: 0 }
  }
}
localStorage.setItem("data", JSON.stringify(stuff))

function add_jason(type, subject, input) {
  if (stuff.time_spent[today_date] === undefined) {
    stuff.time_spent[today_date] = {}
    for (const subject of subjects) {
      stuff.time_spent[today_date][subject] = 0
    }
  }
  if (type === "time") {
    if (subject) {
      stuff.time_spent[today_date][subject] = input
    }
  }
  else if (type === "subject") {
    stuff.subjects.push(input)
    stuff[time_spent][input] = 0
  }

  localStorage.setItem("data", JSON.stringify(stuff))
}

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
const month_lengths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
const alt_month_lengths = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

let current_screen = null
function switch_screen(new_screen) {
  if (current_screen) { current_screen.classList.add("hidden") }
  new_screen.classList.remove("hidden")
  current_screen = new_screen
}

switch_screen(subject_screen)


function last_month() {
  if (current_month == 0) {
    current_month = 11
    current_year -= 1
  } else {
    current_month -= 1
  }
  genCal(current_month, current_year)
}

function next_month() {
  if (current_month == 11) {
    current_month = 0
    current_year += 1
  } else {
    current_month += 1
  }

  genCal(current_month, current_year)
}

function genCal(month, year) {
  cal.innerHTML = ""
  switch_screen(calendar_screen)
  let times = []

  const dateLabel = document.getElementById("date")
  if (dateLabel) dateLabel.innerText = months[month] + " " + year

  let firstdayObject = new Date(year, month, 1)
  let current_first_day = firstdayObject.getDay()

  let active_lengths_array = ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0) ? alt_month_lengths : month_lengths
  let past_month = (month === 0) ? 11 : month - 1

  //past filler
  for (let i = 0; i < current_first_day; i += 1) {
    let day = active_lengths_array[past_month] - current_first_day + i + 1
    let filler = document.createElement("div")
    filler.classList.add("past_filler")
    filler.textContent = day
    cal.appendChild(filler)
  }

  //current days
  let sus = active_lengths_array[month]
  for (let i = 1; i <= sus; i++) {
    let current_date = `${i}-${month}-${year}`
    let day = document.createElement("div")
    if (current_date === today_date) {
      day.classList.add("today")
    }

    if (stuff.time_spent[current_date]) {
      let total = Object.values(stuff.time_spent[current_date]).reduce((acc, curr) => acc + curr, 0)
      let hours = (Math.floor(total / 3600) < 10) ? "0" + (Math.floor(total / 3600)) : Math.floor(total / 3600)
      let minutes = (Math.floor(total / 60) - 60 * hours < 10) ? "0" + (Math.floor(total / 60) - 60 * hours) : Math.floor(total / 60) - 60 * hours
      let seconds = (total - 3600 * hours - 60 * minutes < 10) ? "0" + (total - 3600 * hours - 60 * minutes) : total - 3600 * hours - 60 * minutes
      day.textContent = `${i}
      ${hours}:${minutes}:${seconds}`
      total /= 3600
      if (total < 1 && total > 0) {
        day.classList.add('level1')
      }
      else if (total >= 1 && total < 3) {
        day.classList.add('level2')
      }
      else if (total >= 3 && total < 6) {
        day.classList.add('level3')
      }
      else if (total >= 6 && total < 10) {
        day.classList.add('level4')
      }
    }
    else {
      day.textContent = i
    }
    day.classList.add('calendar_day')

    cal.appendChild(day)
    day.addEventListener("click", () => {
      const current_date = `${i}-${month}-${year}`
      draw_chart(current_date)
    })
  }

  //future filler
  let totalCellsUsed = current_first_day + sus
  let remainingCells = 42 - totalCellsUsed
  for (let i = 0; i < remainingCells; i += 1) {
    let filler = document.createElement("div")
    filler.classList.add("next_filler")
    filler.textContent = i + 1
    cal.appendChild(filler)
  }
}

document.body.addEventListener('keydown', (event) => {
  if (event.key === "ArrowLeft") {
    last_month()
  }

  else if (event.key === "ArrowRight") {
    next_month()
  }
})

const date_input = document.getElementById("date_input")

date_input.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    let month_year = date_input.value.split("-")
    let month = Number(month_year[0])
    let year = Number(month_year[1])
    if (month > 12 || month < 1 || Number.isNaN(month) || Number.isNaN(year)) {
      date_input.placeholder = "Invalid input!"
      date_input.value = ""
    } else {
      current_month = month - 1
      current_year = year
      genCal(current_month, current_year)
    }
  }
})

next_button.addEventListener("click", () => {
  next_month()
})

last_button.addEventListener("click", () => {
  last_month()
})
//=============================================================================
//second screen
//=============================================================================
function subject_choose() {
  subject_screen.innerHTML = ""
  switch_screen(subject_screen)

  function secs_to_time(sec) {
    let hours = (Math.floor(sec / 3600) < 10) ? "0" + (Math.floor(sec / 3600)) : Math.floor(sec / 3600)
    let minutes = (Math.floor(sec / 60) - 60 * hours < 10) ? "0" + (Math.floor(sec / 60) - 60 * hours) : Math.floor(sec / 60) - 60 * hours
    let seconds = (sec - 3600 * hours - 60 * minutes < 10) ? "0" + (sec - 3600 * hours - 60 * minutes) : sec - 3600 * hours - 60 * minutes
    return hours + ":" + minutes + ":" + seconds
  }

  for (const subject of stuff.subjects) {
    let time = stuff.time_spent[today_date][subject]
    let subject_tab = document.createElement("li")

    subject_tab.innerHTML = `
    <button type = "button" id = "select_subject" class = "select">\u25BA</button>
    <div class = "subj_name">${subject}</div>
    <div class = "subj_time">${secs_to_time(time)}</div>
    <button type = "button" class = "kebab_button">&#x22EE;</button>
    `

    subject_screen.appendChild(subject_tab)

    const subject_select_button = subject_tab.querySelector('.select')
    const time_show = subject_tab.querySelector('.subj_time')
    let clock_time = 0
    let record_time_timer = 0
    function clock() {
      clock_time = Date.now()
      record_time_timer += 1
      return clock_time
    }

    subject_select_button.addEventListener('click', () => {
      subject_select_button.innerHTML = '&#x23F8;'
      clock()
      start_time = clock_time
      let running = false
      running = running ? false : true

      while (running) {
        elapsed_time = Math.floor((clock() - start_time) / 1000)
        if (record_time_timer >= 1000) {
          add_jason("time", subject, elapsed_time)
        }
        time_show.innertext = secs_to_time(elapsed_time)
      }

      if (!running) {
        subject_select_button.textContent = "\u25BA"
        elapsed_time = Math.floor((clock() - start_time) / 1000)
        add_jason("time", subject, elapsed_time)
      }
    })

    const kebab_button = subject_tab.querySelector(".kebab_button")

    kebab_button.addEventListener("click", (event) => {
      event.stopPropagation()
      const current_kebab = document.querySelector(".kebab_menu")
      if (current_kebab) {
        current_kebab.remove()
      }

      const rect = event.currentTarget.getBoundingClientRect()
      const top = rect.top + window.scrollY
      const left = rect.left + window.scrollX

      let kebab = document.createElement("div")
      kebab.classList.add("kebab_menu")
      kebab.innerHTML = `
      <button id = "delete" class = "delete_button">delete</button>
      <button id = "edit" class = "delete_button">edit</button>
      `
      kebab.style.top = `${top}px`
      kebab.style.left = `${left}px`
      document.body.appendChild(kebab)

      const delete_button = kebab.querySelector("#delete")
      const edit_button = kebab.querySelector("#edit")

      delete_button.addEventListener("click", () => {
        stuff.subjects = stuff.subjects.filter(subj => subj !== subject)
        delete stuff.time_spent[today_date][subject]
        localStorage.setItem("data", JSON.stringify(stuff))
        subject_choose()
      })

      edit_button.addEventListener("click", () => {
        kebab.remove()

        let input = document.createElement("input")
        input.type = "text"

        const name_div = subject_tab.querySelector(".subj_name")
        input.value = name_div.textContent
        name_div.innerHTML = ""
        name_div.appendChild(input)
        input.addEventListener("keyup", (event) => {
          if (event.key === "Enter") {
            if (!stuff.subjects.includes(input.value)) {
              const index = stuff.subjects.indexOf(subject)
              const new_name = input.value
              stuff.subjects[index] = new_name
              stuff.time_spent[today_date][new_name] = stuff.time_spent[today_date][subject]
              delete stuff.time_spent[today_date][subject]

              localStorage.setItem("data", JSON.stringify(stuff))
              subject_choose()
            }
            else {
              input.value = ''
              input.placeholder = 'name already used!'
            }
          }
        })
      })
    })
  }

  if (stuff.subjects.length <= 20) {
    const create_new_subj = document.createElement("li")
    create_new_subj.innerHTML = `
  <button type = "button" class = "select">+</button>
  <div class = "subj_name">create new subject</div>
  `
    subject_screen.appendChild(create_new_subj)
    let create_label = create_new_subj.querySelector(".subj_name")
    triggered = false
    create_new_subj.querySelector('.select').addEventListener("click", () => {
      if (!triggered) {
        if (stuff.subjects.length <= 20) {
          create_label.classList.add("hidden")
          let input = document.createElement("input")
          input.type = "text"
          create_new_subj.appendChild(input)
          triggered = true
          input.addEventListener("keyup", (event) => {
            if (event.key === "Enter") {
              if (!stuff.subjects.includes(input.value)) {
                add_jason("subject", null, `${input.value}`)
                create_label.classList.remove("hidden")
                input.remove()
                subject_choose()
              }
              else {
                input.value = ''
                input.placeholder = 'name already used!'
              }
            }
          })
        }
      }
    })
  }
}

document.body.addEventListener("click", () => {
  const current_kebab = document.querySelector(".kebab_menu")
  if (current_kebab) {
    current_kebab.remove()
  }
})

//=============================================================================
//charting
//=============================================================================
const ctx = canvas_screen.getContext("2d")
function draw_chart(day) {
  if (stuff.time_spent[day] && Math.max(Object.values(stuff.time_spent[day])) !== 0) {
    switch_screen(canvas_screen)
    ctx.clearRect(0, 0, canvas_screen.width, canvas_screen.height)

    let count = 0
    const highest = Math.max(...Object.values(stuff.time_spent[day])) / 3600

    let bar_data = {}
    let num_of_bars = Object.keys(stuff.time_spent[day]).length
    for (let [subject, time] of Object.entries(stuff.time_spent[day])) {
      time /= 3600
      const height_percentage = time / highest
      const bar_height = canvas_screen.height * height_percentage

      bar_data[subject] = {
        subject_name: subject,
        x: count * canvas_screen.width / num_of_bars,
        height: bar_height,
        current_height: 0
      }
      count++
    }

    function animate() {
      ctx.clearRect(0, 0, canvas_screen.width, canvas_screen.height)

      for (let bar of Object.values(bar_data)) {
        bar.current_height += bar.height * 0.025
        if (bar.current_height > bar.height) {
          bar.current_height = bar.height
        }

        ctx.fillStyle = "#00f6fe"
        ctx.fillRect(bar.x, canvas_screen.height - bar.current_height, canvas_screen.width / num_of_bars * 0.75, bar.current_height)
        ctx.fillStyle = "#641604"
        ctx.font = "bold 15px 'Courier New'"
        ctx.fillText(bar.subject_name, bar.x, canvas_screen.height - 10)
      }

      requestAnimationFrame(animate)
    }

    requestAnimationFrame(animate)
  }

  else {
    popup_background.showModal()
  }
}

popup_close_button.addEventListener('click', () => {
  popup_background.close()
})

//=============================================================================
//screen switching
//=============================================================================
const switch_button = document.getElementById("switch_screen")
switch_button.addEventListener("click", () => {
  if (current_screen === calendar_screen) {
    subject_choose()
  } else if (current_screen === subject_screen) {
    genCal(current_month, current_year)
  }
  else if (current_screen === canvas_screen) {
    genCal(current_month, current_year)
  }
})

genCal(current_month, current_year)

//make the create_kebab function
//add color changing <----
//amake the change_name/make_name function