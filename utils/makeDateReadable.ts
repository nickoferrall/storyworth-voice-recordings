import dayjs from 'dayjs'

export const formatHumanReadableDate = (dateString: Date) => {
  const date = dayjs(dateString)
  return date.format('MMMM D, YYYY')
}

export const formatHumanReadableDateNoYear = (dateString: Date) => {
  const date = dayjs(dateString)

  const day = date.date()
  const month = date.format('MMM') // Shortened month name like "Sep"

  // Function to get the correct ordinal suffix
  const getOrdinal = (n: number) => {
    const s = ['th', 'st', 'nd', 'rd'],
      v = n % 100
    return n + (s[(v - 20) % 10] || s[v] || s[0])
  }

  return `${month} ${getOrdinal(day)}`
}
