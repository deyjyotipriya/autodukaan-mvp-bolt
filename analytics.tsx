import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { ArrowUp, TrendingUp, ShoppingBag, Currency as CurrencyRupee, ChartBar as BarChart2, Calendar } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import Typography from '@/constants/Typography';
import supabase from '@/utils/supabase';

// Define type for analytics data
type AnalyticsData = {
  totalRevenue: number;
  totalOrders: number;
  gmv: number;
  averageOrderValue: number;
  revenueByDay: {
    labels: string[];
    datasets: {
      data: number[];
    }[];
  };
  ordersByDay: {
    labels: string[];
    datasets: {
      data: number[];
    }[];
  };
  productPerformance: {
    labels: string[];
    datasets: {
      data: number[];
    }[];
  };
};

// Mock analytics data
const MOCK_ANALYTICS: AnalyticsData = {
  totalRevenue: 23546,
  totalOrders: 42,
  gmv: 28950,
  averageOrderValue: 560.62,
  revenueByDay: {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        data: [2500, 3800, 2200, 4500, 3100, 5200, 2246],
      },
    ],
  },
  ordersByDay: {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        data: [5, 8, 4, 9, 6, 7, 3],
      },
    ],
  },
  productPerformance: {
    labels: ['Shirts', 'Shoes', 'Dresses', 'T-Shirts', 'Jeans'],
    datasets: [
      {
        data: [8500, 6200, 4800, 2300, 1746],
      },
    ],
  },
};

