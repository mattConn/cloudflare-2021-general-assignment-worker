import { handleOptions } from './config'
import {handleGet as posts_handleGet, handlePost as posts_handlePost } from './routes/posts'
import {handlePost as like_handlePost} from './routes/like'

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

// KV Schema:
// ==========
// {
//   author:
//   {
//     title: {
//       content: "",
//        likes: 0,
//     },
//   },
// }

async function handleRequest(request) {
  const path = request.url.split('/')
  const route = path[path.length - 1]

  if (route === 'posts') { // route for getting all posts
    switch (request.method) {
      case 'OPTIONS':
        return handleOptions()

      case 'GET':
        return posts_handleGet()

      case 'POST':
        return posts_handlePost(request)

      default:
        return new Response(`Method ${request.method} unsupported`, {
          status: 400,
        })
    }
  } else if (route === 'like') { // route for liking posts
    switch (request.method) {
      case 'OPTIONS':
        return handleOptions()

      case 'POST':
        return like_handlePost(request)

      default:
        return new Response(`Method ${request.method} unsupported`, {
          status: 400,
        })
    }
  } else {
    return new Response('404 not found', {
      status: 404,
    })
  }
}
