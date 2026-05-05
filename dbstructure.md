Below is the clean interpretation of the data now written to InfluxDB. Your gateway is now writing correctly after the bucket/token fix, and the payload confirms the schema uses:

```text
measurement,plc=<PLC/source>,node=<semantic_tag> value=<numeric_value>
```

Example from your gateway payload:

```text
factory,plc=PLC3,node=MES.OEE value=40
powergrid,plc=PLC2,node=MES.TotalProduction value=654.500000
railauto,plc=PLC4,node=MES.ProgressPercent value=25
railmanual,plc=PLC5,node=MES.TotalCycleCount value=2
mes_health,plc=gateway,node=Heartbeat value=11931
```

The corrected tagging is visible in your latest gateway output: `factory,plc=PLC3`, `railauto,plc=PLC4`, `railmanual,plc=PLC5`, `powergrid,plc=PLC1/PLC2`, and `mes_health,plc=gateway`. 

## 1. InfluxDB structure

### Bucket

```text
labshock_db
```

Retention:

```text
1 hour
```

That means the database keeps only the most recent 1 hour of telemetry. This is good for lab stability and avoids disk saturation.

### Organization

```text
dataprotect
```

### Field

Every point uses one field:

```text
value
```

### Main tags

```text
plc
node
```

So the query model is:

```flux
from(bucket: "labshock_db")
  |> range(start: -10m)
  |> filter(fn: (r) => r._measurement == "factory")
  |> filter(fn: (r) => r.plc == "PLC3")
  |> filter(fn: (r) => r.node == "MES.OEE")
```

---

# 2. Measurement: `mes_health`

This is the health of the DMZ/MES gateway itself.

## Source

```text
measurement = mes_health
plc = gateway
```

## Main nodes

| Node              | Meaning                                                |
| ----------------- | ------------------------------------------------------ |
| `Heartbeat`       | Counter proving the OPC UA → DMZ gateway loop is alive |
| `Watchdog`        | Another integrity counter for freshness monitoring     |
| `LastUpdateEpoch` | Last update time in Unix epoch seconds                 |
| `DataStale`       | `0` means data is fresh, `1` means stale               |

## Example

```text
mes_health,plc=gateway,node=Heartbeat value=11931
mes_health,plc=gateway,node=DataStale value=0
```

Use this for pipeline monitoring:

```flux
from(bucket: "labshock_db")
  |> range(start: -5m)
  |> filter(fn: (r) => r._measurement == "mes_health")
  |> last()
```

---

# 3. Measurement: `powergrid`

This contains PLC1 and PLC2 data.

```text
measurement = powergrid
plc = PLC1 or PLC2
```

## 3.1 PLC1 — Grid switching and availability

PLC1 represents the power grid connection layer: source availability and load connection.

### Basic field mirror

| Node           | Meaning                     |
| -------------- | --------------------------- |
| `PE.Etat`      | Primary energy source state |
| `FS.Etat`      | Secondary source state      |
| `GS.Etat`      | Generator/source state      |
| `Factory.Etat` | Factory load connected      |
| `Homes.Etat`   | Homes load connected        |
| `Railway.Etat` | Railway load connected      |

Example:

```text
powergrid,plc=PLC1,node=PE.Etat value=1
powergrid,plc=PLC1,node=Factory.Etat value=1
```

### PLC1 MES nodes

| Node                | Meaning                          |
| ------------------- | -------------------------------- |
| `MES.SourceCount`   | Number of active power sources   |
| `MES.LoadCount`     | Number of active consumers/loads |
| `MES.GridOn`        | Grid is active                   |
| `MES.LoadPercent`   | Load connection percentage       |
| `MES.SourcePercent` | Source availability percentage   |
| `MES.GridState`     | Encoded grid state               |
| `MES.SourceMask`    | Bitmask of active sources        |
| `MES.LoadMask`      | Bitmask of active loads          |
| `MES.GridReady`     | Grid ready flag                  |
| `MES.Overload`      | Overload flag                    |
| `MES.FaultType`     | Encoded fault type               |
| `MES.Watchdog`      | PLC1 watchdog                    |
| `MES.Integrity`     | Data integrity/anomaly flag      |

