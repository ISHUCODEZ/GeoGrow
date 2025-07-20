export interface MarketPriceRecord {
  state: string;
  district: string;
  market: string;
  commodity: string;
  variety: string;
  grade: string;
  arrival_date: string;
  min_price: string;
  max_price: string;
  modal_price: string;
}

export interface MarketPricesResponse {
  index_name: string;
  title: string;
  desc: string;
  org_type: string;
  org: string[];
  sector: string[];
  source: string;
  catalog_uuid: string;
  visualizable: string;
  active: string;
  created: number;
  updated: number;
  created_date: string;
  updated_date: string;
  external_ws: number;
  external_ws_url: string;
  target_bucket: {
    index: string;
    type: string;
    field: string;
  };
  field: Array<{
    name: string;
    id: string;
    type: string;
  }>;
  field_dependent: {
    state: {
      parent: string;
      child: string;
    };
  };
  order: Array<{
    name: string;
    id: string;
  }>;
  field_exposed: Array<{
    name: string;
    id: string;
    type: string;
    mandatory?: boolean;
    format?: string;
  }>;
  message: string;
  version: string;
  status: string;
  total: number;
  count: number;
  limit: string;
  offset: string;
  records: MarketPriceRecord[];
}

export interface MarketFilters {
  state?: string;
  district?: string;
  market?: string;
  commodity?: string;
  variety?: string;
  grade?: string;
  arrivalDate?: string;
  limit?: number;
  offset?: number;
}

class MarketService {
  private baseUrl = '/api/agmarknet';
  private resourceId = '9ef84268-d588-465a-a308-a864a43d0070';

