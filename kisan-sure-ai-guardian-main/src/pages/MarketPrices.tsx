import React, { useState } from 'react';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from '@/components/ui/card';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DollarSign } from 'lucide-react';

interface PriceRecord {
  commodity: string;
  market: string;
  state: string;
  min_price: number;
  max_price: number;
  modal_price: number;
  date: string;
}

const commodities = ['Potato', 'Tomato', 'Onion', 'Wheat', 'Rice'];

// Dummy fallback record
const dummyFallback: PriceRecord = {
  commodity: 'Potato',
  market: 'Delhi Mandi',
  state: 'Delhi',
  min_price: 1200,
  max_price: 1500,
  modal_price: 1350,
  date: new Date().toISOString().split('T')[0]
};

const MarketPrices: React.FC = () => {
  const [commodity, setCommodity] = useState<string>(commodities[0]);
  const [location, setLocation] = useState<string>('Delhi Delhi');
  const [prices, setPrices] = useState<PriceRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPrices = async () => {
    setLoading(true);
    setError(null);

    try {
      const resp = await fetch('https://google.serper.dev/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': '1ed76e52b93c255cfe96f4d5a70d4aadd2952696'
        },
        body: JSON.stringify({
          q: `${commodity} mandi price in ${location}`
        })
      });

      if (!resp.ok) throw new Error(`API Error (${resp.status})`);

      const json = await resp.json();
      const raw =
        json.answerBox?.snippet ||
        (json.organic?.map((o: any) => o.snippet).join('\n') || '');
      
      const parsed = raw
        .split('\n')
        .map(line => {
          const m = line.match(/(.+?) – ₹([0-9]+)–₹([0-9]+) \(modal ₹([0-9]+)\) on (.+)/);
          if (m) {
            return {
              commodity,
              market: m[1].trim(),
              state: location.split(' ').slice(-1)[0],
              min_price: Number(m[2]),
              max_price: Number(m[3]),
              modal_price: Number(m[4]),
              date: m[5].trim()
            };
          }
          return null;
        })
        .filter(Boolean) as PriceRecord[];

      setPrices(parsed.length > 0 ? parsed : [dummyFallback]);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
      setPrices([dummyFallback]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold hero-text">Market Prices</h1>
          <p className="text-muted-foreground mt-1">
            View mandi prices using Serper API (with dummy fallback)
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <DollarSign className="h-5 w-5 text-primary" />
          <Badge variant="outline" className="text-xs">Serper + Fallback</Badge>
        </div>
      </div>

      <Card className="agri-card">
        <CardHeader>
          <CardTitle>Select Crop & Location</CardTitle>
          <CardDescription>Get real or dummy market prices</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row gap-4">
          <Select value={commodity} onValueChange={setCommodity}>
            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              {commodities.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>

          <Input
            placeholder="Location (e.g. Delhi Delhi)"
            value={location}
            onChange={e => setLocation(e.target.value)}
            className="flex-grow"
          />

          <Button onClick={fetchPrices} disabled={loading} className="gradient-primary">
            {loading ? 'Fetching...' : 'Get Prices'}
          </Button>
        </CardContent>
      </Card>

      {error && (
        <div className="text-red-600 font-medium">{error}</div>
      )}

      <Card className="agri-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5" />
            <span>Price Results</span>
          </CardTitle>
          <CardDescription>
            Showing prices for {commodity} in {location}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b">
                  <th>Commodity</th>
                  <th>Market</th>
                  <th>State</th>
                  <th>Min</th>
                  <th>Max</th>
                  <th>Modal</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {prices.map((p, idx) => (
                  <tr key={idx}>
                    <td>{p.commodity}</td>
                    <td>{p.market}</td>
                    <td>{p.state}</td>
                    <td>₹{p.min_price}</td>
                    <td>₹{p.max_price}</td>
                    <td>₹{p.modal_price}</td>
                    <td>{p.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MarketPrices;