Example:

```text
powergrid,plc=PLC1,node=MES.SourceCount value=3
powergrid,plc=PLC1,node=MES.LoadPercent value=100
```

Use PLC1 for:

```text
Grid availability
Load connection status
Power source redundancy
Grid readiness
```

---

## 3.2 PLC2 — Energy production, demand, distribution

PLC2 is the main energy balancing PLC.

### Source and distribution booleans

| Node                | Meaning        |
| ------------------- | -------------- |
| `PE.Production`     | PE producing   |
| `FS.Production`     | FS producing   |
| `GS.Production`     | GS producing   |
| `Factory.Distribue` | Factory served |
| `Homes.Distribue`   | Homes served   |
| `Railway.Distribue` | Railway served |

### Power values

| Node       | Meaning                    |
| ---------- | -------------------------- |
| `PE.Power` | PE production power        |
| `FS.Power` | FS production power        |
| `GS.Power` | GS production power        |
| `TAP`      | Total available production |
| `TCP`      | Total consumed power       |

Your logs show:

```text
TAP = 654.5
PE.Power = 42.11
FS.Power = 205.6
GS.Power = 406.83
```



### PLC2 MES energy KPIs

| Node                   | Meaning                               |
| ---------------------- | ------------------------------------- |
| `MES.TotalProduction`  | Total production as engineering value |
| `MES.TotalConsumption` | Total served consumption plus losses  |
| `MES.ReserveMargin`    | Available reserve after demand/losses |
| `MES.FactoryDemand`    | Factory demand                        |
| `MES.HomesDemand`      | Homes demand                          |
| `MES.RailwayDemand`    | Railway demand                        |
| `MES.Losses`           | Estimated distribution losses         |
| `MES.DeficitActive`    | Deficit flag                          |
| `MES.FactoryServed`    | Factory served boolean                |
| `MES.HomesServed`      | Homes served boolean                  |
| `MES.RailwayServed`    | Railway served boolean                |

Example:

```text
powergrid,plc=PLC2,node=MES.TotalProduction value=654.500000
powergrid,plc=PLC2,node=MES.TotalConsumption value=464.680000
powergrid,plc=PLC2,node=MES.ReserveMargin value=189.820000
```



### PLC2 advanced x10 values

These are integer-scaled values from the PLC:

| Node                   | Meaning                    | Scaling      |
| ---------------------- | -------------------------- | ------------ |
| `MES.TAPx10`           | Total available production | divide by 10 |
| `MES.TCPx10`           | Total consumption          | divide by 10 |
| `MES.Demandx10`        | Total demand               | divide by 10 |
| `MES.Servedx10`        | Served demand              | divide by 10 |
| `MES.Unservedx10`      | Unserved demand            | divide by 10 |
| `MES.FactoryDemandx10` | Factory demand             | divide by 10 |
| `MES.HomesDemandx10`   | Homes demand               | divide by 10 |
| `MES.RailwayDemandx10` | Railway demand             | divide by 10 |

Example:

```text
MES.TAPx10 = 6545  -> 654.5
MES.FactoryDemandx10 = 1300 -> 130.0
```

Use PLC2 for:

```text
Energy balance
Production vs consumption
Reserve margin
Demand split
Client service status
```

---

# 4. Measurement: `factory`

This is PLC3, the factory/process line.

```text
measurement = factory
plc = PLC3
```

## 4.1 Raw process states

