"""
Comprehensive Demo Data Seeder for CodeSentinel.

Populates the database with realistic organizations, repositories, scans,
13-stage pipelines, findings across OWASP/CWE categories with real code snippets,
AI security assessments, risk scores, policies, evaluations, and audit logs.
"""

import asyncio
import json
from datetime import datetime, timezone, timedelta

from backend.app.core.database import init_db, async_session_factory
from backend.app.models.organization import Organization
from backend.app.models.user import User
from backend.app.models.organization_member import OrganizationMember
from backend.app.models.repository import Repository
from backend.app.models.scan import Scan
from backend.app.models.scan_stage import ScanStage
from backend.app.models.finding import Finding
from backend.app.models.ai_assessment import AIAssessment
from backend.app.models.policy import Policy
from backend.app.models.policy_evaluation import PolicyEvaluation
from backend.app.models.audit_log import AuditLog
from backend.app.models.security_document import SecurityDocument


async def seed():
    print("[*] Initializing database schema...")
    await init_db()

    async with async_session_factory() as session:
        print("[*] Checking existing data...")
        result = await session.execute(__import__("sqlalchemy").select(Organization))
        existing_org = result.scalars().first()
        if existing_org:
            print("[+] Database already contains data. Skipping re-seed.")
            return

        now = datetime.now(timezone.utc)

        # 1. Organization & User
        org = Organization(
            name="Acme FinTech Corp",
            slug="acme-fintech",
        )
        session.add(org)
        await session.flush()

        user = User(
            email="security.lead@acme-fintech.internal",
            name="Alex Thorne",
            avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=128&h=128&fit=crop&crop=faces",
        )
        session.add(user)
        await session.flush()

        member = OrganizationMember(
            organization_id=org.id,
            user_id=user.id,
            role="OWNER",
        )
        session.add(member)

        # 2. Knowledge Documents (OWASP / CWE)
        docs = [
            SecurityDocument(
                source_type="OWASP",
                external_id="A01:2021",
                title="Broken Access Control",
                url="https://owasp.org/Top10/A01_2021-Broken_Access_Control/",
                content="Access control enforces policy such that users cannot act outside of their intended permissions. Failures typically lead to unauthorized information disclosure, modification, or destruction of all data or performing a business function outside the user's limits.",
            ),
            SecurityDocument(
                source_type="OWASP",
                external_id="A03:2021",
                title="Injection",
                url="https://owasp.org/Top10/A03_2021-Injection/",
                content="Injection flaws, such as SQL, NoSQL, OS, and LDAP injection, occur when untrusted data is sent to an interpreter as part of a command or query. The attacker's hostile data can trick the interpreter into executing unintended commands or accessing data without proper authorization.",
            ),
            SecurityDocument(
                source_type="OWASP",
                external_id="A07:2021",
                title="Identification and Authentication Failures",
                url="https://owasp.org/Top10/A07_2021-Identification_and_Authentication_Failures/",
                content="Confirmation of the user's identity, authentication, and session management is critical to protect against authentication-related attacks.",
            ),
            SecurityDocument(
                source_type="CWE",
                external_id="CWE-89",
                title="Improper Neutralization of Special Elements used in an SQL Command ('SQL Injection')",
                url="https://cwe.mitre.org/data/definitions/89.html",
                content="The product constructs all or part of an SQL command using externally-influenced input from an upstream component, but it does not neutralize or incorrectly neutralizes special elements that could modify the intended SQL command when it is sent to a downstream component.",
            ),
            SecurityDocument(
                source_type="CWE",
                external_id="CWE-798",
                title="Use of Hard-coded Credentials",
                url="https://cwe.mitre.org/data/definitions/798.html",
                content="The product contains hard-coded credentials, such as a password or cryptographic key, which it uses for inbound authentication, outbound communication to external components, or encryption of internal data.",
            ),
            SecurityDocument(
                source_type="CWE",
                external_id="CWE-22",
                title="Improper Limitation of a Pathname to a Restricted Directory ('Path Traversal')",
                url="https://cwe.mitre.org/data/definitions/22.html",
                content="The product uses external input to construct a pathname that is intended to identify a file or directory that is located underneath a restricted parent directory, but the product does not properly neutralize special elements within the pathname that can resolve to a location that is outside of the restricted directory.",
            ),
        ]
        for d in docs:
            session.add(d)

        # 3. Repositories
        repo_payments = Repository(
            organization_id=org.id,
            provider="github",
            provider_repo_id="1089201",
            owner="acme-fintech",
            name="payments-service",
            full_name="acme-fintech/payments-service",
            default_branch="main",
            visibility="private",
            language="Python",
            description="Core payment processing microservice with Stripe and checkout webhooks",
        )
        repo_identity = Repository(
            organization_id=org.id,
            provider="github",
            provider_repo_id="1089202",
            owner="acme-fintech",
            name="identity-auth-service",
            full_name="acme-fintech/identity-auth-service",
            default_branch="main",
            visibility="private",
            language="TypeScript",
            description="OAuth2 and session token management service",
        )
        repo_gateway = Repository(
            organization_id=org.id,
            provider="github",
            provider_repo_id="1089203",
            owner="acme-fintech",
            name="api-gateway",
            full_name="acme-fintech/api-gateway",
            default_branch="main",
            visibility="public",
            language="Go",
            description="Reverse proxy and edge routing for internal microservices",
        )
        session.add_all([repo_payments, repo_identity, repo_gateway])
        await session.flush()

        # 4. Scans & 13-Stage Pipeline for payments-service
        scan_payments = Scan(
            repository_id=repo_payments.id,
            type="PR",
            commit_sha="a7f89b14c389104031df98c19a9284ba10e7b912",
            branch="feature/stripe-webhook-handler",
            pr_number=184,
            triggered_by="github_webhook",
            status="COMPLETED",
            started_at=now - timedelta(minutes=18),
            completed_at=now - timedelta(minutes=15),
            duration_ms=180000,
            files_analyzed=42,
            risk_score=92.0,
            policy_result="FAIL",
        )
        session.add(scan_payments)
        await session.flush()

        # 13 Pipeline Stages
        stages_data = [
            ("PREPARING", "COMPLETED", 120),
            ("FETCHING", "COMPLETED", 850),
            ("INVENTORY", "COMPLETED", 340),
            ("SEMGREP", "COMPLETED", 2100),
            ("GITLEAKS", "COMPLETED", 720),
            ("NORMALIZATION", "COMPLETED", 150),
            ("CONTEXT", "COMPLETED", 450),
            ("INTELLIGENCE", "COMPLETED", 890),
            ("AI", "COMPLETED", 1450),
            ("RISK", "COMPLETED", 110),
            ("POLICY", "COMPLETED", 95),
            ("PERSIST", "COMPLETED", 230),
        ]
        for name, status, dur in stages_data:
            st = ScanStage(
                scan_id=scan_payments.id,
                stage=name,
                status=status,
                started_at=now - timedelta(minutes=18),
                completed_at=now - timedelta(minutes=15),
                item_count=1,
            )
            session.add(st)

        # 5. Realistic Findings
        f1 = Finding(
            scan_id=scan_payments.id,
            stable_fingerprint="fp_cwe798_stripe_live_key_001",
            title="Hardcoded Stripe Live Secret Key exposed in webhook handler",
            description="A production Stripe Secret API Key (sk_live_...) was committed directly into application configuration, enabling unauthorized payment manipulation and refund fraud.",
            category="SECRET",
            severity="CRITICAL",
            confidence="HIGH",
            status="OPEN",
            scanner="gitleaks",
            scanner_rule="stripe-api-key",
            file_path="src/config/stripe.py",
            start_line=24,
            end_line=26,
            evidence='STRIPE_SECRET_KEY = "dummy_mock_stripe_key_0000000000000000"\nSTRIPE_WEBHOOK_SECRET = "dummy_mock_webhook_secret_00000000"\n\ndef get_stripe_client():\n    return stripe.Client(api_key=STRIPE_SECRET_KEY)',
            cwe_id="CWE-798",
            owasp_category="A07:2021-Identification and Authentication Failures",
            risk_score=98.0,
            remediation="Move Stripe API credentials to environment variables or AWS Secrets Manager. Never hardcode live cryptographic secrets in source repositories.",
        )
        session.add(f1)
        await session.flush()

        ai1 = AIAssessment(
            finding_id=f1.id,
            model="gemini-2.0-flash",
            prompt_version="v1",
            summary="A live Stripe secret API key was detected in plaintext within the configuration file.",
            explanation="Hardcoded API keys are permanent credentials that grant complete administrative access to your Stripe account. If this repository is accessed by unauthorized actors or pushed to third-party CI systems, adversaries can charge customer cards, initiate fraudulent payouts, and extract transaction logs.",
            impact="Total financial compromise, unauthorized customer charges, and PCI-DSS compliance violation.",
            remediation='import os\n\nSTRIPE_SECRET_KEY = os.environ.get("STRIPE_SECRET_KEY")\nif not STRIPE_SECRET_KEY:\n    raise RuntimeError("Missing STRIPE_SECRET_KEY environment variable")\n\ndef get_stripe_client():\n    return stripe.Client(api_key=STRIPE_SECRET_KEY)',
            confidence=0.99,
        )
        session.add(ai1)

        f2 = Finding(
            scan_id=scan_payments.id,
            stable_fingerprint="fp_cwe89_sql_injection_order_lookup_002",
            title="SQL Injection via string concatenation in order query",
            description="User-supplied order ID parameter is directly interpolated into a raw SQL query using Python f-strings without query parameterization.",
            category="INJECTION",
            severity="CRITICAL",
            confidence="HIGH",
            status="OPEN",
            scanner="semgrep",
            scanner_rule="python.sqlalchemy.security.raw-sql-concat.raw-sql-concat",
            file_path="src/services/order_service.py",
            start_line=88,
            end_line=94,
            evidence='def get_order_by_customer(customer_id: str, order_id: str):\n    query = f"SELECT * FROM orders WHERE customer_id = \'{customer_id}\' AND id = \'{order_id}\'"\n    return db.session.execute(text(query)).fetchall()',
            cwe_id="CWE-89",
            owasp_category="A03:2021-Injection",
            risk_score=94.0,
            remediation="Use bound parameterization with SQLAlchemy text() bindparams or ORM query filters.",
        )
        session.add(f2)
        await session.flush()

        ai2 = AIAssessment(
            finding_id=f2.id,
            model="gemini-2.0-flash",
            prompt_version="v1",
            summary="Direct concatenation of HTTP request parameters into SQL execution statement.",
            explanation="When input is formatted directly into SQL strings, malicious payload strings like `' OR '1'='1` alter query semantics, allowing attackers to dump entire customer order histories or execute subqueries.",
            impact="Data exfiltration of confidential order records and payment metadata.",
            remediation='from sqlalchemy import text\n\ndef get_order_by_customer(customer_id: str, order_id: str):\n    query = text("SELECT * FROM orders WHERE customer_id = :customer_id AND id = :order_id")\n    return db.session.execute(query, {"customer_id": customer_id, "order_id": order_id}).fetchall()',
            confidence=0.96,
        )
        session.add(ai2)

        f3 = Finding(
            scan_id=scan_payments.id,
            stable_fingerprint="fp_cwe22_path_traversal_receipt_export_003",
            title="Path Traversal in receipt file export utility",
            description="File path is constructed using unsanitized user-supplied invoice filename, allowing directory traversal to read arbitrary server files.",
            category="INJECTION",
            severity="HIGH",
            confidence="MEDIUM",
            status="IN_REVIEW",
            scanner="semgrep",
            scanner_rule="python.lang.security.audit.path-traversal.path-traversal-open",
            file_path="src/utils/receipt_generator.py",
            start_line=45,
            end_line=50,
            evidence='def download_receipt(filename: str):\n    base_dir = "/var/data/receipts"\n    filepath = os.path.join(base_dir, filename)\n    with open(filepath, "rb") as f:\n        return f.read()',
            cwe_id="CWE-22",
            owasp_category="A01:2021-Broken Access Control",
            risk_score=82.0,
            remediation="Sanitize input with os.path.basename() and verify that the canonical path starts with the designated base directory.",
        )
        session.add(f3)
        await session.flush()

        ai3 = AIAssessment(
            finding_id=f3.id,
            model="gemini-2.0-flash",
            prompt_version="v1",
            summary="Unchecked filename parameter allows traversal outside of the receipts directory.",
            explanation="An attacker sending `../../etc/passwd` or `../../app/.env` can read sensitive host configurations and system files.",
            impact="Unauthorized local file inclusion and credential exposure.",
            remediation='from pathlib import Path\n\ndef download_receipt(filename: str):\n    base_dir = Path("/var/data/receipts").resolve()\n    safe_path = (base_dir / Path(filename).name).resolve()\n    if not safe_path.is_relative_to(base_dir):\n        raise ValueError("Invalid file path")\n    return safe_path.read_bytes()',
            confidence=0.91,
        )
        session.add(ai3)

        # 6. Security Policies
        policy_prod = Policy(
            organization_id=org.id,
            name="Production Security Release Gate",
            description="Strict gating policy that blocks merge on any exposed secrets or Critical/High CWE vulnerabilities.",
            enabled=True,
            configuration_json=json.dumps({
                "block_critical": True,
                "block_high_with_high_confidence": True,
                "block_secrets": True,
                "severity_threshold": "HIGH",
                "confidence_threshold": "MEDIUM",
                "allow_approved_exceptions": True,
                "require_exception_expiry": True,
                "max_exception_days": 90,
                "scope_repositories": [],
            }),
        )
        session.add(policy_prod)
        await session.flush()

        pe = PolicyEvaluation(
            policy_id=policy_prod.id,
            scan_id=scan_payments.id,
            result="FAIL",
            reason=json.dumps([
                "Blocked by policy: Hardcoded Stripe Live Secret Key (CWE-798) in src/config/stripe.py",
                "Blocked by policy: Critical SQL Injection vulnerability (CWE-89) in src/services/order_service.py",
            ]),
        )
        session.add(pe)

        # 7. Audit Logs
        logs = [
            AuditLog(
                organization_id=org.id,
                actor_id=user.id,
                action="ORGANIZATION_CREATED",
                resource_type="organization",
                resource_id=org.id,
            ),
            AuditLog(
                organization_id=org.id,
                actor_id=user.id,
                action="POLICY_CREATED",
                resource_type="policy",
                resource_id=policy_prod.id,
                metadata_json=json.dumps({"policy_name": "Production Security Release Gate"}),
            ),
            AuditLog(
                organization_id=org.id,
                action="SCAN_COMPLETED",
                resource_type="scan",
                resource_id=scan_payments.id,
                metadata_json=json.dumps({"repo": "payments-service", "pr": 184, "result": "FAIL"}),
            ),
        ]
        session.add_all(logs)

        await session.commit()
        print("[+] Successfully seeded rich demo data!")


if __name__ == "__main__":
    asyncio.run(seed())
