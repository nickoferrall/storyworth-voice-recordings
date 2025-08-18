import React from 'react'

const WaiverPage = () => {
 return (
  <div className="container mx-auto px-4 py-8">
   <h1 className="text-3xl font-semibold mb-4">Event Waiver</h1>
   <p className="mb-4">
    Please read the following waiver carefully before agreeing to participate in the
    event.
   </p>
   <h2 className="text-2xl font-semibold mb-2">Waiver of Liability</h2>
   <p className="mb-4">
    In consideration of being allowed to participate in the event, you agree to the
    following terms:
   </p>
   <ul className="list-disc list-inside mb-4">
    <li>
     You acknowledge and fully understand that you will be engaging in physical
     activities that involve the risk of injury.
    </li>
    <li>
     You assume full responsibility for any injuries or damages that may occur as a
     result of participating in the event.
    </li>
    <li>
     You hereby release, waive, discharge, and covenant not to sue the event
     organizers, sponsors, and volunteers from any liability to you.
    </li>
    <li>
     You agree to follow all safety instructions and guidelines provided by the event
     organizers.
    </li>
   </ul>
   <h2 className="text-2xl font-semibold mb-2">Medical Consent</h2>
   <p className="mb-4">
    You hereby consent to receive medical treatment deemed necessary if you are
    injured or require medical attention during the event.
   </p>
   <h2 className="text-2xl font-semibold mb-2">Media Release</h2>
   <p className="mb-4">
    You grant permission to the event organizers to use any photographs, videos, or
    other media taken during the event for promotional purposes.
   </p>
   <h2 className="text-2xl font-semibold mb-2">Acceptance of Terms</h2>
   <p className="mb-4">
    By participating in the event, you acknowledge that you have read and understood
    this waiver, and you agree to be bound by its terms.
   </p>
   <p>
    If you have any questions or concerns about this waiver, please contact the event
    organiser directly.
   </p>
  </div>
 )
}

export default WaiverPage
