# COT Data Update Guide

## Overview
This guide explains how to update COT (Commitment of Traders) data in the application to ensure all components display consistent, up-to-date information.

## Data Architecture

### Context Provider Structure
- **Single Context**: All COT components use `COTDataContext` from `src/components/COTDataContext.tsx`
- **Provider Location**: The `COTDataProvider` wraps the entire COT Analysis page in `src/pages/COTAnalysis.tsx`
- **Shared State**: All components (`COTMarketWheel`, `COTOverview`, `COTData`) share the same context instance

### Files to Update When New CFTC Data Arrives

#### 1. COTMarketWheel Component (`src/components/COTMarketWheel.tsx`)

**Update Two Locations:**

**A. Line ~48-56: Default/Fallback Data**
```typescript
// Nov 4th, 2025 CFTC data
return [
  { currency: 'EUR', netPosition: 32145, strength: 32145, bias: 'BULLISH', weeklyChange: 2472, color: '#7EBF8E' },
  { currency: 'GBP', netPosition: 24893, strength: 24893, bias: 'BULLISH', weeklyChange: 3214, color: '#7EBF8E' },
  // ... update all pairs
];
```

**B. Line ~18-45: Detailed Position Data**
```typescript
const nov4Data: Record<string, { long: number; short: number; ncLong: number; ncShort: number }> = {
  'EUR': { long: 285432, short: 253287, ncLong: 198765, ncShort: 166620 },
  // ... update all pairs with CFTC report data
};
```

**How to Calculate:**
- `netPosition` = `ncLong` - `ncShort` (Non-Commercial Long - Non-Commercial Short)
- `strength` = absolute value of `netPosition`
- `bias`: 
  - 'BULLISH' if netPosition > 5000
  - 'BEARISH' if netPosition < -5000
  - 'NEUTRAL' otherwise
- `weeklyChange` = current week netPosition - previous week netPosition
- `color`:
  - '#7EBF8E' for BULLISH (green)
  - '#EF4444' for BEARISH (red)
  - '#8B8B8B' for NEUTRAL (gray)

#### 2. Update Report Date
In `src/components/COTMarketWheel.tsx` and `src/components/COTOverview.tsx`, update the report date:
```typescript
reportDate: '2025-11-04T00:00:00Z'  // Change to current CFTC report date
```

## CFTC Data Structure

### Commercial Traders (Institutions)
- Banks, corporations, hedge funds
- Use futures for legitimate business needs
- Most reliable indicator of fundamental direction

### Non-Commercial Traders (Large Speculators)
- Investment funds, large traders
- Drive short-term momentum
- Extreme positioning often signals reversals

### Data Points Needed Per Currency:
1. **Commercial Long** - Number of long contracts held by institutions
2. **Commercial Short** - Number of short contracts held by institutions
3. **Non-Commercial Long** - Number of long contracts held by speculators
4. **Non-Commercial Short** - Number of short contracts held by speculators
5. **Weekly Change** - Change in net non-commercial positioning from previous week

## Where CFTC Data Comes From

### Official Source
- **Website**: https://www.cftc.gov/MarketReports/CommitmentsofTraders/index.htm
- **Report**: Commitments of Traders (COT) - Financial Futures
- **Release**: Every Friday at 3:30 PM ET (data as of Tuesday close)
- **File Format**: Excel (.xls) or PDF

### Relevant Currency Pairs
- EUR - Euro
- GBP - British Pound
- JPY - Japanese Yen
- CHF - Swiss Franc
- AUD - Australian Dollar
- CAD - Canadian Dollar
- MXN - Mexican Peso

## Modal Functionality

### How Click-to-Details Works
1. User clicks on any currency pair in:
   - COT Market Wheel (pie chart or legend cards)
   - COT Overview (extreme positions or weekly changes)
   
2. Component calls `setSelectedCurrency()` with complete data:
   ```typescript
   setSelectedCurrency({
     currency: 'EUR',
     commercialLong: 285432,
     commercialShort: 253287,
     nonCommercialLong: 198765,
     nonCommercialShort: 166620,
     reportDate: '2025-11-04T00:00:00Z',
     weeklyChange: 2472
   });
   ```

3. Component calls `setIsDetailModalOpen(true)`

4. `COTDetailModal` component displays:
   - Trade signal (BUY/SELL/NEUTRAL) based on commercial positioning
   - Detailed breakdown of long/short positions
   - Bullish percentage calculations
   - Trading recommendations with reasoning
   - Weekly change analysis

### Trade Signal Logic
```typescript
// In COTDetailModal.tsx
if (netCommercial > 30000) return "Strong BUY"
else if (netCommercial < -30000) return "Strong SELL"
else if (Math.abs(netCommercial) > 15000) return "Moderate BUY/SELL"
else return "NEUTRAL - Wait for clearer signal"
```

## Testing Checklist

After updating data:
- [ ] COT Market Wheel displays updated values
- [ ] Pie chart shows correct colors and proportions
- [ ] Currency cards show updated net positions
- [ ] Clicking any currency opens detail modal
- [ ] Modal shows correct long/short breakdown
- [ ] Trade signals reflect new positioning
- [ ] Report date shows current CFTC release date
- [ ] Weekly changes highlight significant moves (>10,000 contracts)
- [ ] All "Click for details" prompts work

## Common Issues

### Modal Not Opening
- Check that all components use the same `COTDataProvider` instance
- Verify `setIsDetailModalOpen` and `setSelectedCurrency` are being called
- Console.log the data being passed to verify structure

### Incorrect Data Displayed
- Verify `commercialLong`, `commercialShort`, `nonCommercialLong`, `nonCommercialShort` are all numbers
- Check that `reportDate` is in ISO 8601 format
- Ensure `weeklyChange` is calculated correctly (current - previous)

### Colors Wrong
- BULLISH (green): #7EBF8E when netPosition > 5000
- BEARISH (red): #EF4444 when netPosition < -5000
- NEUTRAL (gray): #8B8B8B otherwise

## Future Enhancements

### Automated Updates
Consider implementing:
1. CFTC API integration to fetch data automatically
2. Database storage for historical data
3. Upload interface for manual CSV/Excel imports
4. Scheduled jobs to pull latest reports

### Additional Features
- Historical trend charts showing positioning over time
- Email alerts when positioning crosses thresholds
- Comparison view between current and previous weeks
- Export functionality for trade plans
