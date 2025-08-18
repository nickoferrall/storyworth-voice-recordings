import React from 'react'
import { PartnerDashboard } from '../components/Partner/PartnerDashboard'
import Head from 'next/head'

export default function PartnersPage() {
  return (
    <>
      <Head>
        <title>Partner Dashboard - Fitlo</title>
        <meta
          name="description"
          content="Manage your partner interests and requests for fitness competitions"
        />
      </Head>
      <PartnerDashboard />
    </>
  )
}
