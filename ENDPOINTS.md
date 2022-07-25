### This file contains all endpoints created and used in the application.

#### * To test the endpoints with VSCode,
* install rest-client extension
* find actual endpoints to use in the endpoints directory
* change @baseUrl inside each file in the endpoints directory with your backend api url
* make sure to use the correct url params and body in making the requests

```js
@baseUrl = http://localhost:5000
@urlPath = api/v1
```

## Auth
```js
- GET {{baseUrl}}/{{urlPath}}/currentuser
- GET {{baseUrl}}/{{urlPath}}/signout

- POST {{baseUrl}}/{{urlPath}}/signup
- POST {{baseUrl}}/{{urlPath}}/signin
- POST {{baseUrl}}/{{urlPath}}/forgot-password
- POST {{baseUrl}}/{{urlPath}}/reset-password/:token
```

## Current user
```js
- GET {{baseUrl}}/{{urlPath}}/currentuser
```

## Health
```js
- GET {{baseUrl}}/health
- GET {{baseUrl}}/env
- GET {{baseUrl}}/instance
- GET {{baseUrl}}/fibo/:number
```

## User
```js
@userBase = user
- GET {{baseUrl}}/{{urlPath}}/{{userBase}}/all/:page
- GET {{baseUrl}}/{{urlPath}}/{{userBase}}/profile
- GET {{baseUrl}}/{{urlPath}}/{{userBase}}/profile/posts/:username/:userId/:uId
- GET {{baseUrl}}/{{urlPath}}/{{userBase}}/profile/:userId
- GET {{baseUrl}}/{{urlPath}}/{{userBase}}/profile/user/suggestions
- GET {{baseUrl}}/{{urlPath}}/{{userBase}}/profile/search/:query

- PUT {{baseUrl}}/{{urlPath}}/{{userBase}}/profile/basic-info
- PUT {{baseUrl}}/{{urlPath}}/{{userBase}}/profile/social-links
- PUT {{baseUrl}}/{{urlPath}}/{{userBase}}/profile/change-password
- PUT {{baseUrl}}/{{urlPath}}/{{userBase}}/profile/settings
```

## Chat
```js
@chatBase = chat/message
- GET {{baseUrl}}/{{urlPath}}/{{chatBase}}/user/:receiverId
- GET {{baseUrl}}/{{urlPath}}/{{chatBase}}/conversation-list

- POST {{baseUrl}}/{{urlPath}}/{{chatBase}}
- POST {{baseUrl}}/{{urlPath}}/{{chatBase}}/add-chat-users
- POST {{baseUrl}}/{{urlPath}}/{{chatBase}}/remove-chat-users

- PUT {{baseUrl}}/{{urlPath}}/{{chatBase}}/mark-as-read
- PUT {{baseUrl}}/{{urlPath}}/{{chatBase}}/reaction
```

## Comment
```js
@commentBase = post
- GET {{baseUrl}}/{{urlPath}}/{{commentBase}}/comments/:postId
- GET {{baseUrl}}/{{urlPath}}/{{commentBase}}/commentsnames/:postId
- GET {{baseUrl}}/{{urlPath}}/{{commentBase}}/single/comment/:postId/:commentId

- POST {{baseUrl}}/{{urlPath}}/{{commentBase}}/comment
```

## Follower
```js
- GET {{baseUrl}}/{{urlPath}}/user/following
- GET {{baseUrl}}/{{urlPath}}/user/followers/:userId

- PUT {{baseUrl}}/{{urlPath}}/user/follow/:followerId
- PUT {{baseUrl}}/{{urlPath}}/user/unfollow/:followeeId/:followerId
- PUT {{baseUrl}}/{{urlPath}}/user/block/:followerId
- PUT {{baseUrl}}/{{urlPath}}/user/unblock/:followerId
```

## Images
```js
@imagesBase = images
- GET {{baseUrl}}/{{urlPath}}/{{imagesBase}}/:userId

- POST {{baseUrl}}/{{urlPath}}/{{imagesBase}}/profile
- POST {{baseUrl}}/{{urlPath}}/{{imagesBase}}/background

- DELETE {{baseUrl}}/{{urlPath}}/{{imagesBase}}/:imageId
- DELETE {{baseUrl}}/{{urlPath}}/{{imagesBase}}/background/:bgImageId
```

## Notifications
```js
@notificationsBase = notification
- GET {{baseUrl}}/{{urlPath}}/{{notificationsBase}}

- PUT {{baseUrl}}/{{urlPath}}/{{notificationsBase}}/:notificationId

- DELETE {{baseUrl}}/{{urlPath}}/{{notificationsBase}}/:notificationId
```

## Post
```js
@postBase = post
- GET {{baseUrl}}/{{urlPath}}/{{postBase}}/all/:page
- GET {{baseUrl}}/{{urlPath}}/{{postBase}}/images/:page

- POST {{baseUrl}}/{{urlPath}}/{{postBase}}
- POST {{baseUrl}}/{{urlPath}}/{{postBase}}/image/post

- PUT {{baseUrl}}/{{urlPath}}/{{postBase}}/:postId
- PUT {{baseUrl}}/{{urlPath}}/{{postBase}}/image/:postId

- DELETE {{baseUrl}}/{{urlPath}}/{{postBase}}/:postId
```

## Reactions
```js
@postBase = post
- GET {{baseUrl}}/{{urlPath}}/{{postBase}}/reactions/:postId
- GET {{baseUrl}}/{{urlPath}}/{{postBase}}/single/reaction/:postId/:reactionId
- GET {{baseUrl}}/{{urlPath}}/{{postBase}}/single/reaction/username/:username/:postId
- GET {{baseUrl}}/{{urlPath}}/{{postBase}}/reactions/username/:username

- POST {{baseUrl}}/{{urlPath}}/{{postBase}}/reaction

- DELETE {{baseUrl}}/{{urlPath}}/{{postBase}}/reaction/:postId/:previousReaction/:postReactions
```
