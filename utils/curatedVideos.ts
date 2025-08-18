export interface CuratedVideo {
  title: string
  url: string
}

export const CURATED_MOVEMENT_VIDEOS: CuratedVideo[] = [
  // Air Squats
  {
    title: 'Air Squat',
    url: 'https://www.youtube.com/watch?v=C_VtOYc6j5c',
  },

  // Front Squat
  {
    title: 'Front Squat',
    url: 'https://www.youtube.com/watch?v=uYumuL_G_V0',
  },

  // Overhead Squat
  {
    title: 'Overhead Squat',
    url: 'https://www.youtube.com/watch?v=pn8mqlG0nkE',
  },

  // Deadlift
  {
    title: 'Deadlift',
    url: 'https://www.youtube.com/watch?v=1ZXobu7JvvE',
  },

  // Sumo Deadlift High Pull
  {
    title: 'Sumo Deadlift High Pull',
    url: 'https://www.youtube.com/watch?v=gh55vVlwlQg',
  },

  // Push-ups
  {
    title: 'Push-Up',
    url: 'https://www.youtube.com/watch?v=0pkjOk0EiAk',
  },

  // Handstand Push-up
  {
    title: 'Handstand Push-Up',
    url: 'https://www.youtube.com/watch?v=qbRbM6d5ddM',
  },

  // Pull-ups
  {
    title: 'Pull-Up',
    url: 'https://www.youtube.com/watch?v=aAggnpPyR6E',
  },

  // Chest-to-Bar Pull-up
  {
    title: 'Chest-to-Bar Pull-Up',
    url: 'https://www.youtube.com/watch?v=AyPTCEXTjOo',
  },

  // Bar Muscle-up
  {
    title: 'Bar Muscle-Up',
    url: 'https://www.youtube.com/watch?v=OCg3UXgzftc',
  },

  // Ring Muscle-up
  {
    title: 'Ring Muscle-Up',
    url: 'https://www.youtube.com/watch?v=G8W0BhzrWcs',
  },

  // Box Jumps
  {
    title: 'Box Jump',
    url: 'https://www.youtube.com/watch?v=52r_Ul5k03g',
  },

  // Wall Balls
  {
    title: 'Wall Ball',
    url: 'https://www.youtube.com/watch?v=fpUD0mcFp_0',
  },

  // Snatch
  {
    title: 'Snatch',
    url: 'https://www.youtube.com/watch?v=9xQp2sldyts',
  },

  // Clean
  {
    title: 'Clean',
    url: 'https://www.youtube.com/watch?v=Ty14ogq_Vok',
  },

  // Jerk
  {
    title: 'Jerk',
    url: 'https://www.youtube.com/watch?v=VrHNJXoSyXw',
  },

  // Burpee
  {
    title: 'Burpee',
    url: 'https://www.youtube.com/watch?v=TU8QYVW0gDU',
  },

  // Thruster
  {
    title: 'Thruster',
    url: 'https://www.youtube.com/watch?v=L219ltL15zk',
  },

  // Row
  {
    title: 'Row',
    url: 'https://www.youtube.com/watch?v=fxfhQMbATCw',
  },

  // Bike Erg
  {
    title: 'Bike Erg',
    url: 'https://www.youtube.com/watch?v=GAlomTYHQCw&pp=ygUIYmlrZSBlcmc%3D',
  },

  // Devils Press
  {
    title: 'Devils Press',
    url: 'https://www.youtube.com/watch?v=zlqEtAUds-I',
  },

  // Shuttle Run
  {
    title: 'Shuttle Run',
    url: 'https://www.youtube.com/watch?v=3-iZMS6twcE',
  },

  // Burpee Broad Jump
  {
    title: 'Burpee Broad Jump',
    url: 'https://www.youtube.com/watch?v=hxc7t-dVY3I',
  },

  // Sandbag Lunges
  {
    title: 'Sandbag Lunge',
    url: 'https://www.youtube.com/watch?v=uU831yLwBkY',
  },

  // Suitcase Forward Lunges
  {
    title: 'Suitcase Forward Lunge',
    url: 'https://www.youtube.com/watch?v=LEKGw5pKz1w',
  },

  // Ski Erg
  {
    title: 'Ski Erg',
    url: 'https://www.youtube.com/watch?v=WFWs5wWjWxo',
  },

  // Sled Push
  {
    title: 'Sled Push',
    url: 'https://www.youtube.com/watch?v=pVVBD5Gh-J4',
  },

  // Sled Pull
  {
    title: 'Sled Pull',
    url: 'https://www.youtube.com/watch?v=K2FhsenkS3U',
  },

  // Farmers Carry
  {
    title: 'Farmers Carry',
    url: 'https://www.youtube.com/watch?v=KI_TkxBSFOI',
  },

  // Mountain Climbers
  {
    title: 'Mountain Climber',
    url: 'https://www.youtube.com/watch?v=cnyTQDSE884',
  },

  // Air Squat (F45)
  {
    title: 'Air Squat',
    url: 'https://www.youtube.com/watch?v=C_VtOYc6j5c',
  },

  // Jumping Jacks
  {
    title: 'Jumping Jack',
    url: 'https://www.youtube.com/watch?v=c4DAnQ6DtF8',
  },

  // Lunges
  {
    title: 'Forward Lunge',
    url: 'https://www.youtube.com/watch?v=g8-Ge9S0aUw',
  },

  // Kettlebell Swings
  {
    title: 'Russian Kettlebell Swing',
    url: 'https://www.youtube.com/watch?v=RU88iqRVunk',
  },

  {
    title: 'American Kettlebell Swing',
    url: 'https://www.youtube.com/watch?v=d94xX-AQZ0A',
  },

  // Rope Climb
  {
    title: 'Rope Climb',
    url: 'https://www.youtube.com/watch?v=Pa4QUC9AvuA',
  },
]

export function searchCuratedVideos(query: string): CuratedVideo[] {
  if (!query.trim()) return []

  const searchTerm = query.toLowerCase().trim()

  return CURATED_MOVEMENT_VIDEOS.filter((video) =>
    video.title.toLowerCase().includes(searchTerm),
  )
}
