#!/usr/bin/env python3
import json

# Read old flows file
print("Reading existing flows...")
with open('mes_70_precision_flows_FIXED_PROD.json', 'r') as f:
    old_flows = json.load(f)

# Read new flows file  
print("Reading new summary endpoint flows...")
with open('NODERED_FLOWS_MES_API_FIXED.json', 'r') as f:
    new_flows = json.load(f)

print(f"  Old flows: {len(old_flows)} nodes")
print(f"  New flows: {len(new_flows)} nodes")

# Merge: Take all old flows + add new flows except the tab definition
# (we'll add to existing 90_API_Docs tab or create new tab)
merged = old_flows.copy()

# Add the new tab if it doesn't exist
tab_exists = any(node.get('id') == 'tab_main_api' for node in merged)
if not tab_exists:
    print("\nAdding new 'Summary Endpoints' tab...")
    # Add tab as first element after old tabs
    for node in new_flows:
        if node.get('type') == 'tab':
            merged.append(node)
            break

# Add all non-tab nodes from new flows
added_count = 0
for node in new_flows:
    if node.get('type') != 'tab':
        merged.append(node)
        added_count += 1

print(f"  Added: {added_count} new nodes")
print(f"  Total: {len(merged)} nodes in merged file")

# Write merged file back
print("\nSaving merged flows...")
with open('mes_70_precision_flows_FIXED_PROD.json', 'w') as f:
    json.dump(merged, f, indent=2)

print("✓ Successfully merged! File saved.")
print("\nNext steps:")
print("  1. Import mes_70_precision_flows_FIXED_PROD.json into Node-RED")
print("  2. Click Deploy")
print("  3. Test all 5 endpoints")
