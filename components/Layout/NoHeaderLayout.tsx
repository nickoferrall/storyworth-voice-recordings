import React from 'react'

const NoHeaderLayout = ({ children }: { children: any }) => {
  return (
    <div className="layout">
      <main>{children}</main>
    </div>
  )
}

export default NoHeaderLayout
