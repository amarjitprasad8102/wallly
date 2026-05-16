/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Body, Container, Head, Heading, Html, Preview, Text } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface Props { heading?: string; bodyText?: string }

// Plain-text only template used for one-off admin notifications (ban, delete, custom).
// HTML is NEVER injected from props — bodyText is rendered as a normal Text node.
const Email = ({ heading, bodyText }: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>{heading || 'A message from the Wallly team'}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>{heading || 'A message from Wallly'}</Heading>
        <Text style={text}>{bodyText || ''}</Text>
        <Text style={footer}>Need help? <a href="https://wallly.in/contact" style={link}>Contact support</a></Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: (d: Record<string, any>) => d?.heading || 'A message from Wallly',
  displayName: 'Custom admin message',
  previewData: { heading: 'Important account update', bodyText: 'Hi, this is a note from the Wallly team about your account.' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Arial, sans-serif' }
const container = { padding: '24px 28px', maxWidth: '560px' }
const h1 = { fontSize: '24px', color: '#0f172a', margin: '0 0 16px' }
const text = { fontSize: '15px', color: '#64748b', lineHeight: '1.6', margin: '0 0 16px', whiteSpace: 'pre-wrap' as const }
const footer = { fontSize: '13px', color: '#94a3b8', margin: '32px 0 0' }
const link = { color: '#7c3aed', textDecoration: 'underline' }
