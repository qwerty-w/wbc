from fastapi import HTTPException, status


InvalidPasswordError = HTTPException(status.HTTP_400_BAD_REQUEST, 'wrong password')
UserNotFoundError = HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='user not found')
