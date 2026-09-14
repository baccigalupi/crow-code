#!/usr/bin/env bash
set -euo pipefail

LCOV_FILE="${1:-coverage/lcov.info}"

if [[ ! -f "$LCOV_FILE" ]]; then
  echo "ERROR: lcov info not found at $LCOV_FILE" >&2
  exit 1
fi

FAILED=0

# Parse each SF/end_of_record block and compute coverage percentages.
# Fields per file: LF/LH (lines), BRF/BRH (branches), FNF/FNH (functions).
while IFS= read -r line; do
  case "$line" in
    SF:*)
      current_file="${line#SF:}"
      ;;
    FNF:*)
      fnf="${line#FNF:}"
      ;;
    FNH:*)
      fnh="${line#FNH:}"
      ;;
    LF:*)
      lf="${line#LF:}"
      ;;
    LH:*)
      lh="${line#LH:}"
      ;;
    BRF:*)
      brf="${line#BRF:}"
      ;;
    BRH:*)
      brh="${line#BRH:}"
      ;;
    end_of_record)
      # Compute percentages
      if [[ -n "$fnf" && "$fnf" -gt 0 ]]; then
        func_pct=$(( fnh * 100 / fnf ))
        # Use integer math; 95% means >= 95
        if [[ $func_pct -lt 95 ]]; then
          echo "FAIL: $current_file functions coverage ${func_pct}% < 95%"
          FAILED=1
        fi
      fi
      if [[ -n "$lf" && "$lf" -gt 0 ]]; then
        line_pct=$(( lh * 100 / lf ))
        if [[ $line_pct -lt 95 ]]; then
          echo "FAIL: $current_file lines coverage ${line_pct}% < 95%"
          FAILED=1
        fi
      fi
      if [[ -n "$brf" && "$brf" -gt 0 ]]; then
        branch_pct=$(( brh * 100 / brf ))
        if [[ $branch_pct -lt 95 ]]; then
          echo "FAIL: $current_file branches coverage ${branch_pct}% < 95%"
          FAILED=1
        fi
      fi
      ;;
  esac
done < "$LCOV_FILE"

if [[ $FAILED -eq 1 ]]; then
  echo ""
  echo "==> Coverage below 95% on lines, branches, or functions for one or more files."
  exit 1
fi

echo "==> All files meet 95% coverage on lines, branches, and functions."
