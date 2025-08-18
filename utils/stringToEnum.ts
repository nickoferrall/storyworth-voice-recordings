// input: {NAME,BOX}
// output: [NAME, BOX]

export const stringArrayToEnumArray = <T extends Record<string, string>>(
  str: string | null,
  enumType: T,
): T[keyof T][] => {
  if (!str) {
    return []
  }
  // Extract field names from the string enclosed within curly braces
  const fieldNames = str.match(/\{(.*?)\}/)?.[1]
  if (!fieldNames) {
    return []
  }
  // Split the field names into an array
  const fieldsArray = fieldNames.split(',').map((field) => field.trim())
  const enumArray = fieldsArray.map((field) => {
    const enumValue = Object.values(enumType).find((value) => value === field)
    return enumValue
  })
  // Filter out any undefined values
  return enumArray.filter((enumValue) => enumValue !== undefined) as T[keyof T][]
}

export const stringToEnum = <T extends Record<string, string>>(
  str: string,
  enumType: T,
) => {
  if (!str) {
    return undefined
  }
  const trimmedStr = str.trim()
  const enumValue = Object.values(enumType).find(
    (value) => value.toLowerCase() === trimmedStr.toLowerCase(),
  )
  return enumValue
}
