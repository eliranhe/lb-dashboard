import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';
import loadBalancers from './loadBalancers';



ReactDOM.render(
  <App loadBalancers={loadBalancers}/>,
  document.getElementById('root')
);
