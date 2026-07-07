import re
with open(r'C:\Users\shiva\.gemini\antigravity\brain\cbb730ea-d0da-42fd-b01d-eb3498e9668a\.system_generated\steps\2006\content.md', 'r', encoding='utf-8') as f:
    content = f.read()
matches = set(re.findall(r'"([A-Z][a-zA-Z\s,.-]{15,})"', content))
for m in list(matches)[:100]:
    print(m)
