import React from 'react';
import {
  BrowserRouter as Router, Route, Redirect, Switch,
} from 'react-router-dom';

import { ROUTER_BASE_NAME } from '../constants';
import { onAuthStateChanged } from '../firebase';
import LoadingPage from './common/LoadingPage';
import LoginPage from './containers/LoginContainer';
import MainContainer from './containers/MainContainer';
import ViewOnlyContainer from './containers/ViewOnlyContainer';
import Error from './Error';
import PageNotFound from './PageNotFound';
import '../styles/app.scss';

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      checkedAuth: false,
    };
  }

  //= =============React Lifecycle Functions===================//

  componentDidMount() {
    onAuthStateChanged(async (user) => {
      await this.onAuthHandler(user);
    });
    window.addEventListener('resize', this.handleResize, true);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize, true);
  }

  handleResize = () => {
    const { screenResize } = this.props;
    screenResize(window.innerWidth, window.innerHeight);
  };

  /**
   * TODO: Consider reducing the numerous side effects of this function in favor of the one
   * function, one purpose principle onAuthHandler - on execution will set a flag checkedAuth
   * to true. If a valid user is passed to the function, onAuthHandler will attempt to load
   * the metadata and account data corresponding to this account.  If the user has not set
   * their displayName, it will be set to "New User". If no user is passed, we clear any existng
   * user data from the application.
   * @param  {firebase.auth().currentUser}  user - a user object as passed by firebase.auth()
   */
  onAuthHandler = async (user) => {
    const { clearUserData, loadUserData, loadFailure } = this.props;

    if (user) {
      const { uid } = user;
      if (uid) {
        await loadUserData(uid, this.showErrorPage);
        this.setState({ checkedAuth: true });
      } else {
        loadFailure('Failed to load user data...');
        this.setState({ checkedAuth: true });
      }
    } else {
      console.error('no user found');
      clearUserData();
      this.setState({ checkedAuth: true });
    }
  };

  showErrorPage = (err) => {
    const { loadFailure } = this.props;
    console.error(err);
    loadFailure(err);
  };

  renderHome = (isValidUser) => (isValidUser ? <Redirect to="/editor" /> : <Redirect to="/login" />);

  render() {
    const { checkedAuth } = this.state;

    const { errorMsg, uid, developerAcc } = this.props;

    // if we haven't checked if the user is logged in yet, show a loading screen
    if (!checkedAuth) {
      return <LoadingPage />;
    }

    // the user is not valid if there's no UID
    const isValidUser = uid;

    return (
      <Router basename={ROUTER_BASE_NAME}>
        <div className="app">
          <Switch>
            {/* if the user is loggedIn, redirect them to the editor, otherwise, show the login page*? */}
            <Route
              exact
              path="/"
              render={() => {
                if (errorMsg !== '') {
                  return <Error errorMsg={errorMsg} isValidUser={isValidUser} />;
                }
                if (isValidUser) {
                  return <Redirect to="/editor" />;
                }
                return <LoginPage />;
              }}
            />
            {/* if the user is loggedIn, redirect them to the editor, otherwise, show the login page*? */}
            <Route
              path="/login"
              render={() => {
                if (errorMsg !== '') {
                  return <Error errorMsg={errorMsg} isValidUser={isValidUser} />;
                }
                if (isValidUser) {
                  return <Redirect to="/editor" />;
                }
                return <LoginPage />;
              }}
            />
            {/* if the user is not loggedIn, redirect them to the login page, otherwise, show the editor page*? */}
            <Route
              path="/editor"
              render={() => {
                if (errorMsg !== '') {
                  return <Error errorMsg={errorMsg} isValidUser={isValidUser} />;
                }
                if (!isValidUser) {
                  return <Redirect to="/login" />;
                }
                return <MainContainer contentType="editor" />;
              }}
            />
            {/* if the user is loggedIn, redirect them to the editor page, otherwise, show the createUser page*? */}
            <Route
              path="/createUser"
              render={({ location }) => {
                if (errorMsg !== '') {
                  return <Error errorMsg={errorMsg} isValidUser={isValidUser} />;
                }
                if (isValidUser) {
                  return <Redirect to="/editor" />;
                }
                return <LoginPage create initialState={location.state} />;
              }}
            />
            {/* if the user isn't loggedIn, redirect them to the login page, otherwise, show the view page*? */}
            <Route
              path="/sketches"
              render={() => {
                if (errorMsg !== '') {
                  return <Error errorMsg={errorMsg} isValidUser={isValidUser} />;
                }
                if (isValidUser) {
                  return <MainContainer contentType="sketches" />;
                }
                return <Redirect to="/login" />;
              }}
            />
            {/* Get program endpoint */}
            <Route
              path="/p/:programid"
              render={(props) => (
                <ViewOnlyContainer contentType="view" programid={props.match.params.programid} />
              )}
            />
            {/* Class page */}
            <Route
              path="/class"
              render={() => {
                if (errorMsg !== '') {
                  return <Error errorMsg={errorMsg} isValidUser={isValidUser} />;
                }
                if (!isValidUser) {
                  return <Redirect to="/login" />;
                }
                if (developerAcc) {
                  return <MainContainer contentType="classPage" />;
                }
                return <Redirect to="/sketches" />;
              }}
            />
            {/* Classes page */}
            <Route
              path="/classes"
              render={() => {
                if (errorMsg !== '') {
                  return <Error errorMsg={errorMsg} isValidUser={isValidUser} />;
                }
                if (!isValidUser) {
                  return <Redirect to="/login" />;
                }
                if (developerAcc) {
                  return <MainContainer contentType="classes" />;
                }
                return <Redirect to="/sketches" />;
              }}
            />
            {/* Default error page */}
            <Route
              path="/error"
              render={() => (errorMsg ? (
                <Error errorMsg={errorMsg} isValidUser={isValidUser} />
              ) : (
                this.renderHome(isValidUser)
              ))}
            />

            {/* Matches all other paths */}
            <Route render={() => <PageNotFound />} />
          </Switch>
        </div>
      </Router>
    );
  }
}

export default App;
