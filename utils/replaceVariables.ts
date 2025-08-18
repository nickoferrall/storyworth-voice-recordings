export const allowedVariables = ['companyName', 'firstName', 'fullName']

export const replaceVariables = (
  template: string,
  variables: { companyName?: string; firstName?: string; fullName?: string },
): string => {
  if (!template) return template
  let result = template

  allowedVariables.forEach((key) => {
    if (key in variables) {
      const value = variables[key as keyof typeof variables] || ''
      const regex = new RegExp(`{{${key}}}`, 'g')
      result = result.replace(regex, value)
    }
  })

  return result
}
