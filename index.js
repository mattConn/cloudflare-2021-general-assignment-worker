addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})
/**
 * Respond with hello worker text
 * @param {Request} request
 */
async function handleRequest(request) {
  const path = request.url.split('/')

  if(path[path.length-1] === 'posts'){
    switch(request.method){
      case 'GET':
        const list = await KV.list()
        const keys = list.keys.map(key => key.name)

        const posts = await Promise.all(keys.map(async key => {
          const post = JSON.parse(await KV.get(key))
          post.username = key
          return post
        }))

        return new Response(JSON.stringify(posts), {
          headers: { 'content-type': 'application/json' },
        })

      case 'POST':
        // TODO: handle error for missing key, handle error for non-json post
        const data = await request.json()
        const wantedKeys = ['content', 'title', 'username']

        let response = new Response('success', {
          headers: { 'content-type': 'text/plain' },
        })

        wantedKeys.forEach(key => {
          console.log(key)
          if(!data.hasOwnProperty(key)){
            response = new Response(`Missing "${key}" from post`, {
              headers: { 'content-type': 'text/plain' },
            })
          }
        })

        const newEntry = {
          title: data.title,
          content: data.content
        }

        await KV.put(data.username.toLowerCase(), JSON.stringify(newEntry))

        return response

    }
  } else {
    return new Response('404 not found', {
      status: 404,
    })
  }
}
