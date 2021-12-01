import { checkContentType, makeHeaders, checkRequestKeys } from "../helpers"

const handlePost = async (request) => {
    const errorResponse = checkContentType(request, 'application/json')

    if (errorResponse) {
        return errorResponse
    }

    const data = await request.json()
    const missingKeysResponse = checkRequestKeys(data, 'title', 'username')

    if (missingKeysResponse) {
        return missingKeysResponse
    } else {
        const posts = JSON.parse(await KV.get(data.username))
        posts[data.title].likes++
        await KV.put(data.username, JSON.stringify(posts))

        return new Response(`${posts[data.title].likes}`, {
            headers: makeHeaders('text/plain')
        })
    }
}

export { handlePost }