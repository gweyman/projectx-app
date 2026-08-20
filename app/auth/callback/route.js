import { createClient } from '@/lib/supabase/client'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = createClient()
    await supabase.auth.exchangeCodeForSession(code)
  }

  // Redirect to intake form after confirming
  return NextResponse.redirect(`${origin}/onboarding`)
}