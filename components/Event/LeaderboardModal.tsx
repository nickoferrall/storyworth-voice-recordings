import React from 'react'
import { X } from 'lucide-react'
import { Dialog, DialogContent } from '../../src/components/ui/dialog'
import Leaderboard from '../Leaderboard'

type Props = {
  open: boolean
  onClose: () => void
  competitionId: string
  isAdminView?: boolean
}

const LeaderboardModal = (props: Props) => {
  const { open, onClose, competitionId, isAdminView = false } = props

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-background text-card-foreground fixed !left-0 !top-0 !translate-x-0 !translate-y-0 p-0 !max-w-none h-screen w-screen">
        <div className="bg-background py-6 md:p-6 relative flex flex-col items-center w-full h-full overflow-auto">
          <div className="max-h-full w-full">
            <div className="w-full pt-8">
              <Leaderboard competitionId={competitionId} isAdminView={isAdminView} />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default LeaderboardModal