| Node               | Meaning             |
| ------------------ | ------------------- |
| `EtatUsine`        | Factory state       |
| `EtatInstallation` | Installation active |
| `CycleActif`       | Cycle active        |
| `CycleTermine`     | Cycle finished      |
| `RecyclageActif`   | Recycling active    |
| `Cuve1.NiveauBas`  | Tank 1 low level    |
| `Cuve1.NiveauHaut` | Tank 1 high level   |
| `Cuve2.NiveauBas`  | Tank 2 low level    |
| `Cuve2.NiveauHaut` | Tank 2 high level   |
| `Cuve3.NiveauBas`  | Tank 3 low level    |
| `Cuve3.NiveauHaut` | Tank 3 high level   |
| `Cuve4.NiveauBas`  | Tank 4 low level    |
| `Cuve4.NiveauHaut` | Tank 4 high level   |
| `Cuve5.NiveauBas`  | Tank 5 low level    |
| `Cuve5.NiveauHaut` | Tank 5 high level   |

Use these for SCADA/process state visualization.

---

## 4.2 Factory MES shadow states

| Node                  | Meaning                    |
| --------------------- | -------------------------- |
| `MES.CycleActive`     | MES-level cycle active     |
| `MES.CycleDone`       | MES-level cycle complete   |
| `MES.FactoryRunning`  | Factory running flag       |
| `MES.RecycleActive`   | Recycling active           |
| `MES.Tank4HighShadow` | Tank 4 high mirrored state |
| `MES.Tank4LowShadow`  | Tank 4 low mirrored state  |
| `MES.Tank5HighShadow` | Tank 5 high mirrored state |
| `MES.Tank5LowShadow`  | Tank 5 low mirrored state  |

---

## 4.3 Factory legacy numeric MES

| Node                 | Meaning            | Notes                              |
| -------------------- | ------------------ | ---------------------------------- |
| `MES.Heartbeat`      | PLC3 heartbeat     |                                    |
| `MES.ProgramVersion` | PLC logic version  |                                    |
| `MES.DefautCode`     | Fault/default code |                                    |
| `MES.StateWord`      | Encoded state      |                                    |
| `MES.CycleCount`     | Legacy cycle count | not authoritative                  |
| `MES.RunTimeSeconds` | Legacy runtime     | not authoritative                  |
| `MES.GoodCount`      | Legacy good count  | currently invalid/out of threshold |

Your logs show `Factory.MES.GoodCount` can become huge, for example `28770304`, so do **not** use this legacy node for dashboards. 

Use the advanced nodes instead.

---

## 4.4 Factory advanced KPIs

These are the clean authoritative PLC3 MES values.

| Node                      | Meaning                          |
| ------------------------- | -------------------------------- |
| `MES.TotalCycles`         | Total completed cycles           |
| `MES.TotalGood`           | Good produced cycles/items       |
| `MES.TotalReject`         | Rejected cycles/items            |
| `MES.ThroughputPerMin`    | Production throughput per minute |
| `MES.ThroughputPerHour`   | Estimated hourly throughput      |
| `MES.QualityPercent`      | Quality KPI                      |
| `MES.DowntimeSeconds`     | Accumulated downtime             |
| `MES.UptimeSeconds`       | Accumulated uptime               |
| `MES.AvailabilityPercent` | Availability KPI                 |
| `MES.TargetCycleTime`     | Expected/target cycle time       |
| `MES.ActualCycleTime`     | Actual average cycle time        |
| `MES.PerformancePercent`  | Performance KPI                  |
| `MES.OEE`                 | Overall Equipment Effectiveness  |
| `MES.EnergyPerCycle`      | Future energy KPI                |
| `MES.EnergyPerHour`       | Future energy KPI                |
| `MES.FaultTypeAdv`        | Advanced fault class             |
| `MES.WatchdogAdv`         | Advanced watchdog                |
| `MES.ProcessState`        | Encoded process state            |
| `MES.PumpRuntimeHours`    | Pump runtime in hours            |
| `MES.MaintenanceDue`      | Maintenance flag                 |
| `MES.LoadPercent`         | Factory load                     |
| `MES.IntegrityAdv`        | Anomaly/integrity flag           |

