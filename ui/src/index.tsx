import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import UserForm from './user.tsx';
import App from './App4.tsx';
import ThankYouPage from './ThankYouPage.tsx';
import DetailedAssessmentPage from "./assespage.tsx";
ReactDOM.render(
  <React.StrictMode>
   <Router>
      <Routes>
        <Route path="/" element={<UserForm />} />
        <Route path="/call" element={<App />} />
        <Route path="/thank-you" element={<ThankYouPage />} />
        <Route path="/detailed-assessment" element={<DetailedAssessmentPage />} />
      </Routes>
    </Router>
  </React.StrictMode>,
  document.getElementById('root')
);