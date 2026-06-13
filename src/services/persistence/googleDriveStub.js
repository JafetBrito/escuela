// Stub for future Google Drive sync (appDataFolder scope).
// Production flow: OAuth via Google Identity Services -> store access token
// in memory only -> upload/download progress.json to the app's hidden
// appDataFolder so it doesn't clutter the user's visible Drive.

export async function connectGoogleDrive() {
  throw new Error('Google Drive sync is not implemented yet')
}

export async function syncProgressToDrive(_progress) {
  throw new Error('Google Drive sync is not implemented yet')
}

export async function loadProgressFromDrive() {
  throw new Error('Google Drive sync is not implemented yet')
}
