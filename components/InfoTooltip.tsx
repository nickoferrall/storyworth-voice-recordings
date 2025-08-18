import React from 'react'
import CustomizedTooltips from './Tooltip'
import { InfoIcon } from 'lucide-react'

type Props = {
 title: string
}

const InfoTooltip = (props: Props) => {
 const { title } = props
 return (
  <CustomizedTooltips title={title}>
   <InfoIcon className="hover:cursor-pointer ml-1 mb-0.5" size={16} />
  </CustomizedTooltips>
 )
}

export default InfoTooltip
