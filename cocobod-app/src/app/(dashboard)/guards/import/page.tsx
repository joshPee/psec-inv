import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import GuardsImportClient from '../GuardsImportClient'

export default async function GuardsImportPage() {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect('/login')
  }

  return <GuardsImportClient />
}
