import { makeHeaders, checkContentType, checkRequestKeys } from "../helpers"

const handleGet = async () => {
    const list = await KV.list()
    const usernames = list.keys.map(key => key.name)
    let response

    const posts = await Promise.all(usernames.map(async username => {
        const userPosts = JSON.parse(await KV.get(username))
        const formattedPosts = []
        Object.keys(userPosts).forEach(title => {
            formattedPosts.push({
                title: title,
                content: userPosts[title].content,
                username: username,
                likes: userPosts[title].likes
            })
        })

        return formattedPosts
    }))

    response = new Response(JSON.stringify(posts.flat()), {
        headers: makeHeaders('application/json')
    })

    return response
}

const handlePost = async (request) => {
    const errorResp = checkContentType(request, 'application/json')

    if (errorResp) {
        return errorResp
    }

    const data = await request.json()
    const missingKeysResponse = checkRequestKeys(data, 'content', 'title', 'username')

    if (missingKeysResponse){
        return missingKeysResponse
    } else {
        const newEntry = {
            content: data.content,
            likes: data.hasOwnProperty('likes') ? data.likes : 0,
        }

        const postsByTitle = JSON.parse(await KV.get(data.username.toLowerCase()))
        if (!postsByTitle) {
            const newPost = {}
            newPost[data.title.toLowerCase()] = newEntry
            await KV.put(data.username.toLowerCase(), JSON.stringify(newPost))
        } else {
            postsByTitle[data.title.toLowerCase()] = newEntry
            await KV.put(data.username.toLowerCase(), JSON.stringify(postsByTitle))
        }

        return new Response('success', {
            headers: makeHeaders('text/plain')
        })
    }
}

export { handleGet, handlePost }