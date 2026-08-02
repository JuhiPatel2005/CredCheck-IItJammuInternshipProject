const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID

export async function verifyGoogleToken(idToken) {
  if (!idToken) {
    throw new Error('Missing Google ID token')
  }

  if (!GOOGLE_CLIENT_ID) {
    throw new Error('Google client ID is not configured')
  }

  try {
    const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`)

    if (!response.ok) {
      throw new Error('Invalid Google ID token')
    }

    const payload = await response.json()

    if (payload.aud !== GOOGLE_CLIENT_ID) {
      throw new Error('Google ID token audience mismatch')
    }

    if (payload.email_verified !== 'true' && payload.email_verified !== true) {
      throw new Error('Google email is not verified')
    }

    return payload
  } catch (error) {
    throw new Error(error.message || 'Google token verification failed')
  }
}
