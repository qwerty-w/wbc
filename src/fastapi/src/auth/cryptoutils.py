import os
from typing import Optional

from passlib.context import CryptContext
from passlib.hash import argon2
from passlib.utils import consteq
from passlib.utils.binary import b64s_decode

from Cryptodome.Cipher import AES
from Cryptodome.Hash import SHA256


context = CryptContext(['argon2'], argon2__rounds=32)


def dsha256(b: bytes) -> bytes:
    return SHA256.new(b).digest()


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


def kdf(password: str, options: Optional[str] = None) -> tuple[str, bytes]:
    """
    Key derivation function based on argon2

    :param password: String password
    :param meta: Argon2 optional metadata (string that is returned from .hash but with empty digest),
                 using context by default
    :param return: Returns meta, key
    """
    f = argon2.using(**argon2.parsehash(options, checksum=False)) if options else context
    h = f.hash(password)
    op, _, k = h.rpartition('$')
    return op, b64s_decode(k)


def kdfencrypt(password: str, data: bytes) -> tuple[str, bytes, bytes]:
    """
    :param return: Passlib options, received key from kdf(argon2), base64 encrypted data
    """
    options, k = kdf(password)
    return options, k, encrypt(k, data)


def kdfdecrypt(password: str, encrypted: bytes, options: str, kdfhs: bytes) -> bytes:
    """
    :param options: Passlib argon2 options (for .using)
    :param kdfhs: Double SHA256 hash of key from kdf(argon2)
    """
    _, k = kdf(password, options)
    if not consteq(dsha256(k), kdfhs):
        raise ValueError('wrong password')
    return decrypt(k, encrypted)
