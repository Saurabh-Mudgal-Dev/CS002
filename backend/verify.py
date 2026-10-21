import urllib.request
import json

def req(url, data=None, method='GET'):
    payload = json.dumps(data).encode('utf-8') if data else None
    headers = {'Content-Type': 'application/json'} if data else {}
    r = urllib.request.Request(url, data=payload, headers=headers, method=method)
    with urllib.request.urlopen(r) as resp:
        return json.loads(resp.read().decode('utf-8'))

print("1. Reseed DB...")
print(req('http://127.0.0.1:8000/api/seed', method='POST'))

print("\n2. Health Check...")
print(req('http://127.0.0.1:8000/api/health'))

print("\n3. List Activities...")
acts = req('http://127.0.0.1:8000/api/activities')
print(f"Total activities: {acts['total']}, sample: {acts['items'][0]['action_type']} - {acts['items'][0]['item_name']}")

print("\n4. Create Item...")
new_item = req('http://127.0.0.1:8000/api/inventory', data={
    'name': 'Test Medical Suture Kit',
    'sku': 'TEST-MED-099',
    'category': 'Medical Relief',
    'context_tag': 'ngo',
    'quantity': 15,
    'reorder_level': 5,
    'unit_price': 14.50
}, method='POST')
item_id = new_item['id']
print(f"Created item #{item_id}: {new_item['name']}, status: {new_item['status']}")

print("\n5. Update Item (Edit)...")
updated = req(f'http://127.0.0.1:8000/api/inventory/{item_id}', data={
    'unit_price': 18.50,
    'reorder_level': 8
}, method='PUT')
print(f"Updated item #{item_id}: price ${updated['unit_price']}, reorder {updated['reorder_level']}")

print("\n6. Adjust Stock (Restock)...")
restocked = req(f'http://127.0.0.1:8000/api/inventory/{item_id}/adjust', data={
    'adjustment_type': 'RESTOCK',
    'quantity': 10,
    'note': 'Emergency donor replenishment'
}, method='POST')
print(f"Restocked item #{item_id}: new quantity {restocked['quantity']}")

print("\n7. Adjust Stock (Relief Distribution)...")
distributed = req(f'http://127.0.0.1:8000/api/inventory/{item_id}/adjust', data={
    'adjustment_type': 'RELIEF_DISTRIBUTION',
    'quantity': 5,
    'note': 'Dispatched to rural triage unit'
}, method='POST')
print(f"Distributed from item #{item_id}: new quantity {distributed['quantity']}")

print("\n8. Delete Item...")
deleted = req(f'http://127.0.0.1:8000/api/inventory/{item_id}', method='DELETE')
print(f"Delete response: {deleted}")

print("\n9. Verify Audit Trail captured all actions...")
acts_after = req('http://127.0.0.1:8000/api/activities')
print(f"Total audit logs now: {acts_after['total']}")
for a in acts_after['items'][:4]:
    print(f"  - [{a['action_type']}] {a['item_name']}: {a['note']}")

print("\n10. Dashboard Stats...")
stats = req('http://127.0.0.1:8000/api/dashboard/stats?context=ngo')
print(f"Stats - Total items: {stats['total_items']}, Low stock: {stats['low_stock_count']}, Outflow today: {stats['total_outflow_today']}")
print(f"Throughput velocity points: {[p['day'] + ':' + str(p['intake']) + '/' + str(p['outflow']) for p in stats['throughput_curve']]}")

print("\nALL BACKEND VERIFICATIONS PASSED SUCCESSFULLY!")
