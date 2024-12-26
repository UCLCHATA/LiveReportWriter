import React from 'react';
import ReactDOM from 'react-dom/client';
import { MilestoneTracker } from './components/MilestoneTracker';

// Only mount React on the left side container
ReactDOM.createRoot(document.getElementById('react-root')!).render(
  <React.StrictMode>
    <MilestoneTracker />
  </React.StrictMode>
); 