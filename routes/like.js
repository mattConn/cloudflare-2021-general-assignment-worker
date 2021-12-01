import { checkContentType, makeHeaders } from "../config"

const handlePost = async (request) => {
    const errorResponse = checkContentType(request, 'application/json')

    if (errorResponse) {
        return errorResponse
    }

    let response
    const data = await request.json()


    const posts = JSON.parse(await KV.get(data.username))
    posts[data.title].likes++
    await KV.put(data.username, JSON.stringify(posts))

    response = new Response(`${posts[data.title].likes}`, {
        headers: makeHeaders('text/plain')
    })

    return response
}

export { handlePost }