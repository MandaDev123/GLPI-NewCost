const BASE_URL = 'http://localhost/glpi/public/api.php/v1'
const APP_TOKEN = 'olNWQBXR6Y1CkhKKXbkoAeWUZj6kHGibm63KYd69'

export async function initSession() {

   const login = 'glpi'
   const password = 'admin'
  const response = await fetch(`${BASE_URL}/initSession`, {
    method: 'GET',
    headers: {
      'App-Token': APP_TOKEN,
      'Authorization': 'Basic ' + btoa(`${login}:${password}`)
    }
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error[0] ?? 'initSession failed')
  }

  const data = await response.json()
  localStorage.setItem('glpi_session', data.session_token)
}


function getHeaders() {
  return {
    'Content-Type': 'application/json',
    'App-Token': APP_TOKEN,
    'Session-Token': localStorage.getItem('glpi_session') ?? ''
  }
}


// FETCH
export async function glpiFetch(endpoint) {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'GET',
    headers: getHeaders()
  })

  

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error[0] ?? 'GLPI API error')
  }

  return response
}

// DELETE
export async function glpiDelete(endpoint) {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'DELETE',
    headers: getHeaders()
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error[1] ? `${error[0]}: ${error[1]}` : (error[0] ?? 'GLPI delete error'))
  }

  return response
}

// POST

export async function glpiPost(endpoint, data) {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ input: data })
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error[0] ?? 'GLPI post error')
  }

  return response.json()
}

// PUT — update an existing item

export async function glpiPut(endpoint, data) {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify({ input: data })
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error[0] ?? 'GLPI put error')
  }

  return response.json()
}


// Upload file 

export async function glpiUploadDocument(filename, blob, mimeType) {
  const formData = new FormData()

  // GLPI requires the manifest as a JSON part named 'uploadManifest'
  formData.append('uploadManifest', JSON.stringify({
    input: {
      name: filename,
      _filename: [filename]
    }
  }))

  // The file part must be named 'filename[]'
  formData.append('filename[]', blob, filename)

  const response = await fetch(`${BASE_URL}/Document`, {
    method: 'POST',
    headers: {
      // NO Content-Type here — browser sets multipart/form-data + boundary
      'App-Token': APP_TOKEN,
      'Session-Token': localStorage.getItem('glpi_session') ?? ''
    },
    body: formData
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error[0] ?? 'Document upload failed')
  }

  return response.json()  // returns { id, message }
}

// Download a document's actual file content (not its metadata)
// GLPI streams the binary when the request asks for 'application/octet-stream'
export async function glpiDownloadDocument(id) {
  const response = await fetch(`${BASE_URL}/Document/${id}`, {
    method: 'GET',
    headers: {
      'App-Token': APP_TOKEN,
      'Session-Token': localStorage.getItem('glpi_session') ?? '',
      'Accept': 'application/octet-stream'
    }
  })

  if (!response.ok) {
    throw new Error('Document download failed')
  }

  return response.blob()
}