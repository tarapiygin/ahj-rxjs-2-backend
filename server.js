const http = require('http');
const Koa = require('koa');
const koaBody = require('koa-body');
const koaCors = require('@koa/cors');
const Router = require('koa-router');
const faker = require('faker');
const uuid = require('uuid');

const router = new Router();
const app = new Koa();

app.use(koaCors());
app.use(koaBody({
  urlencoded: true,
  multipart: true,
  json: true,
  text: true,
}));

const posts = [];
const comments = [];

const interval = setInterval(() => {
  const postId = uuid.v4();
  const authorId = uuid.v4();
  const random = Math.floor(Math.random() * 10);
  posts.unshift({
    id: postId,
    author_id: authorId,
    title: faker.lorem.slug(),
    author: faker.internet.userName(),
    avatar: faker.internet.avatar(),
    image: faker.image.imageUrl(),
    created: Date.now(),
  });
  for (let i = 0; i <= random; i += 1) {
    comments.unshift({
      id: uuid.v4(),
      post_id: postId,
      author_id: authorId,
      author: faker.internet.userName(),
      avatar: faker.internet.avatar(),
      content: faker.lorem.sentence(),
      created: Date.now(),
    });
  }
  if (posts.length > 100) clearInterval(interval);
}, 15000);

router.get('/posts/latest', async (ctx) => {
  let postsData = posts;
  if (postsData.length > 10) postsData = postsData.slice(0, 9);
  ctx.response.body = {
    status: 'ok',
    data: JSON.stringify(postsData),
  };
});

router.get('/posts/:id/comments/latest', async (ctx) => {
  let latestComments = comments.filter((el) => el.post_id === ctx.params.id);
  if (latestComments.length > 3) latestComments = latestComments.slice(0, 3);
  ctx.response.body = {
    status: 'ok',
    data: JSON.stringify(latestComments),
  };
});

app.use(router.routes()).use(router.allowedMethods());
const server = http.createServer(app.callback());
const port = process.env.PORT || 7070;
server.listen(port);
