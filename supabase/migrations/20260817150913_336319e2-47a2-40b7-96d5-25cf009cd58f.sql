
UPDATE public.cot_history SET long_positions=v.l, short_positions=v.s, net_position=v.l-v.s, change_long=v.cl, change_short=v.cs, source='cftc_tff_verified'
FROM (VALUES
 ('EUR',86753,147353,-8636,-241),
 ('GBP',67627,26957,452,-2044),
 ('JPY',74973,128043,-785,-8540),
 ('CHF',10165,21597,-1243,105),
 ('AUD',72166,23625,7527,-377),
 ('CAD',26511,118516,1725,-8018),
 ('NZD',2520,35981,-1127,2044),
 ('MXN',130485,54203,32411,23836),
 ('USD',15398,9626,-873,-2796),
 ('BTC',4997,12049,754,566),
 ('XAU',148634,10972,8825,1929)
) AS v(cur,l,s,cl,cs)
WHERE cot_history.report_date='2026-08-11' AND cot_history.currency=v.cur;