Example:

```text
factory,plc=PLC3,node=MES.TotalCycles value=439
factory,plc=PLC3,node=MES.QualityPercent value=100
factory,plc=PLC3,node=MES.AvailabilityPercent value=99
factory,plc=PLC3,node=MES.PerformancePercent value=41
factory,plc=PLC3,node=MES.OEE value=40
```



OEE explanation:

```text
OEE = Availability × Performance × Quality / 10000
```

With:

```text
Availability = 99
Performance = 41
Quality = 100
OEE ≈ 40
```

This is mathematically coherent.

---

# 5. Measurement: `railauto`

This is PLC4, the automatic railway sequence.

```text
measurement = railauto
plc = PLC4
```

## 5.1 Raw step states

| Node                    | Meaning                     |
| ----------------------- | --------------------------- |
| `Etape1.Activation`     | Step 1 active               |
| `Etape1.DelaiOuverture` | Step 1 opening delay active |
| `Etape1.DelaiFermeture` | Step 1 closing delay active |
| `Etape1.Terminee`       | Step 1 complete             |
| `Etape2.*`              | Same for step 2             |
| `Etape3.*`              | Same for step 3             |
| `Etape4.*`              | Same for step 4             |

Use these for animation/timeline dashboards.

## 5.2 RailAuto MES

| Node                  | Meaning                     |
| --------------------- | --------------------------- |
| `MES.Step`            | Current sequence step       |
| `MES.ProgressPercent` | Sequence progress           |
| `MES.CycleActive`     | Auto rail cycle active      |
| `MES.CycleDone`       | Cycle complete              |
| `MES.ErrorCode`       | Error code                  |
| `MES.StepTime`        | Current step time           |
| `MES.TotalTime`       | Total sequence time         |
| `MES.Throughput`      | Completed cycles/throughput |
| `MES.Availability`    | Availability                |
| `MES.Performance`     | Performance                 |
| `MES.Quality`         | Quality                     |
| `MES.OEE`             | OEE                         |
| `MES.Watchdog`        | PLC4 watchdog               |
| `MES.State`           | Encoded state               |
| `MES.FaultType`       | Fault class                 |
| `MES.Integrity`       | Integrity/anomaly flag      |

Example:

```text
railauto,plc=PLC4,node=MES.Step value=1
railauto,plc=PLC4,node=MES.ProgressPercent value=25
railauto,plc=PLC4,node=MES.CycleActive value=1
```



Current issue:

```text
MES.Performance = 0
MES.Quality = 0
MES.OEE = 0
```

That means PLC4 logic still needs KPI completion, but the pipeline is working.

---

# 6. Measurement: `railmanual`

This is PLC5, manual bidirectional rail.

```text
measurement = railmanual
plc = PLC5
```

## 6.1 Manual rail route states

| Node                       | Meaning                            |
| -------------------------- | ---------------------------------- |
| `MES.FESRouteValid`        | Valid route toward FES             |
| `MES.MarrakechRouteValid`  | Valid route toward Marrakech       |
| `MES.FESCycleActive`       | FES direction cycle active         |
| `MES.MarrakechCycleActive` | Marrakech direction cycle active   |
| `MES.DirectionConflict`    | Both directions active/conflicting |
| `MES.GlobalFault`          | Global fault flag                  |
| `MES.AnimationAlive`       | Animation/process activity         |
| `MES.FESDone`              | FES cycle complete                 |
| `MES.MarrakechDone`        | Marrakech cycle complete           |
| `MES.FESCycleCount`        | Number of FES cycles               |
| `MES.MarrakechCycleCount`  | Number of Marrakech cycles         |
| `MES.TotalCycleCount`      | Total manual rail cycles           |

Example:

```text
railmanual,plc=PLC5,node=MES.FESCycleCount value=1
railmanual,plc=PLC5,node=MES.MarrakechCycleCount value=1
railmanual,plc=PLC5,node=MES.TotalCycleCount value=2
```



