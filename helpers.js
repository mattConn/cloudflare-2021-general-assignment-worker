const makeHeaders = (type) => {
    return {
        'content-type': type,
        'Access-Control-Allow-Origin': FRONTEND,
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    }
}

const handleOptions = () => {
    return new Response(null, {
        headers: {
            'Access-Control-Allow-Origin': FRONTEND,
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        }
    })
}

const checkContentType = (request, type) => {
    if (!request.headers.get('content-type').includes(type)) {
        return new Response(`Content type needs to be ${type}`, {
            status: 400,
            headers: makeHeaders('text/plain')
        })
    }
    return null
}

const checkRequestKeys = (data, ...neededKeys) => {
    let response = null
    const missing = []
    for (let key of neededKeys) {
        if (!data.hasOwnProperty(key)) {
            missing.push(key)
        }
    }

    if (missing.length) {
        response = new Response(`Missing ${missing.join(', ')}`, {
            status: 400,
            headers: makeHeaders('text/plain')
        })
    }

    return response
}

export { handleOptions, makeHeaders, checkContentType, checkRequestKeys }