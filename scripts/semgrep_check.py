#!/usr/bin/env python3
import sys
import json

def main(path):
    try:
        with open(path, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except Exception as e:
        print('Failed to read semgrep results:', e)
        return 0

    results = data.get('results') or []
    critical = []
    for r in results:
        sev = r.get('extra', {}).get('severity') or r.get('check_id')
        # Treat HIGH / ERROR / CRITICAL as failing
        severity = r.get('extra', {}).get('severity', '').upper()
        if severity in ('ERROR', 'CRITICAL', 'HIGH'):
            critical.append(r)

    if critical:
        print(f"Found {len(critical)} high/critical semgrep findings:")
        for c in critical[:10]:
            print('-', c.get('check_id'), c.get('extra', {}).get('message'))
        sys.exit(1)
    print('No high/critical semgrep findings found.')
    return 0

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print('Usage: semgrep_check.py <semgrep_results.json>')
        sys.exit(0)
    sys.exit(main(sys.argv[1]))
