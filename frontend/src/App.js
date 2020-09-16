import React, { useState, useRef } from 'react';
import {
  StreamApp,
  FlatFeed,
  InfiniteScrollPaginator,
} from 'react-activity-feed';
import 'react-activity-feed/dist/index.es.css';
import axios from 'axios';
import Posts from './Posts';
import './App.css';

function App() {
  const [username, setUsername] = useState('');
  const [streamCredentials, setStreamCredentials] = useState(null);
  const containerRef = useRef(null);

  const register = async (e) => {
    try {
      e.preventDefault();

      var response = await axios.post('http://localhost:8080/registration', {
        username: username
      });

      setStreamCredentials({ token: response.data.userToken, apiKey: response.data.streamApiKey, appId: response.data.appId });

    } catch (e) {
      console.error(e, e.error);
    }
  };

  async function initializeFeeds() {
    try {

      await axios.post('http://localhost:8080/initialize');

    } catch (e) {
      console.log(e);
    }
  }

  if (streamCredentials) {
    return (
      <div ref={containerRef}>
        <StreamApp apiKey={streamCredentials.apiKey} token={streamCredentials.token} appId={streamCredentials.appId}>
          <div className="stream-app">
            <h3 className="app-title">Feedagator</h3>
            <button onClick={initializeFeeds}>One-time-Initialize</button>
          </div>
          <FlatFeed
            feedGroup="user"
            notify
            options={{ limit: 6 }}
            Paginator={(props) => (
              <InfiniteScrollPaginator
                useWindow={false}
                threshold={10}
                {...props}
                getScrollParent={() => containerRef}
              />
            )}
            Activity={Posts}
          />
        </StreamApp>
      </div>
    );
  } else {
    return (
      <div className="App container">
        <form className="card" onSubmit={register}>
          <label>Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="username"
            required
          />
          <button type="submit">
            Log in
          </button>
        </form>
      </div>
    );
  }
}

export default App;
