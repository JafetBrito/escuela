// Local-only Google Sign-In using Google Identity Services (GIS).
// No backend: we just decode the identity token in the browser to get the
// user's name/email/photo and store it in localStorage like everything else.

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID

export function isGoogleAuthConfigured() {
  return Boolean(GOOGLE_CLIENT_ID)
}

function loadGoogleScript() {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) {
      resolve()
      return
    }

    const existing = document.getElementById('google-identity-script')
    if (existing) {
      existing.addEventListener('load', () => resolve())
      existing.addEventListener('error', () => reject(new Error('No se pudo cargar Google Identity Services')))
      return
    }

    const script = document.createElement('script')
    script.id = 'google-identity-script'
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('No se pudo cargar Google Identity Services'))
    document.head.appendChild(script)
  })
}

function decodeIdToken(token) {
  const payload = token.split('.')[1]
  const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
  const json = decodeURIComponent(
    atob(base64)
      .split('')
      .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
      .join(''),
  )
  return JSON.parse(json)
}

// Renders the official Google button inside `container` (a DOM element ref).
// Calls `onSuccess({ sub, name, email, picture })` when the user signs in.
export async function renderGoogleButton(container, onSuccess, onError) {
  if (!isGoogleAuthConfigured()) {
    onError?.(
      new Error(
        'Falta configurar VITE_GOOGLE_CLIENT_ID en el archivo .env para activar el registro con Google.',
      ),
    )
    return
  }

  try {
    await loadGoogleScript()

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (response) => {
        try {
          const payload = decodeIdToken(response.credential)
          onSuccess({
            sub: payload.sub,
            name: payload.name,
            email: payload.email,
            picture: payload.picture,
          })
        } catch (err) {
          onError?.(err)
        }
      },
    })

    window.google.accounts.id.renderButton(container, {
      theme: 'outline',
      size: 'large',
      width: 320,
      text: 'continue_with',
      shape: 'pill',
    })
  } catch (err) {
    onError?.(err)
  }
}
