# IPDC Report Service (IRS) — Claude Code Context

## What this project is
Enterprise financial reporting platform for **IPDC Finance PLC** — a Non-Banking Financial Institution
(NBFI) in Bangladesh regulated by Bangladesh Bank under the Financial Institutions Act 1993.
This system replaces a legacy .NET MVC report server. It receives end-of-day (COB) financial data
from the core banking system (Temenos T24) via an automated ETL pipeline and serves a secure,
role-controlled reporting portal to internal users.

---

## Project structure
```
report_server/
├── backend/                        # This Spring Boot project (you are here)
│   ├── irs-api-gateway/            # API Gateway service
│   ├── irs-report-service/         # Core report generation service
│   ├── irs-etl-service/            # COB data ingestion pipeline (Spring Batch)
│   irs-export-service/            # Excel / PDF / CSV export engine
│   ├── irs-scheduler-service/      # Scheduled report delivery
│   ├── irs-audit-service/          # Immutable audit trail service
│   ├── irs-user-service/           # User management and RBAC
│   └── docker-compose.dev.yml      # Local dev stack
└── frontend/                       # React / Next.js portal (separate)
```

---

## Technology stack — DO NOT suggest alternatives unless asked

| Layer              | Technology                              |
|--------------------|-----------------------------------------|
| Language           | Java 17                                 |
| Framework          | Spring Boot 3.3.x                       |
| Build tool         | Maven                                   |
| Root package       | com.ipdc.irs                            |
| Report engine      | JasperReports + Apache POI + iText      |
| ETL pipeline       | Spring Batch                            |
| Reporting DB       | PostgreSQL 15+ (separate from CBS)      |
| Cache              | Redis 7.x                               |
| Message broker     | Apache Kafka                            |
| Auth               | Spring Security + OAuth2 + JWT + LDAP   |
| Container          | Docker + Docker Compose                 |
| Reverse proxy      | Nginx                                   |
| Monitoring         | Prometheus + Grafana                    |
| Mail               | Office 365 SMTP (smtp.office365.com:587)|
| SMS alerts         | ADN SMS API                             |
| Shared drive       | IPDC Nextcloud (WebDAV)                 |

---

## Package naming conventions

```
com.ipdc.irs.{service}.controller      # REST controllers
com.ipdc.irs.{service}.service         # Business logic
com.ipdc.irs.{service}.service.impl    # Service implementations
com.ipdc.irs.{service}.repository      # Spring Data JPA repositories
com.ipdc.irs.{service}.entity          # JPA entities
com.ipdc.irs.{service}.dto             # Request/Response DTOs
com.ipdc.irs.{service}.dto.request     # Inbound DTOs
com.ipdc.irs.{service}.dto.response    # Outbound DTOs
com.ipdc.irs.{service}.mapper          # MapStruct mappers
com.ipdc.irs.{service}.config          # Configuration classes
com.ipdc.irs.{service}.exception       # Custom exceptions
com.ipdc.irs.{service}.security        # Security filters, JWT utils
com.ipdc.irs.{service}.batch           # Spring Batch jobs, steps, readers, writers
com.ipdc.irs.{service}.event           # Kafka producers and consumers
```

Replace `{service}` with: `report`, `etl`, `export`, `scheduler`, `audit`, `user`, `gateway`

---

## Class naming conventions

| Type                  | Suffix example                        |
|-----------------------|---------------------------------------|
| REST Controller       | `LoanReportController`                |
| Service interface     | `LoanReportService`                   |
| Service implementation| `LoanReportServiceImpl`               |
| JPA Repository        | `LoanReportRepository`                |
| JPA Entity            | `LoanReport`                          |
| Request DTO           | `LoanReportRequest`                   |
| Response DTO          | `LoanReportResponse`                  |
| MapStruct Mapper      | `LoanReportMapper`                    |
| Spring Batch Job      | `CobDataIngestionJob`                 |
| Kafka Consumer        | `CobCompletionEventConsumer`          |
| Exception class       | `ReportGenerationException`           |
| Audit event           | `ReportAccessAuditEvent`              |

---

## Coding rules — always follow these

### Security (non-negotiable — Bangladesh Bank ICT Guidelines apply)
- NEVER write dynamic SQL using string concatenation — always use parameterized queries or JPA
- NEVER hardcode credentials, passwords, or API keys — use environment variables or Spring Vault
- NEVER log sensitive data (account numbers, NID, passwords) — mask before logging
- ALWAYS validate and sanitize all user inputs at the controller layer using `@Valid`
- ALWAYS use `@PreAuthorize` on service methods for RBAC enforcement
- All audit events MUST be published to the audit service — no silent report access
- Sensitive report exports (NPL, Top Borrower, Executive MIS) require MFA check before serving

### Architecture
- Follow layered architecture strictly: Controller → Service → Repository (never skip layers)
- Controllers must NOT contain business logic — delegate everything to the Service layer
- Repositories must NOT contain business logic — only data access methods
- Use DTOs for all API request/response — never expose JPA entities directly in controllers
- Use MapStruct for entity ↔ DTO conversion — never write manual mapping code
- Use constructor injection, not field injection (`@Autowired` on fields is banned)

