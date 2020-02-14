import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import Init from './components/Init';
import Wallet from './components/Wallet';

class App extends React.Component {
  render() {
    return (
      <Router>
        <Switch>
          <Route exact path="/init" component={Init} />
          <Route exact path="/wallet" component={Wallet} />
        </Switch>
      </Router>
    );
  }
}

export default App;
