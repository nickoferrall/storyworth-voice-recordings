import { Selectable } from 'kysely'
import { Heat, ScoreSetting } from '../src/generated/database'
import { Context } from '../graphql/context'

export const isHeatFull = async (
  heat: Selectable<Heat>,
  scoreSetting: Selectable<ScoreSetting>,
  teamSize: number,
  ctx: Context,
): Promise<boolean> => {
  if (scoreSetting.heatLimitType === 'ENTRIES') {
    const lanes = await ctx.loaders.laneByHeatIdLoader.load(heat.id)
    return lanes.length >= heat.maxLimitPerHeat
  } else {
    const entries = await ctx.loaders.entriesByHeatIdLoader.load(heat.id)
    const totalAthletes = entries.reduce((sum, entry) => sum + entry.teamSize, 0)
    return totalAthletes + teamSize > heat.maxLimitPerHeat
  }
}
