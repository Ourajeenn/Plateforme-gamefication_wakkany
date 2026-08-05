#!/usr/bin/env python3
"""
semgrep_check.py — Parse Semgrep JSON results and fail on CRITICAL/ERROR
"""

import json
import sys

def check_semgrep_results(results_file):
    """
    Parse semgrep JSON results and exit with error if CRITICAL/ERROR found.
    """
    try:
        with open(results_file, 'r') as f:
            results = json.load(f)
    except Exception as e:
        print(f"❌ Error reading {results_file}: {e}")
        return 1

    findings = results.get('results', [])
    
    if not findings:
        print("✅ No security issues found!")
        return 0

    critical_errors = []
    high_warnings = []

    for finding in findings:
        severity = finding.get('extra', {}).get('severity', 'UNKNOWN')
        rule_id = finding.get('check_id', 'unknown')
        message = finding.get('extra', {}).get('message', 'No message')
        path = finding.get('path', 'unknown')
        line = finding.get('start', {}).get('line', 'unknown')

        issue_str = f"{path}:{line} [{rule_id}] {message}"

        if severity in ['CRITICAL', 'ERROR']:
            critical_errors.append((severity, issue_str))
        elif severity == 'HIGH':
            high_warnings.append((severity, issue_str))

    # Print warnings
    if high_warnings:
        print("\n⚠️  HIGH severity issues (warnings):")
        for severity, issue in high_warnings:
            print(f"  {issue}")

    # Print critical errors
    if critical_errors:
        print("\n❌ CRITICAL/ERROR issues found:")
        for severity, issue in critical_errors:
            print(f"  {issue}")
        print(f"\n❌ Semgrep failed: {len(critical_errors)} critical issues found")
        return 1

    print(f"✅ Semgrep passed: {len(high_warnings)} high warnings (non-blocking)")
    return 0

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python semgrep_check.py <results.json>")
        sys.exit(1)
    
    exit_code = check_semgrep_results(sys.argv[1])
    sys.exit(exit_code)
