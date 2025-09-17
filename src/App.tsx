import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import {ErrorBoundary} from 'react-error-boundary';
import ErrorFallback from './Component/ErrorFallBack';
import Home from './Pages/home';
import Pick from './Pages/pick';
import Drop from './Pages/drop';
import NoPage from './Pages/Nopage';
import Auth from './Pages/auth';
import DriverRegistration from './Pages/driver/register';
import DriverDashboard from './Pages/driver/dashboard';

const App:React.FC = () => {
    // Set document title
    React.useEffect(() => {
        document.title = 'Ride Cosy';
    }, []);

    const userName = localStorage.getItem('userName');
    if(!userName){
      return <Auth/>
    }

    const userType = localStorage.getItem('userType');

  return (
    <div>
      <Router>
          <Switch>
            <Route exact path = "/" component={Home}/>
            <Route exact path = "/pick/:origin" component={Pick}/>
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              <Route exact path = "/drop/:origin/:end" component = {Drop}/>
            </ErrorBoundary>
            <Route exact path = "/driver/register" component={DriverRegistration}/>
            <Route exact path = "/driver/dashboard" component={DriverDashboard}/>
            <Route exact path = "*" component = {NoPage}/>
          </Switch>
      </Router>
    </div>
  );
}

export default App;
