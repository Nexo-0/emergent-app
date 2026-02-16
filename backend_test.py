#!/usr/bin/env python3
import requests
import sys
import json
from datetime import datetime

class KioskAPITester:
    def __init__(self, base_url="https://design-rebuild-4.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def run_test(self, name, method, endpoint, expected_status, data=None, params=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}" if not endpoint.startswith('http') else endpoint
        headers = {'Content-Type': 'application/json'}
        
        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, params=params, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=10)

            success = response.status_code == expected_status
            
            result = {
                "test_name": name,
                "method": method,
                "endpoint": endpoint,
                "expected_status": expected_status,
                "actual_status": response.status_code,
                "success": success,
                "response_time": response.elapsed.total_seconds(),
                "url": url
            }
            
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    result["response_data"] = response_data
                    if isinstance(response_data, list):
                        print(f"   Response: {len(response_data)} items")
                    elif isinstance(response_data, dict) and 'message' in response_data:
                        print(f"   Message: {response_data['message']}")
                except:
                    print(f"   Response: {response.text[:100]}")
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}")
                result["error"] = response.text[:200]

            self.test_results.append(result)
            return success, response.json() if success and response.text else {}

        except requests.exceptions.RequestException as e:
            print(f"❌ Failed - Network Error: {str(e)}")
            result = {
                "test_name": name,
                "method": method,
                "endpoint": endpoint,
                "success": False,
                "error": str(e),
                "url": url
            }
            self.test_results.append(result)
            return False, {}

    def test_root_endpoint(self):
        """Test API root endpoint"""
        return self.run_test("API Root", "GET", "", 200)

    def test_get_categories(self):
        """Test fetching categories"""
        success, response = self.run_test("Get Categories", "GET", "categories", 200)
        if success and isinstance(response, list):
            print(f"   Found {len(response)} categories")
            expected_categories = ["Fast Food", "Beverages", "Snacks", "Electronics", "Personal Care", "Breakfast"]
            found_categories = [cat['name'] for cat in response]
            print(f"   Categories: {found_categories}")
            
            # Check if all expected categories are present
            missing = set(expected_categories) - set(found_categories)
            if missing:
                print(f"   ⚠️  Missing categories: {missing}")
            
            return len(response) >= 6
        return False

    def test_get_products(self):
        """Test fetching all products"""
        success, response = self.run_test("Get All Products", "GET", "products", 200)
        if success and isinstance(response, list):
            print(f"   Found {len(response)} products")
            return len(response) >= 20  # Should have around 26 products
        return False

    def test_get_products_by_category(self):
        """Test fetching products by category"""
        # First get categories to get a category ID
        success, categories = self.run_test("Get Categories for Product Filter", "GET", "categories", 200)
        if not success or not categories:
            return False
        
        category = categories[0]  # Use first category
        category_id = category['id']
        category_name = category['name']
        
        success, response = self.run_test(
            f"Get Products for {category_name}", 
            "GET", 
            "products", 
            200, 
            params={"category_id": category_id}
        )
        
        if success and isinstance(response, list):
            print(f"   Found {len(response)} products for {category_name}")
            return True
        return False

    def test_get_single_product(self):
        """Test fetching a single product by ID"""
        # First get products to get a product ID
        success, products = self.run_test("Get Products for Single Product Test", "GET", "products", 200)
        if not success or not products:
            return False
        
        product = products[0]  # Use first product
        product_id = product['id']
        product_name = product['name']
        
        success, response = self.run_test(
            f"Get Single Product ({product_name})", 
            "GET", 
            f"products/{product_id}", 
            200
        )
        
        if success and isinstance(response, dict):
            print(f"   Product: {response.get('name', 'Unknown')}")
            print(f"   Price: ${response.get('price', 0)}")
            return response.get('id') == product_id
        return False

    def test_create_order(self):
        """Test creating an order"""
        # First get products to create order items
        success, products = self.run_test("Get Products for Order Creation", "GET", "products", 200)
        if not success or not products:
            return False
        
        # Use first two products for the order
        product1 = products[0]
        product2 = products[1] if len(products) > 1 else products[0]
        
        order_data = {
            "items": [
                {
                    "product_id": product1['id'],
                    "product_name": product1['name'],
                    "quantity": 2,
                    "unit_price": product1['price'],
                    "total_price": product1['price'] * 2
                },
                {
                    "product_id": product2['id'],
                    "product_name": product2['name'],
                    "quantity": 1,
                    "unit_price": product2['price'],
                    "total_price": product2['price'] * 1
                }
            ],
            "subtotal": product1['price'] * 2 + product2['price'],
            "tax": (product1['price'] * 2 + product2['price']) * 0.08,
            "total": (product1['price'] * 2 + product2['price']) * 1.08,
            "payment_method": "card"
        }
        
        success, response = self.run_test("Create Order", "POST", "orders", 200, data=order_data)
        
        if success and isinstance(response, dict):
            print(f"   Order ID: {response.get('id', 'Unknown')}")
            print(f"   Order Number: {response.get('order_number', 'Unknown')}")
            print(f"   Total: ${response.get('total', 0)}")
            
            # Test fetching the created order
            order_id = response.get('id')
            if order_id:
                return self.test_get_order(order_id)
            return True
        return False

    def test_get_order(self, order_id):
        """Test fetching an order by ID"""
        success, response = self.run_test(
            f"Get Order {order_id[:8]}...", 
            "GET", 
            f"orders/{order_id}", 
            200
        )
        
        if success and isinstance(response, dict):
            print(f"   Order Status: {response.get('status', 'Unknown')}")
            print(f"   Items: {len(response.get('items', []))}")
            return True
        return False

    def test_get_orders(self):
        """Test fetching recent orders"""
        success, response = self.run_test("Get Recent Orders", "GET", "orders", 200, params={"limit": 10})
        
        if success and isinstance(response, list):
            print(f"   Found {len(response)} recent orders")
            return True
        return False

    def test_tax_calculation(self):
        """Test if tax calculation is correct (8%)"""
        # First get products
        success, products = self.run_test("Get Products for Tax Test", "GET", "products", 200)
        if not success or not products:
            return False
        
        product = products[0]
        subtotal = product['price'] * 2
        expected_tax = subtotal * 0.08
        expected_total = subtotal + expected_tax
        
        order_data = {
            "items": [
                {
                    "product_id": product['id'],
                    "product_name": product['name'],
                    "quantity": 2,
                    "unit_price": product['price'],
                    "total_price": subtotal
                }
            ],
            "subtotal": subtotal,
            "tax": expected_tax,
            "total": expected_total,
            "payment_method": "cash"
        }
        
        success, response = self.run_test("Tax Calculation Test", "POST", "orders", 200, data=order_data)
        
        if success:
            actual_tax = response.get('tax', 0)
            actual_total = response.get('total', 0)
            tax_correct = abs(actual_tax - expected_tax) < 0.01
            total_correct = abs(actual_total - expected_total) < 0.01
            
            print(f"   Expected Tax: ${expected_tax:.2f}, Actual: ${actual_tax:.2f}")
            print(f"   Expected Total: ${expected_total:.2f}, Actual: ${actual_total:.2f}")
            
            return tax_correct and total_correct
        return False

