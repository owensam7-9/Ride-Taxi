import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import ErrorFallback from './Component/ErrorFallBack';
import Home from './Pages/home';
import Pick from './Pages/pick';
import Drop from './Pages/drop';
import NoPage from './Pages/Nopage';
import Auth from './Pages/auth';
import DriverRegistration from './Pages/driver/register';
import DriverDashboard from './Pages/driver/dashboard';
import Loading from './Component/Loading';

const App: React.FC = () => {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        document.title = 'Ride Cosy';
        // Add a small delay to ensure Firebase is initialized
        const timer = setTimeout(() => setIsLoading(false), 1000);
        return () => clearTimeout(timer);
    }, []);

    if (isLoading) {
        return <Loading />;
    }

    const userName = localStorage.getItem('userName');
    if (!userName) {
        return <Auth />;
    }

    const userType = localStorage.getItem('userType');

    return (
        <ErrorBoundary
            FallbackComponent={ErrorFallback}
            onReset={() => window.location.reload()}
        >
            <Router>
                <Switch>
                    <Route exact path="/" component={Home} />
                    <Route exact path="/pick/:origin" component={Pick} />
                    <Route exact path="/drop/:origin/:end" component={Drop} />
                    {userType === 'driver' ? (
                        <>
                            <Route exact path="/driver/register" component={DriverRegistration} />
                            <Route exact path="/driver/dashboard" component={DriverDashboard} />
                        </>
                    ) : null}
                    <Route component={NoPage} />
                </Switch>
            </Router>
        </ErrorBoundary>
    );
};

export default App;