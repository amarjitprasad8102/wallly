/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Body, Button, Container, Head, Heading, Html, Preview, Section, Text } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'Wallly'

interface Props { userName?: string }

const WelcomeEmail = ({ userName }: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Welcome to {SITE_NAME} — where the walls end, you find a friend.</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Welcome{userName ? `, ${userName}` : ''}!</Heading>
        <Text style={text}>
          You're now part of {SITE_NAME} — where the walls end, you find a friend.
          Jump into random video or text chats, share images, and add new friends from around the world.
        </Text>
        <Section style={{ textAlign: 'center', margin: '28px 0' }}>
          <Button href="https://wallly.in/app" style={button}>Start chatting</Button>
        </Section>
        <Text style={footer}>Need help? <a href="https://wallly.in/contact" style={link}>Contact support</a></Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: WelcomeEmail,
  subject: `Welcome to ${SITE_NAME}`,
  displayName: 'Welcome',
  previewData: { userName: 'Alex' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Arial, sans-serif' }
const container = { padding: '24px 28px', maxWidth: '560px' }
const h1 = { fontSize: '24px', color: '#0f172a', margin: '0 0 16px' }
const text = { fontSize: '15px', color: '#64748b', lineHeight: '1.6', margin: '0 0 16px' }
const button = { backgroundColor: '#7c3aed', color: '#ffffff', padding: '12px 22px', borderRadius: '16px', textDecoration: 'none', fontWeight: 600, fontSize: '15px' }
const footer = { fontSize: '13px', color: '#94a3b8', margin: '32px 0 0' }
const link = { color: '#7c3aed', textDecoration: 'underline' }
