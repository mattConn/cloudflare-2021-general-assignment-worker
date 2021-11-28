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
        return new Response('GET response\n', {
          headers: { 'content-type': 'text/plain' },
        })

      case 'POST':
        return new Response(`POST response\n${JSON.stringify(await request.json())}\n`, {
          headers: { 'content-type': 'text/plain' },
        })

    }
  } else {
    return new Response('404 not found', {
      status: 404,
    })
  }
}
