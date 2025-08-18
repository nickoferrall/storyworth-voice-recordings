import React from 'react'

type Props = {
 columns: any[]
}

const LoadingTable = (props: Props) => {
 const { columns } = props
 return (
  <table
   className="w-full divide-y divide-gray-200 rounded-lg bg-white"
   style={{ tableLayout: 'fixed' }}
  >
   <thead className="bg-gray-50 rounded-lg">
    <tr>
     {columns.map((column, index) => (
      <th
       key={index}
       className="px-4 py-2 text-left text-sm font-medium tracking-wider border-r border-gray-200"
       style={column.style}
      >
       {column.header}
      </th>
     ))}
    </tr>
   </thead>
   <tbody className="bg-white divide-y divide-gray-200">
    <tr className="bg-gray-100">
     <td
      colSpan={columns.length}
      className="px-4 py-8 bg-white whitespace-nowrap text-center"
     >
      <span className="flex items-center justify-center">
       Loading
       <span className="animate-pulse">...</span>
      </span>
     </td>
    </tr>
   </tbody>
  </table>
 )
}

export default LoadingTable
