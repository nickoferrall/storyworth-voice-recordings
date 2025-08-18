export const formatUnitOfMeasurement = (unit: string) => {
  const formattedUnits: { [key: string]: string } = {
    CALORIES: 'Cal',
    FEET: 'Ft',
    KILOGRAMS: 'Kg',
    KILOMETERS: 'Km',
    METERS: 'M',
    MILES: 'Mi',
    MINUTES: 'Mins',
    POUNDS: 'Lbs',
    REPS: 'Reps',
    ROUND: 'Rounds',
    SECONDS: 'Sec',
  }

  return formattedUnits[unit] || unit
}