## 6.2 PLC5 diagnostic nodes

| Node                    | Meaning                   |
| ----------------------- | ------------------------- |
| `MES.Heartbeat`         | PLC5 heartbeat            |
| `MES.ProgramVersion`    | PLC5 program version      |
| `MES.GlobalFaultCode`   | Fault code                |
| `MES.StateWord`         | Encoded state             |
| `MES.LastResetReason`   | Last reset cause          |
| `MES.LastScanMs`        | Scan time                 |
| `MES.MaxScanMs`         | Max scan time             |
| `MES.WatchdogLo`        | Watchdog low word         |
| `MES.FESActiveMs`       | FES active duration       |
| `MES.MarrakechActiveMs` | Marrakech active duration |

## 6.3 PLC5 advanced rail KPIs

| Node                     | Meaning                           |
| ------------------------ | --------------------------------- |
| `MES.ActiveLines`        | Number of active directions/lines |
| `MES.RouteMask`          | Encoded active route mask         |
| `MES.FlowCount`          | Flow/cycle count                  |
| `MES.FlowRate`           | Current flow rate                 |
| `MES.UtilizationPercent` | Utilization percentage            |
| `MES.ConflictCount`      | Number of conflicts               |
| `MES.SafetyFlag`         | Safety state                      |
| `MES.QueueLength`        | Queue length placeholder          |
| `MES.WaitTime`           | Waiting time                      |
| `MES.Throughput`         | Throughput                        |
| `MES.Efficiency`         | Efficiency                        |
| `MES.OEE`                | OEE                               |
| `MES.State`              | Encoded state                     |
| `MES.FaultTypeAdv`       | Advanced fault                    |
| `MES.WatchdogAdv`        | Advanced watchdog                 |
| `MES.IntegrityAdv`       | Integrity flag                    |
| `MES.LoadPercent`        | Load percentage                   |

Current issue from your logs:

```text
railmanual,plc=PLC5,node=MES.Efficiency value=26154
railmanual,plc=PLC5,node=MES.OEE value=200
```

These are invalid KPI values and should be clamped or dropped before final dashboards. 

---

# 7. History interpretation by data type

## Boolean states

Examples:

```text
EtatInstallation
CycleActif
PE.Etat
FactoryServed
DirectionConflict
```

Values:

```text
0 = false/off/inactive
1 = true/on/active
```

History use:

```text
State timelines
Availability calculations
Cycle detection
Alarm event detection
```

Flux example:

```flux
from(bucket: "labshock_db")
  |> range(start: -1h)
  |> filter(fn: (r) => r._measurement == "factory")
  |> filter(fn: (r) => r.node == "EtatInstallation")
```

## Counters

Examples:

```text
MES.TotalCycles
MES.TotalGood
MES.FESCycleCount
MES.TotalCycleCount
```

History use:

```text
Production trend
Throughput calculation
Cycle deltas
Daily/hourly totals
```

Flux example:

```flux
from(bucket: "labshock_db")
  |> range(start: -1h)
  |> filter(fn: (r) => r.node == "MES.TotalCycles")
  |> derivative(unit: 1m, nonNegative: true)
```

## Percent KPIs

Examples:

```text
MES.OEE
MES.QualityPercent
MES.AvailabilityPercent
MES.PerformancePercent
MES.LoadPercent
MES.UtilizationPercent
```

Valid range:

```text
0..100
```

History use:

```text
OEE dashboard
Quality trend
Process degradation
Anomaly detection
```

Flux example:

```flux
from(bucket: "labshock_db")
  |> range(start: -1h)
  |> filter(fn: (r) => r._measurement == "factory")
  |> filter(fn: (r) => r.node == "MES.OEE")
  |> aggregateWindow(every: 1m, fn: mean)
```

## Power / energy values

Examples:

