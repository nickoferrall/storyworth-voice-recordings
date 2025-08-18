import React, { useState } from 'react'
import { Context } from '../graphql/context'
import { useSubmitFeedbackMutation } from '../src/generated/graphql'
import withAuth from '../utils/withAuth'

export const getServerSideProps = withAuth(async function (context: Context) {
 return {
  props: { user: context.user },
 }
})

const Feedback = () => {
 const [feedback, setFeedback] = useState('')
 const [submitFeedback, { called }] = useSubmitFeedbackMutation()

 const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
  event.preventDefault()
  submitFeedback({
   variables: {
    text: feedback,
   },
  })
 }

 if (called) {
  return (
   <div className="flex flex-col justify-center items-center pt-16 h-full">
    <h2 className="text-xl text-center font-semibold mb-4">
     Thank You for Your Feedback!
    </h2>
    <p className="text-center">
     We really appreciate you taking the time to help us improve 🙏
    </p>
   </div>
  )
 }

 return (
  <div className="flex flex-col justify-start items-center xs:pt-5 md:pt-16 h-full">
   <form
    className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 sm:w-3/4 md:w-2/3 lg:w-3/5 xl:w-2/5"
    onSubmit={handleSubmit}
   >
    <h2 className="text-xl text-center font-semibold mb-4">
     Your Feedback
    </h2>
    <div className="mb-4">
     <label className="block text-sm py-3">
      We'd love to know how we can improve! Please share any ideas, bugs, thoughts
      and feelings 🙏
     </label>
     <textarea
      className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:border-purple-500 focus:ring-purple-500"
      autoFocus
      rows={14}
      placeholder="Share your thoughts with us..."
      value={feedback}
      onChange={(e) => setFeedback(e.target.value)}
      required
     />
    </div>
    <div className="flex items-center justify-center w-full">
     <button
      className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
      type="submit"
     >
      Submit Feedback
     </button>
    </div>
   </form>
  </div>
 )
}

export default Feedback
