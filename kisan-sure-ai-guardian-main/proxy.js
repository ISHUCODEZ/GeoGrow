const express = require('express');
require('dotenv').config();

const app = express();
const PORT = 5000;

// Use the correct resource ID for your dataset
const RESOURCE_ID = '9ef84268-d588-465a-a308-a864a43d0070';

app.get('/api/agmarknet', async (req, res) => {
  const { 
    commodity, 
    market, 
    date, 
    state, 
    district, 
    variety, 
    grade,
    limit = 10,
    offset = 0
  } = req.query;
  
  // Set a higher default limit for getting states/commodities
  const actualLimit = (!commodity && !market && !state && !district) ? 10000 : limit;
  
  const apiKey = process.env.VITE_AGMARKNET_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ 
      error: 'API key not found. Please set VITE_AGMARKNET_API_KEY in your .env file' 
    });
  }

  // Build the URL with JSON format
  let url = `https://api.data.gov.in/resource/${RESOURCE_ID}?api-key=${apiKey}&format=json&limit=${actualLimit}&offset=${offset}`;
  
  // Add filters if provided
  if (commodity) url += `&filters[commodity]=${encodeURIComponent(commodity)}`;
  if (market) url += `&filters[market]=${encodeURIComponent(market)}`;
  if (date) url += `&filters[arrival_date]=${encodeURIComponent(date)}`;
  if (state) url += `&filters[state]=${encodeURIComponent(state)}`;
  if (district) url += `&filters[district]=${encodeURIComponent(district)}`;
  if (variety) url += `&filters[variety]=${encodeURIComponent(variety)}`;
  if (grade) url += `&filters[grade]=${encodeURIComponent(grade)}`;

  try {
    console.log('Fetching from:', url);
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`Received ${data.records?.length || 0} records`);
    res.json(data);
  } catch (e) {
    console.error('Error fetching from AGMARKNET:', e);
    res.status(500).json({ 
      error: 'Failed to fetch from AGMARKNET',
      details: e.message 
    });
  }
});

app.listen(PORT, () => console.log(`Proxy running on port ${PORT}`)); 
