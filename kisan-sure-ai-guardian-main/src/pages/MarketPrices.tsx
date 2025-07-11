import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { DollarSign } from 'lucide-react';

const dummyData = [
  {
    commodity: "Potato",
    market: "Delhi",
    state: "Delhi",
    min_price: 1200,
    max_price: 1500,
    modal_price: 1350,
    arrival_date: "2024-07-10"
  },
  {
    commodity: "Tomato",
    market: "Mumbai",
    state: "Maharashtra",
    min_price: 900,
    max_price: 1200,
    modal_price: 1050,
    arrival_date: "2024-07-10"
  },
  {
    commodity: "Onion",
    market: "Nashik",
    state: "Maharashtra",
    min_price: 800,
    max_price: 1000,
    modal_price: 900,
    arrival_date: "2024-07-10"
  }
];

const crops = Array.from(new Set(dummyData.map(d => d.commodity)));

const MarketPrices: React.FC = () => {
  const [selectedCrop, setSelectedCrop] = useState<string>(crops[0]);
  const filtered = dummyData.filter(d => d.commodity === selectedCrop);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold hero-text">Market Prices</h1>
          <p className="text-muted-foreground mt-1">
            Select a crop to view its market prices (dummy data)
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <DollarSign className="h-5 w-5 text-primary" />
          <Badge variant="outline" className="text-xs">
            Dummy Data
          </Badge>
        </div>
      </div>

      <Card className="agri-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>Select Crop</span>
          </CardTitle>
          <CardDescription>
            Choose a crop to see its market prices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedCrop} onValueChange={setSelectedCrop}>
            <SelectTrigger>
              <SelectValue placeholder="Select a crop" />
            </SelectTrigger>
            <SelectContent>
              {crops.map(crop => (
                <SelectItem key={crop} value={crop}>{crop}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card className="agri-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5" />
            <span>Current Market Prices</span>
          </CardTitle>
          <CardDescription>
            Latest mandi rates for {selectedCrop}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th>Commodity</th>
                  <th>Market</th>
                  <th>State</th>
                  <th>Min Price</th>
                  <th>Max Price</th>
                  <th>Modal Price</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((d, i) => (
                  <tr key={i}>
                    <td>{d.commodity}</td>
                    <td>{d.market}</td>
                    <td>{d.state}</td>
                    <td>₹{d.min_price}</td>
                    <td>₹{d.max_price}</td>
                    <td>₹{d.modal_price}</td>
                    <td>{d.arrival_date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center text-muted-foreground py-4">No results found.</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MarketPrices; 