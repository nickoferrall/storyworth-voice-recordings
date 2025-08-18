export interface StandardizedTicketType {
  difficulty: 'SCALED' | 'RX' | 'ELITE' | 'INTERMEDIATE' | 'BEGINNER'
  ageGroup: 'OPEN' | 'TEEN' | 'MASTERS' | 'YOUTH'
  gender: 'MALE' | 'FEMALE' | 'MIXED'
  teamSize: number
}

export function standardizeTicketType(
  name: string,
  formatText?: string,
  existingTeamSize?: number,
): StandardizedTicketType {
  const normalized = name.toLowerCase()

  return {
    difficulty: getDifficulty(normalized),
    ageGroup: getAgeGroup(normalized),
    gender: getGender(normalized),
    teamSize: existingTeamSize || getTeamSize(normalized, formatText),
  }
}

function getDifficulty(name: string): StandardizedTicketType['difficulty'] {
  if (name.includes('scaled') || name.includes('beginner') || name.includes('novice')) {
    return 'SCALED'
  }
  if (name.includes('elite') || name.includes('pro')) {
    return 'ELITE'
  }
  if (name.includes('intermediate') || name.includes('int')) {
    return 'INTERMEDIATE'
  }
  if (name.includes('rx') || name.includes('prescribed')) {
    return 'RX'
  }

  // Default based on age groups (teens/masters often are RX level)
  if (name.includes('teen') || name.includes('masters')) {
    return 'RX'
  }

  return 'RX' // Default to RX
}

function getAgeGroup(name: string): StandardizedTicketType['ageGroup'] {
  if (name.includes('teen') || name.includes('14-15') || name.includes('16-17')) {
    return 'TEEN'
  }
  if (
    name.includes('masters') ||
    name.includes('35-42') ||
    name.includes('43-49') ||
    name.includes('50+') ||
    name.includes('35+')
  ) {
    return 'MASTERS'
  }
  if (
    name.includes('youth') ||
    name.includes('kids') ||
    name.includes('12-14') ||
    name.includes('under 14')
  ) {
    return 'YOUTH'
  }

  return 'OPEN' // Default to open
}

function getGender(name: string): StandardizedTicketType['gender'] {
  if (name.includes('male') && !name.includes('female')) {
    return 'MALE'
  }
  if (name.includes('female') || name.includes('women')) {
    return 'FEMALE'
  }
  if (name.includes('men') && !name.includes('women')) {
    return 'MALE'
  }

  return 'MIXED' // Default to mixed
}

function getTeamSize(name: string, formatText?: string): number {
  const combined = `${name} ${formatText || ''}`.toLowerCase()

  // Check format text first (more reliable)
  if (formatText) {
    if (formatText.includes('team of 2') || formatText.toLowerCase().includes('pairs')) {
      return 2
    }
    if (formatText.includes('team of 3')) {
      return 3
    }
    if (formatText.includes('team of 4')) {
      return 4
    }
    if (formatText.includes('team of 5')) {
      return 5
    }
    if (formatText.includes('team of 6')) {
      return 6
    }
  }

  // Check name
  if (
    combined.includes('pairs') ||
    combined.includes('duo') ||
    combined.includes('team of 2')
  ) {
    return 2
  }
  if (combined.includes('team of 3') || combined.includes('trio')) {
    return 3
  }
  if (combined.includes('team of 4') || combined.includes('squad')) {
    return 4
  }
  if (combined.includes('team of 5')) {
    return 5
  }
  if (combined.includes('team of 6')) {
    return 6
  }
  if (combined.includes('team') && !combined.includes('individual')) {
    return 2 // Default team size
  }

  return 1 // Default to individual
}