  /**
   * Fetch market prices with filters
   */
  async getMarketPrices(filters: MarketFilters = {}): Promise<MarketPricesResponse> {
    try {
      const params = new URLSearchParams();
      
      // Add filters to query parameters
      if (filters.state) params.append('filters[state]', filters.state);
      if (filters.district) params.append('filters[district]', filters.district);
      if (filters.market) params.append('filters[market]', filters.market);
      if (filters.commodity) params.append('filters[commodity]', filters.commodity);
      if (filters.variety) params.append('filters[variety]', filters.variety);
      if (filters.grade) params.append('filters[grade]', filters.grade);
      if (filters.arrivalDate) params.append('filters[arrival_date]', filters.arrivalDate);
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.offset) params.append('offset', filters.offset.toString());

      const url = `${this.baseUrl}?${params.toString()}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching market prices:', error);
      throw new Error('Failed to fetch market prices');
    }
  }

  /**
   * Get unique states from the dataset (real-time, with search)
   */
  async getStates(search?: string): Promise<string[]> {
    try {
      const response = await this.getMarketPrices({ limit: 10000 });
      let states = [...new Set(response.records.map(record => record.state))];
      if (search) {
        states = states.filter(s => s.toLowerCase().includes(search.toLowerCase()));
      }
      return states.sort();
    } catch (error) {
      console.error('Error fetching states:', error);
      return [];
    }
  }

  /**
   * Get fallback list of major Indian states
   */
  private getFallbackStates(): string[] {
    return [
      'Andhra Pradesh',
      'Arunachal Pradesh',
      'Assam',
      'Bihar',
      'Chhattisgarh',
      'Goa',
      'Gujarat',
      'Haryana',
      'Himachal Pradesh',
      'Jharkhand',
      'Karnataka',
      'Kerala',
      'Madhya Pradesh',
      'Maharashtra',
      'Manipur',
      'Meghalaya',
      'Mizoram',
      'Nagaland',
      'Odisha',
      'Punjab',
      'Rajasthan',
      'Sikkim',
      'Tamil Nadu',
      'Telangana',
      'Tripura',
      'Uttar Pradesh',
      'Uttarakhand',
      'West Bengal',
      'Delhi',
      'Jammu and Kashmir',
      'Ladakh',
      'Chandigarh',
      'Dadra and Nagar Haveli and Daman and Diu',
      'Lakshadweep',
      'Puducherry',
      'Andaman and Nicobar Islands'
    ].sort();
  }

  /**
   * Get districts for a specific state (real-time, with search)
   */
  async getDistricts(state: string, search?: string): Promise<string[]> {
    try {
      const response = await this.getMarketPrices({ state, limit: 10000 });
      let districts = [...new Set(response.records.map(record => record.district))];
      if (search) {
        districts = districts.filter(d => d.toLowerCase().includes(search.toLowerCase()));
      }
      return districts.sort();
    } catch (error) {
      console.error('Error fetching districts:', error);
      return [];
    }
  }

  /**
   * Get markets for a specific state and district (real-time, with search)
   */
  async getMarkets(state: string, district?: string, search?: string): Promise<string[]> {
    try {
      const filters: MarketFilters = { state, limit: 10000 };
      if (district) filters.district = district;
      const response = await this.getMarketPrices(filters);
      let markets = [...new Set(response.records.map(record => record.market))];
      if (search) {
        markets = markets.filter(m => m.toLowerCase().includes(search.toLowerCase()));
      }
      return markets.sort();
    } catch (error) {
      console.error('Error fetching markets:', error);
      return [];
    }
  }

  /**
   * Get commodities available in the dataset
   */
  async getCommodities(): Promise<string[]> {
    try {
      const response = await this.getMarketPrices({ limit: 2000 });
      const commodities = [...new Set(response.records.map(record => record.commodity))];
      console.log('API returned commodities:', commodities.length, commodities);
      return commodities.sort();
    } catch (error) {
      console.error('Error fetching commodities:', error);
      // Return fallback commodities
      return [
        'Wheat', 'Rice', 'Maize', 'Bajra', 'Jowar', 'Ragi', 'Pulses',
        'Potato', 'Tomato', 'Onion', 'Garlic', 'Ginger', 'Turmeric',
        'Cotton', 'Sugarcane', 'Tea', 'Coffee', 'Cardamom', 'Pepper'
      ].sort();
    }
  }

  /**
   * Get commodities available in a specific state/district/market (real-time, with search)
   */
  async getCommoditiesByState(state: string, district?: string, market?: string, search?: string): Promise<string[]> {
    try {
      const filters: MarketFilters = { state, limit: 10000 };
      if (district) filters.district = district;
      if (market) filters.market = market;
      const response = await this.getMarketPrices(filters);
      let commodities = [...new Set(response.records.map(record => record.commodity))];
      if (search) {
        commodities = commodities.filter(c => c.toLowerCase().includes(search.toLowerCase()));
      }
      return commodities.sort();
    } catch (error) {
      console.error('Error fetching commodities by state/district/market:', error);
      return [];
    }
  }

  /**
   * Get state-specific commodities as fallback
   */
  private getStateSpecificCommodities(state: string): string[] {
    const stateCommodities: { [key: string]: string[] } = {
      'West Bengal': ['Rice', 'Jute', 'Tea', 'Potato', 'Tomato', 'Onion', 'Mustard', 'Pulses'],
      'Maharashtra': ['Cotton', 'Sugarcane', 'Soybean', 'Tur', 'Wheat', 'Jowar', 'Bajra', 'Pulses'],
      'Punjab': ['Wheat', 'Rice', 'Cotton', 'Sugarcane', 'Maize', 'Pulses', 'Oilseeds'],
      'Uttar Pradesh': ['Wheat', 'Rice', 'Sugarcane', 'Potato', 'Pulses', 'Oilseeds', 'Cotton'],
      'Madhya Pradesh': ['Wheat', 'Soybean', 'Pulses', 'Oilseeds', 'Cotton', 'Sugarcane'],
      'Karnataka': ['Rice', 'Ragi', 'Jowar', 'Bajra', 'Cotton', 'Sugarcane', 'Coffee', 'Cardamom'],
      'Tamil Nadu': ['Rice', 'Sugarcane', 'Cotton', 'Pulses', 'Oilseeds', 'Coffee', 'Tea'],
      'Andhra Pradesh': ['Rice', 'Cotton', 'Sugarcane', 'Pulses', 'Oilseeds', 'Tobacco'],
      'Telangana': ['Rice', 'Cotton', 'Sugarcane', 'Pulses', 'Oilseeds', 'Maize'],
      'Gujarat': ['Cotton', 'Groundnut', 'Wheat', 'Pulses', 'Oilseeds', 'Sugarcane'],
      'Rajasthan': ['Wheat', 'Bajra', 'Jowar', 'Pulses', 'Oilseeds', 'Cotton'],
      'Bihar': ['Rice', 'Wheat', 'Maize', 'Pulses', 'Oilseeds', 'Sugarcane'],
      'Odisha': ['Rice', 'Pulses', 'Oilseeds', 'Sugarcane', 'Cotton'],
      'Assam': ['Rice', 'Tea', 'Jute', 'Pulses', 'Oilseeds'],
      'Jharkhand': ['Rice', 'Wheat', 'Maize', 'Pulses', 'Oilseeds'],
      'Chhattisgarh': ['Rice', 'Wheat', 'Pulses', 'Oilseeds', 'Sugarcane'],
      'Haryana': ['Wheat', 'Rice', 'Cotton', 'Sugarcane', 'Pulses', 'Oilseeds'],
      'Himachal Pradesh': ['Wheat', 'Maize', 'Rice', 'Pulses', 'Oilseeds'],
      'Uttarakhand': ['Rice', 'Wheat', 'Pulses', 'Oilseeds', 'Sugarcane'],
      'Jammu and Kashmir': ['Rice', 'Wheat', 'Maize', 'Pulses', 'Oilseeds'],
      'Ladakh': ['Barley', 'Wheat', 'Pulses', 'Oilseeds'],
      'Delhi': ['Wheat', 'Rice', 'Pulses', 'Oilseeds', 'Vegetables'],
      'Chandigarh': ['Wheat', 'Rice', 'Pulses', 'Oilseeds'],
      'Goa': ['Rice', 'Coconut', 'Cashew', 'Pulses', 'Oilseeds'],
      'Manipur': ['Rice', 'Pulses', 'Oilseeds', 'Vegetables'],
      'Meghalaya': ['Rice', 'Maize', 'Pulses', 'Oilseeds'],
      'Mizoram': ['Rice', 'Maize', 'Pulses', 'Oilseeds'],
      'Nagaland': ['Rice', 'Maize', 'Pulses', 'Oilseeds'],
      'Sikkim': ['Rice', 'Maize', 'Pulses', 'Oilseeds'],
      'Tripura': ['Rice', 'Jute', 'Pulses', 'Oilseeds'],
      'Arunachal Pradesh': ['Rice', 'Maize', 'Pulses', 'Oilseeds'],
      'Dadra and Nagar Haveli and Daman and Diu': ['Rice', 'Pulses', 'Oilseeds'],
      'Lakshadweep': ['Coconut', 'Pulses', 'Oilseeds'],
      'Puducherry': ['Rice', 'Pulses', 'Oilseeds'],
      'Andaman and Nicobar Islands': ['Rice', 'Pulses', 'Oilseeds']
    };

    return stateCommodities[state] || [
      'Wheat', 'Rice', 'Maize', 'Bajra', 'Jowar', 'Ragi', 'Pulses',
      'Potato', 'Tomato', 'Onion', 'Garlic', 'Ginger', 'Turmeric',
      'Cotton', 'Sugarcane', 'Tea', 'Coffee', 'Cardamom', 'Pepper'
    ];
  }

  /**
   * Get price trends for a specific commodity and market
   */
  async getPriceTrends(commodity: string, market: string, days: number = 30): Promise<MarketPriceRecord[]> {
    try {
      const response = await this.getMarketPrices({ 
        commodity, 
        market, 
        limit: days 
      });
      return response.records.sort((a, b) => 
        new Date(b.arrival_date).getTime() - new Date(a.arrival_date).getTime()
      );
    } catch (error) {
      console.error('Error fetching price trends:', error);
      return [];
    }
  }

  /**
   * Get latest prices for a commodity across markets
   */
  async getLatestPrices(commodity: string): Promise<MarketPriceRecord[]> {
    try {
      const response = await this.getMarketPrices({ 
        commodity, 
        limit: 100 
      });
      
      // Group by market and get the latest record for each
      const marketMap = new Map<string, MarketPriceRecord>();
      response.records.forEach(record => {
        const key = `${record.market}-${record.state}`;
        if (!marketMap.has(key) || 
            new Date(record.arrival_date) > new Date(marketMap.get(key)!.arrival_date)) {
          marketMap.set(key, record);
        }
      });
      
      return Array.from(marketMap.values());
    } catch (error) {
      console.error('Error fetching latest prices:', error);
      return [];
    }
  }

  /**
   * Calculate price statistics for a commodity
   */
  calculatePriceStats(records: MarketPriceRecord[]) {
    if (records.length === 0) return null;

    const prices = records.map(r => ({
      min: parseFloat(r.min_price),
      max: parseFloat(r.max_price),
      modal: parseFloat(r.modal_price)
    }));

    const allPrices = prices.flatMap(p => [p.min, p.max, p.modal]);
    const avgPrice = allPrices.reduce((sum, price) => sum + price, 0) / allPrices.length;
    const minPrice = Math.min(...allPrices);
    const maxPrice = Math.max(...allPrices);

    return {
      average: Math.round(avgPrice),
      minimum: minPrice,
      maximum: maxPrice,
      recordCount: records.length
    };
  }
}

export const marketService = new MarketService();
export default marketService; 
