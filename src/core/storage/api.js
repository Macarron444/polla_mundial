const BASE_URL = '/api'

async function request(method, endpoint, body) {
    const options = {
        method,
        headers: { 'Content-Type': 'application/json' },
    }
    if (body !== undefined) {
        options.body = JSON.stringify(body)
    }
    const res = await fetch(`${BASE_URL}${endpoint}`, options)
    if (!res.ok) throw new Error(`API Error ${res.status}: ${await res.text()}`)
    const text = await res.text()
    return text ? JSON.parse(text) : null
}

export function get(endpoint) {
    return request('GET', endpoint)
}

export function put(endpoint, body) {
    return request('PUT', endpoint, body)
}

export function post(endpoint, body) {
    return request('POST', endpoint, body)
}