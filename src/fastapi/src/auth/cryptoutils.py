import os
from typing import Optional

from passlib.context import CryptContext
from passlib.hash import argon2
from passlib.utils.binary import b64s_decode, b64s_encode

from Cryptodome.Cipher import AES


context = CryptContext(['argon2'], argon2__rounds=32)


def generatekey(length: int = 32) -> bytes:
    return os.urandom(length)


def encrypt(key: bytes, data: bytes):
    """AES data encryption
    :param return: <init vector:16><encrypted data>
    """
    cipher = AES.new(key, AES.MODE_CBC)
    e = cipher.encrypt(data)
    return bytes(cipher.iv) + e


def decrypt(key: bytes, encrypted: bytes):
    """AES data decryption
    :param key: key
    :param encrypted: <init vector:16><encrypted data>
    """
    iv, encrypted = encrypted[:16], encrypted[16:]
    cipher = AES.new(key, AES.MODE_CBC, iv=iv)
    return cipher.decrypt(encrypted)


def kdf(password: str, meta: Optional[str] = None) -> tuple[str, bytes]:
    """
    Key derivation function based on argon2

    :param password: String password
    :param meta: Argon2 optional metadata (string that is returned from .hash but with empty digest),
                 using context by default
    :param return: Returns meta, key
    """
    f = argon2.using(**argon2.parsehash(meta, checksum=False)) if meta else context
    h = f.hash(password)
    m, _, k = h.rpartition('$')
    return m, b64s_decode(k)


def kdfencrypt(password: str, data: bytes) -> str:
    meta, k = kdf(password)
    return meta + '$' + b64s_encode(encrypt(k, data))


def kdfdecrypt(password: str, encrypted: str) -> bytes:
    meta, _, data = encrypted.rpartition('$')
    _, k = kdf(password, meta=meta)
    return decrypt(k, b64s_decode(data))
