const express = require('express');
const router = express.Router();
const stream = require('getstream');
const axios = require('axios');
const Parser = require('rss-parser');

require('dotenv').config();

const streamApiKey = process.env.STREAM_API_KEY;
const streamApiSecret = process.env.STREAM_API_SECRET;
const appId = process.env.STREAM_APP_ID;

const client = stream.connect(streamApiKey, streamApiSecret);

router.post('/registration', async (req, res) => {
  try {
    const username = req.body.username.replace(/\s/g, '_').toLowerCase();

    const userToken = client.createUserToken(username);

    client.user(username).getOrCreate({
      name: username,
    });

    const userFeed = await client.feed('user', username);

    await userFeed.follow('source', 'reddit');

    await userFeed.follow('source', 'bbc');

    res.status(200).json({
      userToken,
      streamApiKey,
      username,
      appId
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/initialize', async (req, res) => {
  try {
    await client.user('reddit').getOrCreate({
      name: 'reddit'
    });

    const redditFeed = await client.feed('source', 'reddit');

    const redditUpdate = await axios.get('https://www.reddit.com/r/popular/top.json?count=3');

    const popularPosts = redditUpdate.data.data.children;

    popularPosts.forEach(async (post) => {
      await redditFeed.addActivity({
        'actor': 'reddit',
        'verb': 'post',
        'object': post.data.url,
        'subreddit': post.data.subreddit,
        'title': post.data.title,
        'thumbnail': post.data.thumbnail,
        'url': post.data.url,
        'foreignId': post.data.id,
        'author': post.data.author
      });
    });

    await client.user('bbc').getOrCreate({
      name: 'bbc'
    });

    const bbcFeed = await client.feed('source', 'bbc');

    const parser = new Parser();

    const feed = await parser.parseURL('http://feeds.bbci.co.uk/news/rss.xml?edition=uk#');

    feed.items.forEach(async (article) => {
      await bbcFeed.addActivity({
        'actor': 'bbc',
        'verb': 'article',
        'object': article.link,
        'title': article.title,
        'abstract': article.contentSnippet,
        'date': article.isoDate,
      });
    });

    res.status(200).send();

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/reddit-zapier-webhook', async (req, res) => {
  try {
    const redditFeed = await client.feed('source', 'reddit');

    const post = await req;

    await redditFeed.addActivity({
      'actor': 'reddit',
      'verb': 'post',
      'object': post.body.url,
      'title': post.body.title,
      'author': post.body.author,
      'subreddit': post.body.subreddit,
      'thumbnail': post.body.thumbnail,
      'url': post.body.url,
      'foreignId': post.body.id,
    });

    res.status(200).send();

  } catch (error) {
    console.log(error);
    res.status(500).json({ error: err.message });
  }
});

router.post('/bbc', async (req, res) => {
  try {
    const bbcFeed = await client.feed('source', 'bbc');

    await bbcFeed.addActivity({
      'actor': 'bbc',
      'verb': 'article',
      'object': req.body.link,
      'title': req.body.title,
      'abstract': req.body.blurb,
      'date': req.body.date,
    });

    res.status(200).send();

  } catch (error) {
    console.log(error);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
