addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

const origin = 'http://localhost:3000'

const makeHeaders = (content) => {
  const headers = {
    'content-type': '',
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  }
  switch (content) {
    case 'text':
      headers['content-type'] = 'text/plain'
      return headers

    case 'json':
      headers['content-type'] = 'application/json'
      return headers
  }
}

async function handleRequest(request) {
  // KV Schema:
  // ==========
  // {
  //   author:
  //   {
  //     title: {
  //       content: ""
  //     },
  //   },
  // }

  const path = request.url.split('/')
  let response

  if (path[path.length - 1] === 'posts') {
    switch (request.method) {
      case 'OPTIONS':
        return new Response(null, {
          headers: {
            'Access-Control-Allow-Origin': origin,
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
          }
        })

      case 'GET':
        const list = await KV.list()
        const usernames = list.keys.map(key => key.name)

        const posts = await Promise.all(usernames.map(async username => {
          const userPosts = JSON.parse(await KV.get(username))
          console.log('userPosts', userPosts)
          const formattedPosts = []
          Object.keys(userPosts).forEach(title => {
            formattedPosts.push({
              title: title,
              content: userPosts[title].content,
              username: username
            })
          })

          return formattedPosts
        }))

        response = new Response(JSON.stringify(posts.flat()), {
          headers: makeHeaders('json')
        })

        return response

      case 'POST':
        let error = false

        if (!request.headers.get('content-type').includes('application/json')) {
          error = true
          response = new Response('Post content needs to be JSON', {
            status: 400,
            headers: makeHeaders('text')
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
              headers: makeHeaders('text')
            })
          } else {
            const newEntry = {
              content: data.content
            }

            let postsByTitle = JSON.parse(await KV.get(data.username.toLowerCase()))
            if (!postsByTitle) {
              const newPost = {}
              newPost[data.title.toLowerCase()] = newEntry
              await KV.put(data.username.toLowerCase(), JSON.stringify(newPost))
            } else {
              postsByTitle[data.title.toLowerCase()] = newEntry
              await KV.put(data.username.toLowerCase(), JSON.stringify(postsByTitle))
            }

            response = new Response('success', {
              headers: makeHeaders('text')
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
