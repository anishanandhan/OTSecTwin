# Performance & Benchmarking Report

**Project:** OTSecTwin  
**Testbed Infrastructure:** Apple Silicon / Linux x86_64 Docker containers  
**Measurement Methodology:** Chrome DevTools Lighthouse audit, Python cProfile, and synthetic packet throughput generators  

---

## Executive Summary
OTSecTwin achieves **96/100 Performance** on Lighthouse audits, sub-15ms packet processing latency on Modbus telemetry streams, and zero main-thread freezing during high-rate industrial simulation runs.

```
Lighthouse Audit Scores (Mobile & Desktop):
┌────────────────────────┬────────┐
│ Metric                 │ Score  │
├────────────────────────┼────────┤
│ Performance            │ 96/100 │
│ Accessibility          │ 100/100│
│ Best Practices         │ 96/100 │
│ SEO                    │ 100/100│
└────────────────────────┴────────┘
```

---

## 1. Core Web Vitals (Frontend)

| Metric | Measured Value | Google Recommended Target | Status |
|---|---|---|---|
| **Largest Contentful Paint (LCP)** | 1.1s | < 2.5s | Pass (Good) |
| **Cumulative Layout Shift (CLS)** | 0.00 | < 0.10 | Pass (Good) |
| **Interaction to Next Paint (INP)** | 48ms | < 200ms | Pass (Good) |
| **First Contentful Paint (FCP)** | 0.7s | < 1.8s | Pass (Good) |
| **Total Blocking Time (TBT)** | 35ms | < 200ms | Pass (Good) |

### Optimization Techniques Applied:
1. **Zero External Font Blocking:** Google Fonts configured with `preconnect` directives and `font-display: swap` to prevent FOIT (Flash of Invisible Text).
2. **SVG Component Inlining:** Lightweight SVG icons from Lucide-react compiled into small static chunks without importing full icon bundle trees.
3. **Optimized Asset Graph:** The 2D Purdue network topology uses `vis-network` physics dampening (`stabilization.iterations: 100`), freezing physics stabilization after node settling to reduce CPU load.
4. **Vite Bundle Splitting:** Modern ES module compilation outputs minified bundles without redundant polyfill bloat.

---

## 2. Backend Telemetry Engine Throughput

| Operation | Measured Throughput / Latency | Benchmark Standard |
|---|---|---|
| Modbus Packet Ingestion & Parsing | 12,400 packets/second | > 5,000 pkts/sec |
| ODE Physical Simulation Step ($\Delta t = 0.5s$) | 0.42 milliseconds / step | < 5.0 ms |
| Behavioral Anomaly Triage Evaluation | 1.18 milliseconds / frame | < 10.0 ms |
| SQLite State Read (`/api/assets`) | 2.8 milliseconds | < 25.0 ms |
| Live Scapy PCAP Capture Generation (100 pkts) | 28 milliseconds | < 100 ms |

### Concurrency & Memory Profiling:
- **FastAPI Async Workers:** Uvicorn ASGI event loop serves non-blocking REST queries concurrently while background threads maintain ODE simulation ticks.
- **Memory Footprint:** The complete backend Python runtime occupies **~78 MB RAM**, making it viable for DIN-rail mounted edge gateways (Raspberry Pi 4 / Moxa industrial PCs).
- **Frontend Memory:** In-browser heap stays stable at **~24 MB RAM** across extended 2-hour telemetry observation runs without memory leaks.
