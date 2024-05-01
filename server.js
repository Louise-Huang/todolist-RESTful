const http = require('http')
const { v4: uuidv4 } = require('uuid')
const errHandle = require('./errorHandle')
const todos = []
const requestListener = (req, res) => {
	const headers = {
		'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, X-Requested-With',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'PATCH, POST, GET,OPTIONS,DELETE',
    'Content-Type': 'application/json'
	}
  let body = ''
  req.on('data', chunk => { // 持續抓封包傳過來的資料
    body += chunk
  })
	
	if (req.url === '/todos' && req.method === 'GET') {
		res.writeHead(200, headers)
		res.write(JSON.stringify({
			"status": "success",
			"data": todos
		}))
		res.end()
	} else if (req.url === '/todos' && req.method === 'POST') {
    req.on('end', () => { // 使用 end function 是為了確保 body 有資料
      try {
        const title = JSON.parse(body).title
        if (title !== undefined) {
          const todo = {
            title,
            id: uuidv4()
          }
          todos.push(todo)
          res.writeHead(200, headers)
          res.write(JSON.stringify({
            "status": "success",
            "data": todos
          }))
          res.end()
        } else {
          res.writeHead(400, headers)
          res.write(JSON.stringify({
            "status": "failed",
            "message": "沒有title"
          }))
          res.end()
        }
      } catch (error) {
        console.log('程式錯誤', error)
        res.writeHead(400, headers)
        res.write(JSON.stringify({
          "status": "failed",
          "message": "欄位錯誤"
        }))
        res.end()
      }
    })
  } else if (req.url === '/todos' && req.method === 'DELETE') {
    todos.length = 0
    res.writeHead(200, headers)
		res.write(JSON.stringify({
			"status": "success",
			"data": todos
		}))
		res.end()
  } else if (req.url.startsWith('/todos/') && req.method === 'DELETE') {
    const id = req.url.split('/')[2]
    const index = todos.findIndex(item => item.id === id)
    if (index !== -1) {
      todos.splice(index, 1)
      res.writeHead(200, headers)
      res.write(JSON.stringify({
        "status": "success",
        "data": todos
      }))
      res.end()
    } else {
      res.writeHead(404, headers)
      res.write(JSON.stringify({
        "status": "failed",
        "message": "無此網站路由"
      }))
      res.end()
    } 
  } else if (req.url.startsWith('/todos/') && req.method === 'PATCH') {
    req.on('end', () => { // 使用 end function 是為了確保 body 有資料
      try {
        const id = req.url.split('/')[2]
        const index = todos.findIndex(item => item.id === id)
        const title = JSON.parse(body).title
        if (title !== undefined && index !== -1) {
          todos[index].title = title
          res.writeHead(200, headers)
          res.write(JSON.stringify({
            "status": "success",
            "data": todos
          }))
          res.end()
        } else {
          errHandle(res)
        }
      } catch (error) {
        errHandle(res)
      }
    })
  } else {
		errHandle(res)
	}
}

const server = http.createServer(requestListener)
server.listen(process.env.PORT || 8001)