### This file contains all endpoints created and used in the application.

#### * To test the endpoints with VSCode,
* install rest-client extension
* find actual endpoints to use in the endpoints directory
* change @baseUrl inside each file in the endpoints directory with your backend api url
* make sure to use the correct url params and body in making the requests

## Auth
```js
@baseUrl = http://localhost:5000
@urlPath = api/v1

- GET {{baseUrl}}/{{urlPath}}/currentuser
- GET {{baseUrl}}/{{urlPath}}/signout

- POST {{baseUrl}}/{{urlPath}}/signup
- POST {{baseUrl}}/{{urlPath}}/signin
- POST {{baseUrl}}/{{urlPath}}/forgot-password
- POST {{baseUrl}}/{{urlPath}}/reset-password/:token
```

## Current user
```js
@baseUrl = http://localhost:5000
@urlPath = api/v1

- GET {{baseUrl}}/{{urlPath}}/currentuser
```

## Health
```js
@baseUrl = http://localhost:5000
@urlPath = api/v1

- GET {{baseUrl}}/health
- GET {{baseUrl}}/env
- GET {{baseUrl}}/instance
- GET {{baseUrl}}/fibo/:number
```

## User
```js
@baseUrl = http://localhost:5000
@urlPath = api/v1

- GET {{baseUrl}}/{{urlPath}}/user/all/:page
- GET {{baseUrl}}/{{urlPath}}/user/profile
- GET {{baseUrl}}/{{urlPath}}/user/profile/posts/:username/:userId/:uId
- GET {{baseUrl}}/{{urlPath}}/user/profile/:userId
- GET {{baseUrl}}/{{urlPath}}/user/profile/user/suggestions
- GET {{baseUrl}}/{{urlPath}}/user/profile/search/:query

- PUT {{baseUrl}}/{{urlPath}}/user/profile/basic-info
- PUT {{baseUrl}}/{{urlPath}}/user/profile/social-links
- PUT {{baseUrl}}/{{urlPath}}/user/profile/change-password
- PUT {{baseUrl}}/{{urlPath}}/user/profile/settings
```

## Chat
```js
@baseUrl = http://localhost:5000
@urlPath = api/v1

- GET {{baseUrl}}/{{urlPath}}/chat/message/user/:receiverId
- GET {{baseUrl}}/{{urlPath}}/chat/message/conversation-list

- POST {{baseUrl}}/{{urlPath}}/chat/message
- POST {{baseUrl}}/{{urlPath}}/chat/message/add-chat-users
- POST {{baseUrl}}/{{urlPath}}/chat/message/remove-chat-users

- PUT {{baseUrl}}/{{urlPath}}/chat/message/mark-as-read
- PUT {{baseUrl}}/{{urlPath}}/chat/message/reaction
```

## Comment
```js
@baseUrl = http://localhost:5000
@urlPath = api/v1

- GET {{baseUrl}}/{{urlPath}}/post/comments/:postId
- GET {{baseUrl}}/{{urlPath}}/post/commentsnames/:postId
- GET {{baseUrl}}/{{urlPath}}/post/single/comment/:postId/:commentId

- POST {{baseUrl}}/{{urlPath}}/post/comment
```

## Follower
```js
@baseUrl = http://localhost:5000
@urlPath = api/v1

- GET {{baseUrl}}/{{urlPath}}/user/following
- GET {{baseUrl}}/{{urlPath}}/user/followers/:userId

- PUT {{baseUrl}}/{{urlPath}}/user/follow/:followerId
- PUT {{baseUrl}}/{{urlPath}}/user/unfollow/:followeeId/:followerId
- PUT {{baseUrl}}/{{urlPath}}/user/block/:followerId
- PUT {{baseUrl}}/{{urlPath}}/user/unblock/:followerId
```

## Images
```js
@baseUrl = http://localhost:5000
@urlPath = api/v1

- GET {{baseUrl}}/{{urlPath}}/images/:userId

- POST {{baseUrl}}/{{urlPath}}/images/profile
- POST {{baseUrl}}/{{urlPath}}/images/background

- DELETE {{baseUrl}}/{{urlPath}}/images/:imageId
- DELETE {{baseUrl}}/{{urlPath}}/images/background/:bgImageId
```

## Notifications
```js
@baseUrl = http://localhost:5000
@urlPath = api/v1

- GET {{baseUrl}}/{{urlPath}}/notification

- PUT {{baseUrl}}/{{urlPath}}/notification/:notificationId

- DELETE {{baseUrl}}/{{urlPath}}/notification/:notificationId
```

## Post
```js
@baseUrl = http://localhost:5000
@urlPath = api/v1

- GET {{baseUrl}}/{{urlPath}}/post/all/:page
- GET {{baseUrl}}/{{urlPath}}/post/images/:page

- POST {{baseUrl}}/{{urlPath}}/post
- POST {{baseUrl}}/{{urlPath}}/post/image/post

- PUT {{baseUrl}}/{{urlPath}}/post/:postId
- PUT {{baseUrl}}/{{urlPath}}/post/image/:postId

- DELETE {{baseUrl}}/{{urlPath}}/post/:postId
```

## Reactions
```js
@baseUrl = http://localhost:5000
@urlPath = api/v1

- GET {{baseUrl}}/{{urlPath}}/post/reactions/:postId
- GET {{baseUrl}}/{{urlPath}}/post/single/reaction/:postId/:reactionId
- GET {{baseUrl}}/{{urlPath}}/post/single/reaction/username/:username/:postId
- GET {{baseUrl}}/{{urlPath}}/post/reactions/username/:username

- POST {{baseUrl}}/{{urlPath}}/post/reaction

- DELETE {{baseUrl}}/{{urlPath}}/post/reaction/:postId/:previousReaction/:postReactions
```