// Chart component that handles platform differences
const ChartComponent = ({ 
  type, 
  data, 
  width, 
  height, 
  chartConfig, 
  style,
  ...props 
}: { 
  type: 'line' | 'bar',
  data: any,
  width: number,
  height: number,
  chartConfig: any,
  style: any,
  [key: string]: any
}) => {
  if (Platform.OS === 'web') {
    // For web, render a simple placeholder
    return (
      <View style={[style, { height, width, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: Colors.light.gray }}>Chart visualization not available on web</Text>
      </View>
    );
  }

  // For native platforms, render the actual chart
  const ChartType = type === 'line' ? LineChart : BarChart;
  return (
    <ChartType
      data={data}
      width={width}
      height={height}
      chartConfig={chartConfig}
      style={style}
      {...props}
    />
  );
};

export default function AnalyticsScreen() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'year'>('week');
  
  const screenWidth = Dimensions.get('window').width - 40;
  
  // Load analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        // In a real app, fetch from Supabase
        // Calculate based on timeframe
        // const { data, error } = await supabase.rpc('get_analytics', { timeframe });
        
        // For this MVP, we'll use mock data
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate loading
        setAnalyticsData(MOCK_ANALYTICS);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnalytics();
  }, [timeframe]);
  
  // Chart configuration
  const chartConfig = {
    backgroundGradientFrom: Colors.light.white,
    backgroundGradientTo: Colors.light.white,
    color: (opacity = 1) => `rgba(255, 87, 34, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
    decimalPlaces: 0,
    labelColor: () => Colors.light.gray,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: Colors.light.primary,
    },
  };
  
  // Render time frame selector
  const renderTimeframeSelector = () => (
    <View style={styles.timeframeContainer}>
      <TouchableOpacity
        style={[styles.timeframeButton, timeframe === 'week' && styles.activeTimeframe]}
        onPress={() => setTimeframe('week')}
      >
        <Text style={[styles.timeframeText, timeframe === 'week' && styles.activeTimeframeText]}>
          Week
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.timeframeButton, timeframe === 'month' && styles.activeTimeframe]}
        onPress={() => setTimeframe('month')}
      >
        <Text style={[styles.timeframeText, timeframe === 'month' && styles.activeTimeframeText]}>
          Month
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.timeframeButton, timeframe === 'year' && styles.activeTimeframe]}
        onPress={() => setTimeframe('year')}
      >
        <Text style={[styles.timeframeText, timeframe === 'year' && styles.activeTimeframeText]}>
          Year
        </Text>
      </TouchableOpacity>
    </View>
  );
  
  // Render metric card
  const renderMetricCard = (
    title: string, 
    value: string | number, 
    icon: React.ReactNode,
    trend?: { value: number; isPositive: boolean }
  ) => (
    <View style={styles.metricCard}>
      <View style={styles.metricIconContainer}>
        {icon}
      </View>
      <View style={styles.metricTextContainer}>
        <Text style={styles.metricTitle}>{title}</Text>
        <Text style={styles.metricValue}>{value}</Text>
        {trend && (
          <View style={styles.trendContainer}>
            {trend.isPositive ? (
              <ArrowUp size={12} color={Colors.light.success} />
            ) : (
              <ArrowUp size={12} color={Colors.light.error} style={{ transform: [{ rotate: '180deg' }] }} />
            )}
            <Text 
              style={[
                styles.trendText, 
                { color: trend.isPositive ? Colors.light.success : Colors.light.error }
              ]}
            >
              {trend.value}%
            </Text>
          </View>
        )}
      </View>
    </View>
  );
  
  if (loading || !analyticsData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
        <Text style={styles.loadingText}>Loading analytics...</Text>
      </View>
    );
  }
  
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Business Analytics</Text>
        {renderTimeframeSelector()}
      </View>
      
      <View style={styles.overviewContainer}>
        <Text style={styles.sectionTitle}>Overview</Text>
        <View style={styles.metricsContainer}>
          {renderMetricCard(
            'Total Revenue', 
            `₹${analyticsData.totalRevenue.toLocaleString('en-IN')}`,
            <CurrencyRupee size={24} color={Colors.light.primary} />,
            { value: 12.5, isPositive: true }
          )}
          {renderMetricCard(
            'GMV', 
            `₹${analyticsData.gmv.toLocaleString('en-IN')}`,
            <TrendingUp size={24} color={Colors.light.secondary} />,
            { value: 8.2, isPositive: true }
          )}
          {renderMetricCard(
            'Total Orders', 
            analyticsData.totalOrders,
            <ShoppingBag size={24} color={Colors.light.accent} />,
            { value: 5.1, isPositive: true }
          )}
          {renderMetricCard(
            'Avg. Order Value', 
            `₹${analyticsData.averageOrderValue.toLocaleString('en-IN')}`,
            <BarChart2 size={24} color="#9C27B0" />,
            { value: 3.2, isPositive: false }
          )}
        </View>
      </View>
      
      <View style={styles.chartContainer}>
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>Revenue Trend</Text>
          <Calendar size={20} color={Colors.light.gray} />
        </View>
        <ChartComponent
          type="line"
          data={analyticsData.revenueByDay}
          width={screenWidth}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
          formatYLabel={(value: string) => `₹${parseInt(value).toLocaleString('en-IN')}`}
        />
      </View>
      
      <View style={styles.chartContainer}>
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>Orders by Day</Text>
          <Calendar size={20} color={Colors.light.gray} />
        </View>
        <ChartComponent
          type="line"
          data={analyticsData.ordersByDay}
          width={screenWidth}
          height={220}
          chartConfig={{
            ...chartConfig,
            color: (opacity = 1) => `rgba(30, 136, 229, ${opacity})`,
          }}
          bezier
          style={styles.chart}
        />
      </View>
      
      <View style={styles.chartContainer}>
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>Product Category Performance</Text>
          <Calendar size={20} color={Colors.light.gray} />
        </View>
        <ChartComponent
          type="bar"
          data={analyticsData.productPerformance}
          width={screenWidth}
          height={220}
          chartConfig={{
            ...chartConfig,
            color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
          }}
          style={styles.chart}
          verticalLabelRotation={30}
          fromZero
        />
      </View>
      
      <View style={styles.subscriptionContainer}>
        <Text style={styles.subscriptionTitle}>Current Plan</Text>
        <View style={styles.planCard}>
          <View style={styles.planHeader}>
            <Text style={styles.planName}>Free Tier</Text>
            <View style={styles.planBadge}>
              <Text style={styles.planBadgeText}>Active</Text>
            </View>
          </View>
          <View style={styles.planDetails}>
            <Text style={styles.planPrice}>₹0<Text style={styles.planPeriod}>/month</Text></Text>
            <Text style={styles.planDescription}>
              Basic features for small businesses getting started with online selling
            </Text>
          </View>
          <View style={styles.planFeatures}>
            <Text style={styles.featureItem}>• Up to 100 product listings</Text>
            <Text style={styles.featureItem}>• Basic analytics</Text>
            <Text style={styles.featureItem}>• WhatsApp support</Text>
            <Text style={styles.featureItem}>• Livestream to catalog (5s interval)</Text>
          </View>
          <TouchableOpacity style={styles.upgradePlanButton}>
            <Text style={styles.upgradePlanText}>Upgrade Plan</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: Typography.sizes.medium,
    color: Colors.light.text,
  },
  headerContainer: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: Typography.sizes.xxl,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 15,
  },
  timeframeContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.light.lightGray,
    borderRadius: 30,
    padding: 4,
  },
  timeframeButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 25,
  },
  activeTimeframe: {
    backgroundColor: Colors.light.white,
    ...Platform.select({
      ios: {
        shadowColor: Colors.light.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  timeframeText: {
    fontSize: Typography.sizes.small,
    color: Colors.light.gray,
    fontWeight: '500',
  },
  activeTimeframeText: {
    color: Colors.light.text,
    fontWeight: '600',
  },
  overviewContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: Typography.sizes.large,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 15,
  },
  metricsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricCard: {
    backgroundColor: Colors.light.white,
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    width: '48%',
    ...Platform.select({
      ios: {
        shadowColor: Colors.light.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  metricIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.light.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  metricTextContainer: {
    flex: 1,
  },
  metricTitle: {
    fontSize: Typography.sizes.small,
    color: Colors.light.gray,
    marginBottom: 5,
  },
  metricValue: {
    fontSize: Typography.sizes.large,
    fontWeight: '700',
    color: Colors.light.text,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  trendText: {
    fontSize: Typography.sizes.xs,
    fontWeight: '500',
    marginLeft: 3,
  },
  chartContainer: {
    backgroundColor: Colors.light.white,
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: Colors.light.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  chartTitle: {
    fontSize: Typography.sizes.medium,
    fontWeight: '600',
    color: Colors.light.text,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  subscriptionContainer: {
    marginTop: 10,
  },
  subscriptionTitle: {
    fontSize: Typography.sizes.large,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 15,
  },
  planCard: {
    backgroundColor: Colors.light.white,
    borderRadius: 12,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: Colors.light.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  planName: {
    fontSize: Typography.sizes.large,
    fontWeight: '700',
    color: Colors.light.text,
  },
  planBadge: {
    backgroundColor: Colors.light.success + '20',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  planBadgeText: {
    color: Colors.light.success,
    fontSize: Typography.sizes.xs,
    fontWeight: '600',
  },
  planDetails: {
    marginBottom: 20,
  },
  planPrice: {
    fontSize: Typography.sizes.xxxl,
    fontWeight: '700',
    color: Colors.light.primary,
    marginBottom: 10,
  },
  planPeriod: {
    fontSize: Typography.sizes.small,
    color: Colors.light.gray,
    fontWeight: '400',
  },
  planDescription: {
    fontSize: Typography.sizes.small,
    color: Colors.light.gray,
    lineHeight: 20,
  },
  planFeatures: {
    marginBottom: 20,
  },
  featureItem: {
    fontSize: Typography.sizes.medium,
    color: Colors.light.text,
    marginBottom: 8,
  },
  upgradePlanButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  upgradePlanText: {
    color: Colors.light.white,
    fontSize: Typography.sizes.medium,
    fontWeight: '600',
  },
});