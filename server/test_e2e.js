const API_BASE = 'http://localhost:5000/api';

async function runTests() {
  console.log('🧪 Starting Full System Integration Tests for Jutar Ghor...\n');
  let passed = 0;
  let total = 0;

  function assert(condition, testName) {
    total++;
    if (condition) {
      console.log(`  ✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${testName}`);
      throw new Error(`Assertion failed: ${testName}`);
    }
  }

  try {
    const testId = Date.now().toString().slice(-5);

    // Test 1: API Health Check
    console.log('1. Testing System Health & Currency...');
    const healthRes = await fetch(`${API_BASE}/health`);
    const health = await healthRes.json();
    assert(healthRes.status === 200, 'Health check returns status 200');
    assert(health.store.includes('Jutar Ghor'), 'Store branding is Jutar Ghor');
    assert(health.currency === 'BDT (৳)', 'Currency is Bangladeshi Taka (৳)');

    // Test 2: Admin Login & Authorization
    console.log('\n2. Testing Admin Authentication & RBAC...');
    const loginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@jutarghor.com',
        password: 'admin123',
      }),
    });
    const loginData = await loginRes.json();
    assert(loginRes.status === 200, 'Admin login succeeds');
    assert(loginData.user.role === 'admin', 'User has admin role');
    const adminToken = loginData.token;
    assert(!!adminToken, 'JWT bearer token received');

    // Test 3: Unauthorized route protection
    console.log('\n3. Testing Security & Route Protection...');
    const unauthRes = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Hack Shoe' }),
    });
    assert(unauthRes.status === 401, 'Protected route rejects unauthorized requests with 401');

    // Test 4: Product Creation (with multi-image & size/color inventory variants)
    console.log('\n4. Testing Product Creation CRUD...');
    const testShoePayload = {
      name: `Automated Sneaker ${testId}`,
      sku: `AUTO-${testId}`,
      brand_id: 1, // Nike
      category_id: 1, // Sneakers
      gender: 'Men',
      regular_price: 2500,
      sale_price: 2200,
      short_description: 'E2E automated test sneaker for stock verification.',
      description: 'Full description for automated test shoe.',
      is_featured: 1,
      is_trending: 1,
      is_new_arrival: 1,
      is_active: 1,
      images: [
        { image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600', is_primary: 1 },
      ],
      variants: [
        { size: '41', color: 'Volt Green', color_hex: '#00FF00', sku: `AUTO-${testId}-41-GRN`, stock_quantity: 5 },
        { size: '42', color: 'Volt Green', color_hex: '#00FF00', sku: `AUTO-${testId}-42-GRN`, stock_quantity: 4 },
      ]
    };

    const createRes = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify(testShoePayload),
    });
    const createData = await createRes.json();
    assert(createRes.status === 201, 'Product created in database with 201 status');
    const newProductId = createData.product_id;
    const newProductSlug = createData.slug;
    assert(!!newProductId && !!newProductSlug, 'Created product returns ID and Slug');

    // Test 5: Fetch Created Product & Verify Variants
    console.log('\n5. Testing Product Retrieval & Database Verification...');
    const getRes = await fetch(`${API_BASE}/products/${newProductSlug}`);
    const getData = await getRes.json();
    assert(getRes.status === 200, 'Created product retrieved by slug');
    assert(getData.product.name === testShoePayload.name, 'Retrieved product name matches');
    assert(getData.product.variants.length === 2, 'Both size/color variants stored in database');
    const var42 = getData.product.variants.find(v => v.size === '42');
    assert(var42 && var42.stock_quantity === 4, 'Variant 42 has initial stock of 4');

    // Test 6: Product Editing
    console.log('\n6. Testing Product Update...');
    const updateRes = await fetch(`${API_BASE}/products/${newProductId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        sale_price: 2100,
        short_description: 'Updated short description.',
      }),
    });
    assert(updateRes.status === 200, 'Product update returns 200 status');
    const updatedRes = await fetch(`${API_BASE}/products/${newProductSlug}`);
    const updatedData = await updatedRes.json();
    assert(updatedData.product.sale_price === 2100, 'Product sale price updated in database to ৳2100');

    // Test 7: Order Placement & Inventory Stock Decrement
    console.log('\n7. Testing Order Placement & Atomic Stock Decrement...');
    const orderPayload = {
      customer_name: 'Test Customer BD',
      customer_phone: '01799887766',
      customer_email: 'testcustomer@gmail.com',
      district: 'Dhaka',
      area: 'Gulshan 2',
      full_address: 'House 10, Road 45, Gulshan, Dhaka-1212',
      payment_method: 'cod',
      items: [
        {
          product_id: newProductId,
          variant_id: var42.id,
          quantity: 1, // Order 1 pair (৳2,100 < ৳4,000 threshold -> Dhaka delivery fee ৳80)
        }
      ]
    };

    const orderRes = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderPayload),
    });
    const orderData = await orderRes.json();
    assert(orderRes.status === 201, 'Order created successfully with 201 status');
    const orderNumber = orderData.order.order_number;
    const orderId = orderData.order.id;
    assert(orderNumber.startsWith('JG-2026-'), 'Order generated valid JG-2026-XXXXX order number');
    assert(orderData.order.delivery_fee === 80, `Dhaka order correctly charged ৳80 delivery fee (Actual: ${orderData.order.delivery_fee})`);

    // Verify stock was decremented from 4 to 3 in database!
    const stockAfterOrderRes = await fetch(`${API_BASE}/products/${newProductSlug}`);
    const stockAfterOrder = await stockAfterOrderRes.json();
    const var42After = stockAfterOrder.product.variants.find(v => v.size === '42');
    assert(var42After.stock_quantity === 3, `Inventory decremented atomically from 4 to 3 (Current: ${var42After.stock_quantity})`);

    // Test 8: Prevent Overselling
    console.log('\n8. Testing Overselling Prevention...');
    const oversellRes = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer_name: 'Greedy Buyer',
        customer_phone: '01711223344',
        district: 'Dhaka',
        area: 'Banani',
        full_address: 'Road 5',
        payment_method: 'cod',
        items: [
          {
            product_id: newProductId,
            variant_id: var42.id,
            quantity: 10, // Request 10 when only 3 left!
          }
        ]
      }),
    });
    const oversellData = await oversellRes.json();
    assert(oversellRes.status === 400, 'Server blocked order exceeding inventory with 400 Bad Request');
    assert(oversellData.error.includes('Insufficient stock'), 'Returns clear inventory shortage message');

    // Test 9: Public Order Tracking
    console.log('\n9. Testing Order Tracking by Order Number...');
    const trackRes = await fetch(`${API_BASE}/orders/track/${orderNumber}`);
    const trackData = await trackRes.json();
    assert(trackRes.status === 200, 'Order tracking returns order data');
    assert(trackData.order.customer_name === 'Test Customer BD', 'Customer info is verified');

    // Test 10: Admin Order Status Update & Stock Restoration
    console.log('\n10. Testing Admin Order Management & Cancellation Stock Restoration...');
    const shipRes = await fetch(`${API_BASE}/orders/${orderId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ order_status: 'shipped' }),
    });
    assert(shipRes.status === 200, 'Admin can update order status');

    const checkShippedRes = await fetch(`${API_BASE}/orders/track/${orderNumber}`);
    const checkShipped = await checkShippedRes.json();
    assert(checkShipped.order.order_status === 'shipped', 'Order status updated to shipped');

    // Cancel order -> inventory should be restored from 3 back to 4!
    const cancelRes = await fetch(`${API_BASE}/orders/${orderId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ order_status: 'cancelled' }),
    });
    assert(cancelRes.status === 200, 'Order cancelled');

    const stockAfterCancelRes = await fetch(`${API_BASE}/products/${newProductSlug}`);
    const stockAfterCancel = await stockAfterCancelRes.json();
    const var42Restored = stockAfterCancel.product.variants.find(v => v.size === '42');
    assert(var42Restored.stock_quantity === 4, `Inventory restored from 3 back to 4 upon order cancellation (Current: ${var42Restored.stock_quantity})`);

    // Test 11: Product Deletion
    console.log('\n11. Testing Product Deletion...');
    const deleteRes = await fetch(`${API_BASE}/products/${newProductId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(deleteRes.status === 200, 'Product deleted from database');
    const verifyDeleteRes = await fetch(`${API_BASE}/products/${newProductSlug}`);
    assert(verifyDeleteRes.status === 404, 'Deleted product correctly returns 404');

    // Test 12: Admin Dashboard Statistics
    console.log('\n12. Testing Admin Dashboard Statistics...');
    const dashRes = await fetch(`${API_BASE}/admin/dashboard-stats`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const dashData = await dashRes.json();
    assert(dashRes.status === 200, 'Dashboard statistics fetched successfully');
    assert(dashData.metrics.total_orders > 0, 'Total orders counted in dashboard');
    assert(dashData.metrics.total_revenue > 0, 'Total revenue computed in BDT');
    assert(Array.isArray(dashData.recent_orders), 'Recent orders list returned');

    console.log(`\n🎉 All ${passed}/${total} Integration Tests Passed Successfully!`);
  } catch (error) {
    console.error('\n❌ Test Suite Failed:', error.message);
    process.exit(1);
  }
}

runTests();