### Database
- All JPA entities must have: `@CreatedDate`, `@LastModifiedDate`, `@CreatedBy`, `@LastModifiedBy`
- Every table must have a `created_at`, `updated_at`, `created_by`, `updated_by` column
- Use `snake_case` for all database column names and table names
- Use UUID as primary key type for all entities: `@GeneratedValue(strategy = GenerationType.UUID)`
- Never use `FetchType.EAGER` — always `LAZY` to prevent N+1 queries
- All DB migrations via Flyway — never use `spring.jpa.hibernate.ddl-auto=update` in any env

### API design
- All endpoints versioned: `/api/v1/reports/...`
- Use standard HTTP methods: GET for read, POST for create, PUT for full update, PATCH for partial
- Return `ApiResponse<T>` wrapper for all responses — never return raw entities or raw lists
- Use `@ControllerAdvice` global exception handler — never catch and swallow exceptions silently
- All pagination via `Pageable` — no endpoints return unbounded lists

### Logging
- Use `@Slf4j` (Lombok) — never `System.out.println`
- Log at INFO for business events, DEBUG for technical detail, ERROR for failures
- Always include correlation ID in logs for request tracing

---

## Key domain entities (IRS reporting DB — PostgreSQL)

```
users                  # IRS portal users (synced from IPDC Active Directory)
roles                  # RBAC roles (SYSTEM_ADMIN, CFO, COMPLIANCE_OFFICER, etc.)
user_roles             # Many-to-many user-role assignments
report_definitions     # Pre-built report catalogue definitions
report_access_rules    # Which roles can view/export which reports
report_executions      # Log of every report run (params, row count, duration)
cob_data_loads         # COB ETL run history (date, status, reconciliation result)
scheduled_reports      # Report delivery schedules and recipient lists
audit_logs             # Immutable audit trail (all user actions)
```

---

## ETL pipeline context (Spring Batch)

- COB completion signal arrives via **Kafka topic**: `ipdc.cbs.cob.completed`
- ETL reads from **T24 CBS read-replica** (separate DB connection — `cbs-datasource`)
- ETL writes to **IRS reporting DB** (main datasource — `irs-datasource`)
- Reconciliation against CBS GL totals is MANDATORY before marking COB load as SUCCESS
- If reconciliation fails → publish to Kafka topic `ipdc.irs.cob.failed` → alert Finance + IT
- ETL must complete within **60 minutes** of COB signal
- Manual re-ingestion requires IT_ADMIN role and creates a new versioned `cob_data_loads` record

---

## User roles (RBAC)

```
SYSTEM_ADMIN           # Full access including admin console
IT_OPERATIONS          # ETL monitoring, system reports only
MD_CEO                 # Executive dashboard, all reports read-only
CFO_FINANCE_HEAD       # Finance + MIS reports, full export
COMPLIANCE_OFFICER     # All reports read, full regulatory export
INTERNAL_AUDITOR       # All reports read, audit log access, PDF export only
CREDIT_HEAD            # Credit and loan reports, full export
TREASURY_HEAD          # Treasury reports, full export
BRANCH_MANAGER         # Branch-level reports only, PDF/Excel export
RELATIONSHIP_MANAGER   # Own portfolio reports only, PDF export only
```

---

## Bangladesh Bank compliance requirements
- Loan classification follows **BRPD Circular** grades: UC, SMA, SS, DF, BL
- CRR and SLR computed per **DFIM Circular** for NBFIs (different from bank ratios)
- CIB data extract format must match **Bangladesh Bank CIB prescribed format**
- Audit logs retained **minimum 7 years** (BB ICT Security Guidelines)
- VAPT conducted **annually** — findings logged as GitHub/GitLab issues with remediation dates
- All regulatory reports archived with version, submission timestamp, and submitting officer

---

## Local development environment

```yaml
# PostgreSQL (IRS Reporting DB)
host: localhost
port: 5432
database: irs_reporting
username: irs_user
password: (from .env file — never hardcode)

# Redis
host: localhost
port: 6379

# Kafka
bootstrap-servers: localhost:9092
topics:
  cob-completed: ipdc.cbs.cob.completed
  cob-failed:    ipdc.irs.cob.failed
  report-queue:  ipdc.irs.report.queue
  audit-events:  ipdc.irs.audit.events

# Active Spring profile for local dev
spring.profiles.active: dev
```

---

## What NOT to do
- Do not use `spring.jpa.hibernate.ddl-auto=create` or `update` — Flyway only
- Do not return JPA entities from controllers — always use DTOs
- Do not use `@Autowired` field injection — constructor injection only
- Do not write any report generation logic in controllers or repositories
- Do not commit `.env` files, `application-prod.yml`, or any file with credentials
- Do not use `FetchType.EAGER` anywhere
- Do not write dynamic SQL from user input — parameterized queries only
- Do not skip the audit log for any report access or export event