def main():
    print("🚀 Starting Kiosk System API Tests")
    print("=" * 50)
    
    # Setup
    tester = KioskAPITester()
    
    # Run all tests
    tests = [
        tester.test_root_endpoint,
        tester.test_get_categories,
        tester.test_get_products,
        tester.test_get_products_by_category,
        tester.test_get_single_product,
        tester.test_create_order,
        tester.test_get_orders,
        tester.test_tax_calculation,
    ]
    
    print(f"\nRunning {len(tests)} test suites...\n")
    
    for test in tests:
        try:
            test()
        except Exception as e:
            print(f"❌ Test {test.__name__} failed with exception: {str(e)}")
            tester.tests_run += 1
    
    # Print final results
    print("\n" + "=" * 50)
    print(f"📊 Final Results: {tester.tests_passed}/{tester.tests_run} tests passed")
    print(f"Success Rate: {(tester.tests_passed/tester.tests_run*100):.1f}%")
    
    # Save detailed results to JSON
    results_file = f"/app/test_reports/backend_test_results_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    with open(results_file, 'w') as f:
        json.dump({
            "timestamp": datetime.now().isoformat(),
            "summary": {
                "total_tests": tester.tests_run,
                "passed_tests": tester.tests_passed,
                "success_rate": (tester.tests_passed/tester.tests_run*100) if tester.tests_run > 0 else 0
            },
            "test_results": tester.test_results
        }, f, indent=2)
    
    print(f"📁 Detailed results saved to: {results_file}")
    
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())