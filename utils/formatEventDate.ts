import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'

dayjs.extend(utc)

export const formatEventDate = (dateString: string, includeYear = false) => {
  if (!dateString) return ''
  const date = dayjs(dateString).utc()
  return includeYear ? date.format('MMM D, YYYY') : date.format('MMM D')
}
