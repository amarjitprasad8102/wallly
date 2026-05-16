/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'

export interface TemplateEntry {
  component: React.ComponentType<any>
  subject: string | ((data: Record<string, any>) => string)
  to?: string
  displayName?: string
  previewData?: Record<string, any>
}

import { template as welcome } from './welcome.tsx'
import { template as connectionRequest } from './connection-request.tsx'
import { template as connectionAccepted } from './connection-accepted.tsx'
import { template as premiumUpgrade } from './premium-upgrade.tsx'
import { template as communityJoin } from './community-join.tsx'
import { template as customMessage } from './custom-message.tsx'

export const TEMPLATES: Record<string, TemplateEntry> = {
  welcome,
  'connection-request': connectionRequest,
  'connection-accepted': connectionAccepted,
  'premium-upgrade': premiumUpgrade,
  'community-join': communityJoin,
  'custom-message': customMessage,
}
