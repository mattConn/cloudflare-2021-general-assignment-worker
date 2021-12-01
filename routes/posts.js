import { makeHeaders, checkContentType } from "../config"

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

    let response
    const data = await request.json()
    const neededKeys = ['content', 'title', 'username']
    const missing = []
    for (let key of neededKeys) {
        if (!data.hasOwnProperty(key)) {
            missing.push(key)
        }
    }

    if (missing.length) {
        error = true
        response = new Response(`Missing ${missing.join(', ')} from post`, {
            status: 400,
            headers: makeHeaders('text/plain')
        })
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

        response = new Response('success', {
            headers: makeHeaders('text/plain')
        })
    }

    return response
}

export { handleGet, handlePost }