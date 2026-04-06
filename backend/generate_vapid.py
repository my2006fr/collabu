#!/usr/bin/env python3
"""
One-time VAPID key generation helper.

Usage:
    pip install pywebpush
    python generate_vapid.py

Copy the two output lines into your .env (and Render/Vercel environment variables).
"""
from py_vapid import Vapid
from cryptography.hazmat.primitives import serialization

# Generate VAPID keys
v = Vapid()
v.generate_keys()

# Export private key
private_b64 = v.private_key.private_bytes(
    encoding=serialization.Encoding.PEM,
    format=serialization.PrivateFormat.TraditionalOpenSSL,
    encryption_algorithm=serialization.NoEncryption(),
).decode()

# Export public key
public_b64 = v.public_key.public_bytes(
    encoding=serialization.Encoding.PEM,
    format=serialization.PublicFormat.SubjectPublicKeyInfo,
).decode()

# Print environment variables
print("Add these to your .env file:\n")
print(f"VAPID_PRIVATE_KEY={private_b64.strip()}")
print(f"VAPID_PUBLIC_KEY={public_b64.strip()}")
print(f"VAPID_EMAIL=mailto:admin@youruniversity.edu")
