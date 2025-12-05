#!/bin/bash

# Fleet Feast Load Testing Suite - Run All Tests
# This script runs all load tests sequentially and generates a summary report

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BASE_URL="${BASE_URL:-http://localhost:3000}"
RESULTS_DIR="results"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
REPORT_FILE="${RESULTS_DIR}/summary_${TIMESTAMP}.txt"

echo -e "${BLUE}=== Fleet Feast Load Testing Suite ===${NC}\n"
echo "Base URL: $BASE_URL"
echo "Results directory: $RESULTS_DIR"
echo "Timestamp: $TIMESTAMP"
echo ""

# Create results directory
mkdir -p "$RESULTS_DIR"

# Verify k6 is installed
if ! command -v k6 &> /dev/null; then
    echo -e "${RED}Error: k6 is not installed${NC}"
    echo "Install k6: https://k6.io/docs/getting-started/installation/"
    exit 1
fi

# Verify application is running
echo -e "${YELLOW}Checking if application is running...${NC}"
if ! curl -s -o /dev/null -w "%{http_code}" "$BASE_URL" | grep -q "200\|301\|302"; then
    echo -e "${RED}Error: Application not reachable at $BASE_URL${NC}"
    echo "Please start the application and try again"
    exit 1
fi
echo -e "${GREEN}✓ Application is running${NC}\n"

# Function to run a test
run_test() {
    local test_name=$1
    local test_file=$2
    local output_file="${RESULTS_DIR}/${test_name}_${TIMESTAMP}.json"

    echo -e "${BLUE}Running $test_name...${NC}"
    echo "Output: $output_file"

    if k6 run --out json="$output_file" "$test_file"; then
        echo -e "${GREEN}✓ $test_name completed${NC}\n"
        return 0
    else
        echo -e "${RED}✗ $test_name failed${NC}\n"
        return 1
    fi
}

# Initialize summary report
{
    echo "=== Fleet Feast Load Testing Summary ==="
    echo "Timestamp: $(date)"
    echo "Base URL: $BASE_URL"
    echo ""
} > "$REPORT_FILE"

# Track test results
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Test 1: Concurrent Users
TOTAL_TESTS=$((TOTAL_TESTS + 1))
if run_test "concurrent-users" "concurrent-users-test.js"; then
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi

# Wait between tests to let system recover
echo -e "${YELLOW}Waiting 30 seconds for system recovery...${NC}\n"
sleep 30

# Test 2: API Stress
TOTAL_TESTS=$((TOTAL_TESTS + 1))
if run_test "api-stress" "api-stress-test.js"; then
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi

echo -e "${YELLOW}Waiting 30 seconds for system recovery...${NC}\n"
sleep 30

# Test 3: Payment Flow
TOTAL_TESTS=$((TOTAL_TESTS + 1))
if run_test "payment-flow" "payment-flow-test.js"; then
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi

echo -e "${YELLOW}Waiting 30 seconds for system recovery...${NC}\n"
sleep 30

# Test 4: Rate Limit
TOTAL_TESTS=$((TOTAL_TESTS + 1))
if run_test "rate-limit" "rate-limit-test.js"; then
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi

# Generate summary
{
    echo "=== Test Results ==="
    echo "Total Tests: $TOTAL_TESTS"
    echo "Passed: $PASSED_TESTS"
    echo "Failed: $FAILED_TESTS"
    echo ""
    echo "=== Individual Test Results ==="
    for result_file in ${RESULTS_DIR}/*_${TIMESTAMP}.json; do
        if [ -f "$result_file" ]; then
            echo ""
            echo "$(basename "$result_file"):"
            # Extract key metrics using jq if available
            if command -v jq &> /dev/null; then
                jq -r '.metrics | {
                    total_requests: .http_reqs.values.count,
                    failed_requests: .http_req_failed.values.count,
                    avg_duration: .http_req_duration.values.avg,
                    p95_duration: .http_req_duration.values["p(95)"],
                    p99_duration: .http_req_duration.values["p(99)"]
                } | to_entries | .[] | "  \(.key): \(.value)"' "$result_file"
            fi
        fi
    done
} >> "$REPORT_FILE"

# Display summary
echo -e "${BLUE}=== Test Suite Complete ===${NC}\n"
echo "Total Tests: $TOTAL_TESTS"
if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "Passed: ${GREEN}$PASSED_TESTS${NC}"
    echo -e "Failed: ${GREEN}$FAILED_TESTS${NC}"
else
    echo -e "Passed: ${GREEN}$PASSED_TESTS${NC}"
    echo -e "Failed: ${RED}$FAILED_TESTS${NC}"
fi
echo ""
echo "Summary report: $REPORT_FILE"
echo -e "${YELLOW}Review detailed results in: $RESULTS_DIR${NC}"

# Exit with error if any tests failed
if [ $FAILED_TESTS -gt 0 ]; then
    exit 1
fi
