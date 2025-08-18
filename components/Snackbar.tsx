import React from 'react'
import { CheckCircle } from 'lucide-react'

type Props = {
  openSnackbar: boolean
  setOpenSnackbar: (open: boolean) => void
  message: string
  autoHideDuration?: number
}

const SnackbarComponent = ({
  openSnackbar,
  setOpenSnackbar,
  message,
  autoHideDuration = 3000,
}: Props) => {
  React.useEffect(() => {
    if (openSnackbar) {
      const timer = setTimeout(() => {
        setOpenSnackbar(false)
      }, autoHideDuration)
      return () => clearTimeout(timer)
    }
  }, [openSnackbar, autoHideDuration, setOpenSnackbar])

  if (!openSnackbar) return null

  return (
    <div className="fixed inset-x-0 bottom-5 flex justify-center">
      <div className="bg-white text-gray-900 px-6 py-3 rounded shadow-lg flex items-center border border-gray-200">
        <CheckCircle className="mr-2 text-green-600" size={20} />
        {message}
      </div>
    </div>
  )
}

export default SnackbarComponent
