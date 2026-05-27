"""
认证模块 — 注册 / 邮箱验证 / 登录 / JWT
"""

import hashlib
import hmac
import os
import random
import smtplib
import string
import time
from email.mime.text import MIMEText
from datetime import datetime, timedelta

import bcrypt
import jwt
from dotenv import load_dotenv

load_dotenv()

JWT_SECRET = os.getenv("JWT_SECRET", "change-me-in-production-" + os.urandom(16).hex())
JWT_EXPIRY_HOURS = int(os.getenv("JWT_EXPIRY_HOURS", "720"))  # 30 天
FREE_QUOTA = int(os.getenv("FREE_QUOTA", "10"))
PRICE_PER_PACKAGE = float(os.getenv("PRICE_PER_PACKAGE", "9.9"))

# SMTP 配置
SMTP_HOST = os.getenv("SMTP_HOST", "")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASS = os.getenv("SMTP_PASS", "")
SMTP_FROM = os.getenv("SMTP_FROM", "noreply@bioinfo-agent.com")


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())


def make_token(user_id: int, email: str) -> str:
    """生成 JWT"""
    payload = {
        "user_id": user_id,
        "email": email,
        "exp": datetime.utcnow() + timedelta(hours=JWT_EXPIRY_HOURS),
        "iat": datetime.utcnow(),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")


def decode_token(token: str) -> dict | None:
    """解析 JWT，失败返回 None"""
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None


def generate_verify_code() -> str:
    return "".join(random.choices(string.digits, k=6))


def send_verify_email(email: str, code: str) -> bool:
    """发送验证邮件，SMTP 未配置时仅打印到控制台"""
    if not SMTP_HOST or not SMTP_USER:
        print(f"\n{'='*50}")
        print(f"📧 验证码 [{email}]: {code}")
        print(f"   (SMTP 未配置，请手动告知用户)")
        print(f"{'='*50}\n")
        return True

    try:
        msg = MIMEText(
            f"<h2>生信助理 — 邮箱验证</h2>"
            f"<p>你的验证码是：<b style='font-size:24px'>{code}</b></p>"
            f"<p>验证码 10 分钟内有效。</p>",
            "html", "utf-8",
        )
        msg["Subject"] = "生信助理 — 邮箱验证码"
        msg["From"] = SMTP_FROM
        msg["To"] = email

        with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=10) as srv:
            srv.starttls()
            srv.login(SMTP_USER, SMTP_PASS)
            srv.sendmail(SMTP_FROM, [email], msg.as_string())
        return True
    except Exception as e:
        print(f"邮件发送失败: {e}")
        return False
