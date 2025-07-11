import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Leaf, 
  TrendingUp, 
  AlertTriangle, 
  CloudSun, 
  ShieldCheck,
  Calendar,
  MapPin,
  Camera,
  DollarSign,
  Users
} from 'lucide-react';
import cropDiagnosisImage from '@/assets/crop-diagnosis.jpg';
import weatherSatelliteImage from '@/assets/weather-satellite.jpg';
import farmerTechImage from '@/assets/farmer-tech.jpg';

const Dashboard = () => {
  const navigate = useNavigate();
  
  const [weatherData, setWeatherData] = useState({
    temperature: '28°C',
    humidity: '65%',
    rainfall: '12mm',
    condition: 'Partly Cloudy'
  });

  const [farmData, setFarmData] = useState({
    totalArea: '5.2 hectares',
    currentCrops: 3,
    healthScore: 85,
    yieldPrediction: '+23%'
  });

  const recentAlerts = [
    {
      id: 1,
      type: 'disease',
      severity: 'medium',
      message: 'Early blight detected in tomato crop - Block A',
      time: '2 hours ago'
    },
    {
      id: 2,
      type: 'weather',
      severity: 'low',
      message: 'Light rain expected in 3 days - Good for wheat',
      time: '5 hours ago'
    },
    {
      id: 3,
      type: 'insurance',
      severity: 'low',
      message: 'Kharif insurance renewal due in 15 days',
      time: '1 day ago'
    }
  ];

  const quickActions = [
    {
      title: 'Crop Health Check',
      description: 'Upload plant image for AI diagnosis',
      icon: Camera,
      action: 'diagnosis',
      image: cropDiagnosisImage,
      route: '/crop-health'
    },
    {
      title: 'Weather Forecast',
      description: '7-day satellite weather data',
      icon: CloudSun,
      action: 'weather',
      image: weatherSatelliteImage,
      route: '/weather'
    },
    {
      title: 'Market Prices',
      description: 'Current mandi rates & trends',
      icon: DollarSign,
      action: 'market',
      image: farmerTechImage,
      route: '/crop-planning'
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-400 bg-red-400/20';
      case 'medium': return 'text-yellow-400 bg-yellow-400/20';
      case 'low': return 'text-green-400 bg-green-400/20';
      default: return 'text-primary bg-primary/20';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold hero-text">Farm Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here's what's happening on your farm today.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Pune, Maharashtra</span>
          <Badge variant="outline" className="text-xs">
            <Calendar className="h-3 w-3 mr-1" />
            Kharif Season
          </Badge>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="agri-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Farm Area</CardTitle>
            <Leaf className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{farmData.totalArea}</div>
            <p className="text-xs text-muted-foreground">
              {farmData.currentCrops} active crops
            </p>
          </CardContent>
        </Card>

        <Card className="agri-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Health Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{farmData.healthScore}%</div>
            <Progress value={farmData.healthScore} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="agri-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Temperature</CardTitle>
            <CloudSun className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{weatherData.temperature}</div>
            <p className="text-xs text-muted-foreground">{weatherData.condition}</p>
          </CardContent>
        </Card>

        <Card className="agri-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Yield Prediction</CardTitle>
            <ShieldCheck className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-agri-lime">{farmData.yieldPrediction}</div>
            <p className="text-xs text-muted-foreground">vs last season</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="agri-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Quick Actions</span>
          </CardTitle>
          <CardDescription>
            Essential farming tools at your fingertips
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <div key={action.action} className="relative group cursor-pointer" onClick={() => navigate(action.route)}>
                  <div 
                    className="relative h-48 rounded-xl overflow-hidden bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
                    style={{ backgroundImage: `url(${action.image})` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent"></div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Icon className="h-5 w-5 text-primary" />
                        <span className="font-semibold text-foreground">{action.title}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{action.description}</p>
                      <Button size="sm" className="gradient-primary">
                        Try Now
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Alerts & Weather */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="agri-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5" />
              <span>Recent Alerts</span>
            </CardTitle>
            <CardDescription>
              Important notifications for your farm
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentAlerts.map((alert) => (
              <div key={alert.id} className="flex items-start space-x-3 p-3 rounded-lg bg-secondary/50">
                <Badge className={`${getSeverityColor(alert.severity)} border-0`}>
                  {alert.severity}
                </Badge>
                <div className="flex-1">
                  <p className="text-sm font-medium">{alert.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">{alert.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="agri-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CloudSun className="h-5 w-5" />
              <span>Weather Overview</span>
            </CardTitle>
            <CardDescription>
              Current conditions and forecast
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Temperature</p>
                <p className="text-2xl font-bold text-primary">{weatherData.temperature}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Humidity</p>
                <p className="text-2xl font-bold text-primary">{weatherData.humidity}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Rainfall</p>
                <p className="text-2xl font-bold text-primary">{weatherData.rainfall}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Condition</p>
                <p className="text-lg font-medium text-primary">{weatherData.condition}</p>
              </div>
            </div>
            <Button className="w-full mt-4 gradient-accent" onClick={() => navigate('/weather')}>
              View 7-Day Forecast
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
