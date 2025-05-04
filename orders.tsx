import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Check, X, Truck as TruckIcon, Clock } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import Typography from '@/constants/Typography';
import supabase from '@/utils/supabase';

// Define type for order item
type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

type OrderItem = {
  id: string;
  product_id: string;
  seller_id: string;
  price: number;
  status: OrderStatus;
  transaction_id: string;
  created_at: string;
  product: {
    name: string | null;
    image_url: string;
  };
  customer: {
    name: string;
    phone: string;
    address: string;
  };
};

// Mock data for orders
const MOCK_ORDERS: OrderItem[] = [
  {
    id: '1',
    product_id: 'p1',
    seller_id: 's1',
    price: 899,
    status: 'pending',
    transaction_id: 'tx_123456',
    created_at: '2025-05-02T10:30:00Z',
    product: {
      name: 'Blue Cotton Shirt',
      image_url: 'https://images.pexels.com/photos/297933/pexels-photo-297933.jpeg'
    },
    customer: {
      name: 'Rahul Singh',
      phone: '+919876543210',
      address: '123 Park Street, Mumbai, Maharashtra'
    }
  },
  {
    id: '2',
    product_id: 'p2',
    seller_id: 's1',
    price: 1299,
    status: 'confirmed',
    transaction_id: 'tx_789012',
    created_at: '2025-05-01T14:15:00Z',
    product: {
      name: 'Black Formal Shoes',
      image_url: 'https://images.pexels.com/photos/267320/pexels-photo-267320.jpeg'
    },
    customer: {
      name: 'Priya Patel',
      phone: '+919876543211',
      address: '456 MG Road, Bangalore, Karnataka'
    }
  },
  {
    id: '3',
    product_id: 'p3',
    seller_id: 's1',
    price: 499,
    status: 'shipped',
    transaction_id: 'tx_345678',
    created_at: '2025-04-30T09:45:00Z',
    product: {
      name: 'Floral Summer Dress',
      image_url: 'https://images.pexels.com/photos/2235071/pexels-photo-2235071.jpeg'
    },
    customer: {
      name: 'Ananya Sharma',
      phone: '+919876543212',
      address: '789 Civil Lines, Delhi'
    }
  },
  {
    id: '4',
    product_id: 'p4',
    seller_id: 's1',
    price: 349,
    status: 'delivered',
    transaction_id: 'tx_901234',
    created_at: '2025-04-28T16:20:00Z',
    product: {
      name: 'Printed T-Shirt',
      image_url: 'https://images.pexels.com/photos/1656684/pexels-photo-1656684.jpeg'
    },
    customer: {
      name: 'Vikram Mehta',
      phone: '+919876543213',
      address: '101 Salt Lake, Kolkata, West Bengal'
    }
  }
];

