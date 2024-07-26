from typing import Literal


KeyFormats = Literal['wif', 'hex', 'base64', 'base58']

def convert_key_format(key: str, _from: KeyFormats, _to: KeyFormats):
    if _from == _to:
        return key
    
    return ''
