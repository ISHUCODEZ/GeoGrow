import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  CloudSun, 
  Droplets, 
  Wind, 
  Thermometer,
  Eye,
  Sunrise,
  Sunset,
  MapPin,
  Calendar,
  Satellite,
  AlertTriangle,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import weatherSatelliteImage from '@/assets/weather-satellite.jpg';
import { weatherService, WeatherData, ForecastDay } from '@/services/weatherService';
import { satelliteService, SatelliteData } from '@/services/satelliteService';
import { smsService } from '@/services/smsService';
import { useLocation } from '@/hooks/useLocation';
import { useToast } from '@/hooks/use-toast';

const Weather = () => {
  const navigate = useNavigate();
  const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastDay[]>([]);
  const [satelliteData, setSatelliteData] = useState<SatelliteData | null>(null);
  const [alerts, setAlerts] = useState([
    {
      id: 1,
      type: 'warning',
      title: 'Heavy Rainfall Alert',
      message: 'Heavy rainfall expected in next 48 hours. Protect your crops from waterlogging.',
      validUntil: '2 days'
    },
    {
      id: 2,
      type: 'info',
      title: 'Optimal Irrigation Time',
      message: 'Good time to reduce irrigation as natural rainfall is expected.',
      validUntil: '5 days'
    }
  ]);

  const { location, loading, error, setLocationByPlaceName, useGPSLocation: gpsLocation } = useLocation();
  const [manualMode, setManualMode] = useState(false);
  const [placeName, setPlaceName] = useState('');
  const [usingManual, setUsingManual] = useState(false);

  const { toast } = useToast();

  const loadWeatherData = useCallback(async () => {
    try {
      const lat = location?.latitude || 18.5204;
      const lon = location?.longitude || 73.8567;
      const [weatherData, forecastData] = await Promise.all([
        weatherService.getCurrentWeather(lat, lon),
        weatherService.getWeatherForecast(lat, lon)
      ]);
      setCurrentWeather(weatherData);
      setForecast(forecastData);
      if (forecastData.some(day => day.rain > 80)) {
        await smsService.sendWeatherAlert({
          temperature: weatherData.temperature,
          condition: weatherData.condition,
          humidity: weatherData.humidity,
          rainChance: Math.max(...forecastData.map(d => d.rain))
        });
      }
    } catch (error) {
      console.error('Weather data loading error:', error);
      toast({
        title: "Weather Update Failed",
        description: "Using cached weather data. Please try refreshing.",
        variant: "destructive"
      });
    }
  }, [location, toast]);

  const loadSatelliteData = useCallback(async () => {
    try {
      const lat = location?.latitude || 18.5204;
      const lon = location?.longitude || 73.8567;
      const data = await satelliteService.getSatelliteData(lat, lon);
      setSatelliteData(data);
    } catch (error) {
      console.error('Satellite data loading error:', error);
    }
  }, [location]);

  useEffect(() => {
    if (location) {
      loadWeatherData();
      loadSatelliteData();
    }
  }, [location, loadWeatherData, loadSatelliteData]);

  const handleRefresh = () => {
    if (location) {
      loadWeatherData();
      loadSatelliteData();
      toast({
        title: "Refreshing Data",
        description: "Getting latest weather and satellite information..."
      });
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!placeName.trim()) {
      toast({ title: 'Error', description: 'Please enter a place name.', variant: 'destructive' });
      return;
    }
    setUsingManual(true);
    await setLocationByPlaceName(placeName.trim());
    setManualMode(false);
  };

  const handleUseAuto = () => {
    setUsingManual(false);
    setPlaceName('');
    setManualMode(false);
    gpsLocation();
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'warning': return 'text-yellow-400 bg-yellow-400/20';
      case 'danger': return 'text-red-400 bg-red-400/20';
      case 'info': return 'text-blue-400 bg-blue-400/20';
      default: return 'text-primary bg-primary/20';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold hero-text">Weather & Satellite</h1>
          <p className="text-muted-foreground mt-1">
            Real-time weather conditions and satellite monitoring for your farm
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {location ? `${location.city}, ${location.state}` : 'Loading location...'}
          </span>
          <Badge variant="outline" className="text-xs">
            <Satellite className="h-3 w-3 mr-1" />
            Live Data
          </Badge>
          <Button size="sm" variant="outline" onClick={() => setManualMode((m) => !m)} className="ml-2">
            {manualMode ? 'Cancel' : 'Enter Place Name'}
          </Button>
          {usingManual && (
            <Button size="sm" variant="secondary" className="ml-2" onClick={handleUseAuto}>
              Use My Location
            </Button>
          )}
        </div>
      </div>
      {manualMode && (
        <form className="my-4 flex flex-col md:flex-row items-center gap-2" onSubmit={handleManualSubmit}>
          <Input
            type="text"
            placeholder="Enter place name (e.g. Pune, Maharashtra)"
            value={placeName}
            onChange={e => setPlaceName(e.target.value)}
            className="w-64"
            required
          />
          <Button type="submit" size="sm" className="ml-2">Set Location</Button>
        </form>
      )}
      {error && (
        <div className="my-4 text-center text-red-500">{error.message}</div>
      )}

      {/* Current Weather */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 agri-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CloudSun className="h-5 w-5" />
              <span>Current Weather</span>
            </CardTitle>
            <CardDescription>Real-time conditions at your location</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-48">
                <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Loading weather data...</span>
              </div>
            ) : currentWeather ? (
              <>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <div className="text-4xl font-bold text-primary mb-2">
                      {currentWeather.temperature}°C
                    </div>
                    <p className="text-lg text-muted-foreground">{currentWeather.condition}</p>
                  </div>
                  <div className="text-6xl">⛅</div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 rounded-lg bg-secondary/50">
                    <Droplets className="h-5 w-5 text-primary mx-auto mb-1" />
                    <p className="text-xs text-muted-foreground">Humidity</p>
                    <p className="font-semibold">{currentWeather.humidity}%</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-secondary/50">
                    <Wind className="h-5 w-5 text-primary mx-auto mb-1" />
                    <p className="text-xs text-muted-foreground">Wind</p>
                    <p className="font-semibold">{currentWeather.windSpeed} km/h</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-secondary/50">
                    <Eye className="h-5 w-5 text-primary mx-auto mb-1" />
                    <p className="text-xs text-muted-foreground">Visibility</p>
                    <p className="font-semibold">{currentWeather.visibility} km</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-secondary/50">
                    <Thermometer className="h-5 w-5 text-primary mx-auto mb-1" />
                    <p className="text-xs text-muted-foreground">Pressure</p>
                    <p className="font-semibold">{currentWeather.pressure} mb</p>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-4 pt-4 border-t border-border/50">
                  <div className="flex items-center space-x-2">
                    <Sunrise className="h-4 w-4 text-yellow-400" />
                    <span className="text-sm">Sunrise: {currentWeather.sunrise}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Sunset className="h-4 w-4 text-orange-400" />
                    <span className="text-sm">Sunset: {currentWeather.sunset}</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center text-muted-foreground">
                Failed to load weather data. Please try refreshing.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Satellite Data */}
        <Card className="agri-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Satellite className="h-5 w-5" />
              <span>Satellite Data</span>
            </CardTitle>
            <CardDescription>Farm monitoring from space</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div 
              className="h-32 rounded-lg bg-cover bg-center mb-4"
              style={{ backgroundImage: `url(${weatherSatelliteImage})` }}
            >
              <div className="h-full bg-black/20 rounded-lg flex items-center justify-center">
                <Badge variant="secondary">Live Satellite View</Badge>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Soil Moisture</span>
                <span className="font-semibold text-primary">
                  {satelliteData ? `${Math.round(satelliteData.soilMoisture)}%` : 'Loading...'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Crop Health</span>
                <span className="font-semibold text-primary">
                  {satelliteData ? `${Math.round(satelliteData.cropHealth)}%` : 'Loading...'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Vegetation Index</span>
                <span className="font-semibold text-primary">
                  {satelliteData ? satelliteData.vegetationIndex.toFixed(2) : 'Loading...'}
                </span>
              </div>
            </div>

            <p className="text-xs text-muted-foreground border-t border-border/50 pt-2">
              Last updated: {satelliteData?.lastUpdated || 'Loading...'}
            </p>
            
            {satelliteData?.geospatialAnalysis && (
              <div className="mt-4 space-y-2">
                <h4 className="text-sm font-medium">Field Analysis</h4>
                <div className="text-xs space-y-1">
                  <p>Fields detected: {satelliteData.geospatialAnalysis.fieldBoundaries.length}</p>
                  <p>Health score: {satelliteData.geospatialAnalysis.healthAnalysis.overallHealth}%</p>
                  <p>Stress areas: {satelliteData.geospatialAnalysis.healthAnalysis.stressAreas.length}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 7-Day Forecast */}
      <Card className="agri-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>7-Day Forecast</span>
          </CardTitle>
          <CardDescription>Extended weather outlook for farm planning</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
            {forecast.map((day, index) => (
              <div key={day.day} className="text-center p-4 rounded-lg bg-secondary/50 hover:bg-secondary/70 transition-colors">
                <p className="text-sm font-medium mb-2">{day.day}</p>
                <div className="text-3xl mb-2">{day.icon}</div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold">{day.high}°</p>
                  <p className="text-xs text-muted-foreground">{day.low}°</p>
                  <div className="flex items-center justify-center space-x-1">
                    <Droplets className="h-3 w-3 text-blue-400" />
                    <span className="text-xs">{day.rain}%</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{day.condition}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Weather Alerts */}
      <Card className="agri-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5" />
            <span>Weather Alerts</span>
          </CardTitle>
          <CardDescription>Important weather notifications for your farm</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {alerts.map((alert) => (
            <div key={alert.id} className="flex items-start space-x-3 p-4 rounded-lg bg-secondary/50">
              <Badge className={`${getAlertColor(alert.type)} border-0`}>
                {alert.type}
              </Badge>
              <div className="flex-1">
                <h4 className="font-semibold mb-1">{alert.title}</h4>
                <p className="text-sm text-muted-foreground mb-2">{alert.message}</p>
                <p className="text-xs text-muted-foreground">Valid for: {alert.validUntil}</p>
              </div>
            </div>
          ))}
          
          <Button 
            className="w-full gradient-primary"
            onClick={() => {
              toast({
                title: "Weather Alerts",
                description: "Custom weather alert settings will be available soon!",
              });
            }}
          >
            Set Custom Weather Alerts
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Weather;