export default function OrdersScreen() {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<OrderStatus | 'all'>('all');
  
  // Load orders from API or use mock data
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        // In a real app, fetch from Supabase
        // const { data, error } = await supabase
        //   .from('orders')
        //   .select('*, product:products(name, image_url)')
        //   .eq('seller_id', 'current-seller-id');
        
        // if (error) throw error;
        
        // For this MVP, we'll use mock data
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate loading
        setOrders(MOCK_ORDERS);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, []);
  
  // Update order status
  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      // In a real app, update in Supabase
      // const { error } = await supabase
      //   .from('orders')
      //   .update({ status: newStatus })
      //   .eq('id', orderId);
      
      // if (error) throw error;
      
      // For this MVP, update local state
      setOrders(prev => 
        prev.map(order => 
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };
  
  // Get filtered orders based on selected tab
  const filteredOrders = selectedTab === 'all' 
    ? orders 
    : orders.filter(order => order.status === selectedTab);
  
  // Get status color
  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return Colors.light.warning;
      case 'confirmed': return Colors.light.secondary;
      case 'shipped': return Colors.light.primary;
      case 'delivered': return Colors.light.success;
      case 'cancelled': return Colors.light.error;
      default: return Colors.light.gray;
    }
  };
  
  // Get status icon
  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return <Clock size={16} color={Colors.light.warning} />;
      case 'confirmed': return <Check size={16} color={Colors.light.secondary} />;
      case 'shipped': return <TruckIcon size={16} color={Colors.light.primary} />;
      case 'delivered': return <Check size={16} color={Colors.light.success} />;
      case 'cancelled': return <X size={16} color={Colors.light.error} />;
      default: return null;
    }
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };
  
  // Render order item
  const renderOrderItem = ({ item }: { item: OrderItem }) => (
    <View style={styles.orderItem}>
      <View style={styles.orderHeader}>
        <View style={styles.orderIdContainer}>
          <Text style={styles.orderId}>Order #{item.id}</Text>
          <Text style={styles.orderDate}>{formatDate(item.created_at)}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          {getStatusIcon(item.status)}
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
        </View>
      </View>
      
      <View style={styles.productContainer}>
        <Image source={{ uri: item.product.image_url }} style={styles.productImage} />
        <View style={styles.productDetails}>
          <Text style={styles.productName}>{item.product.name}</Text>
          <Text style={styles.priceText}>₹{item.price.toLocaleString('en-IN')}</Text>
          <Text style={styles.transactionId}>Transaction: {item.transaction_id}</Text>
        </View>
      </View>
      
      <View style={styles.customerInfoContainer}>
        <Text style={styles.customerName}>{item.customer.name}</Text>
        <Text style={styles.customerDetails}>{item.customer.phone}</Text>
        <Text style={styles.customerDetails}>{item.customer.address}</Text>
      </View>
      
      <View style={styles.actionButtons}>
        {item.status === 'pending' && (
          <>
            <TouchableOpacity
              style={[styles.actionButton, styles.confirmButton]}
              onPress={() => updateOrderStatus(item.id, 'confirmed')}
            >
              <Text style={styles.actionButtonText}>Confirm Order</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={() => updateOrderStatus(item.id, 'cancelled')}
            >
              <Text style={styles.actionButtonText}>Cancel</Text>
            </TouchableOpacity>
          </>
        )}
        
        {item.status === 'confirmed' && (
          <TouchableOpacity
            style={[styles.actionButton, styles.shipButton]}
            onPress={() => updateOrderStatus(item.id, 'shipped')}
          >
            <TruckIcon size={16} color={Colors.light.white} />
            <Text style={styles.actionButtonText}>Mark as Shipped</Text>
          </TouchableOpacity>
        )}
        
        {item.status === 'shipped' && (
          <TouchableOpacity
            style={[styles.actionButton, styles.deliverButton]}
            onPress={() => updateOrderStatus(item.id, 'delivered')}
          >
            <Check size={16} color={Colors.light.white} />
            <Text style={styles.actionButtonText}>Mark as Delivered</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
  
  // Render tabs
  const renderTabs = () => (
    <View style={styles.tabsContainer}>
      {(['all', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'] as const).map((tab) => (
        <TouchableOpacity
          key={tab}
          style={[
            styles.tab,
            selectedTab === tab && styles.activeTab
          ]}
          onPress={() => setSelectedTab(tab)}
        >
          <Text 
            style={[
              styles.tabText,
              selectedTab === tab && styles.activeTabText
            ]}
          >
            {tab === 'all' ? 'All' : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
        <Text style={styles.loadingText}>Loading orders...</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      {renderTabs()}
      
      {filteredOrders.length > 0 ? (
        <FlatList
          data={filteredOrders}
          renderItem={renderOrderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No {selectedTab === 'all' ? '' : selectedTab} orders found</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
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
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.lightGray,
    backgroundColor: Colors.light.white,
    ...Platform.select({
      web: {
        overflow: 'auto',
        flexWrap: 'nowrap',
      },
    }),
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    ...Platform.select({
      web: {
        minWidth: 100,
      },
      default: {
        flex: 1,
      },
    }),
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.light.primary,
  },
  tabText: {
    fontSize: Typography.sizes.small,
    color: Colors.light.gray,
    fontWeight: '500',
  },
  activeTabText: {
    color: Colors.light.primary,
    fontWeight: '600',
  },
  listContainer: {
    padding: 15,
  },
  orderItem: {
    backgroundColor: Colors.light.white,
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
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
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  orderIdContainer: {
    flex: 1,
  },
  orderId: {
    fontSize: Typography.sizes.medium,
    fontWeight: '600',
    color: Colors.light.text,
  },
  orderDate: {
    fontSize: Typography.sizes.small,
    color: Colors.light.gray,
    marginTop: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  statusText: {
    fontSize: Typography.sizes.small,
    fontWeight: '500',
    marginLeft: 5,
  },
  productContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.lightGray,
    paddingBottom: 15,
    marginBottom: 15,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: Colors.light.lightGray,
  },
  productDetails: {
    marginLeft: 15,
    flex: 1,
  },
  productName: {
    fontSize: Typography.sizes.medium,
    fontWeight: '500',
    color: Colors.light.text,
    marginBottom: 5,
  },
  priceText: {
    fontSize: Typography.sizes.large,
    fontWeight: '700',
    color: Colors.light.primary,
    marginBottom: 5,
  },
  transactionId: {
    fontSize: Typography.sizes.small,
    color: Colors.light.gray,
  },
  customerInfoContainer: {
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.lightGray,
    marginBottom: 15,
  },
  customerName: {
    fontSize: Typography.sizes.medium,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 5,
  },
  customerDetails: {
    fontSize: Typography.sizes.small,
    color: Colors.light.gray,
    marginBottom: 3,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  confirmButton: {
    backgroundColor: Colors.light.secondary,
  },
  cancelButton: {
    backgroundColor: Colors.light.error,
  },
  shipButton: {
    backgroundColor: Colors.light.primary,
  },
  deliverButton: {
    backgroundColor: Colors.light.success,
  },
  actionButtonText: {
    color: Colors.light.white,
    fontWeight: '600',
    fontSize: Typography.sizes.small,
    marginLeft: 5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: Typography.sizes.medium,
    color: Colors.light.gray,
    textAlign: 'center',
  },
});