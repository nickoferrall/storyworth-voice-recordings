import React from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import { useRetellCallsQuery } from '../src/generated/graphql'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../src/components/ui/table'

dayjs.extend(relativeTime)

function renderTranscriptPreview(t?: string | null) {
  if (!t) return '-'
  const normalized = t
    .replaceAll('\nAgent:', '\nStoryworth:')
    .replace(/^Agent:/, 'Storyworth:')
  const lines = normalized.split('\n')
  const userLines = lines
    .map((line) => {
      const m = /^(Storyworth|User):\s?(.*)$/.exec(line)
      if (!m) return null
      if (m[1] !== 'User') return null
      return m[2]
    })
    .filter(Boolean) as string[]
  if (userLines.length === 0) return '-'
  const preview = userLines.slice(0, 3)
  return (
    <div>
      {preview.map((content, idx) => (
        <div key={idx}>
          <strong>You:</strong> {content}
        </div>
      ))}
    </div>
  )
}

export default function CallsPage() {
  const { data, loading, error } = useRetellCallsQuery({
    fetchPolicy: 'network-only',
  })
  const calls = data?.retellCalls || []

  return (
    <div className="bg-white min-h-screen">
      <Head>
        <title>Calls</title>
      </Head>
      <div className="mx-auto w-full md:w-[741px] md:relative md:-mt-5 px-6 pt-10 pb-10">
        <div className="flex flex-col items-center">
          <Image
            src="/assets/storyworth-img.png"
            alt=""
            width={167}
            height={117}
            className="mb-8"
            aria-hidden
            priority
          />
        </div>
        <h1 className="font-gtDisplay text-brand text-[36px] leading-[44px] font-normal mb-6">
          Your Calls
        </h1>
        {loading && <p className="text-slate-500">Loading…</p>}
        {error && (
          <p className="text-red-600">{String((error as any)?.message || error)}</p>
        )}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>When</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead className="font-semibold">Transcript</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {calls.map((c) => (
              <TableRow
                key={c?.id as any}
                className="cursor-pointer hover:bg-slate-50"
                onClick={() =>
                  (window.location.href = `/call/${encodeURIComponent(String(c?.id))}`)
                }
              >
                <TableCell>
                  {c?.createdAt ? dayjs(c.createdAt as any).fromNow() : '-'}
                </TableCell>
                <TableCell>
                  {c?.createdAt && c?.updatedAt
                    ? `${Math.max(0, Math.round((new Date(c.updatedAt as any).getTime() - new Date(c.createdAt as any).getTime()) / 1000))}s`
                    : '-'}
                </TableCell>
                <TableCell>{c?.phoneE164 || '-'}</TableCell>
                <TableCell className="max-w-[500px]">
                  <div className="line-clamp-3">
                    {renderTranscriptPreview(c?.transcript || '')}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
