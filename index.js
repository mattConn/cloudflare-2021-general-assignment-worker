addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})
/**
 * Respond with hello worker text
 * @param {Request} request
 */
async function handleRequest(request) {
  const path = request.url.split('/')
  let response
  const origin = 'http://localhost:3000'

  if (path[path.length - 1] === 'posts') {
    switch (request.method) {
      case 'GET':
        const list = await KV.list()
        const keys = list.keys.map(key => key.name)

        const posts = await Promise.all(keys.map(async key => {
          const post = JSON.parse(await KV.get(key))
          post.username = key
          return post
        }))

        response = new Response(JSON.stringify(posts), {
          headers: {
            'content-type': 'application/json',
            'Access-Control-Allow-Origin': origin,
          },
        })

        return response

      case 'POST':
        let error = false

        if (!request.headers.get('content-type').includes('application/json')) {
          error = true
          response = new Response('Post content needs to be JSON', {
            status: 400,
            headers: { 'content-type': 'text/plain' },
          })
        }

        if (!error) {
          let data = await request.json()
          const wantedKeys = ['content', 'title', 'username']
          const missing = []
          for (let key of wantedKeys) {
            if (!data.hasOwnProperty(key)) {
              missing.push(key)
            }
          }

          if (missing.length) {
            error = true
            response = new Response(`Missing ${missing.join(', ')} from post`, {
              status: 400,
              headers: { 'content-type': 'text/plain' },
            })
          } else {
            const newEntry = {
              content: data.content
            }

            let postsByTitle = JSON.parse(await KV.get(data.username.toLowerCase()))
            if(!postsByTitle){
              const newPost = {}
              newPost[data.title.toLowerCase()] = newEntry
              await KV.put(data.username.toLowerCase(), JSON.stringify(newPost))
            } else {
              postsByTitle[data.title.toLowerCase()] = newEntry
              await KV.put(data.username.toLowerCase(), JSON.stringify(postsByTitle))
            }

            response = new Response('success', {
              headers: { 'content-type': 'text/plain' },
            })
          }
        }

        return response

      default:
        return new Response(`Method ${request.method} unsupported`, {
          status: 400,
        })

    } // end switch
  } else {
    return new Response('404 not found', {
      status: 404,
    })
  }
}
