from pydantic import BaseModel
from typing import Optional


class LoginLogoutIn(BaseModel):
    hostname:               str
    username:               str
    event_type:             str             # "login" | "logout" | "lock" | "unlock" | "failed"

    # All fields below are optional for backward compatibility with existing agents
    login_time:             Optional[str]   = None  # ISO-8601 datetime string
    logout_time:            Optional[str]   = None  # ISO-8601 datetime string
    session_duration:       Optional[float] = None  # total session minutes
    idle_time:              Optional[float] = None  # idle minutes during session
    screen_lock_time:       Optional[float] = None  # total minutes screen was locked
    ip_address:             Optional[str]   = None  # IPv4 or IPv6
    failed_login_attempts:  Optional[int]   = None  # count of failed attempts
    status:                 Optional[str]   = None  # "active" | "locked" | "logged_out" | "failed"
