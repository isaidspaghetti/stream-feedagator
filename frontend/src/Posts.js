import React from 'react';
const redditLogo = require('./reddit-logo.png');
const bbcLogo = require('./bbc-logo.png');

const Posts = ((props) => {
  if (props.activity.actor === 'reddit') {
    return (
      <div className='post'>
        <img className="actor-logo" alt="reddit-logo" src={redditLogo} />
        <img src={props.activity.thumbnail} alt="preview" className='thumbnail' />
        <div className="post-content">
          <a className="post-title" href={props.activity.url}>{props.activity.title}</a>
          <p className="subreddit">Posted by {props.activity.author} in r/{props.activity.subreddit}</p>
        </div>
      </div >
    );
  }
  else if (props.activity.actor === 'bbc') {
    return (
      <div className='post'>
        <img className="actor-logo news-logo" alt="bbc-logo" src={bbcLogo} />
        <div className="post-content">
          <a className="post-title news-title" href={props.activity.object}>{props.activity.title}</a>
          <p className="abstract">{props.activity.abstract}</p>
          <p className="news-details">{props.activity.date}</p>
        </div>
      </div>
    );
  }
});

export default Posts;
