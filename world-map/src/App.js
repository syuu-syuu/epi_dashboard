import React from 'react';
import WorldMap from './WorldMap'; // Import your WorldMap component

const App = () => {
  return (
      <div className="App">
        <h1>World Air Pollution per Capita by Year</h1>
        <WorldMap /> {/* Render your WorldMap component */}
      </div>
  );
};

export default App;