```text
PE.Power
FS.Power
GS.Power
TAP
TCP
MES.TotalProduction
MES.TotalConsumption
MES.ReserveMargin
MES.FactoryDemand
MES.HomesDemand
MES.RailwayDemand
```

History use:

```text
Energy balance
Demand forecast
Loss analysis
Reserve margin alerts
```

Flux example:

```flux
from(bucket: "labshock_db")
  |> range(start: -1h)
  |> filter(fn: (r) => r._measurement == "powergrid")
  |> filter(fn: (r) => r.plc == "PLC2")
  |> filter(fn: (r) => r.node == "MES.ReserveMargin")
```

## Encoded state values

Examples:

```text
MES.GridState
MES.ProcessState
MES.State
MES.FaultType
MES.TrafficState
```

These should be decoded in Node-RED/Grafana.

Example decoding:

```text
0 = stopped / idle / no fault
1 = active / running
2 = warning / serving / conflict depending on node
3 = fault / conflict
```

Do not average these. Use `last()` or state timeline visualizations.

---

# 8. Recommended dashboard groups

## Global MES dashboard

Use:

```text
mes_health/gateway/Heartbeat
powergrid/PLC2/MES.TotalProduction
powergrid/PLC2/MES.TotalConsumption
powergrid/PLC2/MES.ReserveMargin
factory/PLC3/MES.OEE
factory/PLC3/MES.TotalCycles
railauto/PLC4/MES.ProgressPercent
railmanual/PLC5/MES.TotalCycleCount
```

## PowerGrid dashboard

Use:

```text
PLC1 source/load status
PLC2 production sources
TAP/TCP/reserve margin
Demand by client
Served/unserved percentage
```

## Factory dashboard

Use:

```text
TotalCycles
TotalGood
TotalReject
QualityPercent
AvailabilityPercent
PerformancePercent
OEE
ThroughputPerMin
ThroughputPerHour
ProcessState
LoadPercent
```

Avoid:

```text
Factory.MES.GoodCount
Factory.MES.CycleCount
Factory.MES.RunTimeSeconds
```

for final KPIs because legacy values are inconsistent.

## RailAuto dashboard

Use:

```text
Step
ProgressPercent
CycleActive
CycleDone
ErrorCode
State
FaultType
Integrity
```

## RailManual dashboard

Use:

```text
FESRouteValid
MarrakechRouteValid
DirectionConflict
FESCycleCount
MarrakechCycleCount
TotalCycleCount
UtilizationPercent
SafetyFlag
State
FaultTypeAdv
IntegrityAdv
```

Avoid until fixed:

```text
MES.Efficiency
MES.OEE
```

because your latest logs show impossible values.

---

# 9. Clean-data rules for Influx

Use these as validation rules in the gateway or Node-RED:

```text
Any Percent/OEE/Quality/Availability/Performance/Efficiency > 100 → invalid
Any Percent < 0 → invalid
Factory.MES.GoodCount > 100000 → invalid legacy value
Any state code outside expected range → invalid
Any watchdog not changing → stale source
```

---

# 10. Final status

| Data family                    | Status                                  |
| ------------------------------ | --------------------------------------- |
| MES health                     | Clean                                   |
| PowerGrid PLC1                 | Clean                                   |
| PowerGrid PLC2                 | Clean and very useful                   |
| Factory PLC3 raw               | Clean                                   |
| Factory PLC3 advanced MES      | Clean                                   |
| Factory legacy GoodCount       | Invalid, avoid/drop                     |
| RailAuto PLC4 raw              | Clean                                   |
| RailAuto PLC4 MES              | Partial KPIs, but usable                |
| RailManual PLC5 base counters  | Clean                                   |
| RailManual PLC5 OEE/Efficiency | Invalid until PLC5/export mapping fixed |

Your DB is now a complete MES historian for the cyber-range, with 1-hour rolling history and correctly attributed PLC tags.
